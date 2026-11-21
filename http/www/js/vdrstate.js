// State of a VDR and its host (data/vdrs?probe=1 -> 'hoststate') and the matching
//   start action: wake on lan if the host is off, the start script if only the VDR is off

import { get } from './api.js';
import { busy, toast, toastError } from './ui.js';
import { icon } from './icons.js';

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
