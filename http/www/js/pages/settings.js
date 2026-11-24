// Page "Einstellungen" – tabs: profile, channels, users, system (epgd backend)

import { state, hasRight, rights } from '../state.js';
import { get, post, mediaUrl } from '../api.js';
import { busy, toast, toastError, dialog, confirmBox, stickyBar } from '../ui.js';
import { formatDateTime, sizeText, agoText } from '../utils.js';
import { icon } from '../icons.js';
import { vdrState, epgdState, startButton, remoteButton } from '../vdrstate.js';
import { field, checkbox, select } from '../forms.js';
import { loadProfile, loadChannels, loadVdrs, groupSort } from '../data.js';
import { md5 } from '../lib/md5.js';
import { getTheme, setTheme, accents } from '../theme.js';
import tr from '../../lang/de.js';
import { helpLink, helpButton, hasHelp } from './help.js';

const trp = tr.pages.profile;
const trt = tr.pages.timerList;
const tre = tr.pages.eventDetail;

const tabs = {
   profile:  { label: 'Profil', build: profileTab },
   vdrs:     { label: 'VDRs', right: rights.configEdit, build: vdrsTab },
   channels: { label: tr.pages.options.editChannels.replace(' bearbeiten', ''), right: rights.configEdit, build: channelsTab },
   users:    { label: tr.pages.editUser.user, right: rights.configUsers, build: usersTab },
   system:   { label: 'System', right: rights.configEdit, build: systemTab }
};

let cleanup = null;

// selected tab, kept while visiting other pages and in the browser (localStorage,
//   a convenience only - works without it too)

const TAB_KEY = 'epgd.tab.settings';
let lastTab = null;

try { lastTab = localStorage.getItem(TAB_KEY); }
catch (e) { /* no storage */ }

export function render($content, params = {}) {
   destroy();

   const avail = Object.keys(tabs).filter((k) => !tabs[k].right || hasRight(tabs[k].right));
   const id = [params.tab, lastTab].find((t) => avail.includes(t)) || avail[0];

   lastTab = id;            // the menu link has no tab -> back to the last selected one

   try { localStorage.setItem(TAB_KEY, id); }
   catch (e) { /* no storage */ }
   const $body = $('<div class="tab-body">');

   $content.empty().append($('<section class="page page-settings">').append(
      $('<nav class="tabs" role="tablist">').append(avail.map((k) =>
         $('<a role="tab">').attr('href', '#settings?tab=' + k).text(tabs[k].label).toggleClass('active', k === id))),
      $body));

   cleanup = tabs[id].build($body) || null;
}

export function destroy() {
   cleanup?.();
   cleanup = null;
}

// ---------------------------------------------------------------------------
// helpers

async function loadParameters() {
   const data = await busy(get('data/parameters'));
   return data.parameters || [];
}

// save [{ name, value, owner }] – shows failed entries

async function saveParameters(list, labelOf = (p) => p.name) {
   if (!list.length) {
      toast('Keine Änderungen');
      return true;
   }

   try {
      const res = await busy(post('data/save-parameters', { parameters: list }));

      if (res.result && res.result.state != 200)
         throw Object.assign(new Error(res.result.message), { failed: res.result.failed });

      toast(tr.dataSaved);
      await loadProfile();
      return true;
   }
   catch (e) {
      const failed = e.failed || [];
      toast(failed.length ? tr.error.invalid + ': ' + failed.map((i) => labelOf(list[i])).join(', ') : e.message, { error: true });
      return false;
   }
}

// '?' button with the help of a setting (topic 'p_<name>' in the help section 'Einstellungen')
//   behind the label of a field, a checkbox or a parameter row

function withHelp($el, topic) {
   if (!hasHelp(topic))
      return $el;

   const $label = $el.children('.field-label, span, .sys-name').first();
   ($label.length ? $label : $el).append(helpButton(topic));
   return $el.addClass('has-help');
}

const hfield = (label, $input, topic, cls) => withHelp(field(label, $input, cls), topic);

const card = (title, ...content) => $('<section class="card settings-card">').append($('<h3>').text(title), ...content);
const stripHtml = (s) => $('<div>').html(s).text();

function saveBar(onSave) {
   return $('<div class="save-bar">').append(
      $('<button type="button" class="btn btn-primary">').append(icon('check'), $('<span>').text(tr.save)).on('click', onSave));
}

// ---------------------------------------------------------------------------
// profile (user parameters, owner '@user')

