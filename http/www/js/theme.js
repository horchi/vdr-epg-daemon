// Theme: mode (auto / light / dark) and accent color – stored per device (localStorage)
//   index.html applies the stored values before the first paint (inline script), apply() does it at runtime

const KEY = 'epgd.theme';

export const accents = [
   { name: 'Orange', color: '' },              // default (CSS)
   { name: 'Blau', color: '#3b82f6' },
   { name: 'Grün', color: '#22a35a' },
   { name: 'Violett', color: '#8b5cf6' },
   { name: 'Rot', color: '#e5484d' },
   { name: 'Türkis', color: '#0ea5a4' },
   { name: 'Gelb', color: '#d4a106' }
];

export function getTheme() {
   try { return { mode: 'auto', accent: '', ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
   catch (e) { return { mode: 'auto', accent: '' }; }
}

export function setTheme(changes) {
   const t = { ...getTheme(), ...changes };
   try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) { }
   apply(t);
   $(window).trigger('theme:changed', [t]);
   return t;
}

export function apply(t = getTheme()) {
   const root = document.documentElement;

   t.mode === 'light' || t.mode === 'dark' ? root.setAttribute('data-theme', t.mode) : root.removeAttribute('data-theme');

   if (t.accent) {
      root.style.setProperty('--accent', t.accent);
      root.style.setProperty('--accent-text', contrastText(t.accent));
   }
   else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-text');
   }
}

// effective mode (auto resolved via the system preference)

export const isDark = (t = getTheme()) => t.mode === 'dark' || (t.mode === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);

export function cycleMode() {
   const order = ['auto', 'light', 'dark'];
   return setTheme({ mode: order[(order.indexOf(getTheme().mode) + 1) % order.length] });
}

function contrastText(hex) {
   const n = parseInt(hex.slice(1), 16);
   const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
   return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#1a1206' : '#ffffff';
}
