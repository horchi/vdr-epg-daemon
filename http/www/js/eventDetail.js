// Event detail (modal) – data/event?id=... or data/event?channelid=...&time=...

import { state, hasRight, rights } from './state.js';
import { get, mediaUrl, fallbackImg } from './api.js';
import { busy, toast, toastError } from './ui.js';
import { formatTime, formatDate, formatDateTime, progressOf, textToHtml, pipeList, nowUnix } from './utils.js';
import { channelBadge, switchChannel, createSwitchTimer } from './data.js';
import { icon, iconButton } from './icons.js';
import { openTimerDialog, openSearchTimerDialog, searchEvents, renderResults } from './timerDialog.js';
import tr from '../lang/de.js';

const tre = tr.pages.eventDetail;

let $dlg = null;
let event = null;
let kind = 'event';            // 'event' | 'done' (done timer) | 'rec' (recording)
let ctx = {};                  // recording: { prev(), next(), rename(rec), remove(rec) }
let lastTab = 'overview';      // keep the selected tab while stepping through events
let repeats = false;           // show the 'Wiederholungen' tab (on demand via toolbar button)
let repeatsCache = null;       // { title, res } – avoid searching again while browsing the repeats

export async function showEvent(id) {
   repeats = false;
   return open('data/event?id=' + encodeURIComponent(id));
}

export async function showEventAt(channelId, time) {
   repeats = false;
   return open('data/event?' + new URLSearchParams({ channelid: channelId, time }));
}

// done timer (history) – shown like an event

export async function showDoneTimer(id) {
   repeats = false;
   try {
      const data = await busy(get('data/donetimer?id=' + encodeURIComponent(id)));
      const t = data.donetimer;

      if (!t)
         return toast(tr.error.noData, { error: true });

      if (t.state)
         t.cntlongdescription = tr.pages.timerList.doneStates[t.state] || t.state;

      t.episode = { lang: t.episodelang, season: t.episodeseason, part: t.episodepart };
      delete t.timerid;
      delete t.id;

      event = t;
      kind = 'done';
      ctx = {};
      render();
   }
   catch (e) {
      toastError(e);
   }
}

async function open(url) {
   try {
      const data = await busy(get(url));

      if (!data.event)
         return toast(tr.error.noData, { error: true });

      event = data.event;
      kind = 'event';
      ctx = {};
      render();
   }
   catch (e) {
      toastError(e);
   }
}

// recording – rec: row of data/recordings; opts: { prev, next, rename, remove } (functions or null)

export async function showRecording(rec, opts = {}) {
   repeats = false;
   try {
      const data = await busy(get('data/recording?' + new URLSearchParams({ starttime: rec.starttime, md5path: rec.md5path, owner: rec.owner || '' })));
      const r = data.recording;

      if (!r)
         return toast(tr.error.noData, { error: true });

      r.longdescription ||= r.description;
      r.episode = { lang: r.episodelang, partname: r.episodecomppartname };
      r.duration ||= rec.duration;
      r.path = rec.folderPath || r.path;            // readable folder for display
      r.vdruuid ||= rec.vdruuid;
      r.imgid = rec.imgid;                          // only set by data/recordings if the image exists
      delete r.id;
      delete r.timerid;

      event = r;
      kind = 'rec';
      ctx = { ...opts, rec };
      render();
   }
   catch (e) {
      toastError(e);
   }
}

export const closeDetail = () => $dlg?.[0].open && $dlg[0].close();

// ---------------------------------------------------------------------------
// dialog frame (created once)

