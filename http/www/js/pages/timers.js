// Page "Timer" – tabs: timers, search timers, recent jobs, history, async jobs, messages

import { state, hasRight, rights } from '../state.js';
import { get, post } from '../api.js';
import { busy, toast, toastError, dialog, confirmBox } from '../ui.js';
import { formatDate, formatDateTime, formatTime } from '../utils.js';
import { channelBadge, channelName, channelLogo } from '../data.js';
import { icon } from '../icons.js';
import { dataList, rowButton } from '../lib/datalist.js';
import { hhmmToStr } from '../forms.js';
import { openTimerDialog, openSearchTimerDialog, deleteTimers, renderResults } from '../timerDialog.js';
import { showEvent, showDoneTimer } from '../eventDetail.js';
import tr from '../../lang/de.js';

const trt = tr.pages.timerList;
const trp = tr.pages.timer;

const tabs = {
   timers:   { label: trp.timerList, right: rights.timer, build: timersTab },
   search:   { label: trp.searchTimerList, right: rights.searchTimer, build: searchTimersTab },
   done:     { label: trp.timersDone, right: rights.timer, build: recentJobsTab },
   history:  { label: trp.timerListDone, right: rights.timer, build: historyTab },
   jobs:     { label: trp.timerJobList, right: rights.timer, build: jobsTab },
   messages: { label: trp.messageList, build: messagesTab }
};

let current = null;          // { id, reload() }

export function render($content, params = {}) {
   destroy();

   const avail = Object.keys(tabs).filter((k) => !tabs[k].right || hasRight(tabs[k].right));
   const id = avail.includes(params.tab) ? params.tab : avail[0];

   const $tabs = $('<nav class="tabs" role="tablist">').append(avail.map((k) =>
      $('<a role="tab">').attr('href', '#timers?tab=' + k).text(tabs[k].label).toggleClass('active', k === id)));

   const $body = $('<div class="tab-body">');

   $content.empty().append($('<section class="page page-timers">').append($tabs, $body));

   current = { id, ...tabs[id].build($body, params) };
   current.reload();

   $(window).on('timers:changed.timers', () => current?.reload());
}

export function destroy() {
   $(window).off('.timers');
   current = null;
}

// ---------------------------------------------------------------------------
// shared columns / helpers

const pad4 = (n) => String(10000 + (n || 0)).slice(1);
const vdrName = (uuid) => state.vdrs[uuid]?.name || '–';

const timerStateIcons = { D: 'trash', E: 'alert', F: 'check', R: 'record', P: 'clock', U: 'help' };
const doneStateIcons = { D: 'trash', F: 'alert', f: 'alert', R: 'check', C: 'copy', Q: 'clock' };

function stateBadge(name, text, cls = '') {
   return $('<span class="state">').addClass(cls).append(icon(name), $('<span>').text(text));
}

function timerState(t) {
   const action = (t.action || 'A').toUpperCase();
   const st = (t.state || 'U').toUpperCase();

   if (action !== 'A')
      return stateBadge('wait', trt.timerActions[action] || action, 'state-wait');

   return stateBadge(timerStateIcons[st] || 'help', trt.timerStates[st] || st, 'state-' + st);
}

function titleCell(t, evId) {
   const $c = $('<div class="cell-title">').append(
      $('<b>').text(t.title || t.name || '–'),
      t.shorttext ? $('<div class="dim">').text(t.shorttext) : null);

   if (evId)
      $c.addClass('clickable').on('click', (ev) => { ev.stopPropagation(); showEvent(evId); });

   if (t.autotimerid)
      $('<button type="button" class="btn btn-flat btn-sm link-search">').append(icon('search'),
         $('<span>').text(t.autotimername || t.expression || trp.searchTimerList))
         .on('click', (ev) => { ev.stopPropagation(); editSearchTimerById(t.autotimerid); })
         .appendTo($c);

   return $c;
}

async function editSearchTimerById(id) {
   try {
      const data = await busy(get('data/searchtimers'));
      const st = (data.searchtimers || []).find((s) => s.id == id);
      st ? openSearchTimerDialog(st) : toast(tr.error.noData, { error: true });
   }
   catch (e) { toastError(e); }
}

