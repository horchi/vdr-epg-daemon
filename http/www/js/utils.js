// Time helpers – all times from the API are unix timestamps in the *server* time zone.
// state.timeOffset maps them to browser Date objects.

import { state } from './state.js';

const pad = (n) => String(n).padStart(2, '0');

// disk size of VDR (MB = MiB, 1024*1024 bytes, like VDR and 'df -h') -> '3,5 TB', '512 GB', '800 MB'

export function sizeText(mb) {
   const fmt = (v, d) => v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

   if (mb >= 1024 * 1024)
      return fmt(mb / 1024 / 1024, 1) + ' TB';

   if (mb >= 1024)
      return fmt(mb / 1024, mb >= 100 * 1024 ? 0 : 1) + ' GB';

   return fmt(mb || 0, 0) + ' MB';
}

export const now = () => new Date(Date.now() - (state.timeOffset || 0));
export const nowUnix = () => unixTime(now());
export const toDate = (t) => new Date(t * 1000 - (state.timeOffset || 0));
export const unixTime = (d) => d ? Math.floor((d.getTime() + (state.timeOffset || 0)) / 1000) : 0;

export function formatTime(t) {
   const d = toDate(t);
   return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

const fmtCache = {};

export function formatDate(t, style = 'short') {
   const opts = {
      short:  { weekday: 'short', day: '2-digit', month: '2-digit' },
      medium: { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' },
      long:   { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      full:   { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' },
      numeric: { day: '2-digit', month: '2-digit', year: '2-digit' }
   }[style];

   fmtCache[style] ??= new Intl.DateTimeFormat('de-DE', opts);
   return fmtCache[style].format(toDate(t));
}

export const formatDateTime = (t) => formatDate(t, 'full') + ' ' + formatTime(t);

// <input type="datetime-local"> value <-> unix time

export function toLocalInput(t) {
   const d = toDate(t);
   return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
      + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export const fromLocalInput = (v) => v ? unixTime(new Date(v)) : 0;

// progress of a running event in percent, null if not running

export function progressOf(start, duration) {
   const p = (nowUnix() - start) / duration * 100;
   return p > 0 && p <= 100 ? p : null;
}

// plain text -> escaped html with line breaks

export function textToHtml(s) {
   return $('<div>').text(s || '').html().replace(/\n/g, '<br>');
}

// short description as lead text, null if it is empty or already the beginning of one of the long texts

export function leadText(short, ...longs) {
   const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
   const head = norm(short).slice(0, 40);

   if (!head || longs.some((l) => norm(l).includes(head)))
      return null;

   return short.trim();
}

// '|a|b | c|' -> 'a, b, c'

export const pipeList = (s, sep = ', ') => (s || '').replace(/^\||\|$/g, '').split(/ ?\| ?/).filter(Boolean).join(sep);

// 'vor 5 Minuten' / 'in 3 Stunden' / 'vor 12 Tagen' (rounded), 'gerade eben' / 'gleich'

export function agoText(t) {
   const d = nowUnix() - t;
   const s = Math.abs(d);
   const [n, one, many] = s < 90 ? [0] : s < 5400 ? [Math.round(s / 60), 'Minute', 'Minuten']
      : s < 129600 ? [Math.round(s / 3600), 'Stunde', 'Stunden'] : [Math.round(s / 86400), 'Tag', 'Tage'];

   if (!n)
      return d >= 0 ? 'gerade eben' : 'gleich';

   // dative after 'vor' (Minuten, Stunden, Tagen), accusative after 'in' (Tage)

   return (d >= 0 ? 'vor ' : 'in ') + n + ' ' + (n === 1 ? one : d >= 0 && many === 'Tage' ? 'Tagen' : many);
}
