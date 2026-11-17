// Generic list: table on desktop, cards on phones (CSS), with filter, sort and selection
//
//   const list = dataList({
//      columns:  [{ key, label, render(row) -> jQuery|string, sort(row) -> value, cls, sortDefault: 1|-1 }],
//      rowCls(row), rowActions(row) -> [jQuery buttons], onRowClick(row, ev),
//      selectable: true, bulkActions: [{ icon, label, run(rows) }],
//      tools: [jQuery], empty: 'text', filterText(row) -> string
//   });
//   $parent.append(list.$el); list.setRows(rows);

import { icon } from '../icons.js';
import tr from '../../lang/de.js';

export function dataList(o) {
   const cols = o.columns;
   let rows = [];
   let sortCol = cols.findIndex((c) => c.sortDefault);
   let sortDir = sortCol >= 0 ? cols[sortCol].sortDefault : 1;
   const selected = new Set();

   const $filter = $('<input type="search" class="input dl-filter" placeholder="Filter …">');
   const $count = $('<span class="dl-count dim">');
   const $bulk = $('<div class="dl-bulk">');
   const $tools = $('<div class="toolbar dl-tools">').append($filter, $count, $('<div class="dl-spacer">'), $bulk, ...(o.tools || []));
   const $thead = $('<thead>');
   const $tbody = $('<tbody>');
   const $table = $('<table class="dl">').append($thead, $tbody);
   const $el = $('<div class="dl-wrap">').append($tools, $table);

   if (sortCol < 0 && cols.some((c) => c.sort))
      sortCol = cols.findIndex((c) => c.sort);

   // header

   const $hr = $('<tr>');

   if (o.selectable)
      $hr.append($('<th class="dl-sel">').append($('<input type="checkbox" title="' + tr.markAll + '">')
         .on('change', function () {
            visibleRows().forEach((r) => this.checked ? selected.add(r) : selected.delete(r));
            renderBody();
         })));

   cols.forEach((c, i) => {
      const $th = $('<th>').addClass(c.cls || '').text(c.label || '');

      if (c.sort)
         $th.addClass('dl-sortable').append(icon('chevron', 'dl-sort-icon')).on('click', () => {
            sortDir = sortCol === i ? -sortDir : 1;
            sortCol = i;
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

   $filter.on('input', () => renderBody());

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

   function visibleRows() {
      const f = $filter.val().toLowerCase().trim();
      let list = f ? rows.filter((r) => String(filterText(r)).toLowerCase().includes(f)) : rows.slice();

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
      $bulk.toggleClass('active', n > 0).find('.btn').prop('disabled', n === 0);
      $bulk.attr('data-count', n || '');
   }

   function renderBody() {
      const list = visibleRows();

      $tbody.empty();
      $thead.find('th').removeClass('sorted asc desc');

      if (sortCol >= 0)
         $thead.find('th').eq(sortCol + (o.selectable ? 1 : 0)).addClass('sorted ' + (sortDir > 0 ? 'asc' : 'desc'));

      if (!rows.length) {
         $tbody.append($('<tr class="dl-empty">').append($('<td>').attr('colspan', cols.length + 2).text(o.empty || tr.error.noData)));
         $count.text('');
         $tools.find('.dl-filter').toggle(false);
         updateBulk();
         return;
      }

      $tools.find('.dl-filter').toggle(true);
      $count.text(list.length === rows.length ? rows.length + tr.entries : list.length + ' / ' + rows.length);

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
