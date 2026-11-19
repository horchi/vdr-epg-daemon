// Page "Suche" – EPG search with the search timer criteria, saved searches (search timers of type 'S')
//
//   #search?q=Tatort            search for an expression
//   #search?q=Tatort&exact=1    exact title search (used for "Wiederholungen" in the event detail)

import { state, hasRight, rights } from '../state.js';
import { get, post } from '../api.js';
import { busy, toast, toastError, dialog, stickyBar } from '../ui.js';
import { icon } from '../icons.js';
import { field } from '../forms.js';
import { searchForm, searchEvents, renderResults, openSearchTimerDialog, deleteTimers } from '../timerDialog.js';
import tr from '../../lang/de.js';

const trs = tr.pages.search;

let pg = null;

export async function render($content, params = {}) {
   pg = { saved: [], current: null };

   const showOpts = loadPref('searchOpts') ?? (state.profile.searchAdv == 1 ? '1' : '0');

   const $input = $('<input type="search" class="input search-input" autocomplete="off" enterkeyhint="search">')
      .attr('placeholder', trs.searchExpression + ' …');

   const $savedSel = $('<select class="input search-saved">').attr('title', 'Gespeicherte Suchen')
      .on('change', function () { loadSaved(this.value); });

   const $optsBtn = $('<button type="button" class="btn">').attr('title', 'Suchoptionen').append(icon('gear'), $('<span>').text('Optionen'))
      .toggleClass('active', showOpts === '1')
      .on('click', function () {
         const on = !$(this).hasClass('active');
         $(this).toggleClass('active', on);
         pg.$opts.toggle(on);
         savePref('searchOpts', on ? '1' : '0');
      });

   const $head = $('<form class="search-head">').append(
      $('<div class="search-row">').append(
         $input,
         $('<button type="submit" class="btn btn-primary">').append(icon('search'), $('<span>').text(trs.search))),
      $('<div class="search-row search-row2">').append($savedSel, $optsBtn))
      .on('submit', (ev) => { ev.preventDefault(); run(); });

   pg.$opts = $('<div class="card search-opts">').toggle(showOpts === '1');
   pg.$actions = $('<div class="toolbar search-actions">');
   pg.$results = $('<div class="search-results">');
   pg.$input = $input;
   pg.$savedSel = $savedSel;

   $content.empty().append($('<section class="page page-search">').append(stickyBar($head), pg.$opts, pg.$actions, pg.$results));

   loadSavedList();

   const t = params.q
      ? (params.exact ? { expression: params.q, searchmode: 1, searchfields: 1, casesensitiv: 1 } : { expression: params.q, searchfields: 1 })
      : { searchfields: 1 };

   await setCriteria(t);

   if (params.q)
      run();
   else if (matchMedia('(hover: hover)').matches)
      $input.trigger('focus');
}

export function destroy() {
   pg = null;
}

// ---------------------------------------------------------------------------

async function setCriteria(t) {
   const page = pg;
   const form = await searchForm(t, { embedded: true });

   if (page !== pg)
      return;

   pg.form = form;
   pg.$input.val(t.expression || '');
   pg.$opts.empty().append(form.$form.on('submit', (ev) => { ev.preventDefault(); run(); }));
   renderActions();
}

function criteria(validate = true) {
   // the expression input lives in the page head, the rest in the form

   pg.form.$expr.val(pg.$input.val().trim());
   const data = pg.form.getData(validate);

   if (data) {
      data.type = 'S';
      if (pg.current) { data.id = pg.current.id; data.name = pg.current.name; }
   }

   return data;
}

async function run() {
   if (!pg?.form)
      return;

   const data = criteria();

   if (!data)
      return;

   history.replaceState(null, '', '#search?q=' + encodeURIComponent(data.expression));

   try {
      const res = await searchEvents(data, state.profile.maxListEntries || 100);
      renderResults(pg.$results, res);
      renderActions(true);
   }
   catch (e) { toastError(e); }
}

