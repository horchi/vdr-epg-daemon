// Page "Aufnahmen" – folder browser with breadcrumb, search across all folders,
// detail / play / rename+move / delete
//
//   VDR path: 'Krimi/Tatort/Murot_und_das_Paradies/2016-08-21.11.18.59-0.rec'
//      folders = all segments but the last two, name = second last, file = last

import { state, hasRight, rights } from '../state.js';
import { get, mediaUrl, qs, fallbackImg } from '../api.js';
import { busy, toast, toastError, dialog, confirmBox, stickyBar } from '../ui.js';
import { formatDate, formatTime, formatDateTime, sizeText } from '../utils.js';
import { icon, iconButton } from '../icons.js';
import { field } from '../forms.js';
import { showRecording, closeDetail } from '../eventDetail.js';
import { playRecording } from '../player.js';
import tr from '../../lang/de.js';

const trr = tr.pages.records;

// VDR encodes special chars in file names: '_' = blank, '#XX' = hex char

export const decodeName = (s) => (s || '').replace(/_/g, ' ')
   .replace(/#([0-9A-Fa-f]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));

// name -> file system (as VDR does it), used to predict the new path after a rename

const encodeName = (s) => s.replace(/[#:\\?*"<>|]/g, (c) => '#' + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).replace(/ /g, '_');
const cleanName = (s) => s.replace(/[~/]/g, '-').trim();

const sorts = {
   dateDesc:  { label: 'Neueste zuerst', rec: (a, b) => b.starttime - a.starttime, folder: (a, b) => b.newest - a.newest },
   dateAsc:   { label: 'Älteste zuerst', rec: (a, b) => a.starttime - b.starttime, folder: (a, b) => a.newest - b.newest },
   titleAsc:  { label: 'Titel A–Z', rec: (a, b) => a.sortTitle.localeCompare(b.sortTitle, 'de') || a.starttime - b.starttime, folder: (a, b) => a.name.localeCompare(b.name, 'de') },
   titleDesc: { label: 'Titel Z–A', rec: (a, b) => b.sortTitle.localeCompare(a.sortTitle, 'de') || a.starttime - b.starttime, folder: (a, b) => b.name.localeCompare(a.name, 'de') }
};

// profile.recordSubFolderSort: 1/2 title asc/desc, 3/4 path, 5/6 start asc/desc

const profileSort = () => ({ 1: 'titleAsc', 2: 'titleDesc', 3: 'titleAsc', 4: 'titleDesc', 5: 'dateAsc', 6: 'dateDesc' }[state.profile.recordSubFolderSort] || 'dateDesc');

let pg = null;        // page state

export function render($content, params = {}) {
   pg ??= { recs: null, sort: null, select: false, selected: new Set(), query: '', doubles: false, dbl: null };
   pg.sort ??= loadPref('recSort') || profileSort();
   pg.path = params.p ? params.p.split('/').filter(Boolean) : [];

   const $search = $('<input type="search" class="input rec-search" placeholder="Aufnahmen durchsuchen …">').val(pg.query)
      .on('input', function () { pg.query = this.value; renderList(); });

   const $sort = $('<select class="input rec-sort">').attr('title', 'Sortierung')
      .append(Object.entries(sorts).map(([k, s]) => $('<option>').val(k).text(s.label))).val(pg.sort)
      .on('change', function () { pg.sort = this.value; savePref('recSort', this.value); renderList(); });

   const canEdit = hasRight(rights.recordingsEdit);

   const $bar = $('<div class="toolbar rec-toolbar">').append(
      $search, $sort,
      canEdit ? $('<button type="button" class="btn rec-select-btn">').attr('title', 'Auswählen').append(icon('select'), $('<span>').text('Auswählen'))
         .toggleClass('active', pg.select)
         .on('click', function () { pg.select = !pg.select; pg.selected.clear(); $(this).toggleClass('active', pg.select); renderList(); }) : null,
      $('<button type="button" class="btn rec-dbl-btn">').attr('title', 'Doppelte Aufnahmen (gleicher Titel und Untertitel)')
         .append(icon('copy'), $('<span>').text('Doppelte'))
         .toggleClass('active', pg.doubles)
         .on('click', function () {
            pg.doubles = !pg.doubles;
            pg.selected.clear();
            $(this).toggleClass('active', pg.doubles);
            pg.doubles && pg.recs ? loadDoubles() : renderList();
         }),
      $('<button type="button" class="btn">').attr('title', tr.reload).append(icon('refresh'), $('<span>').text(tr.reload)).on('click', refreshFromVdr));

   pg.$page = $('<section class="page page-records">').append(
      renderDisks(), stickyBar($bar), $('<nav class="crumbs">'), $('<div class="rec-selbar">'), $('<div class="rec-list">'));

   $content.empty().append(pg.$page);

   const loaded = pg.recs ? (renderList(), updateDiskTimes(), Promise.resolve()) : load();

   if (pg.doubles)
      loaded.then(loadDoubles);
}

export function destroy() {
   if (pg)
      pg.$page = null;
}

// ---------------------------------------------------------------------------
// data

async function load() {
   try {
      const data = await busy(get('data/recordings'));
      pg.recs = (data.recordings || []).map(prepare);
      buildTree();
      pg.$page && renderList();
      pg.$page && updateDiskTimes();
   }
   catch (e) {
      toastError(e);
   }
}

// duplicate recordings – same title and short text, selected by the epghttpd like the
//   epg2vdr menu 'Duplicate recordings' (ordered by title, short text, start time)

async function loadDoubles() {
   try {
      const data = await busy(get('data/recordings?doubles=1'));
      const byKey = new Map((pg.recs || []).map((r) => [r.key, r]));

      pg.dbl = (data.recordings || []).map((d) => { const r = prepare(d); return byKey.get(r.key) || r; });
   }
   catch (e) {
      toastError(e);
      pg.dbl = [];
   }

   renderList();
}

// groups of the (still) duplicate recordings, compared case insensitive like the database does,
//   a recording listed by several VDRs counts once

function doubleGroups() {
   const groups = [];
   let last = null, md5s = null;

   for (const r of pg.dbl || []) {
      const k = (r.title || '').toLowerCase() + '\n' + (r.shorttext || '').toLowerCase();

      if (k !== last) {
         groups.push([]);
         last = k;
         md5s = new Set();
      }

      if (!md5s.has(r.md5path)) {
         md5s.add(r.md5path);
         groups[groups.length - 1].push(r);
      }
   }

   return groups.filter((g) => g.length > 1);
}

function renderDoubles($list, words) {
   let groups = doubleGroups();

   if (words)
      groups = groups.filter((g) => g.some((r) => words.every((w) => r.search.includes(w))));

   pg.visible = groups.flat();

   if (!pg.dbl)
      return;

   if (!groups.length) {
      $list.append($('<p class="empty">').text(words ? tr.pages.search.empty : 'Keine doppelten Aufnahmen gefunden.'));
      return;
   }

   $list.append($('<p class="dim rec-info">').text(groups.length + (groups.length === 1 ? ' Gruppe' : ' Gruppen') + ' · ' + pg.visible.length + ' Aufnahmen'));

   for (const g of groups) {
      $list.append(
         $('<h3 class="dbl-head">').append($('<span>').text(g[0].title + (g[0].shorttext ? ' – ' + g[0].shorttext : '')),
            $('<span class="dim">').text(g.length)),
         $('<ul class="rec-rows">').append(g.map((r) => recRow(r, true))));
   }
}

function prepare(r) {
   const segs = (r.path || '').split('/');
   segs.pop();                                   // xxx.rec
   const name = decodeName(segs.pop() || r.name || '');
   const folders = segs.map(decodeName);
   const vdr = state.vdrs[r.vdruuid];

   // VDRs without common recording folder get their own root folder

   if (vdr && !vdr.usecommonrecfolder && Object.values(state.vdrs).some((v) => v.usecommonrecfolder))
      folders.unshift('VDR – ' + vdr.name);

   r.folders = folders;
   r.folderPath = folders.join('/');
   r.displayName = name;
   r.title ||= name;
   r.sortTitle = (r.title + ' ' + (r.shorttext || '')).toLowerCase();
   r.key = r.starttime + '/' + r.md5path + '/' + (r.owner || '');
   r.search = [name, r.title, r.shorttext, r.folderPath].join(' ').toLowerCase();
   return r;
}

function buildTree() {
   const root = { name: '', folders: new Map(), recs: [], count: 0, newest: 0, duration: 0 };

   for (const r of pg.recs) {
      let node = root;
      node.count++; node.newest = Math.max(node.newest, r.starttime); node.duration += r.duration || 0;

      for (const f of r.folders) {
         if (!node.folders.has(f))
            node.folders.set(f, { name: f, folders: new Map(), recs: [], count: 0, newest: 0, duration: 0 });
         node = node.folders.get(f);
         node.count++; node.newest = Math.max(node.newest, r.starttime); node.duration += r.duration || 0;
      }

      node.recs.push(r);
   }

   pg.tree = root;
}

function nodeAt(path) {
   let node = pg.tree;

   for (const f of path) {
      node = node?.folders.get(f);
      if (!node) return null;
   }

   return node;
}

// ---------------------------------------------------------------------------
// render

function renderDisks() {
   const $d = $('<div class="disks">');
   const disks = new Map();           // VDRs sharing one video directory are shown once

   for (const v of Object.values(state.vdrs)) {
      if (!v.videototal)
         continue;

      const key = (v.videodir || v.uuid) + '/' + v.videototal;
      disks.has(key) ? disks.get(key).names.push(v.name) : disks.set(key, { ...v, names: [v.name] });
   }

   for (const v of disks.values()) {
      const used = 100 - v.videofree / v.videototal * 100;

      $('<div class="disk">').attr('title', v.names.join(', ') + ': ' + (v.videodir || '')).data('free', v.videofree).append(
         $('<div class="disk-head">').append(icon('disk'), $('<b>').text(v.names.join(', ')),
            $('<span class="dim">').append(sizeText(v.videofree) + ' frei', $('<span class="disk-total">').text(' / ' + sizeText(v.videototal)))),
         $('<div class="progress disk-bar">').toggleClass('full', used > 90).append($('<div>').css('width', used + '%')),
         $('<div class="disk-time dim">'))
         .appendTo($d);
   }

   return $d;
}

// remaining recording time (HH:MM) of the free space, like VDR from the space used by
//   the recordings and their length (MB per minute); VDRs sharing one disk (same size)
//   are counted once (the one with the latest update), unknown -> VDR's default of 25.75 MB/min

function mbPerMinute() {
   const disks = new Map();

   for (const v of Object.values(state.vdrs)) {
      if (!v.videototal)
         continue;

      const key = Math.round(v.videototal / 1000);
      const d = disks.get(key);

      if (!d || (v.lastupdate || 0) > (d.lastupdate || 0))
         disks.set(key, v);
   }

   const usedMb = [...disks.values()].reduce((s, v) => s + v.videototal - (v.videofree || 0), 0);
   const minutes = (pg.recs || []).reduce((s, r) => s + (r.duration || 0), 0) / 60;
   const mbpm = minutes > 0 ? usedMb / minutes : 0;

   return mbpm >= 5 && mbpm <= 500 ? mbpm : 25.75;
}

function updateDiskTimes() {
   if (!pg.$page || !pg.recs)
      return;

   const mbpm = mbPerMinute();

   pg.$page.find('.disk').each((i, el) => {
      const min = Math.floor(($(el).data('free') || 0) / mbpm);
      $(el).find('.disk-time').text('ca. ' + Math.floor(min / 60) + ':' + String(min % 60).padStart(2, '0') + ' h Aufnahmezeit')
         .attr('title', 'verbleibende Aufnahmezeit, geschätzt mit ' + Math.round(mbpm) + ' MB pro Minute');
   });
}

function hashFor(path) {
   return '#records' + (path.length ? '?p=' + encodeURIComponent(path.join('/')) : '');
}

function renderCrumbs(searching) {
   const $c = pg.$page.find('.crumbs').empty();

   $('<a>').attr('href', hashFor([])).append(icon('home'), $('<span>').text(tr.menu.records)).appendTo($c);

   if (pg.doubles || searching) {
      $c.append(icon('chevron', 'crumb-sep'), $('<span>').text(pg.doubles ? 'Doppelte Aufnahmen' : 'Suche'));
      return;
   }

   pg.path.forEach((f, i) => {
      $c.append(icon('chevron', 'crumb-sep'));
      i === pg.path.length - 1
         ? $c.append($('<span>').text(f))
         : $c.append($('<a>').attr('href', hashFor(pg.path.slice(0, i + 1))).text(f));
   });
}

function renderList() {
   if (!pg.$page || !pg.tree)
      return;

   const q = pg.query.trim().toLowerCase();
   const searching = q.length >= 2;
   const $list = pg.$page.find('.rec-list').empty();
   const s = sorts[pg.sort];

   renderCrumbs(searching);
   renderSelBar();

   if (pg.doubles)
      return renderDoubles($list, searching ? q.split(/\s+/) : null);

   let recs, folders = [];

   if (searching) {
      const words = q.split(/\s+/);
      recs = pg.recs.filter((r) => words.every((w) => r.search.includes(w)));
      $list.append($('<p class="dim rec-info">').text(recs.length + ' Treffer'));
   }
   else {
      const node = nodeAt(pg.path);

      if (!node) {
         location.hash = hashFor([]);
         return;
      }

      folders = [...node.folders.values()].sort(s.folder);
      recs = node.recs;
   }

   recs = recs.slice().sort(s.rec);
   pg.visible = recs;

   if (folders.length)
      $list.append($('<div class="folder-grid">').append(folders.map(folderCard)));

   if (recs.length)
      $list.append($('<ul class="rec-rows">').append(recs.map((r) => recRow(r, searching))));

   if (!folders.length && !recs.length)
      $list.append($('<p class="empty">').text(searching ? tr.pages.search.empty : tr.error.noData));
}

function folderCard(f) {
   return $('<a class="folder-card">').attr('href', hashFor([...pg.path, f.name])).append(
      $('<div class="folder-icon">').html(icon('folder')),
      $('<div class="folder-text">').append(
         $('<b>').text(f.name),
         $('<span class="dim">').text(f.count + (f.count === 1 ? ' Aufnahme' : ' Aufnahmen') + ' · zuletzt ' + formatDate(f.newest, 'numeric'))));
}

function recRow(r, showPath) {
   const p = state.profile;
   const size = { maxW: 160, maxH: 90 };

   // EPG image of the recording, else fanart / poster of the scraper

   const imgs = [
      r.imgid && mediaUrl(p.eventImgPath, { no: 0, imgid: r.imgid, ...size }),
      r.scrmovieid && mediaUrl(p.movieMediaPath, { actor_id: 0, movie_id: r.scrmovieid, media_type: 1, ...size }),
      r.scrmovieid && mediaUrl(p.movieMediaPath, { actor_id: 0, movie_id: r.scrmovieid, media_type: 0, ...size }),
      r.scrseriesid && mediaUrl(p.serieImgPath, { actor_id: 0, series_id: r.scrseriesid, season_number: 0, episode_id: 0, media_type: 1, lfn: 0, ...size }),
      r.scrseriesid && mediaUrl(p.serieImgPath, { actor_id: 0, series_id: r.scrseriesid, season_number: 0, episode_id: 0, media_type: 2, lfn: 0, ...size })];
   const lastFolder = r.folders[r.folders.length - 1];
   const [sub, sub2] = [r.title, r.shorttext].filter((x) => x && x !== r.displayName && x !== lastFolder);

   const $li = $('<li class="rec-row" tabindex="0">').attr('data-key', r.key)
      .toggleClass('pending', !!r.pending)
      .toggleClass('selected', pg.selected.has(r.key))
      .append(
         pg.select ? $('<input type="checkbox" class="rec-check">').prop('checked', pg.selected.has(r.key)) : null,
         $('<div class="rec-thumb">').append(fallbackImg(imgs, { loading: 'lazy' }, $(icon('film'))) || icon('film')),
         $('<div class="rec-main">').append(
            $('<div class="rec-title">').text(r.displayName),
            sub ? $('<div class="rec-sub">').text(sub) : null,
            sub2 ? $('<div class="rec-sub dim">').text(sub2) : null,
            showPath && r.folderPath ? $('<div class="rec-path dim">').append(icon('folder'), $('<span>').text(r.folderPath)) : null),
         $('<div class="rec-meta">').append(
            $('<div>').text(formatDate(r.starttime, 'medium')),
            $('<div class="dim">').text(formatTime(r.starttime) + ' · ' + Math.round((r.duration || 0) / 60) + ' ' + tr.minutes)),
         !pg.select && hasRight(rights.recordings)
            ? iconButton('film', 'Im Browser abspielen').addClass('btn-flat rec-play').on('click', (ev) => {
               ev.stopPropagation();
               if (!r.pending)
                  playRecording(r);
            }) : null);

   $li.on('click', (ev) => {
      if (r.pending)
         return;

      if (pg.select) {
         if (ev.target.nodeName !== 'INPUT')
            $li.find('.rec-check').prop('checked', (i, v) => !v);
         toggleSelect(r, $li.find('.rec-check').prop('checked'), $li);
         return;
      }

      openDetail(r);
   }).on('keydown', (ev) => { if (ev.key === 'Enter') $li.trigger('click'); });

   return $li;
}

// ---------------------------------------------------------------------------
// selection

function toggleSelect(r, on, $li) {
   on ? pg.selected.add(r.key) : pg.selected.delete(r.key);
   $li.toggleClass('selected', on);
   renderSelBar();
}

function renderSelBar() {
   const $b = pg.$page.find('.rec-selbar').empty().toggle(pg.select);

   if (!pg.select)
      return;

   const sel = pg.recs.filter((r) => pg.selected.has(r.key));

   $b.append(
      $('<span>').text(sel.length + ' ausgewählt'),
      $('<button type="button" class="btn btn-sm">').text('Alle').on('click', () => {
         pg.visible.forEach((r) => pg.selected.add(r.key));
         renderList();
      }),
      $('<button type="button" class="btn btn-sm">').text('Keine').on('click', () => { pg.selected.clear(); renderList(); }),
      $('<span class="dl-spacer">'),
      $('<button type="button" class="btn btn-sm">').prop('disabled', !sel.length).append(icon('folder'), $('<span>').text('Verschieben'))
         .on('click', () => moveDialog(sel)),
      $('<button type="button" class="btn btn-sm btn-danger">').prop('disabled', !sel.length).append(icon('trash'), $('<span>').text(tr.del))
         .on('click', () => removeRecs(sel)));
}

// ---------------------------------------------------------------------------
// detail

function openDetail(r) {
   const list = pg.visible || [];
   const i = list.indexOf(r);
   const canEdit = hasRight(rights.recordingsEdit);

   return showRecording(r, {
      prevRec: i > 0 ? list[i - 1] : null,
      nextRec: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
      prev: i > 0 ? () => openDetail(list[i - 1]) : null,
      next: i >= 0 && i < list.length - 1 ? () => openDetail(list[i + 1]) : null,
      rename: canEdit ? () => renameDialog(r) : null,
      remove: canEdit ? async () => { if (await removeRecs([r])) closeDetail(); } : null
   });
}

// ---------------------------------------------------------------------------
// delete

async function removeRecs(recs) {
   if (!recs.length)
      return false;

   const msg = recs.length === 1 ? trr.deleteMessage.replace('$src$', '„' + recs[0].displayName + '“')
      : tr.confirmDelete + ' (' + recs.length + tr.entries + ')';

   if (!await confirmBox(msg))
      return false;

   let ok = 0;

   for (const r of recs) {
      try {
         const res = await busy(get('data/deleterecording?' + new URLSearchParams({ starttime: r.starttime, md5path: r.md5path, owner: r.owner || '' })));

         if (res.result && res.result.state != 200)
            throw new Error(res.result.message);

         pg.recs = pg.recs.filter((x) => x !== r);
         pg.dbl = pg.dbl?.filter((x) => x !== r) ?? null;
         pg.selected.delete(r.key);
         ok++;
      }
      catch (e) {
         toast(r.displayName + ': ' + e.message, { error: true });
      }
   }

   if (ok) {
      toast(ok + (ok === 1 ? ' Aufnahme' : ' Aufnahmen') + ' gelöscht');
      buildTree();
      renderList();
   }

   return ok > 0;
}

// ---------------------------------------------------------------------------
// rename / move – VDR expects the new name relative to the video dir with '~' as separator

function allFolderPaths() {
   const paths = new Set();
   for (const r of pg.recs)
      for (let i = 1; i <= r.folders.length; i++)
         paths.add(r.folders.slice(0, i).join('/'));
   return [...paths].filter((p) => !p.startsWith('VDR – ')).sort();
}

function folderDatalist(id) {
   return $('<datalist>').attr('id', id).append(allFolderPaths().map((p) => $('<option>').val(p)));
}

function renameDialog(r) {
   const $folder = $('<input class="input" list="rec-folders" autocomplete="off">').val(r.folderPath.replace(/^VDR – [^/]*\/?/, ''));
   const $name = $('<input class="input">').val(r.displayName);

   dialog({
      title: 'Umbenennen / Verschieben', cls: 'dlg-form',
      content: $('<form class="form">').append(
         $('<p class="dim">').text(r.title + (r.shorttext ? ' – ' + r.shorttext : '')),
         field(tr.pages.timerList.folder, $('<span class="input-wrap">').append($folder, folderDatalist('rec-folders'))),
         field(tr.pages.search.searchName, $name))
         .on('submit', (ev) => ev.preventDefault()),
      buttons: [
         { text: tr.cancel },
         { text: tr.save, primary: true, click: ($d) => {
            if (!$name.val().trim())
               return toast(tr.error.emptyField.replace('$field$', tr.pages.search.searchName), { error: true }) && false;

            moveRec(r, $folder.val(), $name.val().trim()).then((ok) => ok && $d[0].close());
            return false;
         } }]
   });
}

function moveDialog(recs) {
   const $folder = $('<input class="input" list="rec-folders" autocomplete="off">').val(pg.path.join('/'));

   dialog({
      title: recs.length + (recs.length === 1 ? ' Aufnahme' : ' Aufnahmen') + ' verschieben', cls: 'dlg-form',
      content: $('<form class="form">').append(
         field('Zielordner', $('<span class="input-wrap">').append($folder, folderDatalist('rec-folders'))),
         $('<p class="dim small">').text('Leer lassen für die oberste Ebene. Unterordner mit „/“ trennen, neue Ordner werden angelegt.'))
         .on('submit', (ev) => ev.preventDefault()),
      buttons: [
         { text: tr.cancel },
         { text: 'Verschieben', primary: true, click: ($d) => {
            (async () => {
               let ok = 0;
               for (const r of recs)
                  ok += await moveRec(r, $folder.val(), r.displayName, true) ? 1 : 0;
               if (ok) toast(ok + ' verschoben');
               pg.selected.clear();
               $d[0].close();
            })();
            return false;
         } }]
   });
}

async function moveRec(r, folder, name, quiet = false) {
   // VDR name: folders separated by '~', plain characters (VDR does the file system encoding)

   const parts = [...folder.split('/').map(cleanName).filter(Boolean), cleanName(name)];
   const vdrName = parts.join('~');

   try {
      const res = await busy(get('data/renamerecording?' + qs({ starttime: r.starttime, md5path: r.md5path, owner: r.owner || '', name: vdrName })));

      if (res.result && res.result.state != 200)
         throw new Error(res.result.message);

      // update locally, the md5 of the new path is known after the VDR renamed it

      const file = r.path.split('/').pop();
      r.path = parts.map(encodeName).join('/') + '/' + file;
      r.pending = true;
      prepare(r);
      buildTree();
      renderList();
      quiet || toast(tr.dataSaved);
      closeDetail();
      refreshMd5(r, 0);
      return true;
   }
   catch (e) {
      toast(r.displayName + ': ' + e.message, { error: true });
      return false;
   }
}

function refreshMd5(r, cnt) {
   setTimeout(async () => {
      try {
         const data = await get('data/recording?' + new URLSearchParams({ starttime: r.starttime, path: r.path, owner: r.owner || '' }));
         if (!data.recording?.md5path) throw new Error();
         r.md5path = data.recording.md5path;
         r.pending = false;
         prepare(r);
         pg.$page?.find('.rec-row[data-key]').filter((i, el) => el.dataset.key.startsWith(r.starttime + '/')).removeClass('pending');
         buildTree();
      }
      catch (e) {
         cnt < 5 ? refreshMd5(r, cnt + 1) : toast(trr.notFoundMessage, { error: true });
      }
   }, 3000);
}

// ---------------------------------------------------------------------------
// reload: ask the VDRs to update the recording list, then reload

async function refreshFromVdr() {
   try {
      await busy(get('data/updaterecordings'));
      toast(trr.refreshMessage.replace('$sec$', 5), { timeout: 5000 });
      setTimeout(async () => { pg.recs = null; pg.$page && await load(); pg.$page && pg.doubles && loadDoubles(); }, 5000);
   }
   catch (e) { toastError(e); }
}

// ---------------------------------------------------------------------------

function loadPref(k) { try { return localStorage.getItem('epgd.' + k); } catch (e) { return null; } }
function savePref(k, v) { try { localStorage.setItem('epgd.' + k, v); } catch (e) { } }
