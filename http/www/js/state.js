// Global application state (shared between modules)

export const rights = {         // user mask, see lib/epgservice.h
   config:           2,
   configEdit:       4 + 2,
   configUsers:      8,
   timer:            64,
   timerEdit:        128 + 64,
   searchTimer:      256 + 64,
   searchTimerEdit:  512 + 256 + 128 + 64,
   fsk:              4096,
   recordings:       32768,
   recordingsEdit:   65536 + 32768,
   all:              4294967295
};

export const profileDefaults = {
   needLogin: -1,
   channelLogoPath: 'data/channellogo',
   eventImgPath: 'data/eventimg',
   movieMediaPath: 'data/moviemedia',
   serieImgPath: 'data/seriesmedia',
   movieActorPath: 'https://www.themoviedb.org/person/',
   serieSeasonPath: 'https://www.thetvdb.com/?tab=seasonall&id=',
   constabelEditPath: 'https://www.eplists.de/eplist.cgi?action=edit&back=&file=',
   constabelLinkPath: 'https://www.eplists.de/eplist.cgi?action=show_form_redir&linkname=',
   constabelLoginPath: '',
   minEventTime: 0,
   maxEventTime: 0,
   logoShowName: 0,
   defaultVDRuuid: '',
   quickTimes: '',
   startPage: 'menu_now'
};

export const state = {
   login: { user: '', session: '', rights: 0 },
   profile: { ...profileDefaults },
   timeOffset: null,               // ms between browser and server time zone
   channels: {},                   // channelid -> channel
   channelOrder: [],
   vdrs: {},                       // uuid -> vdr
   currentVdr: null,
   backTo: null                    // { hash, label, page } – link back to the page we came from (e.g. overview)
};

export const hasRight = (mask) => (state.login.rights & mask) === mask;
