// Page "Zeitleiste" – EPG grid: one row per channel, time running from left to right
//
//   One scroll container (both directions); the time axis sticks to the top, the channel
//   heads stick to the left (CSS position: sticky). Events are positioned absolutely by
//   time, SEC_PER_PX seconds per pixel. Data is loaded lazily per channel in BLOCK sized
//   time slices – only for the visible channels / times (like the magazine).

import { state } from '../state.js';
import { get, mediaUrl } from '../api.js';
import { busy, toastError } from '../ui.js';
import { nowUnix, unixTime, toDate, formatTime, formatDate, toLocalInput, fromLocalInput, progressOf, leadText } from '../utils.js';
import { channelBadge, doneBadge } from '../data.js';
import { quickTimes, quickTimeAt, timeOnDay, foreignKey, ctrlScroll, autoRefresh, mergeEvents } from '../gridtools.js';
import { icon, iconButton } from '../icons.js';
import { showEvent } from '../eventDetail.js';
import { liveButton } from '../player.js';
import { groupSelect, filterChannels, currentGroup } from '../groupfilter.js';
import tr from '../../lang/de.js';

const SEC_PER_PX = 15;                // 4px per minute, one hour = 240px
const BLOCK = 6 * 3600;               // load granularity
const LOOKBACK = 6 * 3600;            // events starting up to 6h before a block may still run into it
const NARROW = 70;                    // [px] below: title only, no time
const INFO_MIN_W = 900;               // info panel instead of the detail dialog only if the
const INFO_MIN_H = 700;               //   window is at least this large

let m = null;                         // state of the rendered page

