// Page "Einstellungen" – tabs: profile, channels, users, system (epgd backend)

import { state, hasRight, rights } from '../state.js';
import { get, post } from '../api.js';
import { busy, toast, toastError, dialog, confirmBox } from '../ui.js';
import { formatDateTime } from '../utils.js';
import { icon } from '../icons.js';
import { field, checkbox, select } from '../forms.js';
import { loadProfile, loadChannels } from '../data.js';
import { md5 } from '../lib/md5.js';
import { getTheme, setTheme, accents } from '../theme.js';
import tr from '../../lang/de.js';

const trp = tr.pages.profile;
const trt = tr.pages.timerList;
const tre = tr.pages.eventDetail;

const tabs = {
   profile:  { label: 'Profil', build: profileTab },
   channels: { label: tr.pages.options.editChannels.replace(' bearbeiten', ''), right: rights.configEdit, build: channelsTab },
   users:    { label: tr.pages.editUser.user, right: rights.configUsers, build: usersTab },
   system:   { label: 'System', right: rights.configEdit, build: systemTab }
};

let cleanup = null;

export function render($content, params = {}) {
   destroy();

   const avail = Object.keys(tabs).filter((k) => !tabs[k].right || hasRight(tabs[k].right));
   const id = avail.includes(params.tab) ? params.tab : avail[0];
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

      // start page: keys known by the old and the new UI

      const startPages = ['now', 'magazine', 'timerList', 'records', 'search'].map((k) =>
         ({ value: 'menu_' + k, label: k === 'timerList' ? tr.menu.timer : tr.menu[k] }));

      const $start = select(startPages, val('startPage') || 'menu_now');
      const $defVdr = select([{ value: '', label: '(erster VDR)' }, ...vdrOpts(false)], val('defaultVDRuuid'));
      const $firstDay = select(tr.dateTimePicker.dayNames, val('pickerFirstDay') || 1);
      const $quick = $('<textarea class="input" rows="5">').val(String(val('quickTimes')).replace(/~/g, '\n'));
      const $maxList = $('<input type="number" class="input input-num" min="1" max="999">').val(val('maxListEntries'));
      const $constabel = $('<input class="input" placeholder="https://www.eplists.de/eplist.cgi?action=login&login=…&secret=…">').val(val('constabelLoginPath'));

      controls.startPage = () => $start.val();
      controls.defaultVDRuuid = () => $defVdr.val() || '';
      controls.pickerFirstDay = () => String($firstDay.val());
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
         return field(label, $('<div class="stack">').append($mode, $tpl));
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
         startPage: 'Startseite', quickTimes: 'Schnellzeiten', maxListEntries: 'Max. Einträge',
         mailReceiver: trp.mailReceiver, chFormat: trt.chFormat
      };

      $body.append($('<div class="settings-grid">').append(
         appearanceCard(),
         card('Oberfläche',
            field('Startseite', $start),
            field('Standard-VDR', $defVdr),
            field('Erster Wochentag', $firstDay),
            field('Schnellzeiten (eine pro Zeile)', $('<div class="stack">').append($quick,
               $('<p class="dim small">').text('Bezeichnung=hh:mm, z.B. Primetime=20:15 – mit „!“ (Primetime=!20:15) keine Linie im Magazin. '
                  + 'Jetzt=@Now, Danach=@Next, gespeicherte Suche=@Name'))),
            field(stripHtml(trp.maxListEntries), $maxList),
            field('Constabel-Login', $constabel)),
         card(tr.pages.timer.timerList,
            ...naming,
            $('<div class="row">').append(field(trt.chFormat, $chFormat, 'grow'), field('VDR', $timerVdr, 'grow'))),
         card('Benachrichtigungen',
            field(trp.mailReceiver, $('<div class="row row-tight">').append($mail, $mailTest)),
            field(trp.sendMessages, $('<div class="check-row">').append(mailTypes.map((m) => m.cb.$el)))),
         card('Suche, Aufnahmen & VDR',
            searchAdv.$el,
            field(trp.record.subFolderSort, $recSort),
            sched.$el, notify.$el)),
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
// channels: order (drag), visibility, names; reference list (channels.conf) to take names / order from

function channelsTab($body) {
   const trc = tr.pages.editChannels;
   let rows = state.channelOrder.map((id) => {
      const c = state.channels[id];
      return { id, name: c.name || '', visible: c.visible ?? 1, sources: c.sources || {} };
   });
   let ref = null;           // reference list [{ id, name }]
   let dirty = false;

   const $filter = $('<input type="search" class="input" placeholder="Filter (Name oder ID) …">').on('input', renderList);
   const $count = $('<span class="dim">');
   const $list = $('<ol class="ch-list">');
   const $refBox = $('<div class="ch-ref">').hide();

   const $menu = $('<div class="seg seg-wrap">').append(
      $('<button type="button" class="btn">').append(icon('check'), $('<span>').text('Alle sichtbar')).on('click', () => setVisible(true)),
      $('<button type="button" class="btn">').append(icon('close'), $('<span>').text('Alle ausblenden')).on('click', () => setVisible(false)),
      $('<button type="button" class="btn">').append(icon('copy'), $('<span>').text(trc.menu.referenceList)).on('click', referenceDialog));

   $body.append(
      $('<p class="dim small">').text('Reihenfolge per Ziehen am Griff ändern (auch per Touch). Der Haken steuert die Anzeige im Web-Interface. Filter und Sichtbar-Aktionen wirken auf die gefilterten Kanäle.'),
      $('<div class="toolbar">').append($filter, $count, $menu),
      $('<div class="ch-layout">').append($list, $refBox),
      saveBar(save));

   function filtered() {
      const f = $filter.val().toLowerCase().trim();
      return f ? rows.filter((r) => r.name.toLowerCase().includes(f) || r.id.toLowerCase().includes(f)) : rows;
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

      for (const r of list) {
         const vis = checkbox('', r.visible & 1);
         vis.$cb.attr('title', trc.checkWeb).on('change', function () { r.visible = this.checked ? r.visible | 1 : r.visible & ~1; dirty = true; });

         $('<li class="ch-item">').data('row', r).toggleClass('hidden-ch', !(r.visible & 1)).append(
            $('<span class="ch-handle">').attr('title', sortable ? 'Ziehen zum Sortieren' : 'Sortieren nur ohne Filter').html(icon('menu')),
            vis.$el,
            $('<input class="input ch-name">').val(r.name).attr('placeholder', r.id).on('input', function () { r.name = this.value; dirty = true; }),
            $('<span class="ch-id dim">').text(r.id))
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

         if (el && el !== $item[0]) {
            const r = el.getBoundingClientRect();
            e.clientY < r.top + r.height / 2 ? $item.insertBefore(el) : $item.insertAfter(el);
         }
      }).on('pointerup.chdrag pointercancel.chdrag', () => {
         clearInterval(scroller);
         $(document).off('.chdrag');
         $item.removeClass('dragging');
         rows = $list.children().toArray().map((li) => $(li).data('row'));
         dirty = true;
      });
   });

   // reference list

   function referenceDialog() {
      const $text = $('<textarea class="input" rows="10" placeholder="channels.conf hier einfügen …">');
      const vdrButtons = Object.values(state.vdrs).map((v) =>
         $('<button type="button" class="btn">').append(icon('tv'), $('<span>').text(v.name)).on('click', async () => {
            try {
               const data = await busy(get('data/proxy?id=vdr&uuid=' + encodeURIComponent(v.uuid), { as: 'text' }));
               $text.val(data);
            }
            catch (e) { toastError(e); }
         }));

      dialog({
         title: trc.menu.referenceList, cls: 'dlg-form dlg-wide',
         content: $('<div class="form">').append(
            $('<p class="dim small">').text('Kanalliste (Format channels.conf) eines VDR laden oder einfügen. Danach lassen sich Namen und Reihenfolge übernehmen.'),
            vdrButtons.length ? field('Von VDR laden', $('<div class="btn-row">').append(vdrButtons)) : null,
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
            $('<button type="button" class="btn btn-sm">').text(trc.menu.extentEmptyChannelNames).on('click', () => applyNames(false)),
            $('<button type="button" class="btn btn-sm">').text(trc.menu.applyAllChannelNames).on('click', () => applyNames(true)),
            $('<button type="button" class="btn btn-sm">').text(trc.menu.applyChannelSort).on('click', applyOrder),
            $('<button type="button" class="btn btn-sm btn-flat">').html(icon('close')).attr('title', tr.close).on('click', () => { ref = null; $refBox.hide(); })),
         $('<ul class="ch-ref-list">').append(ref.map((c) =>
            $('<li>').toggleClass('dim', !known.has(c.id)).append($('<b>').text(c.name), ' ', $('<span class="dim small">').text(c.id)))));
   }

   function applyNames(all) {
      const names = new Map(ref.map((c) => [c.id, c.name]));
      let n = 0;

      rows.forEach((r) => {
         if (names.has(r.id) && (all || !r.name) && r.name !== names.get(r.id)) { r.name = names.get(r.id); n++; }
      });

      dirty = dirty || n > 0;
      toast(n + ' Namen übernommen');
      renderList();
   }

   function applyOrder() {
      const pos = new Map(ref.map((c, i) => [c.id, i]));
      rows = rows.map((r, i) => ({ r, i })).sort((a, b) =>
         (pos.has(a.r.id) ? pos.get(a.r.id) : 1e6 + a.i) - (pos.has(b.r.id) ? pos.get(b.r.id) : 1e6 + b.i)).map((x) => x.r);
      dirty = true;
      toast('Reihenfolge übernommen');
      renderList();
   }

   async function save() {
      const channels = {};

      rows.forEach((r, i) => {
         channels[r.id] = { name: r.name, visible: r.visible, order: i + 1, sources: r.sources };
      });

      try {
         const res = await busy(post('data/save-channels', { channels }));
         if (res.result && res.result.state != 200) throw new Error(res.result.message);
         toast(tr.dataSaved);
         dirty = false;
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
// system: login requirement + epgd backend parameters (generic by type)

const ptNum = 0, ptTime = 1, ptBool = 2, ptAscii = 3, ptBitMask = 4;

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

      for (const p of params.filter((x) => x.owner === 'epgd').sort((a, b) => a.name.localeCompare(b.name))) {
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
         else {
            const $in = $('<input class="input">').val(v).attr('placeholder', p.default || '');
            if (p.type === ptNum) $in.addClass('input-num').attr('inputmode', 'numeric');
            $ctl = $in;
            controls.push({ p, get: () => $in.val(), $in });
         }

         $table.append($('<div class="sys-row">').append($('<label class="sys-name">').text(p.name).attr('title', p.valexp ? 'Format: ' + p.valexp : ''), $ctl));
      }

      $body.append($('<div class="settings-grid settings-grid-1">').append(
         card(tr.pages.login.label, nl.$el),
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
                  return toast(tr.error.invalid + ': ' + c.p.name, { error: true });
               }

               list.push({ name: c.p.name, value: v, owner: c.p.owner });
            }

            if (await saveParameters(list)) {
               list.forEach((x) => { const p = params.find((q) => q.name === x.name && q.owner === x.owner); if (p) p.value = x.value; });

               if (list.some((x) => x.name === 'needLogin'))
                  setTimeout(() => location.reload(), 800);
            }
         }));
   })();
}