function timerColumns() {
   return [
      { key: 'channel', label: tr.channel, cls: 'col-channel', render: (t) => channelBadge(t.channelid), sort: (t) => channelName(t.channelid) },
      { key: 'state', label: 'Status', cls: 'col-state', render: (t) => $('<div>').append(timerState(t), t.info ? $('<div class="dim small">').text(t.info) : null), sort: (t) => (t.action || '') + (t.state || '') },
      { key: 'start', label: trt.startTime, cls: 'col-time', sortDefault: 1,
        render: (t) => $('<div>').append($('<div>').text(t.day ? formatDate(t.day, 'full') : '–'),
           $('<b>').text(hhmmToStr(t.starttime) + ' – ' + hhmmToStr(t.endtime))),
        sort: (t) => String(t.day || 0).padStart(12, '0') + pad4(t.starttime) },
      { key: 'title', label: tr.pages.eventDetail.title, cls: 'col-title', render: (t) => titleCell(t, t.eventid), sort: (t) => (t.title || '').toLowerCase() },
      { key: 'vdr', label: 'VDR', cls: 'col-vdr',
        render: (t) => $('<div>').append($('<div>').append(t.type === 'V' ? icon('tv') : null, ' ', vdrName(t.vdruuid)),
           $('<div class="dim small">').text((t.directory ? t.directory + '~' : '') + (t.file || ''))),
        sort: (t) => vdrName(t.vdruuid) }
   ];
}

function toolButton(name, label, fn) {
   return $('<button type="button" class="btn">').attr('title', label).append(icon(name), $('<span>').text(label)).on('click', fn);
}

async function load(url, key) {
   try {
      const data = await busy(get(url));
      return data[key] || [];
   }
   catch (e) {
      toastError(e);
      return [];
   }
}

// ---------------------------------------------------------------------------
// tabs

function timersTab($body) {
   const canEdit = hasRight(rights.timerEdit);

   const list = dataList({
      columns: timerColumns(),
      selectable: canEdit,
      empty: trt.empty,
      rowCls: (t) => t.active ? '' : 'inactive',
      onRowClick: (t) => canEdit && openTimerDialog(t),
      rowActions: (t) => canEdit && !'DF'.includes((t.state || '').toUpperCase())
         ? [rowButton('edit', tr.edit, () => openTimerDialog(t)), rowButton('trash', tr.del, () => deleteTimers([t.id]))] : [],
      bulkActions: canEdit ? [{ icon: 'trash', label: tr.del, run: (rows) => deleteTimers(rows.map((r) => r.id)) }] : [],
      tools: [
         canEdit ? toolButton('plus', trt.newTimer, () => openTimerDialog({})) : null,
         toolButton('refresh', tr.reload, () => reload())
      ]
   });

   $body.append(list.$el);
   const reload = async () => list.setRows(await load('data/timers?state=P,R', 'timers'));
   return { reload };
}

