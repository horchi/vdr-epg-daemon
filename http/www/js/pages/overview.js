// Page "Übersicht" – dashboard: running recordings, next timers, latest recordings, VDRs,
//   disk space, unread messages and problems, state of the epgd

import { state, hasRight, rights } from '../state.js';
import { get, mediaUrl, fallbackImg } from '../api.js';
import { busy } from '../ui.js';
import { formatDate, formatTime, formatDateTime, progressOf, nowUnix, agoText, sizeText } from '../utils.js';
import { channelLogo, channelName } from '../data.js';
import { icon } from '../icons.js';
import { hhmmToStr } from '../forms.js';
import { autoRefresh } from '../gridtools.js';
import { showEvent, showRecording } from '../eventDetail.js';
import { openTimerDialog } from '../timerDialog.js';
import { playRecording } from '../player.js';
import { vdrState, startButton, remoteButton } from '../vdrstate.js';
import { renderDisks, updateDiskTimes, diskList, mbPerMinute, hoursText } from '../disks.js';
import { prepare as prepareRecording } from './records.js';
import { messagePlain } from './timers.js';
import tr from '../../lang/de.js';

const MAX_TIMERS = 8;
const MAX_RECS = 8;
const MAX_MSGS = 5;
const MAX_VDRS = 10;

let $page = null;
let stopRefresh = null;
let loadSeq = 0;

export function render($content) {
   destroy();

   $page = $('<section class="page page-overview">').append(
      $('<div class="ov-tiles">'),
      $('<div class="ov-grid">'))
      .on('click', 'a[href^="#"]', () => { state.backTo = { hash: '#overview', label: tr.menu.overview }; });

   $content.empty().append($page);
   stopRefresh = autoRefresh(() => load(true));
   $(window).on('vdrs:loaded.overview', () => load(true));
   load();
}

export function destroy() {
   stopRefresh?.();
   stopRefresh = null;
   $(window).off('.overview');
   $page = null;
}

// ---------------------------------------------------------------------------
// data – every source on its own, a failing one (e.g. missing right) leaves its card empty

const safe = (p) => p.then((d) => d, () => null);

async function load(quiet = false) {
   const seq = ++loadSeq;
   const canTimer = hasRight(rights.timer);
   const canRecs = hasRight(rights.recordings);

   const work = Promise.all([
      safe(get('data/vdrs?all=1&probe=1')),
      canTimer ? safe(get('data/timers?state=P,R&action=A')) : null,
      canTimer ? safe(get('data/timers?state=E&action=A')) : null,
      canTimer ? safe(get('data/timers?notaction=A')) : null,
      canRecs ? safe(get('data/recordings')) : null,
      safe(get('data/messages')),
      hasRight(rights.searchTimer) ? safe(get('data/searchtimers')) : null
   ]);

   const [vdrs, timers, failed, jobs, recs, msgs, search] = await (quiet ? work : busy(work));

   if (seq !== loadSeq || !$page)
      return;

   const allVdrs = Object.entries(vdrs?.vdrs || {}).map(([uuid, v]) => ({ uuid, ...v }));

   const d = {
      epgd: allVdrs.find((v) => v.uuid === 'epgd'),
      vdrStart: !!vdrs?.vdrstart,
      vdrs: allVdrs.filter((v) => v.uuid !== 'epgd' && v.shareinweb),
      allVdrs: allVdrs.filter((v) => v.uuid !== 'epgd'),
      timers: timers ? timers.timers.map(withTimes).sort((a, b) => a.start - b.start) : null,
      failed: failed ? failed.timers.map(withTimes).filter((t) => t.start > nowUnix() - 7 * 86400).sort((a, b) => b.start - a.start) : null,
      jobs: jobs?.timers || null,
      recs: recs ? (recs.recordings || []).map(prepareRecording).sort((a, b) => b.starttime - a.starttime) : null,
      msgs: msgs ? (msgs.messages || []).filter((m) => m.state === 'N').sort((a, b) => b.updsp - a.updsp) : null,
      search: search?.searchtimers || null
   };

   d.running = d.timers?.filter((t) => t.state === 'R' || (t.start <= nowUnix() && t.end > nowUnix())) || [];
   d.next = d.timers?.filter((t) => !d.running.includes(t) && t.start > nowUnix()) || [];

   renderTiles(d);
   renderCards(d);
}

// start / end (unix) of a timer from day + HHMM, over midnight if the end is before the start

