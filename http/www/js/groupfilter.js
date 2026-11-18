// Channel group filter of the program pages (now, magazine, timeline)
//
//   The groups are the ones of the VDR channels.conf, taken to the channelmap by the
//   epg2vdr master (channelmap.channelgroup). The selection is remembered per page
//   in the browser (localStorage, a convenience only - works without it too).

import { state } from './state.js';

const KEY = 'epgd.channelGroup.';

// groups of the visible channels in the order of the channel list

export function channelGroups() {
   const groups = [];

   for (const id of state.channelOrder) {
      const c = state.channels[id];

      if (c && (c.visible & 1) && c.group && !groups.includes(c.group))
         groups.push(c.group);
   }

   return groups;
}

export function currentGroup(page) {
   let g = '';

   try { g = localStorage.getItem(KEY + page) || ''; }
   catch (e) { /* no storage */ }

   return channelGroups().includes(g) ? g : '';
}

function storeGroup(page, g) {
   try { g ? localStorage.setItem(KEY + page, g) : localStorage.removeItem(KEY + page); }
   catch (e) { /* no storage */ }
}

export const inGroup = (id, g) => !g || state.channels[id]?.group === g;

export function filterChannels(ids, page) {
   const g = currentGroup(page);
   return ids.filter((id) => inGroup(id, g));
}

// select for the toolbar, null if there are less than two groups

export function groupSelect(page, onChange) {
   const groups = channelGroups();

   if (groups.length < 2)
      return null;

   const cur = currentGroup(page);

   return $('<select class="input group-select">').attr('title', 'Kanalgruppe')
      .append($('<option value="">').text('Alle Gruppen'), groups.map((g) => $('<option>').val(g).text(g)))
      .val(cur)
      .toggleClass('active', !!cur)
      .on('change', function () {
         storeGroup(page, this.value);
         $(this).toggleClass('active', !!this.value);
         onChange(this.value);
      });
}
