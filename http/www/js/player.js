// Play a recording in the browser – data/recstream (ffmpeg on the epgd host remuxes
//   the TS files to fragmented MP4: H.264 copied, audio to AAC). Interlaced H.264 (1080i)
//   and MPEG-2 (SD) are deinterlaced and encoded (transcode=1), the browsers can't decode
//   the field pictures of a copied 1080i stream and no MPEG-2 at all.
//   The player window can be moved (header) and resized (lower right corner).
//   The stream can't be seeked, a jump restarts it at the new position (start=<sec>).

import { apiUrl, get, qs } from './api.js';
import { busy, dialog, alertBox, makeMovable } from './ui.js';

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
   let offset = 0;                 // start position of the current stream
   let dragging = false;

   const $video = $('<video class="player-video" controls autoplay playsinline>');
   const video = $video[0];
   const $pos = $('<input type="range" class="player-seek" min="0" step="1">').attr('max', duration || 1).val(0);
   const $time = $('<span class="player-time">');
   const $err = $('<div class="player-error" hidden>');

   const position = () => offset + (video.currentTime || 0);

   function showTime(t) {
      $time.text(hms(t) + (duration ? ' / ' + hms(duration) : ''));
   }

   function start(t) {
      offset = Math.max(0, Math.min(Math.floor(t), duration ? duration - 5 : t));
      $err.prop('hidden', true);
      video.src = apiUrl('data/recstream?' + qs({ ...ref, start: offset, transcode: info.transcode ? 1 : 0 }));
      video.play().catch(() => {});
      $pos.val(offset);
      showTime(offset);
   }

   const jump = (d) => start(position() + d);
   const jumpBtn = (d, label) => $('<button type="button" class="btn btn-flat">').text(label)
      .attr('title', (d < 0 ? 'zurück ' : 'vor ') + Math.abs(d / 60) + ' min').on('click', () => jump(d));

   $video
      .on('timeupdate', () => { if (!dragging) { $pos.val(position()); showTime(position()); } })
      .on('error', () => $err.text('Fehler beim Abspielen (' + (video.error?.message || video.error?.code || '?') + ')').prop('hidden', false));

   $pos
      .on('input', () => { dragging = true; showTime(+$pos.val()); })
      .on('change', () => { dragging = false; start(+$pos.val()); });

   const $dlg = dialog({
      title: r.title || r.name || 'Aufnahme',
      cls: 'dlg-player',
      content: $('<div class="player">').append(
         $video,
         $err,
         $('<div class="player-bar">').append(
            jumpBtn(-600, '« 10'), jumpBtn(-60, '‹ 1'),
            $pos,
            jumpBtn(60, '1 ›'), jumpBtn(600, '10 »'),
            $time)),
      onClose: () => { video.pause(); video.removeAttribute('src'); video.load(); }   // ends the stream -> ffmpeg
   });

   makeMovable($dlg);
   $dlg.find('.player-video').trigger('focus');
   start(0);
}