function renderActions(hasResults = false) {
   const $a = pg.$actions.empty();
   const canSave = hasRight(rights.searchTimerEdit);

   if (canSave)
      $a.append($('<button type="button" class="btn">').append(icon('check'), $('<span>').text(pg.current ? '„' + (pg.current.name || pg.current.expression) + '“ speichern' : 'Suche speichern'))
         .on('click', saveSearch));

   if (canSave && pg.current)
      $a.append(
         $('<button type="button" class="btn">').append(icon('copy'), $('<span>').text(tr.copy)).on('click', () => saveSearch(true)),
         $('<button type="button" class="btn btn-danger">').append(icon('trash'), $('<span>').text(tr.del)).on('click', deleteSearch));

   if (canSave)
      $a.append($('<button type="button" class="btn">').append(icon('record'), $('<span>').text('Als Suchtimer anlegen'))
         .on('click', () => {
            const d = criteria(false);
            openSearchTimerDialog({ ...d, id: undefined, name: '', type: 'R' });
         }));

   $a.toggle(hasResults || !!pg.current);
}

// ---------------------------------------------------------------------------
// saved searches (search timers with type 'S')

async function loadSavedList(selectId) {
   try {
      const data = await get('data/searchtimers?type=S');

      if (!pg)
         return;

      pg.saved = (data.searchtimers || []).sort((a, b) => (a.name || a.expression).localeCompare(b.name || b.expression, 'de'));
      pg.$savedSel.empty()
         .append($('<option value="">').text(pg.saved.length ? 'Gespeicherte Suchen …' : 'Keine gespeicherten Suchen'))
         .append(pg.saved.map((s) => $('<option>').val(s.id).text(s.name || s.expression)))
         .val(selectId ?? pg.current?.id ?? '');
   }
   catch (e) { }
}

async function loadSaved(id) {
   const st = pg.saved.find((s) => s.id == id);
   pg.current = st || null;

   if (st) {
      await setCriteria(st);
      run();
   }
   else
      renderActions();
}

async function saveSearch(asCopy = false) {
   const data = criteria();

   if (!data)
      return;

   const $name = $('<input class="input" required>').val(asCopy ? (data.name || data.expression) + ' copy' : data.name || data.expression);

   dialog({
      title: asCopy ? tr.copy : 'Suche speichern', cls: 'dlg-form',
      content: $('<form class="form">').append(field(trs.searchName, $name)).on('submit', (ev) => ev.preventDefault()),
      buttons: [
         { text: tr.cancel },
         { text: tr.save, primary: true, click: ($d) => {
            if (!$name.val().trim())
               return toast(tr.error.emptyField.replace('$field$', trs.searchName), { error: true }) && false;

            (async () => {
               const d = { ...data, name: $name.val().trim(), type: 'S' };

               if (asCopy)
                  delete d.id;

               try {
                  const res = await busy(post('data/save-searchtimer', d));
                  if (res.result && res.result.state != 200) throw new Error(res.result.message);
                  toast(tr.dataSaved);
                  $d[0].close();
                  await loadSavedList();
                  const st = pg.saved.find((s) => s.name === d.name && (!d.id || s.id == d.id)) || null;
                  pg.current = st;
                  pg.$savedSel.val(st?.id ?? '');
                  renderActions(true);
               }
               catch (e) { toastError(e); }
            })();

            return false;
         } }]
   });
}

async function deleteSearch() {
   if (await deleteTimers([parseInt(pg.current.id, 10)], 'data/save-searchtimer')) {
      pg.current = null;
      await loadSavedList('');
      renderActions(true);
   }
}

function loadPref(k) { try { return localStorage.getItem('epgd.' + k); } catch (e) { return null; } }
function savePref(k, v) { try { localStorage.setItem('epgd.' + k, v); } catch (e) { } }
