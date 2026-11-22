// Page "Programm" – what's on now / next / at a given time / quick search

import { state } from '../state.js';
import { get, post } from '../api.js';
import { busy, toastError, stickyBar } from '../ui.js';
import { now, nowUnix, unixTime, formatTime, formatDate, progressOf, toLocalInput, fromLocalInput, textToHtml } from '../utils.js';
import { channelBadge } from '../data.js';
import { icon } from '../icons.js';
import { foreignKey, ctrlScroll, tileInNextRow, focusTile, autoRefresh, replaceBox } from '../gridtools.js';
import { showEvent } from '../eventDetail.js';
import { liveButton } from '../player.js';
import { groupSelect, currentGroup, inGroup } from '../groupfilter.js';
import tr from '../../lang/de.js';

let current = { type: '@Now', time: 0 };
let $page = null;
let lastEvents = [];
let loadSeq = 0;                      // only the answer of the last request is shown
let stopRefresh = null;

// profile.quickTimes: 'Label=!?Value~Label=Value...'; value is 'HH:MM' or '@searchtimer'

function quickTimes() {
   const list = [];

   (state.profile.quickTimes || '').replace(/([^=~]+)=!?([^~]+)~?/g, (m, label, value) => {
      if (value !== '@Now' && value !== '@Next')
         list.push({ label, value });
   });

   return list;
}

// 'HH:MM' -> unix time; if more than one hour in the past -> tomorrow

function timeOfToday(hhmm) {
   const [h, m] = hhmm.split(':').map(Number);
   const d = now();

   if (h < d.getHours() - 1)
      d.setDate(d.getDate() + 1);

   d.setHours(h, m || 0, 0, 0);
   return unixTime(d);
}

export function render($content) {
   const p = state.profile;
   const $bar = $('<div class="toolbar">');
   const $time = $('<input type="datetime-local" class="input" step="900">')
      .attr({ min: toLocalInput(p.minEventTime), max: toLocalInput(p.maxEventTime), title: tr.date });

   $bar.append(
      $('<div class="seg">').append(
         $('<button type="button" class="btn" data-type="@Now">').text(tr.dateTimePicker.currentText),
         $('<button type="button" class="btn" data-type="@Next">').text(tr.pages.eventDetail.eventNext)),
      $time);

   const qt = quickTimes();

   if (qt.length) {
      const $qt = $('<div class="seg seg-wrap">').appendTo($bar);

      for (const q of qt)
         $('<button type="button" class="btn">').attr('data-type', q.value)
            .append(icon(q.value[0] === '@' ? 'search' : 'clock'), $('<span>').text(q.label))
            .appendTo($qt);

      // compact variant for phones (CSS shows either the buttons or this select)

      $('<select class="input qt-select">').attr('title', 'Schnellwahl')
         .append($('<option value="">').text('Schnellwahl …'))
         .append(qt.map((q) => $('<option>').val(q.value).text(q.label)))
         .on('change', function () {
            if (this.value)
               setTime(this.value);
         })
         .appendTo($bar);
   }

   const $grp = groupSelect('now', () => renderEvents(lastEvents));

   if ($grp)
      $bar.append($grp);

   $bar.on('click', 'button[data-type]', function () { setTime($(this).attr('data-type')); });
   $time.on('change', function () { if (this.value) setTime('@time', fromLocalInput(this.value)); });

   $page = $('<section class="page page-now">').append(
      stickyBar($bar),
      $('<p class="page-info">'),
      $('<ul class="event-grid">')
         .on('click', '.event-card .channel', function (ev) {      // channel logo -> magazine at this channel
            ev.stopPropagation();
            location.hash = '#magazine?ch=' + encodeURIComponent($(this).attr('data-channel'));
         })
         .on('click', '.event-card', function () {        // prev / next in the dialog: the events of this page
            showEvent($(this).attr('data-id'), { list: $page.find('.event-card:visible').get().map((c) => c.dataset.id) });
         })
         .on('keydown', '.event-card', function (ev) { if (ev.key === 'Enter') $(this).trigger('click'); }));

   $content.empty().append($page);
   $(document).on('keydown.nowpage', onKey);
   stopRefresh = autoRefresh(() => setTime(current.type, current.time, true));
   setTime(current.type, current.time);
}

