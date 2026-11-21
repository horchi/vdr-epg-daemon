// Timer and search timer dialogs + save/delete helpers
//
//   openTimerDialog(t)        t: timer row (data/timers) or event based { eventid, channelid, title, evStartTime, ... }
//   openSearchTimerDialog(t)  t: search timer row (data/searchtimers) or prefill { expression, ... }
//
//   after a change $(window) gets 'timers:changed'

import { state, hasRight, rights } from './state.js';
import { get, post } from './api.js';
import { dialog, toast, toastError, busy, confirmBox } from './ui.js';
import { toDate, unixTime, nowUnix, formatTime, formatDate, formatDateTime, toLocalInput, fromLocalInput } from './utils.js';
import { field, checkbox, select, segmented, weekdayPicker, chipPicker, hhmmToStr, strToHhmm } from './forms.js';
import { icon } from './icons.js';
import { channelName, channelLogo } from './data.js';
import { helpButton } from './pages/help.js';
import tr from '../lang/de.js';

const trt = tr.pages.timerList;
const trs = tr.pages.search;
const tre = tr.pages.eventDetail;

// ---------------------------------------------------------------------------
// API helpers

async function postResult(url, data) {
   const res = await busy(post(url, data));

   if (res.result && res.result.state != 200)
      throw new Error(res.result.message || tr.error.common);

   return res;
}

function changed(msg = tr.dataSaved) {
   toast(msg);
   $(window).trigger('timers:changed');
}

export async function saveTimer(data) {
   await postResult('data/save-timer', data);
   changed();
}

export async function deleteTimers(ids, url = 'data/save-timer') {
   if (!ids.length || !await confirmBox(tr.confirmDelete + (ids.length > 1 ? ' (' + ids.length + tr.entries + ')' : '')))
      return false;

   try {
      await postResult(url, { delete: ids });
      changed(tr.dataDeleted);
      return true;
   }
   catch (e) {
      toastError(e);
      return false;
   }
}

// ---------------------------------------------------------------------------
// shared bits

let recDirs = null;

async function recordingDirs() {
   if (!recDirs) {
      try {
         const data = await get('data/recordingdirs');
         recDirs = [...new Set((data.recordingdirs || []).map((d) => d.directory).filter(Boolean))].sort();
      }
      catch (e) { recDirs = []; }
   }

   return recDirs;
}

let listSeq = 0;

function folderInput(value) {
   const id = 'recdirs-' + (++listSeq);
   const $list = $('<datalist>').attr('id', id);
   recordingDirs().then((dirs) => $list.append(dirs.map((d) => $('<option>').val(d))));
   return $('<span class="input-wrap">').append($('<input class="input" autocomplete="off">').attr('list', id).val(value || ''), $list);
}

function vdrSelect(value, withAuto = true) {
   const opts = (withAuto ? [{ value: '', label: 'Auto' }] : [])
      .concat(Object.values(state.vdrs).map((v) => ({ value: v.uuid, label: v.name })));
   return select(opts, value || '');
}

function channelOptions() {
   return state.channelOrder.map((id) => ({ value: id, label: state.channels[id].name || id }));
}

// naming mode + template + folder + prio/lifetime/vps (only for recordings)

function recordingOptions(t, defaults) {
   const mode = t.namingmode ?? (parseInt(defaults.mode, 10) || 0);
   const $mode = select(trt.namingModes, mode);
   const $tpl = $('<input class="input">').val(t.template ?? defaults.template ?? '');
   const $tplField = field(trt.template, $('<div class="stack">').append($tpl, templateHelp($tpl)));
   const $folder = folderInput(t.directory);
   const $prio = $('<input type="number" class="input input-num" min="0" max="99" placeholder="…">').val(t.priority || '');
   const $life = $('<input type="number" class="input input-num" min="0" max="99" placeholder="…">').val(t.lifetime || '');
   const vps = checkbox('VPS', t.vps == 1);

   const sync = () => $tplField.toggle($mode.val() == 6);
   $mode.on('change', sync);
   sync();

   return {
      $el: $('<div class="form-group only-rec">').append(
         $('<div class="row">').append(field(trt.namingMode, $('<div class="row row-tight">').append($mode, helpButton('sTNameMode'))), t.file ? field(trt.file, $('<span class="dim field-value">').text(t.file)) : null),
         $tplField,
         field(trt.folder, $folder),
         $('<div class="row">').append(field(trt.prio, $prio), field(trt.lifetime, $life), vps.$el)),
      get(data) {
         data.namingmode = parseInt($mode.val(), 10);
         data.template = $tpl.val();
         data.directory = $folder.find('input').val();
         data.vps = vps.$cb.prop('checked') ? 1 : 0;
         if ($prio.val()) data.priority = parseInt($prio.val(), 10);
         if ($life.val()) data.lifetime = parseInt($life.val(), 10);
      }
   };
}

