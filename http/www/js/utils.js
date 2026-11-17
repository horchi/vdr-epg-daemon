// Time helpers – all times from the API are unix timestamps in the *server* time zone.
// state.timeOffset maps them to browser Date objects (same logic as the old UI).

import { state } from './state.js';

const pad = (n) => String(n).padStart(2, '0');

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

// '|a|b | c|' -> 'a, b, c'

export const pipeList = (s, sep = ', ') => (s || '').replace(/^\||\|$/g, '').split(/ ?\| ?/).filter(Boolean).join(sep);