export function destroy() {
   $(document).off('.nowpage');
   stopRefresh?.();
   stopRefresh = null;
   $page = null;
}

// keyboard: arrows move the focus over the cards, with Ctrl they scroll the page

function onKey(ev) {
   if (!$page || foreignKey(ev) || ctrlScroll(ev))
      return;

   const cards = $page.find('.event-card').get();
   const cur = document.activeElement?.closest?.('.event-card');
   const i = cards.indexOf(cur);
   let next = null;

   if (!cards.length || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(ev.key))
      return;

   if (i < 0)                                     // nothing focused yet -> start with the first card
      next = ev.key.startsWith('Arrow') ? cards[0] : null;
   else if (ev.key === 'ArrowLeft')  next = cards[i - 1];
   else if (ev.key === 'ArrowRight') next = cards[i + 1];
   else if (ev.key === 'ArrowUp')    next = tileInNextRow(cards, cur, -1);
   else if (ev.key === 'ArrowDown')  next = tileInNextRow(cards, cur, 1);
   else if (ev.key === 'Home')       next = cards[0];
   else if (ev.key === 'End')        next = cards[cards.length - 1];

   if (i >= 0 || next)
      ev.preventDefault();

   next && focusTile(next);

   if (ev.key === 'Home' && next)
      window.scrollTo(0, 0);                      // back to the toolbar too
}

// silent: periodic refresh – no busy indicator and error toasts, unchanged cards stay

async function setTime(type, time, silent = false) {
   let url, body;

   if (type === '@Now' || type === '@time') {
      current = { type, time: type === '@Now' ? nowUnix() : time };
      url = 'data/events?time=' + current.time;
   }
   else if (type === '@Next') {
      current.time ||= nowUnix();
      url = 'data/events?next=1&time=' + current.time;
      current.type = type;
   }
   else if (type[0] === '@') {
      url = 'data/search';
      body = { autotimername: type.slice(1) };
      current.type = type;
   }
   else {
      return setTime('@time', timeOfToday(type));
   }

   if (!$page)
      return;

   const $time = $page.find('input[type=datetime-local]');

   if (!silent || !$time.is(':focus'))                // don't disturb typing
      $time.val(toLocalInput(current.time));

   // mark the current selection: @Now/@Next, a quick search or a quick time matching the time

   const sel = type !== '@time' ? type
      : quickTimes().find((q) => q.value[0] !== '@' && timeOfToday(q.value) === current.time)?.value || '';
   const qtSel = quickTimes().some((q) => q.value === sel) ? sel : '';

   $page.find('button[data-type]').removeClass('active').filter((i, b) => $(b).attr('data-type') === sel).addClass('active');
   $page.find('.qt-select').val(qtSel).toggleClass('active', !!qtSel);
   $page.find('.page-info').text(
      type === '@Now'  ? tr.dateTimePicker.currentText + ', ' + formatDate(current.time, 'long') + ' ' + formatTime(current.time) + ' ' + tr.oClock
    : type === '@Next' ? tr.pages.eventDetail.eventNext + ' ' + formatTime(current.time) + ' ' + tr.oClock
    : type === '@time' ? formatDate(current.time, 'long') + ' ' + formatTime(current.time) + ' ' + tr.oClock
    : tr.menu.search + ': ' + $page.find('button[data-type="' + type + '"]').text());

   const seq = ++loadSeq;

   try {
      const req = body ? post(url, body) : get(url);
      const data = await (silent ? req : busy(req));

      if ($page && seq === loadSeq)
         renderEvents(data.events || []);
   }
   catch (e) {
      if (!silent)
         toastError(e);
   }
}

