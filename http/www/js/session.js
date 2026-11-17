// Login / logout / session handling
//   key = md5(user + password), POST data/login { key } -> { login: { user, session, rights } }

import { state, rights } from './state.js';
import { post, onUnauthorized } from './api.js';
import { md5 } from './lib/md5.js';
import { dialog, toast } from './ui.js';
import tr from '../lang/de.js';

const trl = tr.pages.login;
const noLogin = { user: '', session: '', rights: 0 };

// key storage: sessionStorage for this tab, localStorage if "always logged in"
// (the old UI stored the persistent key in the 'login' cookie – still read as fallback)

const store = {
   get() {
      try { return sessionStorage.getItem('login') || localStorage.getItem('login') || cookieKey(); }
      catch (e) { return cookieKey(); }
   },
   set(key, persistent) {
      try {
         sessionStorage.setItem('login', key);
         persistent && localStorage.setItem('login', key);
      }
      catch (e) { }
   },
   clear() {
      try { sessionStorage.removeItem('login'); localStorage.removeItem('login'); } catch (e) { }
      document.cookie = 'login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
   }
};

function cookieKey() {
   return document.cookie.match(/(?:^|;\s*)login=([^;]+)/)?.[1] || null;
}

function setLogin(login) {
   const old = state.login;
   state.login = login;

   if (old.user !== login.user || old.rights !== login.rights)    // a silent re-login (new session) is no change
      $(window).trigger('login:changed', [old]);
}

async function loginWithKey(key) {
   const data = await post('data/login', { key }, { retry: false });
   return data.login?.session ? data.login : null;
}

// ensure a valid login; resolves when logged in (shows the login form if required)

export async function ensureLogin() {
   if (state.profile.needLogin == 0) {
      setLogin({ user: '', session: '', rights: rights.all });
      return true;
   }

   const key = store.get();

   if (key) {
      const login = await loginWithKey(key).catch(() => null);

      if (login) {
         setLogin(login);
         return true;
      }

      store.clear();
   }

   return showLoginForm();
}

export function showLoginForm() {
   return new Promise((resolve) => {
      const $form = $('<form class="form login-form">').append(
         $('<label>').text(trl.userName).append('<input name="user" autocomplete="username" required autofocus>'),
         $('<label>').text(trl.password).append('<input name="pass" type="password" autocomplete="current-password">'),
         $('<label class="check">').append('<input name="always" type="checkbox">', $('<span>').text(trl.loggedAlwaysIn))
      );

      const submit = async ($dlg) => {
         const f = $form[0];

         if (!f.user.value) {
            toast(tr.error.emptyField.replace('$field$', trl.userName), { error: true });
            return false;
         }

         const key = md5(f.user.value + f.pass.value);
         const login = await loginWithKey(key).catch(() => null);

         if (!login) {
            toast(trl.error, { error: true });
            f.pass.select();
            return false;
         }

         store.set(key, f.always.checked);
         setLogin(login);
         $dlg[0].close();
         resolve(true);
      };

      const $dlg = dialog({
         title: trl.label, content: $form, cls: 'dlg-login', closable: false,
         buttons: [{ text: trl.label, primary: true, click: ($d) => { submit($d); return false; } }]
      });

      $form.on('submit', (ev) => { ev.preventDefault(); submit($dlg); });
      $form.append('<button type="submit" hidden>');
   });
}

export async function logout() {
   if (state.login.session)
      await post('data/login', { key: '' }, { retry: false }).catch(() => {});

   store.clear();
   setLogin({ ...noLogin });
   toast(trl.logoutMessage);
}

// on 401: try to re-login silently with the stored key, else ask

let pending = null;

onUnauthorized(() => {
   if (state.profile.needLogin == 0)
      return Promise.resolve(false);

   state.login.session = '';
   return pending ??= ensureLogin().finally(() => { pending = null; });
});