function withTimes(t) {
   const hm = (v) => Math.floor((v || 0) / 100) * 3600 + ((v || 0) % 100) * 60;

   t.start = (t.day || 0) + hm(t.starttime);
   t.end = (t.day || 0) + hm(t.endtime) + (t.endtime < t.starttime ? 86400 : 0);
   return t;
}

// 'heute', 'morgen' or the date

function dayText(t) {
   const day = (x) => formatDate(x, 'numeric');
   const n = nowUnix();

   return day(t) === day(n) ? 'heute' : day(t) === day(n + 86400) ? 'morgen' : formatDate(t);
}

const vdrName = (uuid) => state.vdrs[uuid]?.name || '';

// ---------------------------------------------------------------------------
// tiles – key figures, each links to the page with the details

function tile(href, iconName, label, value, sub, cls = '') {
   return $(href ? '<a class="ov-tile">' : '<div class="ov-tile">').attr(href ? { href } : {}).addClass(cls).append(
      $('<div class="ov-tile-head">').append(icon(iconName), $('<span>').text(label)),
      $('<div class="ov-tile-value">').text(value),
      sub ? $('<div class="ov-tile-sub dim">').text(sub) : null);
}

function renderTiles(d) {
   const $t = $page.find('.ov-tiles').empty();

   if (d.timers) {
      const n = d.running.length;
      $t.append(tile('#timers?tab=timers', 'record', 'Laufende Aufnahmen', n ? String(n) : 'keine',
         n ? d.running.map((r) => r.title).join(', ') : null, n ? 'ov-rec' : ''));

      const next = d.next[0];
      const day = d.next.filter((t) => t.start < nowUnix() + 86400).length;

      $t.append(tile('#timers?tab=timers', 'timer', 'Timer', d.next.length + ' geplant',
         next ? 'nächster ' + dayText(next.start) + ' ' + formatTime(next.start) + (day ? ' · ' + day + ' in 24 h' : '') : null));
   }

   if (d.recs) {
      const minutes = d.recs.reduce((s, r) => s + (r.duration || 0), 0) / 60;
      $t.append(tile('#records', 'film', 'Aufnahmen', String(d.recs.length), hoursText(minutes) + ' h'));
   }

   const disks = diskList(d.vdrs);

   if (disks.length) {
      const free = Math.min(...disks.map((v) => v.videofree || 0));
      const full = disks.some((v) => (v.videofree || 0) / v.videototal < .1);
      const mbpm = mbPerMinute(d.recs, d.vdrs);

      $t.append(tile(d.recs ? '#records' : null, 'disk', 'Frei', sizeText(free),
         'ca. ' + hoursText(free / mbpm) + ' h Aufnahmezeit' + (disks.length > 1 ? ' (kleinste)' : ''), full ? 'ov-warn' : ''));
   }

   if (d.search) {
      const active = d.search.filter((s) => s.active && s.type !== 'S');
      $t.append(tile('#timers?tab=search', 'search', 'Suchtimer', active.length + ' aktiv',
         d.search.length - active.length ? (d.search.length - active.length) + ' weitere (inaktiv / Suchen)' : null));
   }

   if (d.msgs)
      $t.append(tile('#timers?tab=messages', 'mail', 'Nachrichten', d.msgs.length ? d.msgs.length + ' neu' : 'keine neuen', null,
         d.msgs.some((m) => 'EFW'.includes(m.type)) ? 'ov-warn' : ''));

   if (d.epgd)
      $t.append(tile(null, 'refresh', 'EPG-Update', d.epgd.lastupdate ? agoText(d.epgd.lastupdate) : '–',
         d.epgd.nextupdate ? 'nächstes ' + agoText(d.epgd.nextupdate) : null, d.epgd.state === 'busy' ? 'ov-busy' : ''));
}

// ---------------------------------------------------------------------------
// cards

function card(title, iconName, href, $body, cls = '') {
   return $('<section class="card ov-card">').addClass(cls).append(
      $('<header class="ov-card-head">').append(icon(iconName), $('<h2>').text(title),
         href ? $('<a class="ov-more">').attr('href', href).append($('<span>').text('alle'), icon('chevron')) : null),
      $body);
}

const empty = (text) => $('<p class="dim ov-empty">').text(text);