// the channel group filter applies to the time based lists, not to the search results

//   unchanged cards are kept (no flicker of the images, focus and scroll position stay),
//   only new / changed ones are inserted, the ones which are gone removed

function renderEvents(events) {
   const $ul = $page.find('.event-grid');
   const ul = $ul[0];
   const g = current.type[0] === '@' && !['@Now', '@Next', '@time'].includes(current.type) ? '' : currentGroup('now');
   const old = new Map($ul.children('.event-card').get().map((c) => [c.dataset.id, c]));

   lastEvents = events;
   events = events.filter((e) => inGroup(e.channelid, g));
   $ul.children(':not(.event-card)').remove();

   if (!events.length) {
      $ul.empty().append($('<li class="empty">').text(tr.error.noData));
      return;
   }

   const ids = new Set(events.map((e) => String(e.id)));

   for (const [id, c] of old)
      if (!ids.has(id))
         $(c).remove();

   const focused = document.activeElement;
   let pos = ul.firstElementChild;

   for (const e of events) {
      const sig = JSON.stringify(e) + (progressOf(e.starttime, e.duration) !== null);
      let card = old.get(String(e.id));

      if (card && $(card).data('sig') !== sig)
         card = replaceBox(card, eventCard(e).data('sig', sig));
      else if (!card)
         card = eventCard(e).data('sig', sig)[0];
      else
         updateProgress(card, e);

      if (card !== pos)
         ul.insertBefore(card, pos);       // only moved if the order changed

      pos = card.nextElementSibling;
   }

   if (focused?.isConnected && document.activeElement !== focused)
      focused.focus({ preventScroll: true });
}

function updateProgress(card, e) {
   const p = progressOf(e.starttime, e.duration);

   if (p !== null) {
      $(card).find('.progress > div').css('width', p + '%');
      $(card).find('.ev-rest').text(restText(e));
   }
}

// remaining time of a running event: 'noch 42 Min.'

function restText(e) {
   return 'noch ' + Math.max(0, Math.round((e.starttime + e.duration - nowUnix()) / 60)) + ' ' + tr.minutes;
}

function eventCard(e) {
   const end = e.starttime + e.duration;
   const progress = progressOf(e.starttime, e.duration);
   const desc = e.shortdescription || e.shorttext;
   const img = state.profile.eventImgPath && e.imagecount
      ? '/' + state.profile.eventImgPath + '?' + new URLSearchParams({ no: 0, maxW: 200, maxH: 140, id: e.id }) : null;

   const $time = $('<div class="ev-time">').append(
      $('<b>').text(formatTime(e.starttime)), ' – ', formatTime(end) + ' ' + tr.oClock,
      e.timerid ? $('<span class="badge badge-timer">').attr('title', tr.pages.timer.timerList).html(icon('record')) : null,
      e.tipp ? $('<span class="badge badge-tipp">').text(e.tipp) : null);

   return $('<li class="event-card" tabindex="0">').attr('data-id', e.id).append(
      $('<div class="ev-head">').append(
         channelBadge(e.channelid, { showName: false }),
         $('<div class="ev-when">').append($time,
            progress !== null
               ? $('<div class="ev-prog">').append(
                  $('<div class="progress">').append($('<div>').css('width', progress + '%')),
                  $('<span class="ev-rest">').text(restText(e)))
               : $('<div class="ev-date">').text(formatDate(e.starttime))),
         liveButton(e)),
      $('<div class="ev-body">').append(
         img ? $('<img class="ev-img" loading="lazy" alt="">').attr('src', img) : null,
         $('<div class="ev-title">').text(e.title).append(
            e.numrating ? $('<span class="rate">').addClass('rate' + e.numrating) : null),
         $('<div class="ev-desc">').append(
            e.genre || e.year ? $('<span class="ev-genre">').text([e.genre, e.year].filter(Boolean).join(' · ')) : null,
            desc ? textToHtml(desc) : null)));
}