function searchTimersTab($body) {
   const canEdit = hasRight(rights.searchTimerEdit);
   const typeIcon = { R: 'record', V: 'tv', S: 'search' };

   const list = dataList({
      columns: [
         { key: 'name', label: tr.pages.search.searchName + ' / ' + tr.pages.search.searchExpression, cls: 'col-title', sortDefault: 1,
           render: (t) => $('<div class="cell-title">').append($('<b>').append(icon(typeIcon[t.type] || 'search'), ' ', document.createTextNode(t.name || t.expression)),
              t.name && t.expression !== t.name ? $('<div class="dim small">').text(t.expression) : null),
           sort: (t) => (t.name || t.expression || '').toLowerCase() },
         { key: 'hits', label: 'Treffer', cls: 'col-num', render: (t) => t.type === 'S' ? '–' : String(t.hits ?? 0), sort: (t) => t.hits || 0 },
         { key: 'vdr', label: 'VDR', cls: 'col-vdr', render: (t) => vdrName(t.vdruuid), sort: (t) => vdrName(t.vdruuid) }
      ],
      empty: trt.empty,
      rowCls: (t) => t.active ? '' : 'inactive',
      onRowClick: (t) => canEdit && openSearchTimerDialog(t),
      rowActions: (t) => [
         rowButton('down', t.type === 'S' ? tr.pages.search.search : trp.timerList, () => showSearchTimerHits(t)),
         canEdit ? rowButton('edit', tr.edit, () => openSearchTimerDialog(t)) : null,
         canEdit ? rowButton('trash', tr.del, () => deleteTimers([t.id], 'data/save-searchtimer')) : null],
      tools: [
         canEdit ? toolButton('plus', trt.newTimer, () => openSearchTimerDialog({ searchfields: 1 })) : null,
         toolButton('refresh', tr.reload, () => reload()),
         toolButton('swap', trt.searchTimerReload, async () => {
            try {
               const res = await busy(get('data/updatesearchtimer'));
               toast(res.result?.message || tr.dataSaved);
               reload();
            }
            catch (e) { toastError(e); }
         })
      ]
   });

   $body.append(list.$el);
   const reload = async () => list.setRows(await load('data/searchtimers', 'searchtimers'));
   return { reload };
}

// timers created by a search timer (or the hits of a stored search)

async function showSearchTimerHits(st) {
   const $c = $('<div>');

   try {
      if (st.type === 'S') {
         const q = { ...st, max: state.profile.maxListEntries || 100 };
         delete q.id;
         delete q.name;
         renderResults($c, await busy(post('data/search', q)));
      }
      else {
         const timers = await load('data/timers?state=P,R&autotimerid=' + st.id, 'timers');
         const $ul = $('<ul class="result-list">').appendTo($c);

         if (!timers.length)
            $c.prepend($('<p class="dim">').text(trt.empty));

         for (const t of timers.sort((a, b) => (a.day - b.day) || (a.starttime - b.starttime)))
            $('<li tabindex="0">').append(
               $('<span class="rl-when">').text((t.day ? formatDate(t.day) : '–') + ' ' + hhmmToStr(t.starttime)),
               $('<span class="rl-ch rl-logo">').append(channelLogo(t.channelid)),
               $('<span class="rl-title">').append($('<b>').text(t.title || ''), t.shorttext ? $('<span class="dim">').text(' – ' + t.shorttext) : null),
               $('<span class="dim small">').text(vdrName(t.vdruuid)))
               .on('click', () => t.eventid && showEvent(t.eventid))
               .appendTo($ul);
      }

      dialog({ title: st.name || st.expression, content: $c, cls: 'dlg-wide' });
   }
   catch (e) { toastError(e); }
}

function recentJobsTab($body) {
   const canEdit = hasRight(rights.timerEdit);
   const cols = timerColumns();
   cols[2].sortDefault = -1;

   const list = dataList({
      columns: cols,
      empty: trt.empty,
      rowActions: (t) => canEdit ? [rowButton('trash', tr.del, () => deleteTimers([t.id], 'data/delete-timerjobs'))] : [],
      tools: [toolButton('refresh', tr.reload, () => reload())]
   });

   $body.append(list.$el);
   const reload = async () => list.setRows(await load('data/timers?state=D,F,E&action=A', 'timers'));
   return { reload };
}

function historyTab($body) {
   const canEdit = hasRight(rights.timerEdit);

   const list = dataList({
      columns: [
         { key: 'state', label: 'Status', cls: 'col-state',
           render: (t) => t.state ? stateBadge(doneStateIcons[t.state] || 'help', trt.doneStates[t.state] || t.state, 'done-' + t.state) : '',
           sort: (t) => t.state || '' },
         { key: 'start', label: trt.recordTime, cls: 'col-time', sortDefault: -1,
           render: (t) => $('<div>').append($('<div>').text(formatDateTime(t.starttime)), $('<div class="dim small">').text(Math.round(t.duration / 60) + ' ' + tr.minutes)),
           sort: (t) => t.starttime },
         { key: 'title', label: tr.pages.eventDetail.title, cls: 'col-title', render: (t) => titleCell(t), sort: (t) => (t.title || '').toLowerCase() },
         { key: 'channel', label: tr.channel, cls: 'col-channel', render: (t) => channelBadge(t.channelid), sort: (t) => channelName(t.channelid) }
      ],
      selectable: canEdit,
      empty: trt.empty,
      onRowClick: (t) => showDoneTimer(t.id),
      rowActions: (t) => canEdit ? [rowButton('trash', tr.del, () => deleteTimers([t.id], 'data/store-donetimers'))] : [],
      bulkActions: canEdit ? [{ icon: 'trash', label: tr.del, run: (rows) => deleteTimers(rows.map((r) => r.id), 'data/store-donetimers') }] : [],
      tools: [toolButton('refresh', tr.reload, () => reload())]
   });

   $body.append(list.$el);
   const reload = async () => list.setRows(await load('data/donetimers', 'donetimers'));
   return { reload };
}

