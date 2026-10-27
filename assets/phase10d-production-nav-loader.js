/* Phase 10D production activation loader */
(function(){
  if(document.querySelector('script[data-phase10c-nav]')) return;
  const script=document.createElement('script');
  script.src='assets/phase10c-unified-nav.js';
  script.defer=true;
  script.dataset.phase10cNav='true';
  document.head.appendChild(script);
})();
