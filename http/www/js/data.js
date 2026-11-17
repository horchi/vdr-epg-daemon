// Shared data: profile/parameters, channels, VDRs

import { state } from './state.js';
import { get, post, mediaUrl } from './api.js';
import { toast, toastError } from './ui.js';
import { nowUnix } from './utils.js';
import { icon } from './icons.js';
import tr from '../lang/de.js';

// ---------------------------------------------------------------------------
// profile (data/parameters)
//   returns the names of changed parameters

export async function loadProfile() {
   const data = await get('data/parameters');
   const profile = state.profile;
   const changed = [];

   for (const p of data.parameters || []) {
      const value = p.type === 0 || p.type === 1 ? parseInt(p.value, 10) || 0 : p.value;   // ptNum, ptTime

      if (profile[p.name] !== value) {
         profile[p.name] = value;
         changed.push(p.name);
      }
   }

   if (state.timeOffset === null)
      state.timeOffset = (data.timezone - new Date().getTimezoneOffset() * 60) * 1000;

   if (!profile.minEventTime) {
      const d = new Date();
      profile.minEventTime = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000);
   }

   if (!profile.maxEventTime)
      profile.maxEventTime = profile.minEventTime + 8 * 24 * 60 * 60 - 60;

   if (changed.length)
      $(window).trigger('profile:changed', [changed]);

   return changed;
}

// ---------------------------------------------------------------------------
// channels

export async function loadChannels() {
   const data = await get('data/channels');
   const list = {};
   const order = [];

   $.each(data.channels || {}, (i, ch) => {
      const id = ch.channelid || i;
      ch.channelid = id;
      list[id] = ch;
      order.push(id);
   });

   state.channels = list;
   state.channelOrder = order;
   $(window).trigger('channels:loaded');
}

export const channelName = (id) => state.channels[id]?.name || id;

// channel badge: logo (or name) + switch button

// channel logo only (falls back to the name) – no switch button

export function channelLogo(id) {
   const ch = state.channels[id];
   const name = ch?.name || id;
   const logo = mediaUrl(state.profile.channelLogoPath, { maxW: 70, maxH: 50, id });

   if (!logo || !ch?.name)
      return $('<span class="channel-name">').text(name);

   return $('<img class="ch-logo" loading="lazy">').attr({ src: logo, alt: name, title: name })
      .on('error', function () { $(this).replaceWith($('<span class="channel-name">').text(name)); });
}

// opts.showName: show the name beside the logo (default: profile setting 'logoShowName'),
//   without a logo (or if it fails to load) the name is shown anyway

export function channelBadge(id, opts = {}) {
   const showName = opts.showName ?? state.profile.logoShowName == 1;
   const ch = state.channels[id];
   const name = ch?.name || id;
   const logo = mediaUrl(state.profile.channelLogoPath, { maxW: 70, maxH: 50, id });
   const $ch = $('<div class="channel">').attr('data-channel', id);

   if (logo && ch?.name) {
      $('<img loading="lazy">').attr({ src: logo, alt: name, title: name })
         .on('error', function () { $(this).replaceWith($('<span class="channel-name">').text(name)); })
         .appendTo($ch);

      if (showName)
         $ch.append($('<span class="channel-name">').text(name));
   }
   else
      $ch.append($('<span class="channel-name">').text(name));

   if (state.currentVdr?.uuid)
      $('<button type="button" class="btn btn-icon btn-flat ch-switch">')
         .attr('title', tr.pages.eventDetail.ch_switch).html(icon('tv'))
         .on('click', (ev) => { ev.stopPropagation(); switchChannel(id); })
         .appendTo($ch);

   return $ch;
}

// ---------------------------------------------------------------------------
// VDRs

export async function loadVdrs() {
   const data = await get('data/vdrs');
   state.vdrs = {};

   $.each(data.vdrs || {}, (uuid, vdr) => { state.vdrs[uuid] = { uuid, ...vdr }; });

   const current = state.currentVdr?.uuid;
   state.currentVdr = state.vdrs[current] || state.vdrs[state.profile.defaultVDRuuid]
      || Object.values(state.vdrs)[0] || null;

   $(window).trigger('vdrs:loaded');
}

export function selectVdr(uuid) {
   state.currentVdr = state.vdrs[uuid] || null;
   $(window).trigger('vdrs:changed');
}

export async function switchChannel(channelId) {
   const vdr = state.currentVdr;

   if (!vdr)
      return;

   try {
      const data = await get('data/channelswitch?' + new URLSearchParams({ uuid: vdr.uuid, channel: channelId }));
      toast(vdr.name + ': ' + (data.result?.message || 'OK'));
   }
   catch (e) { toastError(e); }
}

// switch timer ('V') for a future event

export async function createSwitchTimer(event) {
   const vdr = state.currentVdr;

   const data = await post('data/save-timer', {
      type: 'V', active: 1, vdruuid: vdr.uuid,
      eventid: event.id, channelid: event.channelid, title: event.title
   });

   if (data.result?.state != 200)
      throw new Error(data.result?.message || tr.error.common);

   toast(tr.dataSaved);
}

export const isRunningOrFuture = (e) => nowUnix() < e.starttime + e.duration;
