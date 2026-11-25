// EPGd web interface – entry point (layout, menu, hash routing)

import { state, rights, hasRight } from './state.js';
import { log } from './api.js';
import { loadProfile, loadChannels, loadVdrs, selectVdr } from './data.js';
import { ensureLogin, logout, showLoginForm } from './session.js';
import { busy, toastError, confirmBox } from './ui.js';
import { icon } from './icons.js';
import { apply as applyTheme, getTheme, cycleMode } from './theme.js';
import * as pageOverview from './pages/overview.js';
import * as pageNow from './pages/now.js';
import * as pageMagazine from './pages/magazine.js';
import * as pageTimeline from './pages/timeline.js';
import * as pageTimers from './pages/timers.js';
import * as pageRecords from './pages/records.js';
import * as pageSearch from './pages/search.js';
import * as pageSettings from './pages/settings.js';
import * as pageHelp from './pages/help.js';
import tr from '../lang/de.js';

// pages

const pages = {
   overview:       { label: tr.menu.overview, icon: 'home', page: pageOverview },
   now:            { label: tr.menu.now, icon: 'clock', page: pageNow },
   magazine:       { label: tr.menu.magazine, icon: 'now', page: pageMagazine },
   timeline:       { label: tr.menu.timeline, icon: 'timeline', page: pageTimeline },
   timers:         { label: tr.menu.timer, icon: 'timer', page: pageTimers },
   records:        { label: tr.menu.records, icon: 'film', page: pageRecords, right: rights.recordings },
   search:         { label: tr.menu.search, icon: 'search', page: pageSearch, right: rights.searchTimer },
   settings:       { label: tr.menu.options, icon: 'gear', page: pageSettings },
   help:           { label: tr.menu.help, icon: 'help', page: pageHelp }
};

let $content = null;
let currentPage = null;

function buildLayout() {
   const $nav = $('<nav class="nav" id="nav">');

   $('<header class="topbar">').append(
      $('<button type="button" class="btn btn-icon btn-flat nav-toggle">').attr('title', 'Menü').html(icon('menu'))
         .on('click', () => $('body').toggleClass('nav-open')),
      $('<a class="brand">').append($('<img alt="">').attr('src', 'images/epgd-4x.png'), $('<span>').text('EPGd')),
      $('<a class="btn btn-icon btn-flat home-link" href="#overview">').attr({ title: tr.menu.overview, 'aria-label': tr.menu.overview }).html(icon('home')),
      $nav,
      $('<div class="topbar-right">').append(
         $('<button type="button" class="btn btn-icon btn-flat theme-toggle">').on('click', () => { cycleMode(); renderThemeToggle(); }),
         $('<label class="vdr-select">').append($('<span>').text('VDR'), $('<select class="input">')
            .on('change', function () { selectVdr(this.value); })),
         $('<div class="user">'))
   ).appendTo(document.body);

   $content = $('<main class="content" id="content">').appendTo(document.body);

   $(document).on('click', '.nav a', () => $('body').removeClass('nav-open'));

   // phone menu: a tap beside it (on the backdrop, see body.nav-open::after) or Escape closes it

   $(document.body).on('click', (ev) => { if (ev.target === document.body) $('body').removeClass('nav-open'); });
   $(document).on('keydown', (ev) => { if (ev.key === 'Escape' && $('body').hasClass('nav-open')) $('body').removeClass('nav-open'); });
}

const themeLabels = { auto: 'Theme: automatisch (System)', light: 'Theme: hell', dark: 'Theme: dunkel' };

function renderThemeToggle() {
   const mode = getTheme().mode;
   $('.theme-toggle').html(icon({ auto: 'contrast', light: 'sun', dark: 'moon' }[mode] || 'contrast'))
      .attr({ title: themeLabels[mode], 'aria-label': themeLabels[mode] });
}

// the logo leads to the page of the profile setting 'logoPage' (stored as 'menu_<page>')

const pageAlias = { timerList: 'timers', searchTimerList: 'timers', profile: 'settings' };

function renderBrand() {
   let id = String(state.profile.logoPage || '').replace(/^menu_/, '');
   id = pageAlias[id] || id;

   if (!pages[id] || (pages[id].right && !hasRight(pages[id].right)))
      id = 'now';

   $('.topbar .brand').attr({ href: '#' + id, title: pages[id].label });
}