function templateHelp($input) {
   const $ul = $('<ul class="placeholders">');

   for (const [k, v] of Object.entries(trt.templateFields))
      $('<li>').append($('<code>').text(k), $('<span class="dim">').text(v.replace(/^: /, ' ')))
         .on('click', () => {
            const el = $input[0];
            const pos = el.selectionStart ?? el.value.length;
            el.value = el.value.slice(0, pos) + k + el.value.slice(pos);
            el.focus();
            el.setSelectionRange(pos + k.length, pos + k.length);
         })
         .appendTo($ul);

   return $('<details class="hint">').append($('<summary>').text('Platzhalter'), $ul);
}

function validationError(msg, $field) {
   toast(msg, { error: true });
   $field?.trigger('focus');
   return null;
}

const emptyField = (name) => tr.error.emptyField.replace('$field$', name);

// ---------------------------------------------------------------------------
// timer dialog

export async function openTimerDialog(t = {}) {
   // event detail only knows the timer id -> fetch the full timer

   if (t.id && t.vdruuid === undefined && t.weekdays === undefined) {
      try {
         const data = await busy(get('data/timers?state=P,R'));
         const full = (data.timers || []).find((x) => x.id == t.id);
         if (full) t = { ...t, ...full };
      }
      catch (e) { }
   }

   const isEvent = !!t.eventid;
   const evStart = t.evStartTime;
   const p = state.profile;
   let type = t.type === 'V' ? 'V' : 'R';

   // start / end

   let start, end;

   if (t.day) {
      start = t.day + Math.floor((t.starttime || 0) / 100) * 3600 + ((t.starttime || 0) % 100) * 60;
      end = t.endtime !== undefined ? hhmmToStr(t.endtime) : formatTime(start + 7200);
   }
   else if (!isEvent) {
      start = Math.ceil(nowUnix() / 900) * 900;
      end = formatTime(start + 7200);
   }

   const $title = $('<div class="td-title">').append(
      $('<b>').text(t.title || (isEvent ? '' : trt.newTimer)),
      t.shorttext ? $('<div class="dim">').text(t.shorttext) : null,
      evStart ? $('<div class="dim">').text(channelName(t.channelid) + ' · ' + formatDate(evStart, 'full') + ' ' + formatTime(evStart) + ' – ' + formatTime(evStart + t.evDuration))
         : isEvent && t.day ? $('<div class="dim">').text(channelName(t.channelid) + ' · ' + formatDate(t.day, 'full') + ' ' + hhmmToStr(t.starttime) + ' – ' + hhmmToStr(t.endtime))
         : null);

   if (isEvent)
      $title.addClass('clickable').attr('title', tre.title).on('click', async () => {
         const { showEvent } = await import('./eventDetail.js');
         showEvent(t.eventid);
      });

   const typeSeg = segmented([{ value: 'R', label: tre.record }, { value: 'V', label: tre.ch_switch }], type, (v) => { type = v; sync(); });
   const $channel = select(channelOptions(), t.channelid || '').prop('disabled', isEvent);
   const $start = $('<input type="datetime-local" class="input" step="60">').val(start ? toLocalInput(start) : '').prop('disabled', isEvent);
   const $end = $('<input type="time" class="input">').val(end || '').prop('disabled', isEvent);
   const week = weekdayPicker(t.weekdays || 0);
   const $name = $('<input class="input">').val(t.name || '');
   const inactive = checkbox(trt.inactive, t.active === 0);
   const $vdr = vdrSelect(t.vdruuid ?? p.timerDefaultVDRuuid);
   const $wakeup = $('<input type="number" class="input input-num" min="0" max="999" placeholder="48">').val(t.wakeuphours ?? '');
   const $wakeupField = field('Wecken (Std. vorher)', $('<div class="row row-tight">').append($wakeup, helpButton('sTWakeup')));
   const isSerie = t.category === 'Serie';
   const rec = recordingOptions(t, {
      mode: isSerie ? p.namingModeSerie : p.namingModeMovie,
      template: isSerie ? p.namingModeSerieTemplate : p.namingModeMovieTemplate
   });

   const $form = $('<form class="form timer-form">').append(
      $title,
      typeSeg.$el,
      field(tr.channel, $channel),
      isEvent ? null : $('<div class="row">').append(field(trt.recordTime, $start, 'grow'), field(trt.endTime, $end)),
      isEvent ? null : field('Wiederholen an', week.$el),
      $('<div class="row">').append(field('VDR', $vdr, 'grow'), $wakeupField, inactive.$el),
      rec.$el,
      field(trs.searchName, $name));

   // WOL only for recordings on a fixed VDR

   function sync() {
      $form.find('.only-rec').toggle(type === 'R');
      $wakeupField.toggle(type === 'R' && !!$vdr.val());
   }

   $vdr.on('change', sync);
   sync();

   function getData(validate = true) {
      const data = { type, active: inactive.$cb.prop('checked') ? 0 : 1, name: $name.val(), title: t.title || '' };

      if (t.id) data.id = parseInt(t.id, 10);

      if (isEvent)
         data.eventid = parseInt(t.eventid, 10);
      else if ($start.val()) {
         const s = fromLocalInput($start.val());
         const d = toDate(s);
         data.starttime = d.getHours() * 100 + d.getMinutes();
         d.setHours(0, 0, 0, 0);
         data.day = unixTime(d);
         data.endtime = strToHhmm($end.val());
         if (validate && !$end.val()) return validationError(emptyField(trt.endTime), $end);
      }
      else if (validate)
         return validationError(emptyField(trt.recordTime), $start);

      data.weekdays = isEvent ? (t.weekdays || 0) : week.get();
      data.channelid = $channel.val();

      if (validate && !data.channelid)
         return validationError(emptyField(tr.channel), $channel);

      const vdr = $vdr.val() || (type === 'V' ? state.currentVdr?.uuid : '');

      if (vdr)
         data.vdruuid = vdr;
      else if (validate && type === 'V')
         return validationError(emptyField('VDR'), $vdr);

      if (type === 'R') {
         rec.get(data);
         data.wakeuphours = $wakeup.val() !== '' ? parseInt($wakeup.val(), 10) : 48;
         if (validate && !(data.wakeuphours >= 0)) return validationError(tr.error.invalid + ' (Wecken)', $wakeup);
      }

      return data;
   }

   const buttons = [];

   if (t.id)
      buttons.push({ text: tr.del, cls: 'btn-danger', click: ($d) => { deleteTimers([parseInt(t.id, 10)]).then((ok) => ok && $d[0].close()); return false; } });

   if (!t.id && hasRight(rights.searchTimer))
      buttons.push({ text: tr.pages.timer.searchTimerList, click: () => {
         const d = getData(false);
         openSearchTimerDialog({ ...d, id: undefined, expression: t.title || '', searchfields: 1, channelids: d.channelid });
      } });

   buttons.push({ text: tr.cancel });
   buttons.push({ text: tr.save, primary: true, click: ($d) => {
      const data = getData();
      data && saveTimer(data).then(() => $d[0].close(), toastError);
      return false;
   } });

   dialog({ title: (t.id ? tr.edit : trt.newTimer) + ' – ' + tr.pages.timer.timerList, content: $form, buttons, cls: 'dlg-form' });
}