function frame() {
   if ($dlg)
      return $dlg;

   $dlg = $('<dialog class="dlg dlg-event">').appendTo(document.body);

   // timer created / deleted -> refresh the record marker

   $(window).on('timers:changed', () => {
      if ($dlg[0].open && event?.id && kind === 'event')
         get('data/event?id=' + event.id).then((d) => { if (d.event?.id === event?.id) { event = d.event; render(); } }).catch(() => {});
   });

   const $tools = $('<header class="dlg-head ed-toolbar">').append(
      iconButton('record', tre.record).addClass('ed-record').on('click', doRecord),
      iconButton('tv', tre.ch_switch).addClass('ed-play').on('click', doPlay),
      iconButton('repeat', tre.repeat).addClass('ed-repeat').on('click', () => {
         repeats = true;
         repeatsCache = null;
         lastTab = 'repeats';
         render();
      }),
      $('<h2 class="ed-headline">'),
      iconButton('prev', tre.eventPrev).addClass('ed-prev').on('click', () => doStep(-1)),
      iconButton('next', tre.eventNext).addClass('ed-next').on('click', () => doStep(1)),
      iconButton('edit', 'Umbenennen / Verschieben').addClass('ed-rec-edit').on('click', () => ctx.rename?.(ctx.rec)),
      iconButton('trash', tr.del).addClass('ed-rec-del btn-danger').on('click', () => ctx.remove?.(ctx.rec)),
      iconButton('close', tr.close).on('click', () => $dlg[0].close()));

   $dlg.append($tools, $('<nav class="ed-tabs" role="tablist">'), $('<div class="dlg-body ed-body">'))
      .on('click', (ev) => { if (ev.target === $dlg[0]) $dlg[0].close(); })    // click on backdrop
      .on('close', () => $dlg.find('.toasts, .busy').appendTo(document.body))
      .on('keydown', (ev) => {
         if (ev.target.nodeName === 'INPUT')
            return;
         if (ev.key === 'ArrowLeft' && $dlg.find('.ed-prev').is(':visible')) doStep(-1);
         if (ev.key === 'ArrowRight' && $dlg.find('.ed-next').is(':visible')) doStep(1);
      });

   return $dlg;
}

// ---------------------------------------------------------------------------
// actions

function doRecord() {
   const e = event;

   if (e.id && kind === 'event')
      openTimerDialog({ id: e.timerid, eventid: e.id, channelid: e.channelid, title: e.title, shorttext: e.shorttext,
                        evStartTime: e.starttime, evDuration: e.duration, category: e.category });
   else
      openSearchTimerDialog({ expression: e.title, searchfields: 1, channelids: e.channelid });
}

async function doPlay() {
   try {
      if (kind === 'rec')
         return replayRecording(event);

      if (nowUnix() < event.starttime) {
         await busy(createSwitchTimer(event));
         $dlg.find('.ed-record').addClass('has-timer');
      }
      else
         await switchChannel(event.channelid);
   }
   catch (e) { toastError(e); }
}

async function replayRecording(r) {
   const vdr = state.vdrs[r.vdruuid];
   const uuid = vdr && !vdr.usecommonrecfolder ? r.vdruuid : state.currentVdr?.uuid;
   const res = await busy(get('data/replayrecording?' + new URLSearchParams({ vdruuid: uuid || '', starttime: r.starttime, md5path: r.md5path, owner: r.owner || '' })));
   toast((state.vdrs[uuid]?.name || 'VDR') + ': ' + (res.result?.message || 'OK'));
}

function doStep(dir) {
   if (kind === 'rec')
      return dir < 0 ? ctx.prev?.() : ctx.next?.();

   const t = dir < 0 ? event.starttime - 500 : event.starttime + event.duration + 500;
   showEventAt(event.channelid, t);
}

// ---------------------------------------------------------------------------
// render