function jobsTab($body) {
   const canEdit = hasRight(rights.timerEdit);

   const list = dataList({
      columns: timerColumns(),
      selectable: canEdit,
      empty: trt.empty,
      onRowClick: (t) => canEdit && openTimerDialog(t),
      rowActions: (t) => canEdit ? [rowButton('trash', tr.del, () => deleteTimers([t.id], 'data/delete-timerjobs'))] : [],
      bulkActions: canEdit ? [{ icon: 'trash', label: tr.del, run: (rows) => deleteTimers(rows.map((r) => r.id), 'data/delete-timerjobs') }] : [],
      tools: [toolButton('refresh', tr.reload, () => reload())]
   });

   $body.append(list.$el);
   const reload = async () => list.setRows(await load('data/timers?notaction=A', 'timers'));
   return { reload };
}

function messagesTab($body) {
   const trm = trt;
   const typeIcons = { E: 'alert', F: 'alert', I: 'info', W: 'alert' };

   async function mark(rows, st) {
      if (st === 'D' && !await confirmBox(tr.confirmDelete + (rows.length > 1 ? ' (' + rows.length + tr.entries + ')' : '')))
         return;

      try {
         const res = await busy(post('data/markmessages', { messages: rows.map((r) => ({ id: r.id, state: st })) }));
         if (res.result && res.result.state != 200) throw new Error(res.result.message);
         reload();
      }
      catch (e) { toastError(e); }
   }

   const list = dataList({
      columns: [
         { key: 'type', label: 'Typ', cls: 'col-state',
           render: (m) => stateBadge(typeIcons[m.type] || 'info', trm.messageTypes[m.type] || m.type, 'msg-' + m.type), sort: (m) => m.type },
         { key: 'time', label: 'Zeit', cls: 'col-time', sortDefault: -1, render: (m) => formatDateTime(m.updsp), sort: (m) => m.updsp },
         { key: 'title', label: tr.pages.eventDetail.title, cls: 'col-title',
           render: (m) => $('<div class="cell-title">').append($('<b>').text(m.title || ''), $('<div class="msg-text">').text(m.text || '')),
           sort: (m) => (m.title || '').toLowerCase() },
         { key: 'state', label: 'Status', cls: 'col-num', render: (m) => trm.messageStates[m.state] || m.state, sort: (m) => m.state }
      ],
      filterText: (m) => [m.title, m.text, m.type].join(' '),
      selectable: true,
      rowCls: (m) => m.state === 'N' ? 'unread' : '',
      rowActions: (m) => [
         rowButton(m.state === 'N' ? 'check' : 'mail', m.state === 'N' ? trm.messageStates.R : trm.messageStates.N, () => mark([m], m.state === 'N' ? 'R' : 'N')),
         rowButton('trash', tr.del, () => mark([m], 'D'))],
      bulkActions: [
         { icon: 'check', label: trm.messageStates.R, run: (rows) => mark(rows, 'R') },
         { icon: 'trash', label: tr.del, run: (rows) => mark(rows, 'D') }],
      tools: [toolButton('refresh', tr.reload, () => reload())]
   });

   $body.append(list.$el);
   const reload = async () => list.setRows(await load('data/messages', 'messages'));
   return { reload };
}
