// Disk usage of the VDRs' video directories with the remaining recording time
//   (used by the pages 'Aufnahmen' and 'Übersicht')

import { state } from './state.js';
import { sizeText } from './utils.js';
import { icon } from './icons.js';

// VDRs sharing one video directory are shown once -> [{ ...vdr, names: [] }]
//   same directory and nearly the same size (each VDR reports it a bit different), the
//   values of the VDR with the latest update win (the others may be outdated)

export function diskList(vdrs = Object.values(state.vdrs)) {
   const disks = [];
   const sorted = vdrs.filter((v) => v.videototal).sort((a, b) => (b.lastupdate || 0) - (a.lastupdate || 0));

   for (const v of sorted) {
      const d = disks.find((d) => d.videodir && d.videodir === v.videodir
         && Math.abs(d.videototal - v.videototal) < d.videototal / 100);

      d ? d.names.push(v.name) : disks.push({ ...v, names: [v.name] });
   }

   return disks;
}

export function renderDisks(vdrs) {
   const $d = $('<div class="disks">');

   for (const v of diskList(vdrs)) {
      const used = 100 - v.videofree / v.videototal * 100;

      $('<div class="disk">').attr('title', v.names.join(', ') + ': ' + (v.videodir || '')).data('free', v.videofree).append(
         $('<div class="disk-head">').append(icon('disk'), $('<b>').text(v.names.join(', ')),
            $('<span class="dim">').append(sizeText(v.videofree) + ' frei', $('<span class="disk-total">').text(' / ' + sizeText(v.videototal)))),
         $('<div class="progress disk-bar">').toggleClass('full', used > 90).append($('<div>').css('width', used + '%')),
         $('<div class="disk-time dim">'))
         .appendTo($d);
   }

   return $d;
}

// MB per minute of recording, like VDR from the space used by the recordings and their
//   length; VDRs sharing one disk are counted once, unknown -> VDR's default of 25.75 MB/min

export function mbPerMinute(recs, vdrs = Object.values(state.vdrs)) {
   const usedMb = diskList(vdrs).reduce((s, v) => s + v.videototal - (v.videofree || 0), 0);
   const minutes = (recs || []).reduce((s, r) => s + (r.duration || 0), 0) / 60;
   const mbpm = minutes > 0 ? usedMb / minutes : 0;

   return mbpm >= 5 && mbpm <= 500 ? mbpm : 25.75;
}

// minutes -> 'H:MM'

export const hoursText = (min) => Math.floor(min / 60) + ':' + String(Math.floor(min % 60)).padStart(2, '0');

// remaining recording time (HH:MM) of the free space for each .disk below $root

export function updateDiskTimes($root, recs, vdrs) {
   if (!$root || !recs)
      return;

   const mbpm = mbPerMinute(recs, vdrs);

   $root.find('.disk').each((i, el) => {
      const min = Math.floor(($(el).data('free') || 0) / mbpm);
      $(el).find('.disk-time').text('ca. ' + hoursText(min) + ' h Aufnahmezeit')
         .attr('title', 'verbleibende Aufnahmezeit, geschätzt mit ' + Math.round(mbpm) + ' MB pro Minute');
   });
}
