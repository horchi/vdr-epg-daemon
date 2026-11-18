// Page "Magazin" – EPG grid: channels as columns, time running downwards
//
//   One scroll container (both directions); channel heads stick to the top, the time axis
//   sticks to the left (CSS position: sticky). Events are positioned absolutely by time,
//   SEC_PER_PX seconds per pixel. Data is loaded lazily per channel in BLOCK sized
//   time slices – only for the visible channels / times.

import { state } from '../state.js';
import { get, mediaUrl } from '../api.js';
import { busy, toastError } from '../ui.js';
import { nowUnix, unixTime, toDate, formatTime, formatDate, toLocalInput, fromLocalInput, textToHtml } from '../utils.js';
import { channelBadge } from '../data.js';
import { quickTimes, timeOnDay } from '../gridtools.js';
import { icon, iconButton } from '../icons.js';
import { showEvent } from '../eventDetail.js';
import { groupSelect, filterChannels } from '../groupfilter.js';
import tr from '../../lang/de.js';

const SEC_PER_PX = 30;                // 2px per minute (as the old UI)
const BLOCK = 6 * 3600;               // load granularity
const LOOKBACK = 6 * 3600;            // events starting up to 6h before a block may still run into it

let m = null;                         // state of the rendered page

const yOf = (t) => (t - m.gridStart) / SEC_PER_PX;
const tOf = (y) => m.gridStart + y * SEC_PER_PX;

// ---------------------------------------------------------------------------
// render

export function render($content, params = {}) {
   destroy();

   const p = state.profile;
   const d = toDate(p.minEventTime);

   d.setMinutes(0, 0, 0);                                   // grid starts at a full hour

   m = {
      gridStart: unixTime(d),
      gridEnd: p.maxEventTime,
      channels: filterChannels(state.channelOrder.filter((id) => state.channels[id]?.visible & 1), 'magazine'),
      cols: {},                                             // channelid -> { $col, ids:Set, blocks:Set }
      timer: null,
      loadTimer: null,
      raf: 0
   };

   const height = Math.ceil(yOf(m.gridEnd));

   // toolbar

   const $time = $('<input type="datetime-local" class="input" step="900">')
      .attr({ min: toLocalInput(p.minEventTime), max: toLocalInput(p.maxEventTime), title: tr.date })
      .on('change', function () { if (this.value) scrollToTime(fromLocalInput(this.value)); });

   const $chSel = $('<select class="input mag-ch-select">').attr('title', tr.channel)
      .append(m.channels.map((id) => $('<option>').val(id).text(state.channels[id].name || id)))
      .on('change', function () { scrollToChannel(this.value); });

   const $bar = $('<div class="toolbar mag-toolbar">').append(
      $('<div class="seg">').append(
         iconButton('prev', '-1 Tag').on('click', () => scrollToTime(topTime() - 86400 + 1800)),
         $('<button type="button" class="btn">').text(tr.dateTimePicker.currentText).on('click', () => scrollToTime(nowUnix())),
         iconButton('next', '+1 Tag').on('click', () => scrollToTime(topTime() + 86400 + 1800))),
      $time, $chSel,
      groupSelect('magazine', () => render($content, { time: topTime() + 30 * 60 })));    // keep the time

   const qt = quickTimes();

   if (qt.length) {
      $('<div class="seg seg-wrap">').append(qt.map((q) =>
         $('<button type="button" class="btn">').append(icon('clock'), $('<span>').text(q.label))
            .on('click', () => scrollToTime(timeOnVisibleDay(q.value))))).appendTo($bar);

      $('<select class="input qt-select">').attr('title', 'Schnellwahl')
         .append($('<option value="">').text('Schnellwahl …'), qt.map((q) => $('<option>').val(q.value).text(q.label)))
         .on('change', function () { if (this.value) scrollToTime(timeOnVisibleDay(this.value)); this.value = ''; })
         .appendTo($bar);
   }

   // grid

   const $grid = $('<div class="mag-grid">')
      .css({ '--cols': m.channels.length, '--height': height + 'px' });

   $grid.append($('<div class="mag-corner">'));

   // explicit grid columns – auto placement would push the columns behind the overlay

   m.channels.forEach((id, i) =>
      $grid.append($('<div class="mag-head">').css('grid-column', i + 2).append(channelBadge(id))));

   $grid.append(timeAxis(height));

   for (const [i, id] of m.channels.entries()) {
      const $col = $('<div class="mag-col">').attr('data-channel', id).css('grid-column', i + 2);
      m.cols[id] = { $col, ids: new Set(), blocks: new Set() };
      $grid.append($col);
   }

   m.$now = $('<div class="mag-now">');
   $grid.append($('<div class="mag-overlay">').append(dayLines(), qtLines(qt), m.$now));

   m.$scroll = $('<div class="mag-scroll">').append($grid)
      .on('scroll', onScroll)
      .on('click', '.mag-ev', function () { showEvent($(this).attr('data-id')); })
      .on('keydown', '.mag-ev', function (ev) { if (ev.key === 'Enter') $(this).trigger('click'); });

   m.$time = $time;
   m.$chSel = $chSel;

   $content.empty().append($('<section class="page page-magazine">').append($bar, m.$scroll));

   if (!m.channels.length)
      return m.$scroll.empty().append($('<p class="empty">').text(tr.error.noData));

   updateNow();
   m.timer = setInterval(updateNow, 60000);
   $(window).on('resize.magazine', onScroll);

   scrollToTime(Number(params.time) || nowUnix());

   if (params.ch && m.cols[params.ch])
      scrollToChannel(params.ch);
}

