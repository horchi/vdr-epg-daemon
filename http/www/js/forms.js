// Form helpers: labeled fields, weekday picker, chip (multi value) picker, HHMM conversion

import { icon } from './icons.js';
import tr from '../lang/de.js';

const pad = (n) => String(n).padStart(2, '0');

// 2015 -> '20:15'; '20:15' -> 2015

export const hhmmToStr = (v) => v === undefined || v === null || v === '' ? '' : pad(Math.floor(v / 100)) + ':' + pad(v % 100);
export const strToHhmm = (s) => s ? parseInt(s.replace(':', ''), 10) : 0;

// <label class="field"><span>Label</span>$input</label>

export function field(label, $input, cls = '') {
   return $('<label class="field">').addClass(cls).append($('<span class="field-label">').text(label), $input);
}

export function checkbox(label, checked = false, cls = '') {
   const $cb = $('<input type="checkbox">').prop('checked', !!checked);
   return { $el: $('<label class="check">').addClass(cls).append($cb, $('<span>').text(label)), $cb };
}

// select from [{value,label}] or [label] (value = index)

export function select(options, value) {
   const $s = $('<select class="input">');

   options.forEach((o, i) => {
      const opt = typeof o === 'object' ? o : { value: i, label: o };
      $('<option>').val(opt.value).text(opt.label).appendTo($s);
   });

   $s.val(String(value ?? ''));
   return $s;
}

// segmented radio buttons [{value,label}]

export function segmented(options, value, onChange) {
   const $seg = $('<div class="seg seg-radio" role="radiogroup">');

   for (const o of options)
      $('<button type="button" class="btn">').attr('data-value', o.value).text(o.label)
         .toggleClass('active', o.value === value)
         .on('click', function () {
            $seg.find('.btn').removeClass('active');
            $(this).addClass('active');
            onChange?.(o.value);
         })
         .appendTo($seg);

   return { $el: $seg, get: () => $seg.find('.btn.active').attr('data-value') };
}

// weekdays bitmask: Mo=1, Di=2, ... Sa=32, So=64 (as stored by epgd)

export function weekdayPicker(bits = 0) {
   const names = tr.dateTimePicker.dayNamesShort;
   const order = [1, 2, 3, 4, 5, 6, 0];
   const $w = $('<div class="weekdays">');

   order.forEach((day, i) => {
      $('<label class="chip-toggle">').append(
         $('<input type="checkbox">').prop('checked', !!(bits & (1 << i))),
         $('<span>').text(names[day])).appendTo($w);
   });

   return {
      $el: $w,
      get: () => $w.find('input').toArray().reduce((sum, cb, i) => sum + (cb.checked ? 1 << i : 0), 0)
   };
}

// multi value picker with suggestions: options [{value,label}] or [string]

let pickerId = 0;

export function chipPicker({ options = [], values = [], placeholder = '' } = {}) {
   const opts = options.map((o) => typeof o === 'object' ? o : { value: o, label: o });
   const byValue = new Map(opts.map((o) => [String(o.value), o]));
   const byLabel = new Map(opts.map((o) => [o.label.toLowerCase(), o]));
   const listId = 'chip-list-' + (++pickerId);
   const chosen = [];

   const $chips = $('<div class="chips">');
   const $input = $('<input class="chip-input" autocomplete="off">').attr({ list: listId, placeholder });
   const $list = $('<datalist>').attr('id', listId).append(opts.map((o) => $('<option>').val(o.label)));
   const $el = $('<div class="chip-picker input">').append($chips, $input, $list)
      .on('click', (ev) => { if (ev.target === $el[0]) $input.trigger('focus'); });

   function add(value) {
      const v = String(value).trim();

      if (!v || chosen.includes(v))
         return;

      chosen.push(v);
      $('<span class="chip">').attr('data-value', v).text(byValue.get(v)?.label || v)
         .append($('<button type="button" class="chip-x">').attr('title', tr.del).html(icon('close'))
            .on('click', function () {
               chosen.splice(chosen.indexOf(v), 1);
               $(this).parent().remove();
            }))
         .appendTo($chips);
   }

   function takeInput() {
      const txt = $input.val().trim();

      if (!txt)
         return;

      const o = byLabel.get(txt.toLowerCase());

      if (o || !opts.length) {
         add(o ? o.value : txt);
         $input.val('');
      }
   }

   $input.on('change', takeInput)
      .on('keydown', (ev) => {
         if (ev.key === 'Enter') { ev.preventDefault(); takeInput(); }
         if (ev.key === 'Backspace' && !$input.val() && chosen.length) $chips.find('.chip-x').last().trigger('click');
      });

   values.filter((v) => v !== '' && v !== null && v !== undefined).forEach(add);

   return {
      $el,
      get: () => chosen.slice(),
      set(vals) { $chips.empty(); chosen.length = 0; vals.forEach(add); }
   };
}
