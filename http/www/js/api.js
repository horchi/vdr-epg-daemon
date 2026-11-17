// Thin fetch() wrapper for the epghttpd JSON API (/data/...)

import { state } from './state.js';
import tr from '../lang/de.js';

export class ApiError extends Error {
   constructor(status, message) {
      super(message);
      this.status = status;
   }
}

let unauthorizedHandler = null;

// called on HTTP 401, must resolve true if a (re)login succeeded

export function onUnauthorized(fn) {
   unauthorizedHandler = fn;
}

// absolute url incl. session prefix; data/... -> /sid<session>/data/...

export function apiUrl(path) {
   return '/' + (state.login.session ? 'sid' + state.login.session + '/' : '') + path;
}

// url for media (images) – these need no session

export function mediaUrl(path, params) {
   if (!path)
      return null;

   const base = /^(https?:)?\//.test(path) ? path : '/' + path;
   return base + '?' + new URLSearchParams(params).toString();
}

// <img> with fallbacks – tries the urls in order; if none loads the img is
// replaced by $fallback (or removed). Returns null if there is no url at all.

export function fallbackImg(urls, attrs = {}, $fallback = null) {
   const list = urls.filter(Boolean);
   let i = 0;

   if (!list.length)
      return null;

   return $('<img alt="">').attr(attrs).attr('src', list[0]).on('error', function () {
      if (++i < list.length)
         this.src = list[i];
      else if ($fallback)
         $(this).replaceWith($fallback);
      else
         $(this).remove();
   });
}

export async function request(path, { method = 'GET', body, as = 'json', retry = true } = {}) {
   const opts = { method, cache: 'no-store', headers: {} };

   if (body !== undefined) {
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json; charset=utf-8';
   }

   let res;

   try {
      res = await fetch(apiUrl(path), opts);
   }
   catch (e) {
      throw new ApiError(0, tr.error.serverNotResponse);
   }

   if (res.status === 401 && retry && unauthorizedHandler && await unauthorizedHandler())
      return request(path, { method, body, as, retry: false });

   const text = await res.text();
   let data = null;

   if (as === 'json') {
      try { data = text ? JSON.parse(text) : {}; }
      catch (e) { data = null; }
   }

   if (!res.ok) {
      const msg = res.status === 403 ? tr.error.forbidden
                : res.status === 501 ? tr.error.notImplemented
                : data?.result?.message || text || tr.error.serverNotResponse;
      throw new ApiError(res.status, msg);
   }

   if (as === 'json' && data === null)
      throw new ApiError(res.status, tr.error.common);

   return as === 'json' ? data : text;
}

export const get = (path, opts) => request(path, opts);

// query string with %20 for blanks (libmicrohttpd does not decode '+')

export const qs = (params) => Object.entries(params).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v ?? '')).join('&');
export const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body });

// fire & forget server side logging (like the old UI)

export function log(message, level = 0) {
   console.error(message);
   fetch(apiUrl('data/log?' + new URLSearchParams({ level, message })), { cache: 'no-store' }).catch(() => {});
}
