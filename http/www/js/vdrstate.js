// State of a VDR and its host (data/vdrs?probe=1 -> 'hoststate') and the matching
//   start action: wake on lan if the host is off, the start script if only the VDR is off

import { get, apiUrl } from './api.js';
import { busy, toast, toastError, dialog } from './ui.js';
import { icon } from './icons.js';
import { nowUnix } from './utils.js';

//   canStart: a start script is configured (data/vdrs -> 'vdrstart')
//   -> { online, text, cls, action: { label, title } | null }

export function vdrState(v, canStart) {
   if (v.state === 'attached')
      return { online: true, text: 'verbunden', cls: 'vs-on', action: null };

   switch (v.hoststate) {
      case 'vdr':
         return { online: false, text: 'VDR läuft, nicht verbunden', cls: 'vs-half', action: null };

      case 'up':
         return { online: false, text: 'Host an, VDR aus', cls: 'vs-half',
                  action: canStart ? { label: 'VDR starten', title: 'VDR über das Start-Skript (vdrStartScript) starten' } : null };

      case 'down':
         return { online: false, text: 'Host aus', cls: 'vs-off',
                  action: v.mac ? { label: 'Wecken', title: 'Wake on LAN an ' + v.mac } : null };

      default:                     // not probed
         return { online: false, text: 'getrennt', cls: 'vs-off',
                  action: v.mac ? { label: 'Wecken', title: 'Wake on LAN an ' + v.mac } : null };
   }
}

// State of the epgd (row 'epgd' of data/vdrs, 'statesince' -> start of the current state)
//   while busy with events, match or scraping epg2vdr pauses and takes timer jobs only afterwards
//   -> { busy, blocking, long, text, wait }   jobs: number of pending timer jobs (or null)

const EPGD_BUSY = {
   'busy (events)':   { label: 'EPG-Update', long: true },     // download of the EPG, minutes
   'busy (match)':    { label: 'Abgleich' },                   // merge, seconds
   'busy (scraping)': { label: 'Scraping' },
   'busy (images)':   { label: 'Bilder', free: true }           // epg2vdr doesn't pause
};

export function epgdState(v, jobs = null) {
   const b = EPGD_BUSY[v.state];

   if (!b)
      return { busy: false, blocking: false, long: false, text: v.state || '?', wait: null };

   const secs = v.statesince ? Math.max(0, nowUnix() - v.statesince) : 0;
   const long = !b.free && (b.long || secs >= 60);
   const since = secs ? ' seit ' + (secs < 60 ? secs + ' s' : Math.round(secs / 60) + ' min') : '';
   const wait = b.free ? null : jobs ? (jobs === 1 ? '1 Timer-Auftrag wartet' : jobs + ' Timer-Aufträge warten') + ' bis der epgd fertig ist'
      : long ? 'Timer-Aufträge werden erst danach übernommen' : null;

   return { busy: true, blocking: !b.free, long, text: v.state + ' – ' + b.label + since, wait };
}

export function startButton(v, st, cls = 'btn-sm') {
   if (!st.action)
      return null;

   return $('<button type="button" class="btn">').addClass(cls).attr('title', st.action.title)
      .append(icon('play'), $('<span>').text(st.action.label))
      .on('click', () => startVdr(v));
}

// the server decides: host up -> start script, host off -> WOL

export async function startVdr(v) {
   try {
      const res = await busy(get('data/wakeupvdr?uuid=' + encodeURIComponent(v.uuid)));
      toast('VDR ' + v.name + ': ' + (res.result?.message || 'done'));
   }
   catch (e) { toastError(e); }
}

// remote control of the osd2web plugin (fb.html), enabled if the VDR is attached and its
//   osd2web answers; loaded by the proxy of epghttpd (data/osd2web/<uuid>/, incl. the
//   websocket) since osd2web is plain http and the browser blocks it on a https page
//   hide: no button (null) instead of a disabled one if the VDR is not attached or has no osd2web

export function remoteButton(v, cls = 'btn-sm', hide = false) {
   const available = v.state === 'attached' && v.osd2webp > 0 && v.ip;

   if (!available && hide)
      return null;

   const $btn = $('<button type="button" class="btn" disabled>').addClass(cls)
      .append(icon('remote'), $('<span>').text('Fernbedienung'))
      .attr('title', 'osd2web nicht verfügbar');

   if (!available)
      return $btn;

   const url = apiUrl('data/osd2web/' + encodeURIComponent(v.uuid) + '/fb.html');

   $btn.attr('title', 'Prüfe osd2web …');

   fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(6000) })
      .then((res) => {
         if (!res.ok)
            throw new Error(res.status);
         $btn.prop('disabled', false).attr('title', 'Fernbedienung von ' + (v.name || v.ip) + ' öffnen')
            .on('click', () => openRemote(v, url));
      })
      .catch(() => $btn.attr('title', 'osd2web auf ' + v.ip + ':' + v.osd2webp + ' nicht erreichbar'));

   return $btn;
}

function openRemote(v, url) {
   dialog({
      title: 'Fernbedienung – ' + (v.name || v.ip),
      cls: 'dlg-remote',
      content: $('<iframe class="remote-frame" allow="fullscreen">').attr('src', url).attr('title', 'Fernbedienung')
   });
}