const xOf = (t) => (t - m.gridStart) / SEC_PER_PX;
const tOf = (x) => m.gridStart + x * SEC_PER_PX;

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
      channels: filterChannels(state.channelOrder.filter((id) => state.channels[id]?.visible & 1), 'timeline'),
      rows: {},                                             // channelid -> { $lane, $head, els:Map(id -> element), blocks:Map(block -> load promise) }
      navTime: null,                                        // keyboard: time column kept while moving up / down
      stopRefresh: null,
      loadTimer: null,
      raf: 0
   };

   const width = Math.ceil(xOf(m.gridEnd));

   // toolbar

   const $time = $('<input type="datetime-local" class="input" step="900">')
      .attr({ min: toLocalInput(p.minEventTime), max: toLocalInput(p.maxEventTime), title: tr.date })
      .on('change', function () { if (this.value) scrollToTime(fromLocalInput(this.value)); });

   const $chSel = $('<select class="input mag-ch-select">').attr('title', tr.channel)
      .append(m.channels.map((id) => $('<option>').val(id).text(state.channels[id].name || id)))
      .on('change', function () { scrollToChannel(this.value); });

   const $bar = $('<div class="toolbar mag-toolbar">').append(
      $('<div class="seg">').append(
         iconButton('prev', '-1 Tag').on('click', () => scrollToTime(leftTime() - 86400 + 1800)),
         $('<button type="button" class="btn">').text(tr.dateTimePicker.currentText).on('click', () => scrollToTime(nowUnix())),
         iconButton('next', '+1 Tag').on('click', () => scrollToTime(leftTime() + 86400 + 1800))),
      $time, $chSel,
      groupSelect('timeline', () => render($content, { time: leftTime() + 30 * 60 })),    // keep the time
      infoToggle());

   const qt = m.qt = quickTimes();

   if (qt.length) {
      $('<div class="seg seg-wrap">').append(qt.map((q) =>
         $('<button type="button" class="btn">').attr('data-qt', q.value).append(icon('clock'), $('<span>').text(q.label))
            .on('click', () => scrollToTime(timeOnVisibleDay(q.value))))).appendTo($bar);

      $('<select class="input qt-select">').attr('title', 'Schnellwahl')
         .append($('<option value="">').text('Schnellwahl …'), qt.map((q) => $('<option>').val(q.value).text(q.label)))
         .on('change', function () { if (this.value) scrollToTime(timeOnVisibleDay(this.value)); })
         .appendTo($bar);
   }

   // grid: row 1 = corner + time axis, then one row per channel (head + lane),
   //   a heading row before each channel group (not if filtered by a group)

   const $grid = $('<div class="tl-grid">').css('--width', width + 'px');
   const tracks = [];
   const withGroups = !currentGroup('timeline');
   let group = null;

   $grid.append($('<div class="tl-corner">'), timeAxis(width));

   for (const id of m.channels) {
      const g = state.channels[id].group || '';

      if (withGroups && g && g !== group) {
         tracks.push('var(--tl-grp)');
         $grid.append($('<div class="tl-grp">').css('grid-row', tracks.length + 1).append($('<span>').text(g)));
      }

      group = g;
      tracks.push('var(--tl-row)');

      const row = tracks.length + 1;
      const $head = $('<div class="tl-head">').css('grid-row', row).append(channelBadge(id, { showName: false }));
      const $lane = $('<div class="tl-lane">').attr('data-channel', id).css('grid-row', row);

      m.rows[id] = { $head, $lane, els: new Map(), blocks: new Map() };
      $grid.append($head, $lane);
   }

   $grid.css('--tl-rows', tracks.join(' ') || 'var(--tl-row)');

   m.$now = $('<div class="tl-now">');
   $grid.append($('<div class="tl-overlay">').append(dayLines(), qtLines(qt), m.$now));

   m.$scroll = $('<div class="tl-scroll">').append($grid)
      .on('scroll', onScroll)
      .on('click', '.tl-ev', function () { m.navTime = null; select($(this)); })
      .on('dblclick', '.tl-ev', function () { showEvent($(this).attr('data-id')); })
      .on('keydown', '.tl-ev', function (ev) { if (ev.key === 'Enter') $(this).trigger('click'); });

   m.$info = $('<div class="tl-info">').hide();

   m.$time = $time;
   m.$bar = $bar;
   m.$chSel = $chSel;

   $content.empty().append($('<section class="page page-timeline">').append($bar, m.$info, m.$scroll));

   if (!m.channels.length)
      return m.$scroll.empty().append($('<p class="empty">').text(tr.error.noData));

   updateNow();
   m.stopRefresh = autoRefresh(refresh);
   $(window).on('resize.timeline', () => { onScroll(); if (!infoFits()) closeInfo(); });
   $(document).on('keydown.timeline', onKey);

   scrollToTime(Number(params.time) || nowUnix());

   if (params.ch && m.rows[params.ch])
      scrollToChannel(params.ch);
}

export function destroy() {
   if (!m)
      return;

   m.stopRefresh?.();
   clearTimeout(m.loadTimer);
   clearTimeout(m.selTimer);
   cancelAnimationFrame(m.raf);
   $(window).off('.timeline');
   $(document).off('.timeline');
   m = null;
}

// ---------------------------------------------------------------------------
// static parts

function timeAxis(width) {
   const $axis = $('<div class="tl-axis">');

   for (let t = m.gridStart; t < m.gridEnd; t += 3600) {
      const $l = $('<div class="tl-hour">').css('left', xOf(t) + 'px').text(formatTime(t));

      if (toDate(t).getHours() === 0)
         $l.addClass('tl-midnight').prepend($('<b>').text(formatDate(t)));

      $axis.append($l);
   }

   return $axis.css('width', width + 'px');
}

function dayLines() {
   const lines = [];

   for (let t = m.gridStart; t < m.gridEnd; t += 3600)
      if (toDate(t).getHours() === 0)
         lines.push($('<div class="tl-dayline">').css('left', xOf(t) + 'px'));

   return lines;
}

// thin accent lines at the quick times (e.g. 20:15) of every day

function qtLines(qt) {
   const lines = [];

   for (let day = m.gridStart; day < m.gridEnd; day += 86400) {
      for (const q of qt) {
         const t = timeOnDay(day, q.value);

         if (t > m.gridStart && t < m.gridEnd)
            lines.push($('<div class="tl-qtline">').css('left', xOf(t) + 'px').attr('data-label', q.label));
      }
   }

   return lines;
}