function profileTab($body) {
   (async () => {
      let params;

      try { params = await loadParameters(); }
      catch (e) { return toastError(e); }

      const byName = Object.fromEntries(params.map((p) => [p.name, p]));
      const val = (n) => byName[n]?.value ?? byName[n]?.default ?? '';
      const controls = {};          // name -> () => value

      const vdrOpts = (auto) => (auto ? [{ value: '', label: 'Auto' }] : [])
         .concat(Object.values(state.vdrs).map((v) => ({ value: v.uuid, label: v.name })));

      // start page (stored as 'menu_<page>')

      const menuPages = ['overview', 'now', 'magazine', 'timeline', 'timerList', 'records', 'search'].map((k) =>
         ({ value: 'menu_' + k, label: k === 'timerList' ? tr.menu.timer : tr.menu[k] }));
      const startPages = menuPages.concat({ value: 'menu_last', label: 'zuletzt besuchte Seite' });

      const $start = select(startPages, val('startPage') || 'menu_now');
      const $logoPage = select(menuPages, val('logoPage') || 'menu_now');
      const $defVdr = select([{ value: '', label: '(erster VDR)' }, ...vdrOpts(false)], val('defaultVDRuuid'));
      const $quick = $('<textarea class="input" rows="5">').val(String(val('quickTimes')).replace(/~/g, '\n'));
      const $maxList = $('<input type="number" class="input input-num" min="1" max="999">').val(val('maxListEntries'));
      const $constabel = $('<input class="input" placeholder="https://www.eplists.de/eplist.cgi?action=login&login=…&secret=…">').val(val('constabelLoginPath'));

      controls.startPage = () => $start.val();
      controls.logoPage = () => $logoPage.val();
      controls.defaultVDRuuid = () => $defVdr.val() || '';
      controls.quickTimes = () => $quick.val().split('\n').map((l) => l.trim()).filter(Boolean).join('~');
      controls.maxListEntries = () => $maxList.val();
      controls.constabelLoginPath = () => $constabel.val();

      // naming modes

      const naming = [
         ['namingModeSerie', tre.scrapperSerieInfo + ' – ' + tr.pages.timer.timerList],
         ['namingModeSearchSerie', tre.scrapperSerieInfo + ' – ' + tr.pages.timer.searchTimerList],
         ['namingModeMovie', 'Filme / Sonstiges – ' + tr.pages.timer.timerList],
         ['namingModeSearchMovie', 'Filme / Sonstiges – ' + tr.pages.timer.searchTimerList]
      ].map(([name, label]) => {
         const $mode = select(trt.namingModes, parseInt(val(name), 10) || 0);
         const $tpl = $('<input class="input" placeholder="Template">').val(val(name + 'Template'));
         const sync = () => $tpl.toggle($mode.val() == 6);
         $mode.on('change', sync);
         sync();
         controls[name] = () => String($mode.val());
         controls[name + 'Template'] = () => $tpl.val();
         return hfield(label, $('<div class="stack">').append($mode, $tpl), 'p_namingMode');
      });

      const $chFormat = $('<input class="input" placeholder="z.B. HD,SD">').val(val('chFormat'));
      const $timerVdr = select(vdrOpts(true), val('timerDefaultVDRuuid'));
      const $mail = $('<input type="email" class="input">').val(val('mailReceiver'));
      const mailTypes = Object.entries(trt.messageTypes).map(([k, l]) => ({ k, cb: checkbox(l, String(val('messageMailTypes')).includes(k)) }));
      const searchAdv = checkbox('Suchoptionen standardmäßig anzeigen', val('searchAdv') == 1);
      const sched = checkbox(trp.vdr.startWithSched, val('startWithSched') == 1);
      const notify = checkbox(trp.vdr.osdTimerNotify, val('osdTimerNotify') == 1);
      const $recSort = select([
         { value: 6, label: 'Neueste zuerst' }, { value: 5, label: 'Älteste zuerst' },
         { value: 1, label: 'Titel A–Z' }, { value: 2, label: 'Titel Z–A' }], val('recordSubFolderSort') || 6);

      controls.chFormat = () => $chFormat.val();
      controls.timerDefaultVDRuuid = () => $timerVdr.val() || '';
      controls.mailReceiver = () => $mail.val();
      controls.messageMailTypes = () => mailTypes.filter((m) => m.cb.$cb.prop('checked')).map((m) => m.k).join('');
      controls.searchAdv = () => searchAdv.$cb.prop('checked') ? '1' : '0';
      controls.startWithSched = () => sched.$cb.prop('checked') ? '1' : '0';
      controls.osdTimerNotify = () => notify.$cb.prop('checked') ? '1' : '0';
      controls.recordSubFolderSort = () => String($recSort.val());

      const $mailTest = $('<button type="button" class="btn">').text(tr.test).on('click', async () => {
         try {
            const res = await busy(post('data/sendmail', { receiver: $mail.val(), subject: 'checkMailAddress', body: 'it works', mimetype: '' }));
            res.result?.state == 200 ? toast(tr.dataSend) : toast(res.result?.message || tr.error.common, { error: true });
         }
         catch (e) { toastError(e); }
      });

      // compare against the values the form was initialized with (parameters may be missing in the response)

      const initial = Object.fromEntries(Object.entries(controls).map(([k, g]) => [k, g()]));

      const labels = {
         startPage: 'Startseite', logoPage: 'Seite hinter dem Logo', quickTimes: 'Schnellzeiten', maxListEntries: 'Max. Einträge',
         mailReceiver: trp.mailReceiver, chFormat: trt.chFormat
      };

      $body.append($('<div class="settings-grid">').append(
         appearanceCard(),
         card('Oberfläche',
            hfield('Startseite', $start, 'p_startPage'),
            hfield('Seite hinter dem Logo', $logoPage, 'p_logoPage'),
            hfield('Standard-VDR', $defVdr, 'p_defaultVDRuuid'),
            hfield('Schnellzeiten (eine pro Zeile)', $('<div class="stack">').append($quick,
               $('<p class="dim small">').text('Bezeichnung=hh:mm, z.B. Primetime=20:15 – mit „!“ (Primetime=!20:15) keine Linie im Magazin. '
                  + 'Jetzt=@Now, Danach=@Next, gespeicherte Suche=@Name')), 'p_quickTimes'),
            hfield(stripHtml(trp.maxListEntries), $maxList, 'p_maxListEntries'),
            hfield('Constabel-Login', $constabel, 'p_constabelLoginPath')),
         card(tr.pages.timer.timerList,
            ...naming,
            $('<div class="row">').append(hfield(trt.chFormat, $chFormat, 'p_chFormat', 'grow'), hfield('VDR', $timerVdr, 'p_timerDefaultVDRuuid', 'grow'))),
         card('Benachrichtigungen',
            hfield(trp.mailReceiver, $('<div class="row row-tight">').append($mail, $mailTest), 'p_mailReceiver'),
            field(trp.sendMessages, $('<div class="check-row">').append(mailTypes.map((m) => m.cb.$el)))),
         card('Suche, Aufnahmen & VDR',
            withHelp(searchAdv.$el, 'p_searchAdv'),
            hfield(trp.record.subFolderSort, $recSort, 'p_recordSubFolderSort'),
            withHelp(sched.$el, 'p_startWithSched'), withHelp(notify.$el, 'p_osdTimerNotify'))),
         saveBar(async () => {
            const lines = $quick.val().split('\n').map((l) => l.trim()).filter(Boolean);
            const bad = lines.find((l) => !/^[^=]+=!?((([0-1]?[0-9]|2[0-4]):[0-5]?[0-9])|@\S*)$/.test(l));

            if (bad)
               return toast(tr.error.invalid + ': ' + bad, { error: true });

            const list = [];

            for (const [name, getter] of Object.entries(controls)) {
               const v = getter();
               if (String(initial[name]) !== String(v))
                  list.push({ name, value: v, owner: byName[name]?.owner || '@' + state.login.user });
            }

            if (await saveParameters(list, (p) => labels[p.name] || p.name))
               list.forEach((p) => { initial[p.name] = p.value; });
         }));
   })();
}