function render() {
   const e = event;
   const $d = frame();
   const n = nowUnix();
   const p = state.profile;
   const vdr = state.currentVdr;

   const isRec = kind === 'rec';
   const playable = isRec ? !!vdr?.uuid : kind === 'event' && vdr?.uuid && n < e.starttime + e.duration;
   const isFuture = !isRec && n < e.starttime;
   const canEditRec = isRec && hasRight(rights.recordingsEdit);

   $d.find('.ed-headline').text(e.title || e.name || '');
   $d.find('.ed-record').toggleClass('has-timer', !!e.timerid).toggle(hasRight(rights.timer))
      .attr('title', kind === 'event' ? tre.record : tr.pages.records.similarTimer);
   $d.find('.ed-play').toggle(!!playable).html(icon(isRec ? 'play' : 'tv'))
      .attr('title', isRec ? tre.play : (isFuture ? tr.pages.timerList.newTimer + ': ' : '') + tre.ch_switch);
   $d.find('.ed-prev').toggle(isRec ? !!ctx.prev : kind === 'event' && e.starttime - 500 >= p.minEventTime);
   $d.find('.ed-next').toggle(isRec ? !!ctx.next : kind === 'event' && e.starttime + e.duration + 500 <= p.maxEventTime);
   $d.find('.ed-rec-edit').toggle(canEditRec && !!ctx.rename);
   $d.find('.ed-repeat').toggle(hasRight(rights.searchTimer) && !!e.title);
   $d.find('.ed-rec-del').toggle(canEditRec && !!ctx.remove);

   const $body = $d.find('.ed-body').empty().scrollTop(0);
   const sc = e.scraper?.movie || e.scraper?.serie || null;
   const media = sc?.media || {};
   const ep = e.episode || {};

   // tabs: [{ id, label, $c, onShow }]

   const tabs = [{ id: 'overview', label: 'Übersicht', $c: $('<div class="ed-overview-tab">').append(renderTop(e, sc, media, ep), renderDescription(e, sc, ep)) }];

   if (sc && e.scraper.movie)
      tabs.push({ id: 'info', label: 'Film', $c: renderMovie(e, sc, media) });
   else if (sc)
      tabs.push({ id: 'info', label: 'Serie', $c: renderSerie(e, sc, media) });
   else {
      const $ext = renderExtInfo(e, ep);
      $ext && tabs.push({ id: 'info', label: 'Details', $c: $ext });
   }

   const $actors = renderActors(e, sc);
   $actors && tabs.push({ id: 'actors', label: 'Darsteller', $c: $actors });

   if (e.category === 'Serie' || (sc && !e.scraper.movie) || ep.episodename)
      tabs.push({ id: 'episodes', label: 'Episoden', ...renderConstabel(ep.episodename || e.title) });

   if (repeats && hasRight(rights.searchTimer) && e.title)
      tabs.push({ id: 'repeats', label: tre.repeat, ...renderRepeats(e) });

   if (e.recordings?.length)
      tabs.push({ id: 'recs', label: tr.menu.records + ' (' + e.recordings.length + ')', $c: renderRecordings(e.recordings) });

   const $tabs = $d.find('.ed-tabs').empty().toggle(tabs.length > 1);

   for (const t of tabs) {
      t.$btn = $('<button type="button" class="ed-tab" role="tab">').text(t.label).on('click', () => activate(t)).appendTo($tabs);
      t.$panel = $('<div class="ed-panel" role="tabpanel">').append(t.$c).appendTo($body);
   }

   function activate(t) {
      lastTab = t.id;
      tabs.forEach((x) => { x.$btn.toggleClass('active', x === t).attr('aria-selected', x === t); x.$panel.toggle(x === t); });
      $body.scrollTop(0);
      t.$btn[0].scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      t.onShow?.();
   }

   activate(tabs.find((t) => t.id === lastTab) || tabs[0]);

   if (!$d[0].open)
      $d[0].showModal();
}