function updateNow() {
   if (!m)
      return;

   const n = nowUnix();

   m.$now.css('left', xOf(n) + 'px').attr('data-time', formatTime(n)).toggle(n >= m.gridStart && n <= m.gridEnd);

   for (const r of Object.values(m.rows))
      r.$lane.children('.tl-ev').each(function () {
         $(this).toggleClass('past', +this.dataset.end <= n).toggleClass('running', +this.dataset.start <= n && +this.dataset.end > n);
      });
}

// ---------------------------------------------------------------------------
// navigation

const headWidth = () => m.$scroll.find('.tl-corner').outerWidth();
const axisHeight = () => m.$scroll.find('.tl-corner').outerHeight();

const timeOnVisibleDay = (hhmm) => timeOnDay(leftTime() + 3600, hhmm);

function leftTime() {
   return tOf(m.$scroll.scrollLeft());
}

function scrollToTime(t) {
   t = Math.max(m.gridStart, Math.min(t, m.gridEnd));
   m.$scroll.scrollLeft(xOf(t) - 30 * 60 / SEC_PER_PX);    // 30 minutes left of it
   onScroll();
}

function scrollToChannel(id) {
   const $lane = m.rows[id]?.$lane;

   if ($lane)
      m.$scroll.scrollTop($lane[0].offsetTop - axisHeight());
}

function onScroll() {
   if (!m || m.raf)
      return;

   m.raf = requestAnimationFrame(() => {
      if (!m)
         return;

      m.raf = 0;

      const t = leftTime() + 1800;
      m.$time.val(toLocalInput(Math.min(t, m.gridEnd)));

      // show the quick time we are at (select on phones, buttons else)

      const q = quickTimeAt(m.qt, t);
      m.$bar.find('.qt-select').val(q).toggleClass('active', !!q);
      m.$bar.find('[data-qt]').each((i, b) => $(b).toggleClass('active', $(b).attr('data-qt') === q));

      const first = visibleChannels()[0];
      first && m.$chSel.val(first);

      clearTimeout(m.loadTimer);
      m.loadTimer = setTimeout(loadVisible, 120);
   });
}

function visibleChannels() {
   const s = m.$scroll[0];
   const top = s.scrollTop + axisHeight();
   const bottom = s.scrollTop + s.clientHeight;
   const list = [];

   for (const id of m.channels) {
      const lane = m.rows[id].$lane[0];

      if (lane.offsetTop + lane.offsetHeight > top - lane.offsetHeight && lane.offsetTop < bottom + lane.offsetHeight)
         list.push(id);
   }

   return list;
}

// ---------------------------------------------------------------------------
// data

// visible channels and the range of the visible blocks (with one hour around)

function visibleRange() {
   const s = m.$scroll[0];
   const from = tOf(s.scrollLeft) - 3600;
   const to = tOf(s.scrollLeft + s.clientWidth) + 3600;

   return {
      channels: visibleChannels(),
      first: Math.floor((Math.max(from, m.gridStart) - m.gridStart) / BLOCK),
      last: Math.floor((Math.min(to, m.gridEnd) - m.gridStart) / BLOCK)
   };
}

function loadVisible() {
   if (!m)
      return;

   const { channels, first, last } = visibleRange();
   const jobs = [];

   for (const id of channels)
      for (let b = first; b <= last; b++)
         if (!m.rows[id].blocks.has(b))
            jobs.push(loadBlock(id, b));

   if (jobs.length)
      busy(Promise.all(jobs));
}

// periodic refresh: the visible blocks are reloaded silently (scroll position, focus,
//   info panel and dialogs stay), the others are marked to be reloaded when they get visible

function refresh() {
   if (!m)
      return;

   updateNow();

   const { channels, first, last } = visibleRange();

   for (const id of m.channels) {
      const row = m.rows[id];

      for (const b of [...row.blocks.keys()]) {
         if (channels.includes(id) && b >= first && b <= last)
            row.blocks.set(b, fetchBlock(row, id, b, true));
         else
            row.blocks.delete(b);
      }
   }
}

// load the block (once), the promise resolves when its events are in the lane

