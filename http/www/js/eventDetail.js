// Event detail (modal) – data/event?id=... or data/event?channelid=...&time=...

import { state, hasRight, rights } from './state.js';
import { get, post, mediaUrl, fallbackImg } from './api.js';
import { busy, toast, toastError, confirmBox } from './ui.js';
import { formatTime, formatDate, formatDateTime, progressOf, textToHtml, leadText, pipeList, nowUnix } from './utils.js';
import { channelBadge, doneBadge, switchChannel, createSwitchTimer } from './data.js';
import { icon, iconButton } from './icons.js';
import { playRecording, playLiveEvent, canLive } from './player.js';
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
let peeks = {};                // touch: prefetched neighbors { '-1'|'1': { url, data, $pane } }
let peekGen = 0;
let adoptPage = null;          // prefetched page of the neighbor which is taken over by the next render()

// data of a prefetched neighbor (swipe) or load it

function fetchData(url) {
   const dir = [-1, 1].find((d) => peeks[d]?.url === url);

   if (!dir)
      return busy(get(url));

   adoptPage = peeks[dir].$page;                     // its rendered page is reused, no flicker
   delete peeks[dir];
   return Promise.resolve(adoptPage.data('data'));
}

const eventAtUrl = (channelId, time) => 'data/event?' + new URLSearchParams({ channelid: channelId, time });
const recordingUrl = (rec) => 'data/recording?' + new URLSearchParams({ starttime: rec.starttime, md5path: rec.md5path, owner: rec.owner || '' });

// opts.list: event ids of the calling page, prev / next steps through them instead of the channel

export async function showEvent(id, opts = {}) {
   repeats = false;
   return open(eventUrl(id), opts.list ? { list: opts.list.map(String) } : {});
}

const eventUrl = (id) => 'data/event?id=' + encodeURIComponent(id);

// neighbor id in the list of the calling page (ctx.list)

function listNeighbor(dir) {
   const i = ctx.list.indexOf(String(event.id));
   return i < 0 ? null : ctx.list[i + dir] ?? null;
}

export async function showEventAt(channelId, time) {
   repeats = false;
   return open(eventAtUrl(channelId, time));
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
         t.cntlongdescription = (tr.pages.timerList.doneStates[t.state] || t.state)
            + ((t.info || tr.pages.timerList.doneInfoDefault[t.state]) ? ' – ' + (t.info || tr.pages.timerList.doneInfoDefault[t.state]) : '');

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

async function open(url, c = {}) {
   try {
      const data = await fetchData(url);

      if (!data.event)
         return toast(tr.error.noData, { error: true });

      event = data.event;
      kind = 'event';
      ctx = c;
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
      const data = await fetchData(recordingUrl(rec));
      const r = prepRecording(data.recording, rec);

      if (!r)
         return toast(tr.error.noData, { error: true });

      event = r;
      kind = 'rec';
      ctx = { ...opts, rec };
      render();
   }
   catch (e) {
      toastError(e);
   }
}

function prepRecording(r, rec) {
   if (!r)
      return null;

   r.longdescription ||= r.description;
   r.episode = { lang: r.episodelang, partname: r.episodecomppartname };
   r.duration ||= rec.duration;
   r.path = rec.folderPath || r.path;            // readable folder for display
   r.vdruuid ||= rec.vdruuid;
   r.imgid = rec.imgid;                          // only set by data/recordings if the image exists
   delete r.id;
   delete r.timerid;

   return r;
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
      iconButton('film', 'Im Browser abspielen').addClass('ed-stream').on('click', () => playRecording(event)),
      iconButton('live', 'Live im Browser ansehen').addClass('ed-live')
         .on('click', () => playLiveEvent(event)),
      iconButton('check', tre.markRecorded).addClass('ed-mark-rec').on('click', doMarkRecorded),
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
      iconButton('close', tr.close).addClass('ed-close').attr('autofocus', '')    // default button (Enter / Esc)
         .on('click', () => $dlg[0].close()));

   $dlg.append($tools, $('<div class="ed-page ed-main">'))
      .on('click', (ev) => { if (ev.target === $dlg[0]) $dlg[0].close(); })    // click on backdrop
      .on('close', () => $dlg.find('.toasts, .busy').appendTo(document.body))
      .on('keydown', (ev) => {
         if (ev.target.nodeName === 'INPUT')
            return;
         if (ev.key === 'ArrowLeft' && $dlg.find('.ed-prev').is(':visible')) doStep(-1);
         if (ev.key === 'ArrowRight' && $dlg.find('.ed-next').is(':visible')) doStep(1);
      });

   initSwipe();

   return $dlg;
}

