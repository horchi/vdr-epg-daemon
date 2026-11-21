// Play a recording in the browser via HLS – data/rechlsstart lets ffmpeg on the epgd host
//   write HLS segments (H.264 copied, audio to AAC). Interlaced H.264 (1080i) and MPEG-2 (SD)
//   are deinterlaced and encoded (transcode=1), the browsers can't decode the field pictures
//   of a copied 1080i stream and no MPEG-2 at all.
//   Played with hls.js (loaded on demand) if the browser has Media Source Extensions, else
//   natively (iPhone without ManagedMediaSource). The native HLS of Chrome (newer versions
//   report support) failed with DEMUXER_ERROR_COULD_NOT_PARSE, so hls.js is preferred.
//   A jump inside the already written part seeks in the stream, otherwise a new session
//   is started at the new position (start=<sec>).
//   The player window can be moved (header) and resized (lower right corner).

import { apiUrl, get, qs } from './api.js';
import { busy, dialog, alertBox, makeMovable } from './ui.js';
import { state, hasRight, rights } from './state.js';
import { nowUnix } from './utils.js';
import { iconButton } from './icons.js';

const nativeHls = () => !!document.createElement('video').canPlayType('application/vnd.apple.mpegurl');
let HlsLib = null;

async function loadHls() {
   HlsLib = HlsLib || (await import('./lib/hls.light.min.js')).default;
   return HlsLib;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const hms = (s) => {
   s = Math.max(0, Math.floor(s));
   return Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};

// missing dependency on the epgd host -> { missing, package, host, neededfor }

function missingText(d) {
   if (!d?.missing)
      return null;

   const where = 'Auf dem epgd-Server »' + (d.host || '?') + '«';

   if (d.missing === 'libx264')
      return where + ' fehlt im ffmpeg der Encoder »libx264«, er wird für Aufnahmen in ' + (d.neededfor || '?')
         + ' gebraucht. Abhilfe: das ffmpeg der Distribution (Paket »' + (d.package || 'ffmpeg') + '«)'
         + ' oder ein mit --enable-libx264 gebautes ffmpeg installieren, danach epghttpd neu starten.';

   return where + ' fehlt das Programm »' + d.missing + '« (nicht im PATH von epghttpd gefunden).'
      + ' Abhilfe: Paket »' + (d.package || 'ffmpeg') + '« installieren, danach ist kein Neustart nötig.';
}

export async function playRecording(r) {
   const ref = { md5path: r.md5path, starttime: r.starttime, owner: r.owner || '' };
   let info;

   try { info = await busy(get('data/recstreaminfo?' + qs(ref))); }
   catch (e) { return alertBox(missingText(e.data) || e.message || String(e), 'Abspielen nicht möglich'); }

   if (!info.playable) {
      const fmt = (info.video || '?') + (info.height ? ' ' + info.width + 'x' + info.height : '');
      return alertBox('Im Browser lassen sich bisher nur Aufnahmen in H.264 (HD) und MPEG-2 (SD) abspielen, diese Aufnahme ist ' + fmt + '.',
                      'Abspielen nicht möglich');
   }

   const duration = r.duration || 0;
   let useNative = false;
   let offset = 0;                 // start position of the current session
   let dragging = false;
   let session = null;             // HLS session id
   let hls = null;                 // hls.js instance
   let gen = 0;                    // start counter, a newer start cancels an older one
   let closed = false;

   try {
      const Hls = await busy(loadHls());
      useNative = !Hls.isSupported();
   }
   catch (e) {
      useNative = true;
   }

   if (useNative && !nativeHls())
      return alertBox('Dieser Browser kann HLS-Streams nicht abspielen (weder Media Source Extensions noch natives HLS).', 'Abspielen nicht möglich');

   const $video = $('<video class="player-video" controls autoplay playsinline>');
   const video = $video[0];
   const $pos = $('<input type="range" class="player-seek" min="0" step="1">').attr('max', duration || 1).val(0);
   const $time = $('<span class="player-time">');
   const $msg = $('<div class="player-msg" hidden>');

   const position = () => offset + (video.currentTime || 0);
   const message = (text, error = false) => $msg.text(text || '').toggleClass('error', error).prop('hidden', !text);

   function showTime(t) {
      $time.text(hms(t) + (duration ? ' / ' + hms(duration) : ''));
   }

   function detach() {
      hls?.destroy();
      hls = null;
      video.pause();
      video.removeAttribute('src');
      video.load();

      if (session)
         get('data/rechlsstop?id=' + session).catch(() => {});

      session = null;
   }

   // already written part of the current session?

   function seekable(t) {
      if (!session || t < offset || !video.seekable.length)
         return false;

      return t - offset <= video.seekable.end(video.seekable.length - 1) - 2;
   }

   function goto(t) {
      t = Math.max(0, Math.min(Math.floor(t), duration ? duration - 5 : t));

      if (seekable(t)) {
         video.currentTime = t - offset;
         return;
      }

      start(t);
   }

   async function start(t) {
      const my = ++gen;

      detach();
      offset = t;
      $pos.val(offset);
      showTime(offset);
      message('Stream wird vorbereitet …');

      try {
         const res = await get('data/rechlsstart?' + qs({ ...ref, start: offset, transcode: info.transcode ? 1 : 0 }));

         if (my !== gen || closed)
            return get('data/rechlsstop?id=' + res.id).catch(() => {});

         session = res.id;

         // wait for the first segments (max. 30 seconds)

         for (let i = 0; i < 60; i++) {
            const st = await get('data/rechlsstate?id=' + session);

            if (my !== gen || closed)
               return;

            if (st.ready)
               break;

            await sleep(500);
         }

         const url = apiUrl(res.url);

         if (useNative)
            video.src = url;
         else {
            hls = new HlsLib({ startPosition: 0, maxBufferLength: 60, liveDurationInfinity: false });
            hls.on(HlsLib.Events.ERROR, (ev, d) => {
               if (d.fatal)
                  message('Fehler beim Abspielen (' + (d.details || d.type) + ')', true);
            });
            hls.loadSource(url);
            hls.attachMedia(video);
         }

         message('');
         video.play().catch(() => {});
      }
      catch (e) {
         if (my === gen && !closed)
            message(missingText(e.data) || e.message || String(e), true);
      }
   }

   const jumpBtn = (d, label) => $('<button type="button" class="btn btn-flat">').text(label)
      .attr('title', (d < 0 ? 'zurück ' : 'vor ') + Math.abs(d / 60) + ' min').on('click', () => goto(position() + d));

   $video
      .on('timeupdate', () => { if (!dragging) { $pos.val(position()); showTime(position()); } })
      .on('error', () => { if (video.error && session) message('Fehler beim Abspielen (' + (video.error.message || video.error.code) + ')', true); });

   $pos
      .on('input', () => { dragging = true; showTime(+$pos.val()); })
      .on('change', () => { dragging = false; goto(+$pos.val()); });

   const $dlg = dialog({
      title: r.title || r.name || 'Aufnahme',
      cls: 'dlg-player',
      content: $('<div class="player">').append(
         $video,
         $msg,
         $('<div class="player-bar">').append(
            jumpBtn(-600, '« 10'), jumpBtn(-60, '‹ 1'),
            $pos,
            jumpBtn(60, '1 ›'), jumpBtn(600, '10 »'),
            $time)),
      onClose: () => { closed = true; gen++; clearInterval(keepAlive); detach(); }      // stops the session -> ffmpeg
   });

   // keep the session alive while paused (the server removes it after 60 seconds without request)

   const keepAlive = setInterval(() => { if (session) get('data/rechlsstate?id=' + session).catch(() => {}); }, 20000);

   makeMovable($dlg);
   $dlg.find('.player-video').trigger('focus');
   start(0);
}

// ---------------------------------------------------------------------------
// Live TV in the browser via HLS – data/livehlsstart lets ffmpeg on the epgd host read the
//   HTTP stream of streamdev-server (parameter liveStreamUrl), 720p is copied, 1080i and SD
//   are deinterlaced and encoded. The playlist is a sliding window of 30 minutes (timeshift),
//   the session is removed 30 seconds after the last request (frees the tuner of the VDR).

const LIVE_EDGE = 10;              // seconds behind the end of the playlist still shown as 'live'

const liveFormat = (st) => !st.video ? '' : (st.video === 'mpeg2video' ? 'MPEG-2' : st.video.toUpperCase())
   + (st.height ? ' ' + st.height + (st.fieldorder && st.fieldorder !== 'progressive' && st.fieldorder !== 'unknown' ? 'i' : 'p') : '')
   + (st.mode === 'encode' ? ', umkodiert (' + (st.encoder === 'vaapi' ? 'GPU' : 'x264') + ')' : st.mode === 'copy' ? ', kopiert' : '');

// live possible: configured (liveStreamUrl), right and the event is running

export const canLive = (e) => {
   const n = nowUnix();
   return !!e && !!state.profile.liveStreamUrl && hasRight(rights.recordings) && e.starttime <= n && n < e.starttime + e.duration;
};

export const playLiveEvent = (e) => playLive({ ...e, channelname: state.channels[e.channelid]?.name });

// button for tiles / info panels (doesn't trigger the click handler of the tile)

export const liveButton = (e) => !canLive(e) ? null
   : iconButton('live', 'Live im Browser ansehen').addClass('btn-live')
      .on('click', (ev) => { ev.stopPropagation(); playLiveEvent(e); })
      .on('keydown', (ev) => ev.stopPropagation());

export async function playLive(e) {
   const channel = e.channelname || e.channelid;
   let useNative = false;
   let session = null;
   let hls = null;
   let gen = 0;
   let closed = false;
   let format = '';

   try {
      const Hls = await busy(loadHls());
      useNative = !Hls.isSupported();
   }
   catch (err) {
      useNative = true;
   }

   if (useNative && !nativeHls())
      return alertBox('Dieser Browser kann HLS-Streams nicht abspielen (weder Media Source Extensions noch natives HLS).', 'Abspielen nicht möglich');

   const $video = $('<video class="player-video" controls autoplay playsinline>');
   const video = $video[0];
   const $time = $('<span class="player-time">');
   const $msg = $('<div class="player-msg" hidden>');
   const $liveBtn = $('<button type="button" class="btn btn-flat player-live">').text('● Live').attr('title', 'zum aktuellen Bild springen');

   const message = (text, error = false) => $msg.text(text || '').toggleClass('error', error).prop('hidden', !text);
   const edge = () => video.seekable.length ? video.seekable.end(video.seekable.length - 1) : 0;
   const behind = () => Math.max(0, edge() - (video.currentTime || 0));

   function showTime() {
      const b = behind();
      const isLive = !video.seekable.length || b < LIVE_EDGE;
      $time.text((isLive ? 'live' : '−' + hms(b) + ' hinter live') + (format ? ' · ' + format : ''));
      $liveBtn.toggleClass('active', isLive);
   }

   function detach() {
      hls?.destroy();
      hls = null;
      video.pause();
      video.removeAttribute('src');
      video.load();

      if (session)
         get('data/rechlsstop?id=' + session).catch(() => {});

      session = null;
   }

   function jump(d) {
      if (!video.seekable.length)
         return;

      const start = video.seekable.start(0);
      video.currentTime = Math.max(start, Math.min(video.currentTime + d, edge() - 3));
   }

   function toLive() {
      if (hls && hls.liveSyncPosition)
         video.currentTime = hls.liveSyncPosition;
      else if (video.seekable.length)
         video.currentTime = edge() - 6;

      video.play().catch(() => {});
   }

   async function start() {
      const my = ++gen;

      detach();
      format = '';
      message('Sender wird eingeschaltet …');

      try {
         const res = await get('data/livehlsstart?' + qs({ channelid: e.channelid }));

         if (my !== gen || closed)
            return get('data/rechlsstop?id=' + res.id).catch(() => {});

         session = res.id;

         // wait for the probe and the first segments (max. 45 seconds)

         let st = null;

         for (let i = 0; i < 90; i++) {
            st = await get('data/rechlsstate?id=' + session);

            if (my !== gen || closed)
               return;

            if (st.mode && !format) {
               format = liveFormat(st);
               message('Stream wird vorbereitet … (' + format + ')');
            }

            if (st.ready)
               break;

            await sleep(500);
         }

         if (!st?.ready)
            throw new Error('Zeitüberschreitung – der Stream liefert keine Daten.');

         const url = apiUrl(res.url);

         if (useNative)
            video.src = url;
         else {
            hls = new HlsLib({ liveSyncDurationCount: 3, maxBufferLength: 30, backBufferLength: 1800 });
            hls.on(HlsLib.Events.ERROR, (ev, d) => {
               if (d.fatal)
                  message('Fehler beim Abspielen (' + (d.details || d.type) + ')', true);
            });
            hls.loadSource(url);
            hls.attachMedia(video);
         }

         message('');
         video.play().catch(() => {});
      }
      catch (err) {
         if (my === gen && !closed)
            message(missingText(err.data) || err.message || String(err), true);
      }
   }

   const jumpBtn = (d, label) => $('<button type="button" class="btn btn-flat">').text(label)
      .attr('title', (d < 0 ? 'zurück ' : 'vor ') + (Math.abs(d) >= 60 ? Math.abs(d / 60) + ' min' : Math.abs(d) + ' s'))
      .on('click', () => jump(d));

   $video
      .on('timeupdate progress', showTime)
      .on('error', () => { if (video.error && session) message('Fehler beim Abspielen (' + (video.error.message || video.error.code) + ')', true); });

   const $dlg = dialog({
      title: channel + (e.title ? ' – ' + e.title : ''),
      cls: 'dlg-player',
      content: $('<div class="player">').append(
         $video,
         $msg,
         $('<div class="player-bar">').append(
            jumpBtn(-600, '« 10'), jumpBtn(-60, '‹ 1'), jumpBtn(-10, '‹ 10s'),
            $liveBtn,
            jumpBtn(10, '10s ›'), jumpBtn(60, '1 ›'),
            $('<span class="grow">'),
            $time)),
      onClose: () => { closed = true; gen++; clearInterval(keepAlive); detach(); }      // stops the session -> ffmpeg, frees the tuner
   });

   // keep the session alive while paused (the server removes a live session after 30 seconds
   //   without request), notice the end of the stream (e.g. tuner needed by a recording)

   const keepAlive = setInterval(async () => {
      if (!session)
         return;

      try {
         const st = await get('data/rechlsstate?id=' + session);

         if (!st.running && !closed)
            message('Der Live-Stream wurde beendet (z.B. Tuner für eine Aufnahme gebraucht) – ' +
                    'mit »● Live« neu starten.', true);
      }
      catch (err) { }
   }, 10000);

   // live button: jump to the live edge, restart after the end of the stream

   $liveBtn.on('click', () => {
      if (!session || $msg.hasClass('error'))
         return start();

      toLive();
   });

   makeMovable($dlg);
   $dlg.find('.player-video').trigger('focus');
   start();
}