// ---------------------------------------------------------------------------
// search timer dialog

let catCache = null;

async function categoriesAndGenres() {
   if (!catCache) {
      const [c, g] = await Promise.all([get('data/categories').catch(() => ({})), get('data/genres').catch(() => ({}))]);
      catCache = { categories: (c.categories || []).sort(), genres: (g.genres || []).sort() };
   }

   return catCache;
}

const unquoteList = (s) => s ? String(s).replace(/'/g, '').split(',').map((x) => x.trim()).filter(Boolean) : [];
const quoteList = (a) => a.map((x) => "'" + x + "'").join(',');

// search criteria form – shared by the search timer dialog and the search page
//   embedded: search page (type fixed 'S', no name / type / VDR / recording options, expression input placed by the caller)

export async function searchForm(t = {}, { embedded = false } = {}) {
   const p = state.profile;
   const { categories, genres } = await busy(categoriesAndGenres());
   let type = embedded ? 'S' : (t.type || 'R');

   const isSerie = t.category === 'Serie';
   const $name = $('<input class="input">').val(t.name || '');
   const typeSeg = segmented([
      { value: 'R', label: tre.record }, { value: 'V', label: tre.ch_switch }, { value: 'S', label: tr.menu.search }
   ], type, (v) => { type = v; sync(); });
   const inactive = checkbox(trt.inactive, t.active === 0);

   const $expr = $('<input class="input" required>').val(t.expression || '');
   const $mode = select(trs.searchModes.map((l, i) => ({ value: i + 1, label: l })), t.searchmode || 4);
   const caseSens = checkbox(trs.caseSensitive, t.casesensitiv == 1);
   const fields = trs.searchFields.map((l, i) => checkbox(l, (t.searchfields ?? 1) & (1 << i)));

   // advanced

   const $episode = $('<input class="input">').val(t.episodename || '');
   const $season = $('<input class="input input-num" placeholder="1-3">').val(t.season || '');
   const $part = $('<input class="input input-num" placeholder="1-3">').val(t.seasonpart || '');
   const $year = $('<input class="input input-num" placeholder="1990-2000">').val(t.year || '');
   const cats = chipPicker({ options: categories, values: unquoteList(t.category), placeholder: tre.category + ' …' });
   const gens = chipPicker({ options: genres, values: unquoteList(t.genre), placeholder: tre.genre + ' …' });
   const tipps = ['GoldTipp', 'TagesTipp', 'TopTipp'].map((v) => ({ v, cb: checkbox(v, (t.tipp || '').includes("'" + v + "'")) }));
   const noEpg = checkbox(trt.noEpgMatch, t.noepgmatch == 1);
   const advOpen = !!(t.episodename || t.season || t.seasonpart || t.year || t.category || t.genre || t.tipp || t.noepgmatch == 1);

   // repeats

   const repFields = trs.repeatFields.map((l, i) => checkbox(l, (t.repeatfields || 0) & (1 << i)));

   // channels

   const chExclude = segmented([{ value: '0', label: trt.chInclude }, { value: '1', label: trt.chExclude }], t.chexclude ? '1' : '0');
   const chans = chipPicker({ options: channelOptions(), values: unquoteList(t.channelids), placeholder: tr.channel + ' …' });
   const $chMin = $('<input type="number" class="input input-num" min="0">').val(t.chnummin || '');
   const $chMax = $('<input type="number" class="input input-num" min="0">').val(t.chnummax || '');
   const $chFormat = $('<input class="input" placeholder="z.B. HD,SD" list="chformats">').val(t.chformat ?? (t.id ? '' : p.chFormat || ''));
   const $chFormats = $('<datalist id="chformats">').append(['HD,SD', 'SD,HD', 'HD', 'SD', '3D,HD,SD'].map((v) => $('<option>').val(v)));

   // time

   const hasTime = !!(t.starttime || t.endtime || t.weekdays || t.nextdays);
   const $tStart = $('<input type="time" class="input">').val(t.starttime ? hhmmToStr(t.starttime) : '');
   const $tEnd = $('<input type="time" class="input">').val(t.endtime ? hhmmToStr(t.endtime) : '');
   const week = weekdayPicker(t.weekdays || 0);
   const $nextDays = $('<input type="number" class="input input-num" min="0">').val(t.nextdays || '');

   const $vdr = vdrSelect(t.vdruuid);
   const rec = recordingOptions(t, {
      mode: isSerie ? p.namingModeSearchSerie : p.namingModeSearchMovie,
      template: isSerie ? p.namingModeSearchSerieTemplate : p.namingModeSearchMovieTemplate
   });

   const section = (title, open, help, ...content) => $('<details class="form-section">').prop('open', open)
      .append($('<summary>').append(icon('chevron'), $('<span>').text(title), help ? helpButton(help) : null), $('<div class="form-section-body">').append(...content));

   const $form = $('<form class="form timer-form">');

   if (!embedded)
      $form.append(
         $('<div class="row">').append(field(trs.searchName, $name, 'grow'), inactive.$el),
         typeSeg.$el,
         field(trs.searchExpression, $expr));

   $form.append(
      $('<div class="row">').append(field('Suchmodus', $('<div class="row row-tight">').append($mode, helpButton('sExpr')), 'grow'), caseSens.$el),
      field('Suchen in', $('<div class="check-row">').append(fields.map((f) => f.$el))),
      section(tr.advanced, advOpen, 'sTAdv',
         field(trt.episodepartname, $episode),
         $('<div class="row">').append(field(tre.season, $season), field(tre.part, $part), field(tre.year, $year)),
         field(tre.category, cats.$el), field(tre.genre, gens.$el),
         field('Tipp', $('<div class="check-row">').append(tipps.map((x) => x.cb.$el))),
         noEpg.$el),
      section(trt.noRepeat, (t.repeatfields || 0) > 0, 'sTRepeat',
         $('<div class="check-row">').append(repFields.map((f) => f.$el))).addClass('no-search'),
      section(tr.channel, !!(t.channelids || t.chnummin || t.chnummax || t.chformat), 'sTChannels',
         chExclude.$el, chans.$el,
         $('<div class="row">').append(field(trt.chRange, $('<div class="row row-tight">').append($chMin, '–', $chMax)),
            $('<div class="no-search grow">').append(field(trt.chFormat, $('<span class="input-wrap">').append($chFormat, $chFormats))))),
      section(tr.dateTimePicker.timeText, hasTime, 'sTime',
         field(tr.dateTimePicker.timeTextBetween, $('<div class="row row-tight">').append($tStart, '–', $tEnd)),
         field('Wochentage', week.$el),
         $('<div class="only-search">').append(field(trt.nextDays.replace('$field$', 'N'), $nextDays))));

   if (!embedded)
      $form.append($('<div class="row no-search">').append(field('VDR', $vdr, 'grow')), rec.$el);

   function sync() {
      $form.find('.only-rec').toggle(type === 'R');
      $form.find('.no-search').toggle(type !== 'S');
      $form.find('.only-search').toggle(type === 'S');
   }

   sync();

   function getData(validate = true) {
      const data = { expression: $expr.val(), type, name: $name.val(), active: inactive.$cb.prop('checked') ? 0 : 1 };

      if ($season.val()) data.season = $season.val();
      if ($part.val()) data.seasonpart = $part.val();
      if ($year.val()) data.year = $year.val();

      if (validate) {
         if (!data.expression)
            return validationError(emptyField(trs.searchExpression), $expr);
         if (data.season && !/^[0-9]{0,3}-?[0-9]{0,3}$/.test(data.season))
            return validationError(tr.error.invalid + ' (' + tre.season + ')', $season);
         if (data.seasonpart && !/^[0-9]{0,3}-?[0-9]{0,3}$/.test(data.seasonpart))
            return validationError(tr.error.invalid + ' (' + tre.part + ')', $part);
         if (data.year && !/^((19|20)[0-9]{2})?(-|-(19|20)[0-9]{2})?$/.test(data.year))
            return validationError(tr.error.invalid + ' (' + tre.year + ')', $year);
      }

      if (t.id) data.id = parseInt(t.id, 10);
      if ($episode.val()) data.episodename = $episode.val();

      data.category = quoteList(cats.get());
      data.genre = quoteList(gens.get());
      data.tipp = quoteList(tipps.filter((x) => x.cb.$cb.prop('checked')).map((x) => x.v));
      data.noepgmatch = noEpg.$cb.prop('checked') ? 1 : 0;
      data.searchmode = parseInt($mode.val(), 10);
      data.searchfields = fields.reduce((s, f, i) => s + (f.$cb.prop('checked') ? 1 << i : 0), 0);
      data.casesensitiv = caseSens.$cb.prop('checked') ? 1 : 0;
      data.repeatfields = type === 'S' ? 0 : repFields.reduce((s, f, i) => s + (f.$cb.prop('checked') ? 1 << i : 0), 0);
      data.channelids = chans.get().join(',');
      data.chformat = $chFormat.val();
      data.chexclude = parseInt(chExclude.get(), 10) || 0;
      data.chnummin = parseInt($chMin.val(), 10) || 0;
      data.chnummax = parseInt($chMax.val(), 10) || 0;

      if ($tStart.val() || $tEnd.val() || week.get()) {
         data.starttime = strToHhmm($tStart.val());
         data.endtime = strToHhmm($tEnd.val());
         data.weekdays = week.get();
      }

      if (type === 'S' && $nextDays.val())
         data.nextdays = parseInt($nextDays.val(), 10);

      if (type !== 'S' && $vdr.val())
         data.vdruuid = $vdr.val();

      if (type === 'R')
         rec.get(data);

      return data;
   }

   return { $form, $expr, getData };
}

// run a search (data/search) with the criteria of a search timer

export function searchEvents(data, max) {
   const q = { ...data, max };
   delete q.id;
   delete q.name;
   return busy(post('data/search', q));
}

export async function openSearchTimerDialog(t = {}) {
   const p = state.profile;
   const { $form, getData } = await searchForm(t);
   const $results = $('<div class="st-results">').appendTo($form);
   const runSearch = searchEvents;

   async function test() {
      const data = getData();

      if (!data)
         return;

      try {
         const res = await runSearch(data, p.maxListEntries || 100);
         renderResults($results, res);
         $results[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      catch (e) { toastError(e); }
   }

   async function save($d) {
      const data = getData();

      if (!data)
         return;

      try {
         const res = await runSearch(data, 0);

         if (res.count > 50 && !await confirmBox(trt.confirmSaveBigResult.replace('$cnt$', res.count)))
            return;

         await postResult('data/save-searchtimer', data);
         changed();
         $d[0].close();
      }
      catch (e) { toastError(e); }
   }

   const buttons = [];

   if (t.id) {
      buttons.push({ text: tr.del, cls: 'btn-danger', click: ($d) => {
         deleteTimers([parseInt(t.id, 10)], 'data/save-searchtimer').then((ok) => ok && $d[0].close());
         return false;
      } });
      buttons.push({ text: tr.copy, click: ($d) => {
         const d = getData(false);
         $d[0].close();
         openSearchTimerDialog({ ...t, ...d, id: undefined, name: (d.name || d.expression) + ' copy' });
      } });
   }
   else if (hasRight(rights.timer))
      buttons.push({ text: tr.pages.timer.timerList, click: () => {
         const d = getData(false);
         openTimerDialog({ ...d, id: undefined, title: d.expression, channelid: (d.channelids || '').split(',')[0], weekdays: d.weekdays });
      } });

   buttons.push({ text: tr.test, click: () => { test(); return false; } });
   buttons.push({ text: tr.cancel });
   buttons.push({ text: tr.save, primary: true, click: ($d) => { save($d); return false; } });

   dialog({ title: (t.id ? tr.edit : trt.newTimer) + ' – ' + tr.pages.timer.searchTimerList, content: $form, buttons, cls: 'dlg-form dlg-wide' });
}

// search result list (used in the search timer dialog and the search timer list)

// opts: { onClick(event), currentId } – default click opens the event detail

export function renderResults($target, res, opts = {}) {
   const events = res.events || [];
   const max = state.profile.maxListEntries || 100;

   $target.empty().append($('<h4>').text(events.length ? (res.count ?? events.length) + ' Treffer' : trs.empty));

   if (res.count > events.length)
      $target.append($('<p class="dim">').text('Angezeigt werden nur die ersten ' + events.length + ' (Einstellung „maxListEntries“: ' + max + ').'));

   const $ul = $('<ul class="result-list">').appendTo($target);

   for (const e of events) {
      const recState = (e.dones || []).map((d) => d.state).join(' ');

      $('<li tabindex="0">').toggleClass('done', (e.dones || []).some((d) => d.state === 'R'))
         .toggleClass('current', opts.currentId !== undefined && e.id == opts.currentId).append(
         $('<span class="rl-when">').text(formatDate(e.starttime) + ' ' + formatTime(e.starttime)),
         $('<span class="rl-ch rl-logo">').append(channelLogo(e.channelid)),
         $('<span class="rl-title">').append($('<b>').text(e.title), e.shorttext ? $('<span class="dim">').text(' – ' + e.shorttext) : null),
         recState ? $('<span class="badge rl-done">').attr('title', (e.dones || []).map((d) => trt.doneStates[d.state] || d.state).join(', ')).text(recState) : null)
         .on('click', async () => {
            if (opts.onClick)
               return opts.onClick(e);
            const { showEvent } = await import('./eventDetail.js');
            showEvent(e.id, { list: events.map((x) => x.id) });      // prev / next steps through the results
         })
         .on('keydown', (ev) => ev.key === 'Enter' && $(ev.currentTarget).trigger('click'))
         .appendTo($ul);
   }
}
