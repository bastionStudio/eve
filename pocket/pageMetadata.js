(function(){
  'use strict';

  function upsertMetaByName(name, content){
    if(!content) return;
    var el = document.querySelector('meta[name="'+name+'"]');
    if(!el){
      el = document.createElement('meta');
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  }

  function upsertMetaByProperty(prop, content){
    if(!content) return;
    var el = document.querySelector('meta[property="'+prop+'"]');
    if(!el){
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.content = content;
  }

  function applyPageMetadata(){
    var metaEl = document.getElementById('page-metadata');
    if(!metaEl) return;
    try{
      var cfg = JSON.parse(metaEl.textContent || '{}');
      if(cfg.title) document.title = cfg.title;
      if(cfg.description) upsertMetaByName('description', cfg.description);

      if(cfg['og:description']) upsertMetaByProperty('og:description', cfg['og:description']);
    }catch(e){
      console.warn('pageMetadata: failed to parse #page-metadata JSON', e);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyPageMetadata);
  } else {
    applyPageMetadata();
  }

})();