function loadBlock(channelId, block) {
   const row = m.rows[channelId];

   if (!row.blocks.has(block))
      row.blocks.set(block, fetchBlock(row, channelId, block));

   return row.blocks.get(block);
}

function loadBlockAt(channelId, t) {
   return t >= m.gridStart && t < m.gridEnd
      ? loadBlock(channelId, Math.floor((t - m.gridStart) / BLOCK)) : Promise.resolve();
}

async function fetchBlock(row, channelId, block, silent = false) {
   const start = m.gridStart + block * BLOCK;
   const end = Math.min(start + BLOCK, m.gridEnd);
   const page = m;

   try {
      // also ask for events which started before the block (e.g. before midnight) and are still running

      const data = await get('data/events?' + new URLSearchParams({ time: start - LOOKBACK, endtime: end, channelid: channelId }));

      if (page !== m)            // page left / re-rendered meanwhile
         return;

      const events = (data.events || []).filter((e) => e.starttime + e.duration > m.gridStart);
      mergeEvents(row.$lane, row.els, events, start, end, eventBox);
   }
   catch (e) {
      if (page !== m)
         return;

      row.blocks.delete(block);

      if (!silent && e.status !== 404)
         toastError(e);
   }
}

function eventBox(e) {
   const n = nowUnix();
   const end = e.starttime + e.duration;
   const left = Math.max(xOf(e.starttime), 0);
   const w = Math.max(xOf(end) - left, 1);
   const sub = e.shorttext || e.genre;

   return $('<div class="tl-ev" tabindex="0">').data('event', e)
      .attr({ 'data-id': e.id, 'data-start': e.starttime, 'data-end': end,
              title: formatTime(e.starttime) + ' – ' + formatTime(end) + '  ' + e.title + (e.shorttext ? '\n' + e.shorttext : '') })
      .toggleClass('past', end <= n)
      .toggleClass('running', e.starttime <= n && end > n)
      .toggleClass('narrow', w < NARROW)
      .toggleClass('selected', m.selected == e.id)
      .css({ left: left + 'px', '--w': w + 'px' })
      .append($('<div class="tl-ev-in">').append(          // sticky – stays visible if the event starts left of the view
         $('<div class="tl-ev-line">').append(
            $('<b class="tl-ev-time">').text(formatTime(e.starttime)),
            e.timerid ? $('<span class="badge badge-timer">').html(icon('record')) : null,
            doneBadge(e),
            e.tipp ? $('<span class="badge badge-tipp">').text(e.tipp) : null,
            $('<span class="tl-ev-title">').text(e.title)),
         sub ? $('<div class="tl-ev-sub">').text(sub) : null));
}

// ---------------------------------------------------------------------------
// keyboard navigation
//   arrows: previous / next event, channel above / below (keeping the time column)
//   PageUp/PageDown: one screen of channels, Home: the running event, Esc: close the info panel
//   with Ctrl the arrows scroll as usual

const laneEvents = (id) => m.rows[id].$lane.children('.tl-ev').get().sort((a, b) => a.dataset.start - b.dataset.start);

// event of the lane at time t, in a gap the nearest one

function eventAt(id, t) {
   let best = null, bestD = Infinity;

   for (const el of laneEvents(id)) {
      const d = Math.max(+el.dataset.start - t, t - +el.dataset.end + 1, 0);

      if (d < bestD)
         [best, bestD] = [el, d];
   }

   return best;
}

function firstVisibleChannel() {
   const top = m.$scroll[0].scrollTop + axisHeight() - 2;
   return m.channels.find((id) => m.rows[id].$lane[0].offsetTop >= top) || m.channels[0];
}

function lanesPerPage() {
   const lane = m.rows[m.channels[0]].$lane[0];
   return Math.max(1, Math.floor((m.$scroll[0].clientHeight - axisHeight()) / lane.offsetHeight) - 1);
}

