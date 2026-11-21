// Small inline SVG icon set (24x24, stroke based) – replaces the fontello font

const paths = {
   record:  '<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="9.5"/>',
   tv:      '<rect x="2.5" y="5" width="19" height="13" rx="2"/><path d="M8 21h8M8.5 1.5 12 5l3.5-3.5"/>',
   prev:    '<path d="M11 18 5 12l6-6M19 18l-6-6 6-6"/>',
   next:    '<path d="M13 6l6 6-6 6M5 6l6 6-6 6"/>',
   left:    '<path d="m15 18-6-6 6-6"/>',
   right:   '<path d="m9 6 6 6-6 6"/>',
   first:   '<path d="m17 18-6-6 6-6M7 6v12"/>',
   last:    '<path d="m7 6 6 6-6 6M17 6v12"/>',
   close:   '<path d="M6 6l12 12M18 6 6 18"/>',
   repeat:  '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
   clock:   '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
   search:  '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5"/>',
   logout:  '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
   user:    '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
   menu:    '<path d="M3 6h18M3 12h18M3 18h18"/>',
   edit:    '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
   link:    '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
   film:    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M3 12h18"/>',
   now:     '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
   timeline: '<path d="M3 5h18M3 19h18"/><rect x="3" y="8.5" width="8" height="3" rx="1"/><rect x="13" y="8.5" width="8" height="3" rx="1"/><rect x="6" y="13" width="11" height="3" rx="1"/>',
   timer:   '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
   gear:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
   help:    '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
   chevron: '<path d="m9 6 6 6-6 6"/>',
   trash:   '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
   plus:    '<path d="M12 5v14M5 12h14"/>',
   refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
   check:   '<path d="m5 12 5 5 9-10"/>',
   alert:   '<path d="M12 3 2 20h20L12 3zM12 10v4M12 17.5v.01"/>',
   wait:    '<circle cx="12" cy="12" r="9.5" stroke-dasharray="3 3"/><path d="M12 7v5l3 2"/>',
   copy:    '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
   swap:    '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
   folder:  '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
   info:    '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.01"/>',
   mail:    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
   down:    '<path d="m6 9 6 6 6-6"/>',
   remote:  '<rect x="7" y="2" width="10" height="20" rx="3"/><circle cx="12" cy="8" r="2"/><path d="M10 13.5h.01M14 13.5h.01M10 17h.01M14 17h.01"/>',
   play:    '<path d="M7 4v16l13-8z"/>',
   live:    '<circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2"/>',
   disk:    '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
   home:    '<path d="M3 11 12 3l9 8M5 9.5V20h5v-6h4v6h5V9.5"/>',
   select:  '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/>',
   sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
   moon:    '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
   contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'
};

export function icon(name, cls = '') {
   return '<svg class="icon ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"'
      + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || '') + '</svg>';
}

// <button> with icon (+ optional label)

export function iconButton(name, title, label = '') {
   return $('<button type="button" class="btn">')
      .toggleClass('btn-icon', !label)
      .attr({ title, 'aria-label': title })
      .append(icon(name), label ? $('<span>').text(label) : null);
}
