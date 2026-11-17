// Page "Hilfe" – table of contents + sections; helpButton(topic) for context help elsewhere

import { dialog } from '../ui.js';
import { icon } from '../icons.js';
import { sections } from '../../lang/help.de.js';
import tr from '../../lang/de.js';

export function render($content, params = {}) {
   const $toc = $('<nav class="help-toc">').append(sections.map((s) =>
      $('<a>').attr('href', '#help?t=' + s.id).text(s.title)));

   const $body = $('<div class="help-body">').append(sections.map((s) =>
      $('<section class="card help-section">').attr('id', 'help-' + s.id).append($('<h2>').text(s.title), $('<div>').html(s.html))));

   $content.empty().append($('<section class="page page-help">').append($toc, $body));

   // history / todo are loaded on first open

   $body.find('details.help-file').one('toggle', async function () {
      const $pre = $(this).find('pre').text('…');

      try {
         const res = await fetch($(this).attr('data-src'), { cache: 'no-cache' });
         if (!res.ok) throw new Error(res.status);
         $pre.text((await res.text()).replace(/^#.*\n/gm, '').trim());
      }
      catch (e) { $pre.text(tr.error.noData); }
   });

   if (params.t)
      requestAnimationFrame(() => {
         const el = document.getElementById('help-' + params.t) || document.getElementById('h_' + params.t);
         if (el) {
            el.scrollIntoView({ block: 'start' });
            window.scrollBy(0, -70);
            $(el).addClass('flash');
         }
      });

   $toc.find('a').filter((i, a) => a.getAttribute('href') === '#help?t=' + params.t).addClass('active');
}

// small '?' button showing a help topic (id as in the help sections, e.g. 'sTNameMode') in a dialog

export function helpButton(topic) {
   return $('<button type="button" class="btn btn-icon btn-flat help-btn">').attr('title', tr.menu.help).html(icon('help'))
      .on('click', (ev) => {
         ev.preventDefault();
         ev.stopPropagation();

         const $all = $('<div>').append(sections.map((s) => s.html));
         const $topic = $all.find('#h_' + topic);
         const section = sections.find((s) => s.id === topic);

         dialog({
            title: tr.menu.help, cls: 'dlg-help',
            content: $('<div class="help-popup">').append(
               $topic.length ? $topic.children().clone() : section ? $(section.html) : $('<p>').text('Keine Hilfe vorhanden.'),
               $('<p class="small">').append($('<a>').attr('href', '#help?t=' + (section ? topic : sectionOf(topic))).text('Ganze Hilfe öffnen …')
                  .on('click', function () { $(this).closest('dialog')[0].close(); })))
         });
      });
}

function sectionOf(topic) {
   return sections.find((s) => s.html.includes('id="h_' + topic + '"'))?.id || 'intro';
}