async function onKey(ev) {
   if (!m || foreignKey(ev) || ctrlScroll(ev, m.$scroll[0]) || ev.ctrlKey)
      return;

   const key = ev.key;
   const cur = document.activeElement?.closest?.('.tl-ev');
   const inGrid = cur && m.$scroll[0].contains(cur);

   if (key === 'Escape' && m.selected) {
      closeInfo();
      return;
   }

   if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home'].includes(key))
      return;

   if (!inGrid && !key.startsWith('Arrow'))      // PageUp/Down, Home without focus: scroll as usual
      return;

   ev.preventDefault();

   const page = m;
   let target = null;

   if (!inGrid) {                                  // nothing focused yet -> event at the left of the view
      const id = firstVisibleChannel();
      const t = leftTime() + 1800;

      await loadBlockAt(id, t);
      target = page === m && eventAt(id, t);
   }
   else {
      const id = $(cur).closest('.tl-lane').attr('data-channel');
      const start = +cur.dataset.start, end = +cur.dataset.end;

      if (key === 'ArrowRight' || key === 'ArrowLeft') {
         m.navTime = null;
         const pick = () => key === 'ArrowRight'
            ? laneEvents(id).find((el) => +el.dataset.start > start)
            : laneEvents(id).reverse().find((el) => +el.dataset.start < start);

         target = pick();

         if (!target) {                              // not loaded yet -> the neighboring block
            await loadBlockAt(id, key === 'ArrowRight' ? end : start - 1);
            target = page === m && pick();
         }
      }
      else if (key === 'Home') {
         m.navTime = null;
         await loadBlockAt(id, nowUnix());
         target = page === m && eventAt(id, nowUnix());
      }
      else {
         const dir = key === 'ArrowUp' || key === 'PageUp' ? -1 : 1;
         const step = key.startsWith('Page') ? lanesPerPage() : 1;
         const from = m.channels.indexOf(id);
         const to = Math.max(0, Math.min(m.channels.length - 1, from + dir * step));

         if (to === from)
            return;

         // keep the time column, as long as the events cover it

         if (m.navTime === null || m.navTime < start || m.navTime >= end)
            m.navTime = Math.max(start, leftTime() + 60);

         const t = m.navTime;

         // channels without events in reach are skipped

         for (let i = to; i >= 0 && i < m.channels.length; i += dir) {
            await loadBlockAt(m.channels[i], t);

            if (page !== m)
               return;

            target = eventAt(m.channels[i], t);

            if (target && Math.abs(+target.dataset.start - t) < 6 * 3600)
               break;

            target = null;
         }
      }
   }

   if (page === m && target)
      focusEvent(target);
}

function focusEvent(el) {
   const s = m.$scroll[0];
   const sr = s.getBoundingClientRect(), r = el.getBoundingClientRect();
   const viewL = sr.left + headWidth(), viewR = sr.left + s.clientWidth;
   const viewT = sr.top + axisHeight(), viewB = sr.top + s.clientHeight;
   let dx = 0, dy = 0;

   // horizontal only if (almost) nothing of it is visible – long running events stay where they are

   if (r.right < viewL + 40 || r.left > viewR - 40)
      dx = r.left - viewL - 30 * 60 / SEC_PER_PX;

   if (r.top < viewT)
      dy = r.top - viewT - 2;
   else if (r.bottom > viewB)
      dy = r.bottom - viewB + 2;

   el.focus({ preventScroll: true });

   if (dx || dy)
      s.scrollBy(dx, dy);

   // the info panel follows the focus (delayed, holding a key would load every event)

   if (m.selected) {
      clearTimeout(m.selTimer);
      m.selTimer = setTimeout(() => { if (m?.selected && document.activeElement === el) select($(el)); }, 250);
   }
}

// ---------------------------------------------------------------------------
// info panel – the most important data of the last clicked event above the grid
//   (only if the window is large enough, else the detail dialog as everywhere)

// mode per device: 'auto' (panel on large windows only), 'on' (always), 'off' (always the dialog)

const INFO_KEY = 'timeline.info';
const infoModes = { auto: 'Infofeld: automatisch (große Fenster)', on: 'Infofeld: immer', off: 'Infofeld: aus (Detail-Dialog)' };