function renderCards(d) {
   const $g = $page.find('.ov-grid').empty();

   if (d.running.length)
      $g.append(card('Laufende Aufnahmen', 'record', '#timers?tab=timers', runningList(d.running), 'ov-running'));

   if (d.timers)
      $g.append(card('Nächste Timer', 'timer', '#timers?tab=timers',
         d.next.length ? timerList(d.next.slice(0, MAX_TIMERS)) : empty(tr.pages.timerList.empty)));

   if (d.recs)
      $g.append(card('Letzte Aufnahmen', 'film', '#records', d.recs.length ? recList(d.recs.slice(0, MAX_RECS)) : empty(tr.error.noData)));

   const notes = notesList(d);

   if (notes)
      $g.append(card('Hinweise', 'alert', null, notes, 'ov-notes'));

   if (d.allVdrs.length || d.epgd)
      $g.append(card('VDRs', 'tv', hasRight(rights.configEdit) ? '#settings?tab=vdrs' : null, vdrList(d)));

   const $disks = renderDisks(d.vdrs);

   if ($disks.children().length) {
      updateDiskTimes($disks, d.recs || [], d.vdrs);
      $g.append(card('Speicherplatz', 'disk', null, $disks, 'ov-disks'));
   }
}

function runningList(timers) {
   return $('<ul class="ov-list">').append(timers.map((t) => {
      const p = progressOf(t.start, t.end - t.start) ?? 0;

      return $('<li class="ov-row" tabindex="0">').append(
         $('<span class="ov-logo">').append(channelLogo(t.channelid)),
         $('<div class="ov-main">').append(
            $('<div class="ov-title">').text(t.title || t.file || '–'),
            $('<div class="dim small">').text(formatTime(t.start) + ' – ' + formatTime(t.end)
               + ' · noch ' + Math.max(0, Math.round((t.end - nowUnix()) / 60)) + ' ' + tr.minutes
               + (vdrName(t.vdruuid) ? ' · ' + vdrName(t.vdruuid) : '')),
            $('<div class="progress">').append($('<div>').css('width', p + '%'))))
         .on('click', () => openTimer(t));
   }));
}

function timerList(timers) {
   let lastDay = null;
   const $ul = $('<ul class="ov-list">');

   for (const t of timers) {
      const day = dayText(t.start);

      if (day !== lastDay)
         $ul.append($('<li class="ov-day">').text(day === 'heute' || day === 'morgen' ? day[0].toUpperCase() + day.slice(1) : day));

      lastDay = day;

      $('<li class="ov-row" tabindex="0">').append(
         $('<span class="ov-time">').text(hhmmToStr(t.starttime)),
         $('<span class="ov-logo">').append(channelLogo(t.channelid)),
         $('<div class="ov-main">').append(
            $('<div class="ov-title">').append(t.type === 'V' ? icon('tv') : null, document.createTextNode(t.title || t.file || '–')),
            $('<div class="dim small">').text([t.shorttext, t.autotimername ? 'Suchtimer ' + t.autotimername : '', vdrName(t.vdruuid)]
               .filter(Boolean).join(' · '))))
         .toggleClass('inactive', !t.active)
         .on('click', () => openTimer(t))
         .appendTo($ul);
   }

   return $ul;
}

function openTimer(t) {
   if (t.eventid)
      showEvent(t.eventid);
   else if (hasRight(rights.timerEdit))
      openTimerDialog(t);
}

function recList(recs) {
   const p = state.profile;
   const size = { maxW: 160, maxH: 90 };

   return $('<ul class="ov-list">').append(recs.map((r, i) => {
      const imgs = [
         r.imgid && mediaUrl(p.eventImgPath, { no: 0, imgid: r.imgid, ...size }),
         r.scrmovieid && mediaUrl(p.movieMediaPath, { actor_id: 0, movie_id: r.scrmovieid, media_type: 1, ...size }),
         r.scrseriesid && mediaUrl(p.serieImgPath, { actor_id: 0, series_id: r.scrseriesid, season_number: 0, episode_id: 0, media_type: 1, lfn: 0, ...size })];
      const sub = [r.title, r.shorttext].find((x) => x && x !== r.displayName);

      return $('<li class="ov-row" tabindex="0">').append(
         $('<div class="rec-thumb">').append(fallbackImg(imgs, { loading: 'lazy' }, $(icon('film'))) || icon('film')),
         $('<div class="ov-main">').append(
            $('<div class="ov-title">').text(r.displayName),
            $('<div class="dim small">').text([sub, dayText(r.starttime) + ' ' + formatTime(r.starttime),
               Math.round((r.duration || 0) / 60) + ' ' + tr.minutes].filter(Boolean).join(' · '))),
         $('<button type="button" class="btn btn-icon btn-flat">').attr('title', 'Im Browser abspielen').html(icon('play'))
            .on('click', (ev) => { ev.stopPropagation(); playRecording(r); }))
         .on('click', () => openRec(recs, i));
   }));
}

