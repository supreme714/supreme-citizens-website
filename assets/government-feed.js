/* Homepage priority placement: run from an external script already loaded by index.html. */
(function(){
  var countdown=document.querySelector('.election-countdown');
  var main=document.getElementById('main');
  if(countdown&&main&&main.firstElementChild!==countdown){
    main.insertBefore(countdown,main.firstElementChild);
  }

  /* Strengthen the Election Day call to action without changing the countdown layout. */
  if(countdown){
    var message=countdown.querySelector('.election-countdown-message');
    if(message){
      var existing=message.querySelector('span');
      if(existing){
        existing.textContent='Explore the Election Day Initiative →';
        existing.setAttribute('role','button');
        existing.setAttribute('aria-label','Explore the Election Day Initiative');
        existing.style.display='inline-block';
        existing.style.marginTop='10px';
        existing.style.padding='9px 15px';
        existing.style.border='2px solid #f1cf6a';
        existing.style.borderRadius='999px';
        existing.style.background='#f1cf6a';
        existing.style.color='#002f73';
        existing.style.fontWeight='900';
        existing.style.lineHeight='1.2';
        existing.style.boxShadow='0 3px 10px rgba(0,0,0,.16)';
      }
    }
  }
})();

/* Preserve the original government feed implementation unchanged. */
(function(){
  var script=document.createElement('script');
  script.src='assets/government-feed-original.js';
  script.defer=true;
  document.head.appendChild(script);
})();
