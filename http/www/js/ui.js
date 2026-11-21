// Generic UI helpers: toasts, modal dialogs, busy indicator

import tr from '../lang/de.js';
import { icon } from './icons.js';

// ---------------------------------------------------------------------------
// button / filter bar at the top of a page that stays visible while scrolling (below the
//   top bar and the tabs), its height goes to --bar-h of the page for the elements stuck below it

export function stickyBar($bar) {
   let seen = false;

   const ro = new ResizeObserver(() => {
      if (!$bar[0].isConnected)                   // removed from the page -> done
         return seen && ro.disconnect();

      seen = true;
      $bar.closest('.page')[0]?.style.setProperty('--bar-h', $bar.outerHeight() + 'px');
   });

   ro.observe($bar.addClass('sticky-bar')[0]);
   return $bar;
}

// ---------------------------------------------------------------------------
// toast

let $toasts = null;

// modal <dialog>s live in the browser's top layer – overlays must go into the topmost one to stay visible

const topLayer = () => $('dialog[open]').last()[0] || document.body;

export function toast(text, { error = false, timeout } = {}) {
   $toasts ??= $('<div class="toasts" aria-live="polite">');
   $toasts.appendTo(topLayer());

   const $t = $('<div class="toast">')
      .toggleClass('toast-error', error)
      .append($('<span>').text(text))
      .append($('<button type="button" class="btn btn-icon btn-flat">').attr('title', tr.close).html(icon('close'))
         .on('click', () => $t.remove()))
      .appendTo($toasts);

   timeout ??= error ? 8000 : 3000;

   if (timeout)
      setTimeout(() => $t.addClass('toast-out').one('animationend', () => $t.remove()), timeout);

   return $t;
}

export const toastError = (e) => toast(e?.message || String(e), { error: true });

// ---------------------------------------------------------------------------
// modal dialog based on native <dialog>
//   buttons: [{ text, primary, click($dlg) -> false keeps it open }]

export function dialog({ title, content, buttons = [], cls = '', closable = true, onClose } = {}) {
   const $dlg = $('<dialog class="dlg">').addClass(cls);
   const $head = $('<header class="dlg-head">').append($('<h2>').text(title || ''));

   if (closable)
      $head.append($('<button type="button" class="btn btn-icon btn-flat">').attr('title', tr.close).html(icon('close'))
         .on('click', () => $dlg[0].close()));

   const $foot = $('<footer class="dlg-foot">');

   for (const b of buttons) {
      $('<button type="button" class="btn">').text(b.text)
         .toggleClass('btn-primary', !!b.primary)
         .addClass(b.cls || '')
         .on('click', () => { if (b.click?.($dlg) !== false) $dlg[0].close(); })
         .appendTo($foot);
   }

   $dlg.append($head, $('<div class="dlg-body">').append(content), buttons.length ? $foot : null)
      .on('cancel', (ev) => { if (!closable) ev.preventDefault(); })
      .on('close', () => { $dlg.find('.toasts, .busy').appendTo(document.body); onClose?.(); $dlg.remove(); })
      .appendTo(document.body);

   $dlg[0].showModal();

   // desktop: focus the first field (on phones this would pop up the keyboard),
   // without a field the primary button is the default one (Enter / Space)

   const $field = matchMedia('(hover: hover)').matches
      ? $dlg.find('.dlg-body').find('input:not([type=checkbox]):not([disabled]), select:not([disabled])').first() : $();
   const $default = $foot.find('.btn-primary').first();

   if ($field.length)
      $field.trigger('focus');
   else if ($default.length)
      $default[0].focus();
   else
      $dlg.attr('tabindex', -1)[0].focus();

   return $dlg;
}

// move a dialog by dragging its header (not on its buttons), it stays inside the window

export function makeMovable($dlg) {
   const dlg = $dlg[0];

   $dlg.addClass('dlg-movable').find('.dlg-head').on('pointerdown', (ev) => {
      if (ev.button !== 0 || $(ev.target).closest('button, a, input, select').length)
         return;

      const r = dlg.getBoundingClientRect();
      const dx = ev.clientX - r.left, dy = ev.clientY - r.top;
      const head = ev.currentTarget;

      head.setPointerCapture(ev.pointerId);
      ev.preventDefault();

      const move = (e) => {
         const x = Math.min(Math.max(0, e.clientX - dx), innerWidth - Math.min(r.width, 80));
         const y = Math.min(Math.max(0, e.clientY - dy), innerHeight - 40);
         $dlg.css({ margin: 0, left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' });
      };

      const up = () => $(head).off('pointermove', move).off('pointerup pointercancel', up);

      $(head).on('pointermove', move).on('pointerup pointercancel', up);
   });

   return $dlg;
}

export function alertBox(text, title = '') {
   return dialog({ title, content: $('<p>').text(text), buttons: [{ text: 'OK', primary: true }] });
}

export function confirmBox(text, title = '') {
   return new Promise((resolve) => {
      let result = false;
      dialog({
         title, content: $('<p>').text(text),
         buttons: [
            { text: tr.no },
            { text: tr.yes, primary: true, click: () => { result = true; } }
         ],
         onClose: () => resolve(result)
      });
   });
}

// ---------------------------------------------------------------------------
// busy indicator (thin progress bar on top), reference counted
//   await busy(promise) / busy(async () => ...)

let busyCount = 0;
let $busy = null;

export async function busy(work) {
   $busy ??= $('<div class="busy" role="progressbar">');
   $busy.appendTo(topLayer());
   busyCount++;
   $busy.addClass('on');

   try {
      return await (typeof work === 'function' ? work() : work);
   }
   finally {
      if (--busyCount === 0)
         $busy.removeClass('on');
   }
}
