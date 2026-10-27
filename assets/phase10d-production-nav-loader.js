/* Phase 10D production activation loader */
(function(){
  if(document.querySelector('script[data-phase10c-nav],script[data-phase10d-nav]')) return;
  const script=document.createElement('script');
  script.src='assets/phase10c-unified-nav.js';
  script.defer=true;
  script.dataset.phase10dNav='true';
  document.head.appendChild(script);
})();
