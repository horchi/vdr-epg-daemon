// Page "Programm" – what's on now / next / at a given time / quick search

import { state } from '../state.js';
import { get, post } from '../api.js';
import { busy, toastError } from '../ui.js';
import { now, nowUnix, unixTime, formatTime, formatDate, progressOf, toLocalInput, fromLocalInput, textToHtml } from '../utils.js';
import { channelBadge } from '../data.js';
import { icon } from '../icons.js';
import { showEvent } from '../eventDetail.js';
import tr from '../../lang/de.js';

let current = { type: '@Now', time: 0 };
let $page = null;

// profile.quickTimes: 'Label=!?Value~Label=Value...'; value is 'HH:MM' or '@searchtimer'

function quickTimes() {
   const list = [];

   (state.profile.quickTimes || '').replace(/([^=~]+)=!?([^~]+)~?/g, (m, label, value) => {
      if (value !== '@Now' && value !== '@Next')
         list.push({ label, value });
   });

   return list;
}

// 'HH:MM' -> unix time; if more than one hour in the past -> tomorrow (as the old UI)

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
            this.value = '';
         })
         .appendTo($bar);
   }

   $bar.on('click', 'button[data-type]', function () { setTime($(this).attr('data-type')); });
   $time.on('change', function () { if (this.value) setTime('@time', fromLocalInput(this.value)); });

   $page = $('<section class="page page-now">').append(
      $bar,
      $('<p class="page-info">'),
      $('<ul class="event-grid">')
         .on('click', '.event-card .channel', function (ev) {      // channel logo -> magazine at this channel
            ev.stopPropagation();
            location.hash = '#magazine?ch=' + encodeURIComponent($(this).attr('data-channel'));
         })
         .on('click', '.event-card', function () { showEvent($(this).attr('data-id')); })
         .on('keydown', '.event-card', function (ev) { if (ev.key === 'Enter') $(this).trigger('click'); }));

   $content.empty().append($page);
   setTime(current.type, current.time);
}

async function setTime(type, time) {
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

   $page.find('input[type=datetime-local]').val(toLocalInput(current.time));
   $page.find('button[data-type]').removeClass('active').filter((i, b) => $(b).attr('data-type') === (type === '@time' ? '' : type)).addClass('active');
   $page.find('.page-info').text(
      type === '@Now'  ? tr.dateTimePicker.currentText + ', ' + formatDate(current.time, 'long') + ' ' + formatTime(current.time) + ' ' + tr.oClock
    : type === '@Next' ? tr.pages.eventDetail.eventNext + ' ' + formatTime(current.time) + ' ' + tr.oClock
    : type === '@time' ? formatDate(current.time, 'long') + ' ' + formatTime(current.time) + ' ' + tr.oClock
    : tr.menu.search + ': ' + $page.find('button[data-type="' + type + '"]').text());

   try {
      const data = await busy(body ? post(url, body) : get(url));
      renderEvents(data.events || []);
   }
   catch (e) {
      toastError(e);
   }
}

function renderEvents(events) {
   const $ul = $page.find('.event-grid').empty();

   if (!events.length) {
      $ul.append($('<li class="empty">').text(tr.error.noData));
      return;
   }

   for (const e of events)
      $ul.append(eventCard(e));
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
         channelBadge(e.channelid),
         $('<div class="ev-when">').append($time,
            progress !== null
               ? $('<div class="progress">').append($('<div>').css('width', progress + '%'))
               : $('<div class="ev-date">').text(formatDate(e.starttime)))),
      $('<div class="ev-body">').append(
         img ? $('<img class="ev-img" loading="lazy" alt="">').attr('src', img) : null,
         $('<div class="ev-title">').text(e.title).append(
            e.numrating ? $('<span class="rate">').addClass('rate' + e.numrating) : null),
         $('<div class="ev-desc">').append(
            e.genre ? $('<span class="ev-genre">').text(e.genre) : null,
            desc ? textToHtml(desc) : null)));
}