export function destroy() {
   if (!m)
      return;

   clearInterval(m.timer);
   clearTimeout(m.loadTimer);
   cancelAnimationFrame(m.raf);
   $(window).off('.magazine');
   m = null;
}

// ---------------------------------------------------------------------------
// static parts

function timeAxis(height) {
   const $axis = $('<div class="mag-axis">');

   for (let t = m.gridStart; t < m.gridEnd; t += 3600) {
      const d = toDate(t);
      const $l = $('<div class="mag-hour">').css('top', yOf(t) + 'px').text(formatTime(t));

      if (d.getHours() === 0)
         $l.addClass('mag-midnight').prepend($('<b>').text(formatDate(t)));

      $axis.append($l);
   }

   return $axis.css('height', height + 'px');
}

function dayLines() {
   const $f = $(document.createDocumentFragment());

   for (let t = m.gridStart; t < m.gridEnd; t += 3600)
      if (toDate(t).getHours() === 0)
         $f.append($('<div class="mag-dayline">').css('top', yOf(t) + 'px'));

   return $f.children();
}

// thin accent lines at the quick times (e.g. 20:15) of every day

function qtLines(qt) {
   const lines = [];

   for (let day = m.gridStart; day < m.gridEnd; day += 86400) {
      for (const q of qt) {
         const t = timeOnDay(day, q.value);

         if (t > m.gridStart && t < m.gridEnd)
            lines.push($('<div class="mag-qtline">').css('top', yOf(t) + 'px').attr('data-label', q.label));
      }
   }

   return lines;
}

function updateNow() {
   if (!m)
      return;

   const n = nowUnix();

   m.$now.css('top', yOf(n) + 'px').attr('data-time', formatTime(n)).toggle(n >= m.gridStart && n <= m.gridEnd);

   for (const c of Object.values(m.cols))
      c.$col.children('.mag-ev').each(function () {
         $(this).toggleClass('past', +this.dataset.end <= n).toggleClass('running', +this.dataset.start <= n && +this.dataset.end > n);
      });
}

// ---------------------------------------------------------------------------
// quick times

const timeOnVisibleDay = (hhmm) => timeOnDay(topTime() + 3600, hhmm);

// ---------------------------------------------------------------------------
// navigation

function topTime() {
   return tOf(m.$scroll.scrollTop());
}

function scrollToTime(t) {
   t = Math.max(m.gridStart, Math.min(t, m.gridEnd));
   m.$scroll.scrollTop(yOf(t) - 30 * 60 / SEC_PER_PX);   // 30 minutes above
   onScroll();
}

function scrollToChannel(id) {
   const $col = m.cols[id]?.$col;

   if ($col)
      m.$scroll.scrollLeft($col[0].offsetLeft - m.$scroll.find('.mag-axis').outerWidth());
}