function infoMode() {
   try { return infoModes[localStorage.getItem(INFO_KEY)] ? localStorage.getItem(INFO_KEY) : 'auto'; }
   catch (e) { return 'auto'; }
}

function infoToggle() {
   const $btn = $('<button type="button" class="btn tl-info-toggle">');
   const show = () => {
      const mode = infoMode();
      $btn.attr('title', infoModes[mode]).toggleClass('active', mode === 'on')
         .empty().append(icon('info'), $('<span>').text({ auto: 'Auto', on: 'Ein', off: 'Aus' }[mode]));
   };

   $btn.on('click', () => {
      const next = { auto: 'on', on: 'off', off: 'auto' }[infoMode()];
      try { localStorage.setItem(INFO_KEY, next); } catch (e) { }
      show();
      if (!infoFits()) closeInfo();
   });

   show();
   return $btn;
}

function infoFits() {
   const mode = infoMode();
   return mode === 'on' || (mode === 'auto' && window.innerWidth >= INFO_MIN_W && window.innerHeight >= INFO_MIN_H);
}

function select($ev) {
   const id = $ev.attr('data-id');

   if (!infoFits())
      return showEvent(id);

   m.$scroll.find('.tl-ev.selected').removeClass('selected');
   $ev.addClass('selected');
   m.selected = id;

   renderInfo($ev.data('event'));                      // at once with the list data ..

   const page = m;

   get('data/event?id=' + encodeURIComponent(id))     // .. completed by the details
      .then((d) => { if (page === m && m.selected === id && d.event) renderInfo(d.event); })
      .catch((e) => { if (e.status !== 404) toastError(e); });
}

function closeInfo() {
   if (!m)
      return;

   m.selected = null;
   m.$scroll.find('.tl-ev.selected').removeClass('selected');
   m.$info.hide().empty();
}

function renderInfo(e) {
   const p = state.profile;
   const end = e.starttime + e.duration;
   const progress = progressOf(e.starttime, e.duration);
   const desc = e.longdescription || e.cntlongdescription || '';
   const lead = leadText(e.shortdescription, e.longdescription, e.cntlongdescription);
   const facts = [e.genre, e.category !== e.genre ? e.category : null, e.country, e.year].filter(Boolean).join(' · ');
   const img = e.imagecount && p.eventImgPath ? mediaUrl(p.eventImgPath, { no: 0, id: e.id, maxW: 320, maxH: 180 }) : null;

   m.$info.empty().show().append(
      img ? $('<img class="tl-info-img" alt="">').attr('src', img).on('error', function () { $(this).remove(); }) : null,
      $('<div class="tl-info-body">').append(
         $('<div class="tl-info-head">').append(
            channelBadge(e.channelid, { showName: false }),
            $('<span class="tl-info-when">').append(
               $('<span class="tl-info-date">').text(formatDate(e.starttime) + ' '),
               formatTime(e.starttime) + ' – ' + formatTime(end) + ' ' + tr.oClock,
               $('<span class="tl-info-dur">').text(' (' + Math.round(e.duration / 60) + ' ' + tr.minutes + ')')),
            e.tipp ? $('<span class="badge badge-tipp">').text(e.tipp) : null,
            e.numrating ? $('<span class="rate">').addClass('rate' + e.numrating) : null,
            $('<span class="tl-info-actions">').append(
               liveButton(e),
               $('<button type="button" class="btn tl-info-details">').attr('title', 'Details')
                  .append(icon('info'), $('<span>').text('Details')).on('click', () => showEvent(e.id)),
               iconButton('close', 'Schließen').on('click', closeInfo))),
         $('<div class="tl-info-title">').text(e.title),
         e.shorttext && e.shorttext !== e.title ? $('<div class="tl-info-short">').text(e.shorttext) : null,
         facts ? $('<div class="tl-info-facts">').text(facts) : null,
         progress !== null ? $('<div class="progress tl-info-progress">').append($('<div>').css('width', progress + '%')) : null,
         lead ? $('<div class="tl-info-lead">').text(lead) : null,
         desc ? $('<div class="tl-info-desc">').text(desc) : null));
}