function renderTop(e, sc, media, ep) {
   const p = state.profile;
   const progress = progressOf(e.starttime, e.duration);
   const size = { maxW: 400, maxH: 225 };
   const isMovie = sc && e.scraper.movie;

   // EPG image, else the scraper images (fanart / episode image)

   const imgs = [
      e.imagecount ? mediaUrl(p.eventImgPath, { no: 0, id: e.id, ...size })
         : e.imgid ? mediaUrl(p.eventImgPath, { no: 0, imgid: e.imgid, ...size }) : null,
      isMovie && media['1'] && mediaUrl(p.movieMediaPath, { actor_id: 0, movie_id: sc.movieid, media_type: 1, ...size }),
      sc && !isMovie && media['12'] && sc.episode && mediaUrl(p.serieImgPath, { actor_id: 0, series_id: sc.seriesid, season_number: sc.episode.seasonnumber,
                                                                                 episode_id: sc.episode.episodeid, media_type: 12, ...size }),
      sc && !isMovie && media['1'] && mediaUrl(p.serieImgPath, { actor_id: 0, series_id: sc.seriesid, season_number: 0, episode_id: 0, media_type: 1, lfn: 0, ...size })];

   const flags = $('<div class="ed-flags">').append(
      e.flags?.includes('16:9') ? $('<span class="flag">').text('16:9') : null,
      e.audio?.includes('DolbyDigital') ? $('<span class="flag">').text('DD') : null,
      e.flags?.includes('Live') ? $('<span class="flag flag-live">').text('Live') : null,
      e.parentalrating ? $('<span class="flag fsk">').addClass('fsk' + e.parentalrating).text('FSK ' + e.parentalrating) : null,
      e.merge ? $('<span class="flag flag-dim">').text(tre.mergeSrc + e.merge) : null);

   const stars = $('<div class="ed-stars">');

   if (e.rating) {
      const terms = e.rating.slice(e.rating.indexOf('/')).split(' ');

      for (let i = 1; i + 1 < terms.length; i += 3)
         stars.append($('<span>').text(terms[i] + ' ').append($('<b>').text('★'.repeat(terms[i + 1].length))));
   }

   const sub = ep.partname || e.shorttext;

   return $('<div class="ed-top">').append(
      fallbackImg(imgs, { class: 'ed-img' }),
      $('<div class="ed-meta">').append(
         $('<div class="ed-chrow">').append(channelBadge(e.channelid),
            $('<div class="ed-when">').append(
               $('<div>').text(formatDate(e.starttime, 'long')),
               $('<div class="ed-time">').append($('<b>').text(formatTime(e.starttime)), ' – ',
                  formatTime(e.starttime + e.duration) + ' ' + tr.oClock + ' · ' + Math.round(e.duration / 60) + ' ' + tr.minutes))),
         progress !== null ? $('<div class="progress">').append($('<div>').css('width', progress + '%')) : null,
         $('<h3 class="ed-title">').text(e.title),
         sub ? $('<div class="ed-subtitle">').text(sub) : null,
         $('<div class="ed-rating">').append(
            e.numrating ? $('<span class="rate">').addClass('rate' + e.numrating) : null,
            e.tipp ? $('<span class="badge badge-tipp">').text(e.tipp) : null,
            e.txtrating ? $('<span class="ed-txtrating">').text(e.txtrating) : null,
            e.shortreview ? $('<span>').text(e.shortreview) : null),
         stars.children().length ? stars : null,
         flags.children().length ? flags : null,
         infoList([
            [tr.pages.timerList.folder, e.path?.replace(/\//g, ' / ')],
            [tre.genre, e.genre], [tre.category, e.category], [tre.country, e.country], [tre.year, e.year],
            [tre.season, ep.season], [tre.part, ep.part ? ep.part + (ep.parts ? ' / ' + ep.parts : '') : null],
            [tre.number, ep.number],
            ['', ep.extracol1], ['', ep.extracol2], ['', ep.extracol3]
         ], 'ed-info')));
}

function infoList(rows, cls = '') {
   const $dl = $('<dl class="kv">').addClass(cls);

   for (const [k, v] of rows)
      if (v !== undefined && v !== null && v !== '')
         $dl.append($('<dt>').text(k), $('<dd>').text(v));

   return $dl.children().length ? $dl : null;
}

function renderDescription(e, sc, ep) {
   const $desc = $('<div class="ed-desc">');
   const add = (text, cls) => text && $desc.append($('<p>').addClass(cls || '').html(textToHtml(text)));

   if (sc && e.scraper.movie)
      add(sc.overview, 'ed-overview');

   const epi = sc && !e.scraper.movie ? sc.episode : null;

   if (epi) {
      $desc.append($('<h4>').text(epi.episodename || ''));
      add(epi.episodeoverview, 'ed-overview');
   }

   if (!(epi?.episodeoverview && e.longdescription && epi.episodeoverview.length > e.longdescription.length))
      add(e.longdescription);

   if (e.cntlongdescription) {
      $desc.append('<hr>');
      add(e.cntlongdescription);
   }

   if (sc && !e.scraper.movie && sc.seriesoverview)
      $desc.append($('<h4 class="ed-subhead">').text('Serienbeschreibung'), $('<p>').html(textToHtml(sc.seriesoverview)));

   return $desc;
}

function renderExtInfo(e, ep) {
   const rows = [[tre.title, e.title], [tre.part, ep.partname], [tre.release_date, e.year], [tre.lang, ep.lang]];

   for (const k in tre.extInfo)
      rows.push([tre.extInfo[k], e[k]]);

   return infoList(rows);
}

function extInfoRows(e) {
   return Object.keys(tre.extInfo).map((k) => [tre.extInfo[k], e[k]]);
}

function renderMovie(e, sc, media) {
   const p = state.profile;
   const mm = (type, maxW, maxH) => mediaUrl(p.movieMediaPath, { actor_id: 0, movie_id: sc.movieid, media_type: type, maxW, maxH });

   return $('<div class="ed-scraper">').append(
      media['1'] ? $('<img class="ed-fanart" loading="lazy" alt="">').attr('src', mm(1, 800, 450)) : null,
      $('<div class="ed-scraper-cols">').append(
         infoList([
            [tre.title, sc.title], [tre.original_title, sc.originaltitle],
            [tre.runtime, sc.runtime ? sc.runtime + ' ' + tr.minutes : null],
            [tre.release_date, sc.movie_release_date], [tre.genre, pipeList(sc.genres)],
            [$('<div>').html(tre.vote_average).text(), sc.voteaverage ? sc.voteaverage.toFixed(1) + ' / 10' : null],
            [tre.popularity, sc.popularity?.toFixed(1)],
            ...extInfoRows(e),
            ['Budget', sc.budget ? '$' + sc.budget.toLocaleString('de-DE') : null],
            ['Einnahmen', sc.revenue ? '$' + sc.revenue.toLocaleString('de-DE') : null]
         ]),
         media['0'] ? $('<img class="ed-poster" loading="lazy" alt="">').attr('src', mm(0, 300, 450)) : null),
      sc.homepage ? $('<a target="_blank" rel="noopener">').attr('href', sc.homepage).text(tre.homepage) : null);
}

function renderSerie(e, sc, media) {
   const p = state.profile;
   const epi = sc.episode;
   const sm = (params) => mediaUrl(p.serieImgPath, { actor_id: 0, series_id: sc.seriesid, ...params });

   return $('<div class="ed-scraper">').append(
      media['1'] ? $('<img class="ed-fanart" loading="lazy" alt="">').attr('src', sm({ season_number: 0, episode_id: 0, media_type: 1, lfn: 1, maxW: 800, maxH: 250 })) : null,
      $('<div class="ed-scraper-cols">').append(
         infoList([
            [tre.title, sc.seriesname], [tre.network, sc.seriesnetwork], [tre.seriesstatus, sc.seriesstatus],
            [tre.release_date, sc.seriesfirstaired], [tre.genre, pipeList(sc.seriesgenre)],
            [$('<div>').html(tre.vote_average).text(), sc.seriesrating ? sc.seriesrating.toFixed(1) + ' / 10' : null],
            [tre.season, epi?.seasonnumber], [tre.number, epi?.episodenumber],
            ...extInfoRows(e)
         ]),
         epi && media['7'] ? $('<img class="ed-poster" loading="lazy" alt="">').attr('src', sm({ season_number: epi.seasonnumber, episode_id: 0, media_type: 7, maxW: 300, maxH: 450 }))
            : media['2'] ? $('<img class="ed-poster" loading="lazy" alt="">').attr('src', sm({ season_number: 0, episode_id: 0, media_type: 2, lfn: 0, maxW: 300, maxH: 450 }))
            : null),
      p.serieSeasonPath ? $('<a target="_blank" rel="noopener">').attr('href', p.serieSeasonPath + sc.seriesid).text(tre.homepage) : null);
}

function renderActors(e, sc) {
   const p = state.profile;
   const $list = $('<div class="ed-actors">');

   if (sc?.actors) {
      const isMovie = !!e.scraper.movie;

      $.each(sc.actors, (id, a) => {
         const img = isMovie
            ? mediaUrl(p.movieMediaPath, { maxW: 60, maxH: 90, media_type: 4, actor_id: id })
            : mediaUrl(p.serieImgPath, { maxW: 60, maxH: 90, season_number: 0, episode_id: 0, media_type: 13, actor_id: id, series_id: sc.seriesid });

         $('<div class="actor">').append(
            img ? $('<img loading="lazy" alt="">').attr('src', img).on('error', function () { $(this).css('visibility', 'hidden'); }) : null,
            $('<div>').append(
               isMovie ? $('<a target="_blank" rel="noopener">').attr('href', p.movieActorPath + id).text(a.actorname)
                       : $('<b>').text(a.actorname),
               $('<div class="dim">').text((a.actorrole || '').replace(/\|/g, ', ')))).appendTo($list);
      });

      if (sc.episode?.episodegueststars)
         $list.append($('<div class="actor-guests">').append($('<h4>').text(tre.gueststars), $('<p>').text(pipeList(sc.episode.episodegueststars))));
   }
   else if (e.actor) {
      for (const name of e.actor.split(/, /))
         $list.append($('<div class="actor">').append($('<div>').append($('<b>').text(name))));
   }

   return $list.children().length ? $list : null;
}

// constabel episode list – loaded on first open via data/proxy

function renderConstabel(title) {
   const p = state.profile;
   const $body = $('<div class="ed-constabel">').append(
      $('<div class="btn-row">').append(
         $('<a class="btn" target="constabel" rel="noopener">').attr('href', p.constabelEditPath + encodeURIComponent(title) + '.episodes').append(icon('edit'), $('<span>').text(tr.edit)),
         $('<a class="btn" target="constabel" rel="noopener">').attr('href', p.constabelLinkPath + encodeURIComponent(title)).append(icon('link'), $('<span>').text(tre.addConstableLink)),
         p.constabelLoginPath ? $('<a class="btn" target="constabel" rel="noopener">').attr('href', p.constabelLoginPath).append(icon('user'), $('<span>').text(tre.loginConstable)) : null),
      $('<div class="ed-constabel-data">'));

   let loaded = false;

   const load = async () => {
      if (loaded)
         return;

      loaded = true;
      const $out = $body.find('.ed-constabel-data').text('…');

      try {
         const data = await busy(get('data/proxy?id=constabel&title=' + encodeURIComponent(encodeURIComponent(title)) + '&_=' + Date.now(), { as: 'text' }));

         if (data.includes('Error:'))
            return $out.text(tr.error.noData);

         const $head = $('<tr>').append([tre.season, tre.part, tre.number, tre.title].map((t) => $('<th>').text(t)));
         const $tbody = $('<tbody>');

         for (const line of data.split(/\r?\n/)) {
            if (line[0] === '#') {
               const m = line.match(/EXTRACOL[0-9] (.+)/i);
               m && $head.append($('<th>').text(m[1]));
            }
            else {
               const cols = line.split('\t');
               cols.length > 3 && $tbody.append($('<tr>').append(cols.map((c) => $('<td>').text(c))));
            }
         }

         $out.empty().append(
            $('<div class="table-wrap">').append($('<table class="table">').append($('<thead>').append($head), $tbody)),
            $('<details class="ed-raw">').append($('<summary>').text('Raw'), $('<pre>').text(data)));
      }
      catch (e) {
         $out.text(e.message);
      }
   };

   return { $c: $body, onShow: load };
}

// repeats – exact title search (data/search), loaded on first open

function renderRepeats(e) {
   const $body = $('<div class="ed-repeats">');
   const $out = $('<div class="ed-repeats-data">');
   let loaded = false;

   $body.append(
      $('<div class="btn-row">').append(
         $('<a class="btn">').attr('href', '#search?exact=1&q=' + encodeURIComponent(e.title))
            .append(icon('search'), $('<span>').text('In der Suche öffnen'))
            .on('click', () => $dlg[0].close())),
      $out);

   const load = async () => {
      if (loaded)
         return;

      loaded = true;
      $out.text('…');

      try {
         const res = repeatsCache?.title === e.title ? repeatsCache.res
            : await searchEvents({ expression: e.title, searchmode: 1, searchfields: 1, casesensitiv: 1 }, state.profile.maxListEntries || 100);

         repeatsCache = { title: e.title, res };
         renderResults($out, res, {
            currentId: kind === 'event' ? e.id : undefined,
            onClick: (r) => {               // keep the tab, but show the overview of the selected repeat
               if (r.id != e.id || kind !== 'event') {
                  lastTab = 'overview';
                  open('data/event?id=' + encodeURIComponent(r.id));
               }
            }
         });
      }
      catch (err) {
         loaded = false;
         $out.text(err.message);
      }
   };

   return { $c: $body, onShow: load };
}

function renderRecordings(recs) {
   const density = (v) => $('<span class="density">').attr('title', v + '% ' + tr.pages.search.matchdensity)
      .append($('<span>').css('width', v + '%'));

   return $('<ul class="ed-recs">').append(recs.map((r) =>
      $('<li>').append(
         $('<div class="dim">').text(formatDateTime(r.starttime) + ' · ' + Math.round(r.duration / 60) + ' ' + tr.minutes),
         $('<div>').append(density(r.matchdensitytitle), $('<b>').text(r.title)),
         r.shorttext ? $('<div>').append(density(r.matchdensityshorttext), $('<i>').text(r.shorttext)) : null)));
}