function openRec(recs, i) {
   showRecording(recs[i], {
      prevRec: recs[i - 1] || null,
      nextRec: recs[i + 1] || null,
      prev: i > 0 ? () => openRec(recs, i - 1) : null,
      next: i < recs.length - 1 ? () => openRec(recs, i + 1) : null
   });
}

// problems and unread messages, null if there is nothing to say

function notesList(d) {
   const $ul = $('<ul class="ov-list ov-notes-list">');
   const note = (iconName, cls, title, text, href) => $('<li class="ov-note">').addClass(cls).append(icon(iconName),
      $('<div class="ov-main">').append($(href ? '<a>' : '<b>').attr(href ? { href } : {}).text(title), text ? $('<div class="dim small">').text(text) : null))
      .appendTo($ul);

   for (const t of d.failed || [])
      note('alert', 'state-E', 'Timer-Fehler: ' + (t.title || t.file || '–'),
         [t.day ? dayText(t.start) + ' ' + formatTime(t.start) : '', channelName(t.channelid), t.info].filter(Boolean).join(' · '), '#timers?tab=done');

   if (d.jobs?.length)
      note('wait', 'state-wait', d.jobs.length + (d.jobs.length === 1 ? ' Auftrag wartet' : ' Aufträge warten') + ' auf einen VDR',
         d.jobs.slice(0, 3).map((t) => t.title || t.file).filter(Boolean).join(', '), '#timers?tab=jobs');

   for (const v of diskList(d.vdrs))
      if ((v.videofree || 0) / v.videototal < .1)
         note('disk', 'state-E', 'Wenig Platz auf ' + v.names.join(', '), sizeText(v.videofree || 0) + ' frei');

   for (const m of (d.msgs || []).slice(0, MAX_MSGS))
      note({ E: 'alert', F: 'alert', W: 'alert' }[m.type] || 'info', 'msg-' + m.type, m.title || '',
         formatDateTime(m.updsp) + ' · ' + messagePlain(m).slice(0, 160), '#timers?tab=messages');

   if ((d.msgs || []).length > MAX_MSGS)
      $ul.append($('<li class="ov-note">').append($('<a href="#timers?tab=messages">').text('… ' + (d.msgs.length - MAX_MSGS) + ' weitere Nachrichten')));

   return $ul.children().length ? $ul : null;
}

function vdrList(d) {
   const $ul = $('<ul class="ov-list ov-vdrs">');
   const vdrs = d.allVdrs.slice().sort((a, b) => (a.state === 'attached' ? 0 : 1) - (b.state === 'attached' ? 0 : 1)
      || (b.lastupdate || 0) - (a.lastupdate || 0)).slice(0, MAX_VDRS - (d.epgd ? 1 : 0));

   if (d.epgd)
      $ul.append(vdrRow({ ...d.epgd, isEpgd: true }));

   return $ul.append(vdrs.map((v) => vdrRow(v, d.vdrStart)));
}

function vdrRow(v, canStart) {
   const ver = (v.version || '').replace(/-GIT\w+/, '').replace(/ \(.*\)$/, '');
   const st = v.isEpgd ? { online: v.state !== 'detached', cls: v.state !== 'detached' ? 'vs-on' : 'vs-off', action: null }
      : vdrState(v, canStart);
   const info = v.isEpgd
      ? ['Status ' + (v.state || '?'), v.lastmerge ? 'Merge ' + agoText(v.lastmerge) : '']
      : [st.text + (!st.online && v.lastupdate ? ' · zuletzt ' + agoText(v.lastupdate) : ''),
         v.tunercount ? v.tunercount + ' Tuner' : ''];

   return $('<li class="ov-row ov-vdr">').toggleClass('offline', !st.online).append(
      $('<span class="ov-dot">').addClass(st.cls).attr('title', st.text || ''),
      $('<div class="ov-main">').append(
         $('<div class="ov-title">').append(icon(v.isEpgd ? 'disk' : 'tv'), document.createTextNode(' ' + (v.name || v.uuid)),
            v.isEpgd ? $('<span class="badge">').text('epgd') : null,
            v.uuid === state.currentVdr?.uuid ? $('<span class="badge">').text('ausgewählt') : null,
            !v.isEpgd && !v.shareinweb ? $('<span class="badge">').attr('title', 'Timer und Aufnahmen dieses VDR sind im Web nicht sichtbar').text('nicht freigegeben') : null),
         $('<div class="dim small">').text([ver, ...info].filter(Boolean).join(' · '))),
      v.isEpgd ? null : remoteButton(v, 'btn-sm btn-icon-only', true),
      v.isEpgd ? null : startButton(v, st));
}