function renderMenu() {
   renderBrand();

   const $nav = $('#nav').empty();

   if (!state.login.rights)
      return;

   for (const [id, p] of Object.entries(pages)) {
      if (p.right && !hasRight(p.right))
         continue;

      $('<a>').attr({ href: '#' + id, 'data-page': id })
         .append(icon(p.icon), $('<span>').text(p.label))
         .appendTo($nav);
   }

   const $user = $('.topbar .user').empty();

   if (state.profile.needLogin == 1 && state.login.session)
      $user.append($('<button type="button" class="btn btn-flat">').attr('title', tr.pages.login.logout)
         .append(icon('user'), $('<span>').text(state.login.user), icon('logout'))
         .on('click', async () => { if (await confirmBox('Wirklich abmelden?', tr.pages.login.logout)) logout(); }));
   else if (state.profile.needLogin == 1)
      $user.append($('<button type="button" class="btn btn-flat">').append(icon('user'), $('<span>').text(tr.pages.login.label))
         .on('click', () => showLoginForm()));
}

function renderVdrs() {
   const $sel = $('.vdr-select select').empty();

   for (const vdr of Object.values(state.vdrs))
      $('<option>').val(vdr.uuid).text(vdr.name).appendTo($sel);

   $sel.val(state.currentVdr?.uuid || '');
   $('.vdr-select').toggle(Object.keys(state.vdrs).length > 0);
}

// ---------------------------------------------------------------------------
// routing (#page)

const LAST_PAGE_KEY = 'epgd.lastPage';
let lastPage = null;

try { lastPage = localStorage.getItem(LAST_PAGE_KEY); }
catch (e) { /* no storage */ }

function route() {
   if (!state.login.rights)
      return $content.empty();

   let start = String(state.profile.startPage || '').replace(/^menu_/, '');
   start = pageAlias[start] || start;

   // start page 'last': the page visited last in this browser (incl. tab etc.)

   if (!location.hash && start === 'last' && lastPage)
      history.replaceState(null, '', '#' + lastPage);

   const [hashId, query] = location.hash.slice(1).split('?');
   const params = Object.fromEntries(new URLSearchParams(query || ''));
   let id = hashId || (pages[start] ? start : 'now');

   if (!pages[id] || (pages[id].right && !hasRight(pages[id].right)))
      id = 'now';

   const p = pages[id];

   lastPage = id === hashId ? location.hash.slice(1) : id;      // with tab etc., an unknown page counts as 'now'

   try { localStorage.setItem(LAST_PAGE_KEY, lastPage); }
   catch (e) { /* no storage */ }

   $('#nav a').removeClass('active').filter('[data-page="' + id + '"]').addClass('active');
   document.title = p.label + ' – EPGd';

   $('dialog[open]').each(function () { this.close(); });     // a link inside a dialog navigated away
   currentPage?.destroy?.();
   currentPage = p.page;

   // back link to the page we came from (set by e.g. the overview), kept while staying on this page

   const back = state.backTo;

   if (back && !back.page)
      back.page = id;
   else if (back && back.page !== id)
      state.backTo = null;

   try {
      p.page.render($content, params);

      if (state.backTo)
         $content.prepend($('<a class="back-link">').attr('href', back.hash).append(icon('left'), $('<span>').text('Zurück zur ' + back.label)));
   }
   catch (e) {
      log((e.message || 'common error') + '\n' + (e.stack || ''), 2);
      toastError(e);
   }
}

// ---------------------------------------------------------------------------
// startup

async function reloadUserData() {
   await loadProfile();          // user specific parameters
   await Promise.all([loadChannels(), loadVdrs()]);
   renderMenu();
   renderVdrs();
   route();
}

async function init() {
   applyTheme();
   buildLayout();
   renderThemeToggle();

   $(window)
      .on('hashchange', route)
      .on('login:changed', () => {
         $('dialog.dlg-event').each(function () { this.close(); });
         state.login.rights ? busy(reloadUserData()).catch(toastError) : (renderMenu(), route(), ensureLogin());
      })
      .on('vdrs:loaded', renderVdrs)
      .on('theme:changed', renderThemeToggle)
      .on('profile:changed', renderBrand)

   try {
      await busy(loadProfile());

      if (state.profile.needLogin == -1)
         state.profile.needLogin = 0;

      await ensureLogin();         // triggers login:changed -> reloadUserData()
   }
   catch (e) {
      toastError(e);
   }

   setInterval(() => loadProfile().catch(() => {}), 3600000);
}

window.addEventListener('error', (ev) => {
   log(ev.message + '\nline: ' + ev.lineno + (ev.error?.stack ? '\nerror: ' + ev.error.stack : ''), 2);
});

window.addEventListener('unhandledrejection', (ev) => {
   log('unhandled rejection: ' + (ev.reason?.stack || ev.reason), 2);
});

$(init);
