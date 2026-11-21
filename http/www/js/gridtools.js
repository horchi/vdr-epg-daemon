// Helpers shared by the EPG grid pages (magazine, timeline) and the tile navigation

import { state } from './state.js';
import { toDate, unixTime } from './utils.js';

// quick times of the profile – only 'HH:MM' entries are useful for a grid

export function quickTimes() {
   const list = [];

   (state.profile.quickTimes || '').replace(/([^=~]+)=!?([0-9]{1,2}:[0-9]{2})~?/g, (a, label, value) => {
      list.push({ label, value });
   });

   return list;
}

// value of the quick time matching the time of day of t (±1 minute), '' if none

export function quickTimeAt(qt, t) {
   const d = toDate(t);
   const min = d.getHours() * 60 + d.getMinutes();

   return qt.find((q) => {
      const [h, mi] = q.value.split(':').map(Number);
      return Math.abs(h * 60 + mi - min) <= 1;
   })?.value || '';
}

// unix time of 'HH:MM' on the day of t

export function timeOnDay(t, hhmm) {
   const [h, mi] = hhmm.split(':').map(Number);
   const d = toDate(t);

   d.setHours(h, mi, 0, 0);
   return unixTime(d);
}

// ---------------------------------------------------------------------------
// keyboard navigation over the tiles (Programm, Zeitleiste)
//   the arrow keys move the focus from tile to tile, with Ctrl held they scroll as usual

export const SCROLL_STEP = 40;               // [px] per Ctrl+arrow

// true if the key is not ours: typing in a field, a dialog is open, other modifiers

export function foreignKey(ev) {
   return ev.altKey || ev.metaKey || ev.shiftKey
      || $(ev.target).is('input, select, textarea, [contenteditable]')
      || $('dialog[open]').length > 0;
}

// Ctrl+arrow -> scroll the element (or the page) by one step, true if handled

export function ctrlScroll(ev, el = document.scrollingElement) {
   const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[ev.key];

   if (!ev.ctrlKey || !d)
      return false;

   ev.preventDefault();
   el.scrollBy({ left: d[0] * SCROLL_STEP, top: d[1] * SCROLL_STEP });
   return true;
}

// tile in the row above (dir -1) or below (dir 1) of cur, the one nearest to its horizontal center

export function tileInNextRow(tiles, cur, dir) {
   const r = cur.getBoundingClientRect();
   const cx = r.left + r.width / 2;
   let best = null, bestDy = Infinity, bestDx = Infinity;

   for (const t of tiles) {
      const q = t.getBoundingClientRect();
      const dy = (q.top - r.top) * dir;
      const dx = Math.abs(q.left + q.width / 2 - cx);

      if (dy < 1)
         continue;

      if (dy < bestDy - 1 || (Math.abs(dy - bestDy) <= 1 && dx < bestDx))
         [best, bestDy, bestDx] = [t, dy, dx];
   }

   return best;
}

// focus without the browser's own scrolling, then bring it into view (respects scroll-margin)

export function focusTile(el) {
   el.focus({ preventScroll: true });
   el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

// ---------------------------------------------------------------------------
// periodic refresh of the EPG pages (Programm, Magazin, Zeitleiste)
//   fn runs every REFRESH seconds while the tab is visible, at once when the tab gets visible
//   again after a longer time and after a timer was changed; returns the stop function

export const REFRESH = 60;                   // [s]

export function autoRefresh(fn) {
   let last = Date.now();
   const ns = '.autorefresh';
   const run = () => { last = Date.now(); fn(); };
   const timer = setInterval(() => { if (!document.hidden) run(); }, REFRESH * 1000);

   $(document).on('visibilitychange' + ns, () => {
      if (!document.hidden && Date.now() - last >= REFRESH * 1000)
         run();
   });

   $(window).on('timers:changed' + ns, run);

   return () => {
      clearInterval(timer);
      $(document).off(ns);
      $(window).off(ns);
   };
}

// replace the element by $new if it changed, keeps the keyboard focus

export function replaceBox(el, $new) {
   const focused = document.activeElement === el;

   $(el).replaceWith($new);

   if (focused)
      $new[0].focus({ preventScroll: true });

   return $new[0];
}

// merge the events of a loaded time slice [from, to) into a lane / column of a grid page:
//   new ones are added, changed ones replaced, the ones which are gone removed
//   els: Map event id -> element, box(e): builds the element

export function mergeEvents($lane, els, events, from, to, box) {
   const seen = new Set();

   for (const e of events) {
      const sig = JSON.stringify(e);
      const el = els.get(e.id);

      seen.add(e.id);

      if (el && $(el).data('sig') === sig)
         continue;

      const $box = box(e).data('sig', sig);

      if (el)
         els.set(e.id, replaceBox(el, $box));
      else
         els.set(e.id, $box.appendTo($lane)[0]);
   }

   for (const [id, el] of els) {
      if (!seen.has(id) && +el.dataset.start >= from && +el.dataset.start < to) {
         $(el).remove();
         els.delete(id);
      }
   }
}
