// Generic list: table on desktop, cards on phones (CSS), with filter, sort and selection
//
//   const list = dataList({
//      columns:  [{ key, label, render(row) -> jQuery|string, sort(row) -> value, cls, sortDefault: 1|-1,
//                   filter: { value(row) -> key, label(key) -> text } }],   // select in the column header
//      rowCls(row), rowActions(row) -> [jQuery buttons], onRowClick(row, ev),
//      selectable: true, bulkActions: [{ icon, label, run(rows) }],
//      editMode: true,  // selection only after 'Bearbeiten', with 'select all' and 'select group'
//      tools: [jQuery], empty: 'text', filterText(row) -> string,
//      pageSize: n      // render only n rows at once (sort and filter still work on all rows)
//      onFilterEnter(text), filterHint: 'text'   // enter in the filter field (e.g. search on the server)
//   });
//   $parent.append(list.$el); list.setRows(rows);

import { icon } from '../icons.js';
import { stickyBar } from '../ui.js';
import tr from '../../lang/de.js';

export function dataList(o) {
   const cols = o.columns;
   let rows = [];
   let sortCol = cols.findIndex((c) => c.sortDefault);
   let sortDir = sortCol >= 0 ? cols[sortCol].sortDefault : 1;
   let page = 0;
   let shown = [];              // rows of the current page
   const selected = new Set();
   const colFilter = new Map();   // column index -> selected filter key ('' = all)
   const filterCols = cols.map((c, i) => c.filter ? i : -1).filter((i) => i >= 0);
   let editing = !o.editMode;

   const $filter = $('<input type="search" class="input dl-filter" placeholder="Filter …">');
   const $count = $('<span class="dl-count dim">');
   const $bulk = $('<div class="dl-bulk">');
   const $tools = stickyBar($('<div class="toolbar dl-tools">')).append($filter, $count, $('<div class="dl-spacer">'), $bulk, ...(o.tools || []));
   const $thead = $('<thead>');
   const $tbody = $('<tbody>');
   const $table = $('<table class="dl">').append($thead, $tbody);
   const $pagers = [$('<div class="dl-pager">'), $('<div class="dl-pager dl-pager-bottom">')];
   $tools.find('.dl-count').after($pagers[0]);
   const $el = $('<div class="dl-wrap">').append($tools, $table, $pagers[1]);

   // column filter selects (in the header, on phones in the toolbar since there is no header)

   const $colSelects = new Map();   // column index -> [$select, ...]

   function filterSelect(i) {
      const $s = $('<select class="input dl-col-filter">').attr('title', cols[i].label || '')
         .on('click', (ev) => ev.stopPropagation())
         .on('change', function () {
            colFilter.set(i, this.value);
            $colSelects.get(i).forEach(($o) => $o.val(this.value));
            page = 0;
            renderBody();
         });

      $colSelects.set(i, [...($colSelects.get(i) || []), $s]);
      return $s;
   }

   function groupsOf(i, list = rows) {
      const counts = new Map();

      for (const r of list) {
         const k = String(cols[i].filter.value(r) ?? '');
         counts.set(k, (counts.get(k) || 0) + 1);
      }

      return [...counts].map(([k, n]) => ({ key: k, n, label: cols[i].filter.label?.(k) ?? k }))
         .sort((a, b) => a.label.localeCompare(b.label));
   }

   function fillFilterSelects() {
      for (const i of filterCols) {
         const groups = groupsOf(i);
         const cur = colFilter.get(i) || '';

         for (const $s of $colSelects.get(i))
            $s.empty().append($('<option value="">').text((cols[i].label || '') + ': ' + tr.filterAll),
               groups.map((g) => $('<option>').val(g.key).text(g.label + ' (' + g.n + ')')))
               .val(groups.some((g) => g.key === cur) ? cur : '');

         if (!groups.some((g) => g.key === cur))
            colFilter.set(i, '');
      }
   }

   for (const i of filterCols)
      $('<span class="dl-col-filter-m">').append(filterSelect(i)).insertAfter($filter);

   // edit mode: selection column, select all / select group, bulk actions

   const $groupSel = $('<select class="input dl-group-sel">').on('change', function () {
      const [i, key] = this.value.split('|');

      if (this.value !== '')
         textFiltered().filter((r) => String(cols[+i].filter.value(r) ?? '') === key).forEach((r) => selected.add(r));

      this.value = '';
      renderBody();
   });

   if (o.editMode) {
      const $selAll = $('<button type="button" class="btn">').append(icon('check'), $('<span>').text(tr.markAll))
         .on('click', () => { visibleRows().forEach((r) => selected.add(r)); renderBody(); });
      const $selNone = $('<button type="button" class="btn">').append(icon('close'), $('<span>').text(tr.markNone))
         .on('click', () => { selected.clear(); renderBody(); });
      const $edit = $('<button type="button" class="btn dl-edit-toggle">').append(icon('edit'), $('<span>').text(tr.edit))
         .on('click', () => {
            editing = !editing;
            selected.clear();
            $edit.toggleClass('active', editing).find('span').text(editing ? tr.editDone : tr.edit);
            renderBody();
         });

      $('<div class="dl-edit-tools">').append($selAll, filterCols.length ? $groupSel : null, $selNone).prependTo($bulk);
      $tools.append($edit);
   }

   if (sortCol < 0 && cols.some((c) => c.sort))
      sortCol = cols.findIndex((c) => c.sort);

   // header

   const $hr = $('<tr>');

   if (o.selectable)
      $hr.append($('<th class="dl-sel">').append($('<input type="checkbox" title="' + tr.markAll + '">')
         .on('change', function () {
            shown.forEach((r) => this.checked ? selected.add(r) : selected.delete(r));
            renderBody();
         })));

   cols.forEach((c, i) => {
      const $th = $('<th>').addClass(c.cls || '').append($('<span>').text(c.label || ''));

      if (c.filter)
         $th.addClass('dl-has-filter').append(filterSelect(i));

      if (c.sort)
         $th.addClass('dl-sortable').append(icon('chevron', 'dl-sort-icon')).on('click', () => {
            sortDir = sortCol === i ? -sortDir : 1;
            sortCol = i;
            page = 0;
            renderBody();
         });

      $hr.append($th);
   });

   $hr.append($('<th class="dl-actions">'));
   $thead.append($hr);

   // bulk actions

   for (const a of o.bulkActions || [])
      $('<button type="button" class="btn">').attr('title', a.label).append(icon(a.icon), $('<span>').text(a.label))
         .on('click', () => {
            const sel = rows.filter((r) => selected.has(r));
            sel.length && a.run(sel);
         })
         .appendTo($bulk);

   $filter.on('input', () => { page = 0; renderBody(); });

   if (o.onFilterEnter)
      $filter.attr('title', o.filterHint || null).on('keydown', (ev) => { if (ev.key === 'Enter') o.onFilterEnter($filter.val().trim()); });

   $tbody.on('click', 'tr', function (ev) {
      if ($(ev.target).closest('button, a, input, label').length)
         return;
      const row = this.dlRow;
      row && o.onRowClick?.(row, ev);
   });

   $tbody.on('change', '.dl-sel input', function () {
      const row = $(this).closest('tr')[0].dlRow;
      this.checked ? selected.add(row) : selected.delete(row);
      updateBulk();
   });

   function filterText(r) {
      if (o.filterText)
         return o.filterText(r);
      return cols.map((c) => c.sort ? c.sort(r) : '').join(' ');
   }

   function textFiltered() {
      const f = $filter.val().toLowerCase().trim();
      return f ? rows.filter((r) => String(filterText(r)).toLowerCase().includes(f)) : rows.slice();
   }

   function visibleRows() {
      let list = textFiltered();

      for (const [i, key] of colFilter)
         if (key !== '')
            list = list.filter((r) => String(cols[i].filter.value(r) ?? '') === key);

      if (sortCol >= 0 && cols[sortCol].sort) {
         const key = cols[sortCol].sort;
         list.sort((a, b) => {
            const va = key(a), vb = key(b);
            return (va > vb ? 1 : va < vb ? -1 : 0) * sortDir;
         });
      }

      return list;
   }

   function updateBulk() {
      const n = rows.filter((r) => selected.has(r)).length;
      $el.toggleClass('dl-editing', editing && !!o.selectable).toggleClass('dl-edit-off', !editing);
      $bulk.toggleClass('active', n > 0 || (o.editMode && editing)).find('> .btn').prop('disabled', n === 0);
      $bulk.attr('data-count', n || (o.editMode && editing ? '0' : ''));

      // group selection with the counts of the (text) filtered rows

      if (o.editMode && editing && filterCols.length) {
         const base = textFiltered();
         $groupSel.empty().append($('<option value="">').text(tr.markGroup),
            filterCols.flatMap((i) => groupsOf(i, base).map((g) => $('<option>').val(i + '|' + g.key).text(g.label + ' (' + g.n + ')'))));
      }
   }

   function renderPager(total) {
      const pages = o.pageSize ? Math.ceil(total / o.pageSize) : 1;

      for (const $p of $pagers) {
         $p.empty().toggle(pages > 1);

         if (pages <= 1)
            continue;

         const go = (n, $btn) => $btn.prop('disabled', n < 0 || n >= pages || n === page).on('click', () => {
            page = n;
            renderBody();

            // keep the list start in view when paging at the bottom

            if ($p.hasClass('dl-pager-bottom'))
               window.scrollTo({ top: Math.max(0, $el.offset().top - 120) });
         });

         const btn = (name, title, n, cls = '') => go(n, $('<button type="button" class="btn btn-icon btn-flat">').addClass(cls).attr({ title, 'aria-label': title }).html(icon(name)));

         $p.append(
            btn('first', tr.pager.first, 0),
            btn('left', tr.pager.prev, page - 1),
            $('<span class="dl-pg-info">').text(tr.pager.page + ' ' + (page + 1) + ' / ' + pages),
            btn('right', tr.pager.next, page + 1),
            btn('last', tr.pager.last, pages - 1));
      }
   }

   function renderBody() {
      const all = visibleRows();
      const pages = o.pageSize ? Math.max(1, Math.ceil(all.length / o.pageSize)) : 1;

      page = Math.min(Math.max(page, 0), pages - 1);
      const list = o.pageSize ? all.slice(page * o.pageSize, (page + 1) * o.pageSize) : all;
      shown = list;

      $tbody.empty();
      $thead.find('th').removeClass('sorted asc desc');

      if (sortCol >= 0)
         $thead.find('th').eq(sortCol + (o.selectable ? 1 : 0)).addClass('sorted ' + (sortDir > 0 ? 'asc' : 'desc'));

      if (!rows.length) {
         $tbody.append($('<tr class="dl-empty">').append($('<td>').attr('colspan', cols.length + 2).text(o.empty || tr.error.noData)));
         $count.text('');
         $tools.find('.dl-filter').toggle(false);
         renderPager(0);
         updateBulk();
         return;
      }

      $tools.find('.dl-filter').toggle(true);
      $count.text(all.length === rows.length ? rows.length + tr.entries : all.length + ' / ' + rows.length);
      renderPager(all.length);

      for (const r of list) {
         const $tr = $('<tr>').addClass(o.rowCls?.(r) || '');
         $tr[0].dlRow = r;

         if (o.selectable)
            $tr.append($('<td class="dl-sel">').append($('<input type="checkbox">').prop('checked', selected.has(r))));

         for (const c of cols) {
            const v = c.render ? c.render(r) : r[c.key];
            $tr.append($('<td>').addClass(c.cls || '').attr('data-label', c.label || '').append(v ?? ''));
         }

         $tr.append($('<td class="dl-actions">').append(o.rowActions?.(r) || []));
         $tbody.append($tr);
      }

      $thead.find('.dl-sel input').prop('checked', list.length > 0 && list.every((r) => selected.has(r)));
      updateBulk();
   }

   return {
      $el,
      setRows(newRows) {
         rows = newRows;
         selected.clear();
         fillFilterSelects();
         renderBody();
      },
      rows: () => rows
   };
}

// small helpers for row buttons

export function rowButton(name, title, fn) {
   return $('<button type="button" class="btn btn-icon btn-flat">').attr({ title, 'aria-label': title }).html(icon(name))
      .on('click', (ev) => { ev.stopPropagation(); fn(); });
}