// appearance – stored per device, applied immediately

function appearanceCard() {
   const t = getTheme();

   const mode = $('<div class="seg seg-radio">').append(
      [['auto', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']].map(([v, l]) =>
         $('<button type="button" class="btn">').text(l).toggleClass('active', t.mode === v)
            .on('click', function () { setTheme({ mode: v }); $(this).addClass('active').siblings().removeClass('active'); })));

   const $swatches = $('<div class="swatches">').append(accents.map((a) =>
      $('<button type="button" class="swatch">').attr({ title: a.name, 'aria-label': a.name })
         .css('--swatch', a.color || 'var(--accent-default)')
         .toggleClass('active', (t.accent || '') === a.color)
         .on('click', function () { setTheme({ accent: a.color }); $(this).addClass('active').siblings().removeClass('active'); })));

   return card('Darstellung',
      field('Theme', mode),
      field('Akzentfarbe', $swatches),
      $('<p class="dim small">').text('Gilt für dieses Gerät und wird sofort übernommen. „Automatisch“ folgt der Einstellung des Betriebssystems.'));
}

// ---------------------------------------------------------------------------
// channels: order (drag), visibility; reference list (channels.conf) to take the order from
//   name and group are maintained by the epg2vdr master from the VDR channels (read only here),
//   the list is ordered by the groups, a channel can be moved only within its group

function channelsTab($body) {
   const trc = tr.pages.editChannels;
   let rows = state.channelOrder.map((id) => {
      const c = state.channels[id];
      return { id, name: c.name || '', group: c.group || '', visible: c.visible ?? 1, sources: c.sources || {} };
   });
   let ref = null;           // reference list [{ id, name }]
   let dirty = false;

   // stored order not yet grouped (e.g. after the groups were taken from the VDR) -> already grouped
   //   by loadChannels, ask to save

   const regrouped = state.channelsRegrouped;
   dirty = regrouped;

   const $filter = $('<input type="search" class="input" placeholder="Filter (Name, Gruppe oder ID) …">').on('input', renderList);
   const $count = $('<span class="dim">');
   const $list = $('<ol class="ch-list">');
   const $refBox = $('<div class="ch-ref">').hide();

   const $menu = $('<div class="seg seg-wrap">').append(
      $('<button type="button" class="btn">').append(icon('check'), $('<span>').text('Alle sichtbar')).on('click', () => setVisible(true)),
      $('<button type="button" class="btn">').append(icon('close'), $('<span>').text('Alle ausblenden')).on('click', () => setVisible(false)),
      $('<button type="button" class="btn">').append(icon('copy'), $('<span>').text(trc.menu.referenceList)).on('click', referenceDialog));

   $body.append(
      helpLink('optChannels'),
      regrouped ? $('<p class="ch-regrouped">').append(icon('info'),
         $('<span>').text('Die Kanäle wurden nach ihren Gruppen geordnet, innerhalb der Gruppen in der bisherigen Reihenfolge. Zum Übernehmen speichern.')) : null,
      stickyBar($('<div class="toolbar">').append($filter, $count, $menu)),
      $('<div class="ch-layout">').append($list, $refBox),
      saveBar(save));

   function filtered() {
      const f = $filter.val().toLowerCase().trim();
      return f ? rows.filter((r) => r.name.toLowerCase().includes(f) || r.group.toLowerCase().includes(f) || r.id.toLowerCase().includes(f)) : rows;
   }

   function setVisible(on) {
      filtered().forEach((r) => { r.visible = on ? (r.visible | 1) : (r.visible & ~1); });
      dirty = true;
      renderList();
   }

   function renderList() {
      const list = filtered();
      const sortable = list.length === rows.length;

      $count.text(list.length === rows.length ? rows.length + ' Kanäle' : list.length + ' / ' + rows.length);
      $list.empty().toggleClass('no-sort', !sortable);

      const counts = {};
      list.forEach((r) => { counts[r.group] = (counts[r.group] || 0) + 1; });
      let group = null;

      for (const r of list) {
         if (r.group !== group) {
            group = r.group;
            $('<li class="ch-group-head">').append($('<span>').text(group || 'Ohne Gruppe'), $('<span class="dim">').text(counts[group]))
               .appendTo($list);
         }

         const vis = checkbox('', r.visible & 1);
         vis.$cb.attr('title', trc.checkWeb).on('change', function () { r.visible = this.checked ? r.visible | 1 : r.visible & ~1; dirty = true; });

         $('<li class="ch-item">').data('row', r).toggleClass('hidden-ch', !(r.visible & 1)).append(
            $('<span class="ch-handle">').attr('title', sortable ? 'Ziehen zum Sortieren' : 'Sortieren nur ohne Filter').html(icon('menu')),
            vis.$el,
            logoButton(r),
            $('<span class="ch-name">').append(
               r.name ? $('<span>').text(r.name) : $('<span class="dim">').text('(kein Name)')),
            $('<span class="ch-id dim">').text(r.id),
            sourceBadges(r.sources))
            .appendTo($list);
      }
   }

   // drag & drop with pointer events (mouse + touch)

   $list.on('pointerdown', '.ch-handle', function (ev) {
      if ($list.hasClass('no-sort'))
         return;

      ev.preventDefault();
      const $item = $(this).closest('.ch-item').addClass('dragging');
      const scroller = setInterval(() => {
         if (lastY < 70) window.scrollBy(0, -12);
         else if (lastY > window.innerHeight - 50) window.scrollBy(0, 12);
      }, 30);
      let lastY = ev.clientY;

      $(document).on('pointermove.chdrag', (e) => {
         lastY = e.clientY;
         const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.ch-item');

         // only within the group of the channel

         if (el && el !== $item[0] && $(el).data('row').group === $item.data('row').group) {
            const r = el.getBoundingClientRect();
            e.clientY < r.top + r.height / 2 ? $item.insertBefore(el) : $item.insertAfter(el);
         }
      }).on('pointerup.chdrag pointercancel.chdrag', () => {
         clearInterval(scroller);
         $(document).off('.chdrag');
         $item.removeClass('dragging');
         rows = $list.children('.ch-item').toArray().map((li) => $(li).data('row'));
         dirty = true;
      });
   });

   // channel logo, click shows how it is looked up (file, path, ...)

   function logoButton(r) {
      const $btn = $('<button type="button" class="ch-logo-btn">').attr('title', 'Logo-Details')
         .on('click', () => logoDialog(r));
      const $none = () => $('<span class="ch-logo-none">').html(icon('alert'));

      if (r.name)
         $btn.append($('<img loading="lazy" alt="">').attr('src', mediaUrl(state.profile.channelLogoPath, { maxW: 70, maxH: 50, id: r.id }))
            .on('error', function () { $(this).replaceWith($none()); }));
      else
         $btn.append($none());

      return $btn;
   }

   async function logoDialog(r) {
      let info;

      try { info = await busy(get('data/channellogoinfo?' + new URLSearchParams({ id: r.id }))); }
      catch (e) { return toastError(e); }

      const kv = (k, v) => v === undefined || v === null || v === '' ? null : $('<tr>').append($('<th>').text(k), $('<td>').append(v));
      const mono = (t) => $('<code>').text(t);
      const size = info.size !== undefined ? (info.size < 10240 ? info.size + ' Byte' : Math.round(info.size / 1024) + ' KB') : null;

      dialog({
         title: 'Logo: ' + (r.name || r.id), cls: 'dlg-wide',
         content: $('<div class="logo-info">').append(
            info.file ? $('<div class="logo-info-img">').append($('<img alt="">').attr('src', mediaUrl(state.profile.channelLogoPath, { maxW: 300, maxH: 200, id: r.id })))
                      : $('<p class="logo-info-missing">').append(icon('alert'), $('<span>').text(!info.key ? 'Kein Logo – der Kanal hat keinen Namen.' : 'Kein Logo gefunden.')),
            $('<table class="logo-info-kv">').append(
               kv('Kanal-ID', mono(info.channelid)),
               kv('Name', info.name || '–'),
               kv('Suche nach', (info.byId ? 'Kanal-ID' : 'Name') + (info.upperCase ? ', Großbuchstaben' : ', Kleinbuchstaben')),
               kv('Schlüssel', info.key !== undefined ? mono(info.key) : null),
               kv('Verzeichnis', mono(info.dir)),
               kv('Verweist auf', info.dirTarget && info.dirTarget !== info.dir ? mono(info.dirTarget) : null),
               kv('Datei', info.file ? mono(info.file) : null),
               kv('Echter Pfad', info.realpath && info.realpath !== info.file ? mono(info.realpath) : null),
               kv('Größe', size),
               kv('Geändert', info.modtime ? formatDateTime(info.modtime) : null),
               kv('Gesucht', info.tried?.length ? $('<ul class="logo-info-tried">').append(info.tried.map((t) =>
                  $('<li>').toggleClass('dim', !t.exists).append(t.exists ? icon('check') : icon('close'), mono(t.path)))) : null))),
         buttons: [{ text: tr.close }]
      });
   }

   // sources of the channel (channelmap rows) with their merge role

   function sourceBadges(sources) {
      const roles = { 0: 'kein Merge', 1: 'führend', 2: 'Fallback', 3: 'Fallback + Bilder' };
      const rank = (m) => m === 0 ? 9 : m;
      const list = Object.entries(sources).map(([src, s]) => ({ src, extid: s.externalid ?? s.extid ?? '', merge: Number(s.merge ?? 0) }))
         .sort((a, b) => rank(a.merge) - rank(b.merge) || a.src.localeCompare(b.src));

      return $('<span class="ch-src">').append(list.map((s) =>
         $('<span class="badge ch-src-badge">').addClass('merge-' + s.merge)
            .attr('title', s.src + (s.extid && s.extid !== '000' ? ' (ID ' + s.extid + ')' : '') + ' – Merge ' + s.merge + ': ' + (roles[s.merge] || '?'))
            .text(s.src + ':' + s.merge)));
   }

   // reference list

   function referenceDialog() {
      const $text = $('<textarea class="input" rows="10" placeholder="channels.conf hier einfügen …">');

      dialog({
         title: trc.menu.referenceList, cls: 'dlg-form dlg-wide',
         content: $('<div class="form">').append(
            $('<p class="dim small">').text('Kanalliste (Format channels.conf) eines VDR einfügen. Danach lässt sich die Reihenfolge übernehmen.'),
            field(trc.menu.insertAsText, $text)),
         buttons: [
            { text: tr.cancel },
            { text: tr.apply, primary: true, click: () => { setReference(parseChannelsConf($text.val())); } }]
      });
   }

   function parseChannelsConf(text) {
      const list = [];

      for (const line of text.split('\n')) {
         const t = line.split(':');

         if (t.length > 11 && t[0] && line[0] !== ':')
            list.push({ name: t[0].split(/[,;]/)[0], id: t[3] + '-' + t[10] + '-' + t[11] + '-' + t[9] });
      }

      return list;
   }

   function setReference(list) {
      ref = list;

      if (!ref.length) {
         $refBox.hide();
         return toast(tr.error.noData, { error: true });
      }

      const known = new Set(rows.map((r) => r.id));

      $refBox.show().empty().append(
         $('<h4>').text(trc.menu.referenceList + ' (' + ref.length + ')'),
         $('<div class="btn-row">').append(
            $('<button type="button" class="btn btn-sm">').text(trc.menu.applyChannelSort).on('click', applyOrder),
            $('<button type="button" class="btn btn-sm btn-flat">').html(icon('close')).attr('title', tr.close).on('click', () => { ref = null; $refBox.hide(); })),
         $('<ul class="ch-ref-list">').append(ref.map((c) =>
            $('<li>').toggleClass('dim', !known.has(c.id)).append($('<b>').text(c.name), ' ', $('<span class="dim small">').text(c.id)))));
   }

   function applyOrder() {
      const pos = new Map(ref.map((c, i) => [c.id, i]));
      rows = rows.map((r, i) => ({ r, i })).sort((a, b) =>
         (pos.has(a.r.id) ? pos.get(a.r.id) : 1e6 + a.i) - (pos.has(b.r.id) ? pos.get(b.r.id) : 1e6 + b.i)).map((x) => x.r);
      rows = groupSort(rows);            // keep the groups together, the reference gives the order of the groups too
      dirty = true;
      toast('Reihenfolge übernommen');
      renderList();
   }

   async function save() {
      const channels = {};

      rows.forEach((r, i) => {
         channels[r.id] = { visible: r.visible, order: i + 1 };
      });

      try {
         const res = await busy(post('data/save-channels', { channels }));
         if (res.result && res.result.state != 200) throw new Error(res.result.message);
         toast(tr.dataSaved);
         dirty = false;
         $body.find('.ch-regrouped').remove();
         await loadChannels();
      }
      catch (e) { toastError(e); }
   }

   renderList();

   const warn = (ev) => { if (dirty) { ev.preventDefault(); ev.returnValue = ''; } };
   window.addEventListener('beforeunload', warn);
   return () => window.removeEventListener('beforeunload', warn);
}

// ---------------------------------------------------------------------------
// users

const rightList = [
   ['config', 'umConfig'], ['configEdit', 'umConfigEdit'], ['configUsers', 'umConfigUsers'],
   ['timer', 'umTimer'], ['timerEdit', 'umTimerEdit'], ['searchTimer', 'umSearchTimer'], ['searchTimerEdit', 'umSearchTimerEdit'],
   ['fsk', 'umFsk'], ['recordings', 'umRecordings'], ['recordingsEdit', 'umRecordingsEdit']
];

function usersTab($body) {
   const tru = tr.pages.editUser;
   const $list = $('<div class="user-list">');
   const $edit = $('<div class="user-edit">');

   $body.append($('<div class="users-layout">').append(
      $('<div>').append($list, $('<button type="button" class="btn">').append(icon('plus'), $('<span>').text(tru.add)).on('click', () => editUser(null))),
      $edit));

   async function load(select) {
      try {
         const data = await busy(get('data/users'));
         const users = Object.values(data.users || {}).sort((a, b) => a.user.localeCompare(b.user));

         $list.empty().append(users.map((u) =>
            $('<button type="button" class="user-item">').toggleClass('inactive', u.active != 1).append(icon('user'),
               $('<span>').text(u.user), u.active != 1 ? $('<span class="dim small">').text(tru.inActive) : null)
               .on('click', function () { $list.find('.active').removeClass('active'); $(this).addClass('active'); editUser(u); })));

         if (!users.length)
            $list.append($('<p class="dim">').text('Noch keine Benutzer.'));

         if (select !== undefined)
            $list.find('.user-item').filter((i, el) => $(el).text().startsWith(select)).first().trigger('click');
      }
      catch (e) { toastError(e); }
   }

   function editUser(u) {
      const isNew = !u;
      u ||= { user: '', active: 1, rights: state.login.rights };

      const $name = $('<input class="input" autocomplete="off">');
      const active = checkbox(tru.active, u.active == 1);
      const $pass = $('<input type="password" class="input" autocomplete="new-password">').attr('placeholder', isNew ? '' : 'leer lassen = unverändert');
      const boxes = rightList.map(([key, label]) => ({ mask: rights[key], cb: checkbox(tru.rights[label] || label, (u.rights & rights[key]) === rights[key]) }));

      // a right includes its sub rights -> check and lock them

      function syncRights() {
         for (const b of boxes) {
            const implied = boxes.some((o) => o !== b && o.mask > b.mask && (o.mask & b.mask) === b.mask && o.cb.$cb.prop('checked'));
            b.cb.$cb.prop('disabled', implied);
            if (implied) b.cb.$cb.prop('checked', true);
         }
      }

      let rightsChanged = false;
      boxes.forEach((b) => b.cb.$cb.on('change', () => { rightsChanged = true; syncRights(); }));
      syncRights();

      $edit.empty().append($('<div class="card">').append(
         $('<h3>').text(isNew ? tru.add : tru.user + ' ' + u.user),
         $('<div class="form">').append(
            isNew ? field(tr.pages.login.userName, $name) : null,
            active.$el,
            field(tr.pages.login.password, $pass),
            field(tru.rights.label, $('<div class="rights">').append(boxes.map((b) => b.cb.$el)))),
         $('<div class="btn-row">').append(
            !isNew && u.user !== state.login.user ? $('<button type="button" class="btn btn-danger">').append(icon('trash'), $('<span>').text(tr.del)).on('click', () => saveUser('D')) : null,
            $('<span class="dl-spacer">'),
            $('<button type="button" class="btn btn-primary">').append(icon('check'), $('<span>').text(tr.save)).on('click', () => saveUser(isNew ? 'C' : 'M')))));

      if (isNew)
         $name.trigger('focus');

      async function saveUser(st) {
         const d = { user: isNew ? $name.val().trim() : u.user, state: st };

         if (st === 'D') {
            if (!await confirmBox(tr.confirmDelete + ' (' + u.user + ')'))
               return;
         }
         else {
            if (!d.user)
               return toast(tr.error.emptyField.replace('$field$', tr.pages.login.userName), { error: true });

            const r = boxes.reduce((s, b) => s | (b.cb.$cb.prop('checked') ? b.mask : 0), 1);
            const a = active.$cb.prop('checked') ? 1 : 0;

            if (isNew || (rightsChanged && r !== u.rights)) d.rights = r;
            if (isNew || a !== u.active) d.active = a;
            if (isNew || $pass.val()) d.passwd = md5(d.user + $pass.val());
         }

         try {
            const res = await busy(post('data/save-users', { users: [d] }));
            if (res.Error || (res.result && res.result.state != 200)) throw new Error(res.Error || res.result.message);
            toast(st === 'D' ? tr.dataDeleted : tr.dataSaved);
            $edit.empty();
            load(st === 'D' ? undefined : d.user);
         }
         catch (e) { toastError(e); }
      }
   }

   load();
}

// ---------------------------------------------------------------------------
// VDRs: all rows of the vdrs table with details, delete a row, wake on lan

function vdrsTab($body) {
   const $grid = $('<div class="settings-grid vdr-grid">');

   $body.append(
      helpLink('optVdrs'),
      $grid);

   let canStart = false;          // start script configured
   let jobs = null;               // pending timer jobs (shown at the epgd while it is busy)
   let pollTimer = null;          // refresh of the epgd card while it is busy (no push from the server)
   let watchUntil = 0;            // after 'EPG-Update starten' poll until the epgd reports busy
   let stopped = false;

   const POLL = 5000;             // [ms]

   async function loadJobs() {
      const tj = hasRight(rights.timer) ? await get('data/timers?notaction=A').catch(() => null) : null;
      jobs = tj ? (tj.timers || []).length : null;
   }

   async function load() {
      try {
         const [data] = await busy(Promise.all([get('data/vdrs?all=1&probe=1'), loadJobs()]));
         canStart = !!data.vdrstart;
         const vdrs = Object.entries(data.vdrs || {}).map(([uuid, v]) => ({ uuid, ...v }))
            .sort((a, b) => (a.uuid === 'epgd' ? -1 : b.uuid === 'epgd' ? 1 : 0)
               || (a.state === 'attached' ? 0 : 1) - (b.state === 'attached' ? 0 : 1)
               || (a.name || '').localeCompare(b.name || ''));

         $grid.empty().append(vdrs.map(vdrCard));

         if (!vdrs.length)
            $grid.append($('<p class="dim">').text(tr.error.noData));

         schedule(data.vdrs?.epgd);
      }
      catch (e) { toastError(e); }
   }

   // silent refresh of the epgd card only (without probing the VDRs)

   async function poll() {
      pollTimer = null;

      if (stopped)
         return;

      if (document.hidden)
         return schedule({ state: 'busy' });

      try {
         const [data] = await Promise.all([get('data/vdrs?all=1'), loadJobs()]);
         const v = data.vdrs?.epgd;

         if (stopped)
            return;

         if (v)
            $grid.children('.epgd-card').replaceWith(vdrCard({ uuid: 'epgd', ...v }));

         schedule(v);
      }
      catch (e) { schedule({ state: 'busy' }); }      // retry, the epgd may be restarting
   }

   function schedule(v) {
      clearTimeout(pollTimer);
      pollTimer = null;

      if (!stopped && v && ((v.state || '').startsWith('busy') || Date.now() < watchUntil))
         pollTimer = setTimeout(poll, POLL);
   }

   function vdrCard(v) {
      const isEpgd = v.uuid === 'epgd';
      const st = isEpgd ? null : vdrState(v, canStart);
      const es = isEpgd ? epgdState(v, jobs) : null;
      const kv = [];
      const add = (label, value) => value !== undefined && value !== null && value !== '' && kv.push($('<dt>').text(label), $('<dd>').append(value));

      add('UUID', $('<code class="small">').text(v.uuid));
      add('Version', v.version);
      add('Status', isEpgd ? $('<span>').append($('<span>').toggleClass('state-wait', es.long).toggleClass('state-ok', v.state === 'standby').text(es.text),
         es.wait ? $('<div class="small state-wait">').text(es.wait) : null)
         : $('<span>').toggleClass('state-ok', v.state === 'attached').text(st.text + (v.state && v.state !== 'attached' ? ' (' + v.state + ')' : '')));
      add('Master', v.master === 'Y' ? 'ja' : v.master === 'n' ? 'nein' : null);
      add('Aktiv', v.lastupdate ? $('<span>').attr('title', formatDateTime(v.lastupdate)).text(agoText(v.lastupdate)) : null);
      add('IP', v.ip);
      add('MAC', v.mac);
      add('SVDRP-Port', v.svdrp);
      add('osd2web-Port', isEpgd ? null : v.osd2webp > 0 ? $('<a target="_blank" rel="noopener">').attr('href', 'http://' + v.ip + ':' + v.osd2webp).text(v.osd2webp)
         : $('<span class="dim">').text('<unknown>'));
      add('PID', v.pid);
      add('DB-API', v.dbapi);
      add('Tuner', v.tunercount);
      add('Im Web freigegeben', isEpgd ? null : v.shareinweb ? 'ja' : 'nein');
      add('Gemeinsame Aufnahmen', isEpgd ? null : v.usecommonrecfolder ? 'ja' : 'nein');
      add('Videoverzeichnis', v.videodir);

      if (v.videototal) {
         const used = v.videototal - (v.videofree || 0);
         add('Belegung', $('<div class="vdr-disk">').append(
            $('<div class="progress">').append($('<div>').css('width', Math.round(used * 100 / v.videototal) + '%')),
            $('<span class="dim small">').text(sizeText(used) + ' von ' + sizeText(v.videototal) + ', frei ' + sizeText(v.videofree || 0))));
      }

      return $('<section class="card settings-card vdr-card">').toggleClass('attached', v.state === 'attached').toggleClass('epgd-card', isEpgd).append(
         $('<h3 class="vdr-head">').append(icon(isEpgd ? 'disk' : 'tv'), $('<span>').text(v.name || v.uuid),
            $('<span class="badge vdr-state">').text(isEpgd ? 'epgd' : v.state || '?')),
         $('<dl class="kv">').append(kv),
         isEpgd ? $('<div class="btn-row">').append(
            $('<button type="button" class="btn">').attr('title', 'Startet jetzt den EPG-Update-Lauf (Download bei den Providern, Abgleich, ...), sonst automatisch alle UpdateTime Stunden.\nNur im Zustand standby möglich.')
               .prop('disabled', v.state !== 'standby').append(icon('refresh'), $('<span>').text('EPG-Update starten'))
               .on('click', () => updateEpg())) :
         $('<div class="btn-row">').append(
            remoteButton(v, ''),
            startButton(v, st, 'btn-ok'),
            $('<span class="dl-spacer">'),
            $('<button type="button" class="btn btn-danger">').append(icon('trash'), $('<span>').text(tr.del)).on('click', () => remove(v))));
   }

   async function updateEpg() {
      try {
         const res = await busy(get('data/updateepg'));
         if (res.result && res.result.state != 200) throw new Error(res.result.message);
         toast('EPG-Update gestartet, das dauert einige Minuten');
         watchUntil = Date.now() + 30000;      // the epgd needs some seconds to report busy
         schedule({ state: 'busy' });
      }
      catch (e) { toastError(e); }
   }

   async function remove(v) {
      const warn = v.state === 'attached' ? '\nDer VDR ist verbunden und trägt sich wieder ein!' : '';

      if (!await confirmBox(tr.confirmDelete + ' (VDR ' + v.name + ', ' + v.ip + ')' + warn))
         return;

      try {
         const res = await busy(post('data/delete-vdrs', { delete: [v.uuid] }));
         toast(res.result?.message || tr.dataDeleted);
         await loadVdrs().catch(() => {});      // VDR selection of the top bar
         load();
      }
      catch (e) { toastError(e); }
   }

   load();

   return () => {
      stopped = true;
      clearTimeout(pollTimer);
   };
}

// ---------------------------------------------------------------------------
// system: login requirement + epgd backend parameters (generic by type)

const ptNum = 0, ptTime = 1, ptBool = 2, ptAscii = 3, ptBitMask = 4;

// parameters sharing one help text

const helpAlias = {
   recCompleteMinPctVps: 'recCompleteMinPct',
   logoSuffix: 'logo', logoById: 'logo', logoUpperCase: 'logo', logoShowName: 'logo'
};

// what a valid value of the parameter looks like

function formatHint(p) {
   return trp.system.paramFormats?.[p.name] || 'Format: ' + p.valexp;
}

function systemTab($body) {
   (async () => {
      let params;

      try { params = await loadParameters(); }
      catch (e) { return toastError(e); }

      const controls = [];
      const needLogin = params.find((p) => p.name === 'needLogin');
      const nl = checkbox(tr.pages.login.needLogin, needLogin?.value == 1);

      nl.$cb.on('change', async function () {
         if (!this.checked)
            return;

         // only allow if there is an active user (else one would lock oneself out)

         try {
            const data = await get('data/users');
            if (!Object.values(data.users || {}).some((u) => u.active == 1)) {
               this.checked = false;
               toast('Zuerst einen aktiven Benutzer anlegen (Tab „Benutzer“).', { error: true });
            }
         }
         catch (e) { this.checked = false; toastError(e); }
      });

      if (needLogin)
         controls.push({ p: needLogin, get: () => nl.$cb.prop('checked') ? '1' : '0' });

      const $table = $('<div class="sys-params">');

      // order and titles from the language file, unknown parameters at the end (by name)

      const titles = trp.system.params || {};
      const order = Object.keys(titles);
      const rank = (p) => { const i = order.indexOf(p.name); return i < 0 ? order.length : i; };

      for (const p of params.filter((x) => x.owner === 'epgd').sort((a, b) => (rank(a) - rank(b)) || a.name.localeCompare(b.name))) {
         const v = p.value ?? p.default ?? '';
         let $ctl;

         if (p.type === ptTime || p.readonly)
            $ctl = $('<span class="field-value">').text(p.type === ptTime && +v ? formatDateTime(+v) : v);
         else if (p.type === ptBool) {
            const cb = checkbox('', v == 1);
            $ctl = cb.$el;
            controls.push({ p, get: () => cb.$cb.prop('checked') ? '1' : '0' });
         }
         else if (p.type === ptBitMask) {
            const set = String(v).split(',');
            const cbs = (p.options || []).map((o) => ({ o, cb: checkbox(o, set.includes(o)) }));
            $ctl = $('<div class="check-row">').append(cbs.map((x) => x.cb.$el));
            controls.push({ p, get: () => cbs.filter((x) => x.cb.$cb.prop('checked')).map((x) => x.o + ',').join(''), bitmask: true });
         }
         else if (p.options?.length) {
            // fixed values (e.g. the encoders available on the epgd host), labels from the language file,
            //   a stored value which isn't possible (any more) is kept and marked

            const labels = trp.system.paramOptions?.[p.name] || {};
            const label = (o) => typeof labels === 'function' ? labels(o, p.options) : labels[o] ?? o;
            const opts = p.options.map((o) => ({ value: o, label: label(o) }));

            if (!p.options.includes(String(v)))
               opts.push({ value: String(v), label: label(String(v)) + ' (nicht verfügbar)' });

            const $sel = select(opts, v);
            $ctl = $sel;
            controls.push({ p, get: () => $sel.val(), $in: $sel });
         }
         else {
            const $in = $('<input class="input">').val(v).attr('placeholder', p.default || '');
            if (p.type === ptNum) $in.addClass('input-num').attr('inputmode', 'numeric');
            $ctl = $in;
            controls.push({ p, get: () => $in.val(), $in });

            // check while typing, an invalid value is marked with a hint to the format

            if (p.valexp) {
               const re = new RegExp(p.valexp);
               const $hint = $('<div class="field-error">').text(formatHint(p)).hide();
               const check = () => {
                  const ok = re.test($in.val());
                  $in.toggleClass('invalid', !ok).attr('aria-invalid', ok ? null : 'true');
                  $hint.toggle(!ok);
               };

               $in.on('input', check);
               $ctl = $('<div class="field-check">').append($in, $hint);
               check();
            }
         }

         const topic = 'p_' + (helpAlias[p.name] || p.name);

         $table.append($('<div class="sys-row">').append(withHelp($('<label class="sys-name">').append($('<span>').text(titles[p.name] || p.name))
            .attr('title', p.name + (p.valexp ? ' – Format: ' + p.valexp : '')), topic), $ctl));
      }

      $body.append($('<div class="settings-grid settings-grid-1">').append(
         card(tr.pages.login.label, withHelp(nl.$el, 'p_needLogin')),
         card(trp.system.label, $table)),
         saveBar(async () => {
            const list = [];

            for (const c of controls) {
               const v = c.get();
               const old = c.p.value ?? c.p.default ?? '';
               const norm = (s) => c.bitmask ? String(s).split(',').filter(Boolean).sort().join(',') : String(s);

               if (norm(v) === norm(old))
                  continue;

               if (c.p.valexp && c.$in && !new RegExp(c.p.valexp).test(v)) {
                  c.$in.trigger('focus');
                  return toast('Ungültiger Wert bei „' + (titles[c.p.name] || c.p.name) + '“: ' + formatHint(c.p), { error: true });
               }

               list.push({ name: c.p.name, value: v, owner: c.p.owner });
            }

            if (await saveParameters(list, (p) => titles[p.name] || p.name)) {
               list.forEach((x) => { const p = params.find((q) => q.name === x.name && q.owner === x.owner); if (p) p.value = x.value; });

               if (list.some((x) => x.name === 'needLogin'))
                  setTimeout(() => location.reload(), 800);
            }
         }));
   })();
}
