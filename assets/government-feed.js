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

  /* Congressional Activity Tracker: a horizontal mini-counter immediately above the three government cards. */
  var governmentGrid=document.querySelector('.government-grid');
  if(governmentGrid&&!document.getElementById('congressional-activity-mini')){
    var style=document.createElement('style');
    style.textContent='\
      .congress-activity-mini{margin:24px 0 28px;background:#002f73;color:#fff;border-top:5px solid #c79a26;border-bottom:5px solid #d71920;border-radius:10px;box-shadow:0 8px 24px rgba(0,47,115,.14);overflow:hidden}\
      .congress-activity-mini-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,.2)}\
      .congress-activity-mini-head h3{margin:0;color:#fff;font:700 clamp(1.15rem,2.2vw,1.55rem)/1.15 Georgia,serif}\
      .congress-activity-mini-kicker{display:block;color:#f1cf6a;font-size:.72rem;font-weight:900;letter-spacing:.1em;margin-bottom:4px}\
      .congress-activity-mini-source{font-size:.76rem;color:#dbe8ff;text-align:right}\
      .congress-activity-mini-grid{display:grid;grid-template-columns:repeat(3,1fr)}\
      .congress-activity-stat{text-align:center;padding:20px 14px;border-right:1px solid rgba(255,255,255,.18)}\
      .congress-activity-stat:last-child{border-right:0}\
      .congress-activity-label{display:block;color:#f1cf6a;font-size:.72rem;font-weight:900;letter-spacing:.09em}\
      .congress-activity-number{display:block;font-size:clamp(2rem,4.2vw,3.2rem);font-weight:900;line-height:1;margin:8px 0 5px}\
      .congress-activity-unit{display:block;font-size:.7rem;font-weight:900;letter-spacing:.08em}\
      .congress-activity-desc{display:block;margin-top:5px;font-size:.78rem;color:#dbe8ff}\
      .congress-activity-mini-foot{display:flex;justify-content:center;align-items:center;gap:16px;padding:12px 18px;background:rgba(255,255,255,.07);font-size:.76rem;text-align:center}\
      .congress-activity-mini-foot a{color:#f1cf6a;font-weight:900;text-decoration:none}\
      .congress-activity-mini-foot a:hover{text-decoration:underline}\
      @media(max-width:680px){.congress-activity-mini-head{display:block;text-align:center}.congress-activity-mini-source{text-align:center;margin-top:7px}.congress-activity-mini-grid{grid-template-columns:1fr}.congress-activity-stat{border-right:0;border-bottom:1px solid rgba(255,255,255,.18);padding:16px 12px}.congress-activity-stat:last-child{border-bottom:0}.congress-activity-mini-foot{display:block}.congress-activity-mini-foot a{display:block;margin-top:6px}}';
    document.head.appendChild(style);

    var tracker=document.createElement('section');
    tracker.className='congress-activity-mini';
    tracker.id='congressional-activity-mini';
    tracker.setAttribute('aria-labelledby','congress-activity-mini-title');
    tracker.innerHTML='\
      <div class="congress-activity-mini-head">\
        <div><span class="congress-activity-mini-kicker">THE PEOPLE\'S LEGISLATIVE SCOREBOARD</span><h3 id="congress-activity-mini-title">CONGRESSIONAL ACTIVITY TRACKER</h3></div>\
        <div class="congress-activity-mini-source">119th Congress · 2nd Session<br>Official source: Congress.gov</div>\
      </div>\
      <div class="congress-activity-mini-grid" aria-live="polite">\
        <div class="congress-activity-stat"><span class="congress-activity-label">HOUSE</span><strong class="congress-activity-number" id="house-intro-days">—</strong><span class="congress-activity-unit">DAYS</span><span class="congress-activity-desc">Since a House bill was last introduced</span></div>\
        <div class="congress-activity-stat"><span class="congress-activity-label">SENATE</span><strong class="congress-activity-number" id="senate-intro-days">—</strong><span class="congress-activity-unit">DAYS</span><span class="congress-activity-desc">Since a Senate bill was last introduced</span></div>\
        <div class="congress-activity-stat"><span class="congress-activity-label">BECAME LAW</span><strong class="congress-activity-number" id="law-enacted-days">—</strong><span class="congress-activity-unit">DAYS</span><span class="congress-activity-desc">Since federal legislation last became law</span></div>\
      </div>\
      <div class="congress-activity-mini-foot"><span id="congress-activity-status">Loading official congressional activity…</span><a href="congress.html">Explore Congress →</a></div>';
    governmentGrid.parentNode.insertBefore(tracker,governmentGrid);
  }
})();

/* Load the original three-branch government feed and the live congressional tracker. */
(function(){
  var feedScript=document.createElement('script');
  feedScript.src='assets/government-feed-original.js';
  feedScript.defer=true;
  document.head.appendChild(feedScript);

  var trackerScript=document.createElement('script');
  trackerScript.src='assets/congress-activity.js';
  trackerScript.defer=true;
  document.head.appendChild(trackerScript);
})();
