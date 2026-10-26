/* Supreme Citizens Election Day countdown.
   Initializes the live countdown and moves the countdown banner directly
   below the site header/navigation so it remains prominent at the top of
   the homepage without changing the source-document fallback position. */
(function(){
  var config={target:'2026-11-03T00:00:00-05:00',postElection:'2026-11-04T00:00:00-05:00'};
  window.SupremeCitizensElectionDay=config;

  function set(id,value){var el=document.getElementById(id);if(el)el.textContent=value;}

  function relocateCountdown(){
    var countdown=document.querySelector('.election-countdown');
    var header=document.querySelector('.site-header');
    var main=document.getElementById('main');
    if(countdown&&header&&main&&main.firstElementChild!==countdown){
      main.insertBefore(countdown,main.firstElementChild);
    }
  }

  function updateElectionCountdown(){
    var target=new Date(config.target).getTime();
    var end=new Date(config.postElection).getTime();
    var now=Date.now();
    var diff=target-now;
    var msg=document.getElementById('election-countdown-message');
    var clock=document.getElementById('election-countdown-clock');
    if(!clock)return;
    if(now>=target&&now<end){
      clock.innerHTML='<div class="count-box" style="min-width:260px"><strong style="font-size:1.25rem">ELECTION DAY IS TODAY</strong><span>PARTICIPATE · VOTE</span></div>';
      if(msg)msg.innerHTML='Election Day Belongs to the People.<span>Voting information &amp; civic resources →</span>';
      return;
    }
    if(now>=end){
      clock.innerHTML='<div class="count-box" style="min-width:260px"><strong style="font-size:1.2rem">CITIZENSHIP CONTINUES</strong><span>AFTER ELECTION DAY</span></div>';
      if(msg)msg.innerHTML='Stay informed · Stay involved · Stay engaged<span>Follow the civic process →</span>';
      return;
    }
    var total=Math.max(0,Math.floor(diff/1000));
    set('count-days',Math.floor(total/86400));
    set('count-hours',Math.floor((total%86400)/3600));
    set('count-minutes',Math.floor((total%3600)/60));
    set('count-seconds',total%60);
  }

  function init(){
    relocateCountdown();
    updateElectionCountdown();
    window.setInterval(updateElectionCountdown,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();