function onScroll() {
   if (!m || m.raf)
      return;

   m.raf = requestAnimationFrame(() => {
      if (!m)
         return;

      m.raf = 0;

      const t = topTime() + 1800;
      m.$time.val(toLocalInput(Math.min(t, m.gridEnd)));

      const first = visibleChannels()[0];
      first && m.$chSel.val(first);

      clearTimeout(m.loadTimer);
      m.loadTimer = setTimeout(loadVisible, 120);
   });
}

function visibleChannels() {
   const s = m.$scroll[0];
   const axisW = m.$scroll.find('.mag-axis').outerWidth();
   const left = s.scrollLeft + axisW;
   const right = s.scrollLeft + s.clientWidth;
   const list = [];

   for (const id of m.channels) {
      const col = m.cols[id].$col[0];

      if (col.offsetLeft + col.offsetWidth > left - col.offsetWidth && col.offsetLeft < right + col.offsetWidth)
         list.push(id);
   }

   return list;
}

// ---------------------------------------------------------------------------
// data

function loadVisible() {
   if (!m)
      return;

   const s = m.$scroll[0];
   const from = tOf(s.scrollTop) - 3600;
   const to = tOf(s.scrollTop + s.clientHeight) + 3600;
   const firstBlock = Math.floor((Math.max(from, m.gridStart) - m.gridStart) / BLOCK);
   const lastBlock = Math.floor((Math.min(to, m.gridEnd) - m.gridStart) / BLOCK);
   const jobs = [];

   for (const id of visibleChannels())
      for (let b = firstBlock; b <= lastBlock; b++)
         if (!m.cols[id].blocks.has(b))
            jobs.push(loadBlock(id, b));

   if (jobs.length)
      busy(Promise.all(jobs));
}

async function loadBlock(channelId, block) {
   const col = m.cols[channelId];
   const start = m.gridStart + block * BLOCK;
   const end = Math.min(start + BLOCK, m.gridEnd);
   const page = m;

   col.blocks.add(block);

   try {
      // also ask for events which started before the block (e.g. before midnight) and are still running

      const data = await get('data/events?' + new URLSearchParams({ time: start - LOOKBACK, endtime: end, channelid: channelId }));

      if (page !== m)            // page left / re-rendered meanwhile
         return;

      for (const e of data.events || []) {
         if (col.ids.has(e.id) || e.starttime + e.duration <= m.gridStart)
            continue;

         col.ids.add(e.id);
         col.$col.append(eventBox(e));
      }
   }
   catch (e) {
      col.blocks.delete(block);
      if (e.status !== 404)
         toastError(e);
   }
}

function eventBox(e) {
   const n = nowUnix();
   const end = e.starttime + e.duration;
   const top = Math.max(yOf(e.starttime), 0);
   const h = Math.max(yOf(end) - top, 1);
   const desc = e.shortdescription || e.shorttext;
   const img = h >= 90 && state.profile.eventImgPath && e.imagecount
      ? mediaUrl(state.profile.eventImgPath, { no: 0, maxW: 100, maxH: 70, id: e.id }) : null;

   return $('<div class="mag-ev" tabindex="0">')
      .attr({ 'data-id': e.id, 'data-start': e.starttime, 'data-end': end })
      .toggleClass('past', end <= n)
      .toggleClass('running', e.starttime <= n && end > n)
      .toggleClass('short', h < 34)
      .css({ top: top + 'px', '--h': h + 'px' })
      .append(
         $('<div class="mag-ev-time">').append(
            $('<b>').text(formatTime(e.starttime)),
            $('<span class="dim">').text(Math.round(e.duration / 60) + ' ' + tr.minutes),
            e.timerid ? $('<span class="badge badge-timer">').html(icon('record')) : null,
            e.tipp ? $('<span class="badge badge-tipp">').text(e.tipp) : null,
            e.numrating ? $('<span class="rate">').addClass('rate' + e.numrating) : null),
         $('<div class="mag-ev-title">').text(e.title),
         img ? $('<img class="mag-ev-img" loading="lazy" alt="">').attr('src', img) : null,
         $('<div class="mag-ev-desc">').append(
            e.genre ? $('<span class="ev-genre">').text(e.genre) : null,
            desc ? textToHtml(desc) : null));
}
