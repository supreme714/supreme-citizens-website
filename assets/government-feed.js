/* Homepage priority placement: run from an external script already loaded by index.html. */
(function(){
  var countdown=document.querySelector('.election-countdown');
  var main=document.getElementById('main');
  if(countdown&&main&&main.firstElementChild!==countdown){
    main.insertBefore(countdown,main.firstElementChild);
  }
})();

/* Preserve the original government feed implementation unchanged. */
(function(){
  var script=document.createElement('script');
  script.src='assets/government-feed-original.js';
  script.defer=true;
  document.head.appendChild(script);
})();
