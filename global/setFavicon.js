(function(){
  'use strict';

  // Simple global favicon manager
  // Usage:
  //  - Configure `GlobalFavicon.pages` with entries { match: <string|RegExp|'*'>, favicon: '<url>' }
  //  - Call `GlobalFavicon.set(faviconUrl)` to override for current page
  //  - Call `GlobalFavicon.apply()` to (re)apply rules

  const DEFAULT_ICON = '/assets/svg/eve.svg'; // absolute preferred to work from any path
  const MASK_COLOR = '#00ff41';

  const pages = [
    // default: all pages use the same svg favicon
    { match: '*', favicon: DEFAULT_ICON }
  ];

  function resolveUrl(url){
    try{ return new URL(url, document.baseURI).href; }catch(e){ return url; }
  }

  function findMatch(path){
    for(const entry of pages){
      if(entry.match === '*') return entry;
      if(typeof entry.match === 'string' && entry.match === path) return entry;
      if(entry.match instanceof RegExp && entry.match.test(path)) return entry;
    }
    return null;
  }

  function setFavicon(url){
    if(!url) return;
    const href = resolveUrl(url);

    // update or create rel=icon
    let link = document.querySelector('link[rel~="icon"]');
    if(!link){ link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/svg+xml';
    link.href = href;

    // mask-icon for Safari pinned tabs
    let mask = document.querySelector('link[rel="mask-icon"]');
    if(!mask){ mask = document.createElement('link'); mask.rel = 'mask-icon'; document.head.appendChild(mask); }
    mask.href = href;
    mask.setAttribute('color', MASK_COLOR);

    // alternate ico fallback
    let alt = document.querySelector('link[rel="alternate icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if(!alt){ alt = document.createElement('link'); alt.rel = 'alternate icon'; document.head.appendChild(alt); }
    alt.type = 'image/x-icon';
    // keep an .ico fallback at /assets/ico/eve.ico if it exists
    alt.href = resolveUrl('/assets/ico/eve.ico');

    // force browser to re-request favicon (very small trick)
    // by appending a short cache-buster when debugging (only if param provided)
    return href;
  }

  function apply(){
    const path = location.pathname;
    const match = findMatch(path) || { favicon: DEFAULT_ICON };
    setFavicon(match.favicon || DEFAULT_ICON);
  }

  // Public API
  window.GlobalFavicon = {
    pages,
    set: (url)=>{ setFavicon(url); },
    setFor: (match, url)=>{ pages.push({ match, favicon: url }); },
    apply,
    DEFAULT_ICON
  };

  // Auto apply on DOM ready
  if(document.readyState === 'complete' || document.readyState === 'interactive') apply();
  else document.addEventListener('DOMContentLoaded', apply);

})();