// touch: swipe left / right steps to the next / previous event (like the arrow keys)
//  like the iPhone home screens: the prefetched neighbor (peek pane) moves in together with the content,
//  if it is not loaded (yet) the content slides out and the new event slides in after loading

function initSwipe() {
   const ease = 'cubic-bezier(.2, .7, .3, 1)';      // starts with 3.5 x the average speed
   let sw = null;               // { x, y, t, dx, dir, hist }  dir: null (undecided), 'h' or 'v'
   let busyStep = false;        // slide animation / loading running
   let raf = 0;

   const page = () => $dlg.find('.ed-main')[0];

   // horizontally scrollable element below the finger (tab bar, tables) -> leave the gesture to it

   const hScrollable = (el) => {
      for (; el && el !== $dlg[0]; el = el.parentElement)
         if (el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(el).overflowX))
            return true;
      return false;
   };

   const canStep = (dir) => $dlg.find(dir < 0 ? '.ed-prev' : '.ed-next').is(':visible');
   const place = (el, x, ms) => { el.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none'; el.style.transform = x ? `translateX(${x}px)` : ''; };

   // move the page to x, the neighbor pages move along at the left / right of it

   const move = (x, ms) => {
      const pg = page();
      const w = pg.offsetWidth;

      place(pg, x, ms);

      for (const dir of [-1, 1]) {
         const pane = peeks[dir]?.$page?.[0];

         if (!pane)
            continue;

         Object.assign(pane.style, { top: pg.offsetTop + 'px', left: pg.offsetLeft + 'px', width: w + 'px', height: pg.offsetHeight + 'px' });

         if (x !== 0)                                     // at 0 (snap back) it stays visible while moving out
            pane.style.visibility = Math.sign(-x) === dir ? 'visible' : 'hidden';

         place(pane, x + dir * w, ms);
      }
   };

   const transitionEnd = (el, ms) => new Promise((res) => {
      const done = () => { el.removeEventListener('transitionend', done); clearTimeout(tm); res(); };
      const tm = setTimeout(done, ms + 50);
      el.addEventListener('transitionend', done);
   });

   // duration to cover dist with the ease curve starting at the finger speed v (px/ms)

   const duration = (dist, v) => Math.round(Math.min(380, Math.max(160, 3.5 * Math.abs(dist) / Math.max(Math.abs(v), 0.4))));

   const step = async (dir, x, v) => {
      const pg = page();
      const w = pg.offsetWidth;

      busyStep = true;

      try {
         if (peeks[dir]?.$page) {                         // neighbor is visible -> it slides in and is taken over
            const ms = duration(w - Math.abs(x), v);
            move(-dir * w, ms);
            await transitionEnd(pg, ms);
            await doStep(dir);
            return;
         }

         const ms = duration(w - Math.abs(x), v);         // not loaded yet: slide out, load, slide in
         move(-dir * w, ms);
         await transitionEnd(pg, ms);
         pg.style.visibility = 'hidden';

         await doStep(dir);

         const np = page();
         place(np, dir * w * 0.4, 0);
         np.getBoundingClientRect();                      // commit the start position
         place(np, 0, 240);
         await transitionEnd(np, 240);
         np.style.transition = '';
         pg.style.visibility = '';                        // load failed -> old page is still there
         place(pg, 0, 0);
      }
      catch (e) { /* reported by doStep */ }
      finally {
         busyStep = false;
      }
   };

   $dlg[0].addEventListener('touchstart', (ev) => {
      sw = null;

      if (busyStep || ev.touches.length !== 1 || $(ev.target).closest('input, textarea, select, video').length || hScrollable(ev.target))
         return;

      const t = ev.touches[0];
      sw = { x: t.clientX, y: t.clientY, dx: 0, dir: null, hist: [] };
   }, { passive: true });

   $dlg[0].addEventListener('touchmove', (ev) => {
      if (!sw || sw.dir === 'v')
         return;

      const t = ev.touches[0];
      const dx = t.clientX - sw.x;
      const dy = t.clientY - sw.y;

      if (!sw.dir) {
         if (Math.max(Math.abs(dx), Math.abs(dy)) < 8)
            return;
         sw.dir = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'h' : 'v';
         if (sw.dir === 'v')
            return;
         sw.x = t.clientX;                                // start following without a jump
      }

      ev.cancelable && ev.preventDefault();               // no vertical scrolling while swiping sideways

      const now = performance.now();
      sw.dx = t.clientX - sw.x;
      sw.hist.push({ x: sw.dx, t: now });
      while (sw.hist.length > 2 && now - sw.hist[0].t > 100)
         sw.hist.shift();

      if (!raf)
         raf = requestAnimationFrame(() => {
            raf = 0;
            if (sw?.dir === 'h')
               move(canStep(sw.dx < 0 ? 1 : -1) ? sw.dx : sw.dx * 0.2, 0);    // resistance if there is nothing to step to
         });
   }, { passive: false });

   const end = () => {
      const s = sw;
      sw = null;

      if (!s || s.dir !== 'h')
         return;

      cancelAnimationFrame(raf);
      raf = 0;

      const h = s.hist;
      const v = h.length > 1 ? (h[h.length - 1].x - h[0].x) / Math.max(1, h[h.length - 1].t - h[0].t) : 0;   // px/ms of the last 100 ms
      const dir = s.dx < 0 ? 1 : -1;
      const flick = Math.abs(v) > 0.3 && Math.sign(v) === Math.sign(s.dx);

      if (canStep(dir) && (flick || (Math.abs(s.dx) > page().offsetWidth / 3 && Math.sign(v) !== -Math.sign(s.dx))))
         step(dir, s.dx, Math.sign(v) === Math.sign(s.dx) ? v : 0);
      else
         move(0, 220);                                    // snap back
   };

   $dlg[0].addEventListener('touchend', end);
   $dlg[0].addEventListener('touchcancel', () => { sw = null; move(0, 220); });
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

async function doMarkRecorded() {
   const name = event.title + (event.shorttext ? ' – ' + event.shorttext : '');

   if (!await confirmBox(tre.markRecordedConfirm.replace('$1', name), tre.markRecorded))
      return;

   const $btn = $dlg.find('.ed-mark-rec').prop('disabled', true);

   try {
      await busy(post('data/store-donetimers', { recorded: [event.id] }));
      toast(tre.markedRecorded);
      $(window).trigger('timers:changed');           // reloads the event and the EPG views
   }
   catch (e) { toastError(e); }
   finally { $btn.prop('disabled', false); }
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

// url of the previous / next event or recording

function stepUrl(dir) {
   if (kind === 'rec') {
      const rec = dir < 0 ? ctx.prevRec : ctx.nextRec;
      return rec ? recordingUrl(rec) : null;
   }

   if (kind === 'event' && ctx.list) {
      const id = listNeighbor(dir);
      return id ? eventUrl(id) : null;
   }

   return kind === 'event' ? eventAtUrl(event.channelid, dir < 0 ? event.starttime - 500 : event.starttime + event.duration + 500) : null;
}

// touch devices: load the neighbors in the background and render them as hidden peek panes for swiping

function prefetchNeighbors() {
   const gen = ++peekGen;

   Object.values(peeks).forEach((p) => p?.$page?.remove());
   peeks = {};

   if (!navigator.maxTouchPoints)
      return;

   for (const dir of [-1, 1]) {
      const url = $dlg.find(dir < 0 ? '.ed-prev' : '.ed-next').is(':visible') && stepUrl(dir);
      const rec = dir < 0 ? ctx.prevRec : ctx.nextRec;
      const k = kind;

      url && get(url).then((data) => {
         if (gen !== peekGen)
            return;

         const e = k === 'rec' ? prepRecording(data.recording, rec) : data.event;

         if (!e)
            return;

         const $page = buildPage(e, repeats && !!ctx.keepRepeats).addClass('ed-peek').attr('aria-hidden', 'true').data('data', data).appendTo($dlg);
         peeks[dir] = { url, $page };
      }).catch(() => {});
   }
}

function doStep(dir) {
   if (kind === 'rec')
      return dir < 0 ? ctx.prev?.() : ctx.next?.();

   if (ctx.list) {
      const id = listNeighbor(dir);
      repeats &&= !!ctx.keepRepeats;
      return id && open(eventUrl(id), ctx);
   }

   const t = dir < 0 ? event.starttime - 500 : event.starttime + event.duration + 500;
   return showEventAt(event.channelid, t);
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
      .attr('title', isRec ? tre.play + ' (VDR)' : (isFuture ? tr.pages.timerList.newTimer + ': ' : '') + tre.ch_switch);
   $d.find('.ed-stream').toggle(isRec && hasRight(rights.recordings));
   $d.find('.ed-live').toggle(kind === 'event' && canLive(e));
   $d.find('.ed-prev').toggle(isRec ? !!ctx.prev : ctx.list ? !!listNeighbor(-1) : kind === 'event' && e.starttime - 500 >= p.minEventTime);
   $d.find('.ed-next').toggle(isRec ? !!ctx.next : ctx.list ? !!listNeighbor(1) : kind === 'event' && e.starttime + e.duration + 500 <= p.maxEventTime);
   $d.find('.ed-rec-edit').toggle(canEditRec && !!ctx.rename);
   $d.find('.ed-mark-rec').toggle(kind === 'event' && !!e.id && e.donestate !== 'R' && hasRight(rights.timerEdit));
   $d.find('.ed-repeat').toggle(hasRight(rights.searchTimer) && !!e.title);
   $d.find('.ed-rec-del').toggle(canEditRec && !!ctx.remove);

   // page (tab bar + tab panels), a prefetched page of a neighbor (swipe) is taken over

   const $page = adoptPage || buildPage(e, repeats);

   adoptPage = null;
   $page.removeClass('ed-peek').removeAttr('aria-hidden style');
   $d.find('.ed-main').not($page).replaceWith($page);
   $page.addClass('ed-main');
   $page.data('activate')(lastTab, true);

   if (!$d[0].open) {
      $d[0].showModal();
      $d.find('.ed-close')[0].focus();
   }

   prefetchNeighbors();
}

// page of an event: tab bar and tab panels; $page.data('activate')(tabId, load)

function buildPage(e, withRepeats) {
   const tabs = buildTabs(e, withRepeats);
   const $tabs = $('<nav class="ed-tabs" role="tablist">').toggle(tabs.length > 1);
   const $body = $('<div class="dlg-body ed-body">');
   const $page = $('<div class="ed-page">').append($tabs, $body);

   for (const t of tabs) {
      t.$btn = $('<button type="button" class="ed-tab" role="tab">').text(t.label).on('click', () => activate(t, true)).appendTo($tabs);
      t.$panel = $('<div class="ed-panel" role="tabpanel">').append(t.$c).appendTo($body);
   }

   function activate(t, load) {
      load && (lastTab = t.id);                   // not for the hidden pages of the neighbors
      tabs.forEach((x) => { x.$btn.toggleClass('active', x === t).attr('aria-selected', x === t); x.$panel.toggle(x === t); });
      $body.scrollTop(0);
      load && t.$btn[0].isConnected && t.$btn[0].scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      load && t.onShow?.();
   }

   const select = (id) => tabs.find((t) => t.id === id) || tabs[0];

   activate(select(lastTab), false);
   $page.data('activate', (id, load) => activate(select(id), load));

   return $page;
}

// tabs of an event: [{ id, label, $c, onShow }]

function buildTabs(e, withRepeats) {
   const sc = e.scraper?.movie || e.scraper?.serie || null;
   const media = sc?.media || {};
   const ep = e.episode || {};

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

   if (withRepeats && hasRight(rights.searchTimer) && e.title)
      tabs.push({ id: 'repeats', label: tre.repeat, ...renderRepeats(e) });

   if (e.recordings?.length)
      tabs.push({ id: 'recs', label: tr.menu.records + ' (' + e.recordings.length + ')', $c: renderRecordings(e.recordings) });

   return tabs;
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
      e.merge ? $('<span class="flag flag-dim">').text(tre.mergeSrc + e.merge) : null,
      e.imagesource ? $('<span class="flag flag-dim">').text(tre.imageSrc + e.imagesource.toUpperCase()) : null);

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
            doneBadge(e)?.append(' ', $('<span>').text(e.donestate === 'R' ? tre.alreadyRecorded : tre.plannedOther)),
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

   add(leadText(e.shortdescription, e.longdescription, e.cntlongdescription), 'ed-lead');

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
                  lastTab = 'overview';      // prev / next steps through the repeats, the tab stays
                  open(eventUrl(r.id), { list: (res.events || []).map((x) => String(x.id)), keepRepeats: true });
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
