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
