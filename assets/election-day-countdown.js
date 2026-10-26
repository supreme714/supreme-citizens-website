/* Supreme Citizens Election Day countdown.
   Initializes the live countdown, keeps the banner directly below navigation,
   and advances nonpartisan civic messaging during the final week. */
(function(){
  var config={target:'2026-11-03T00:00:00-05:00',postElection:'2026-11-04T00:00:00-05:00'};
  window.SupremeCitizensElectionDay=config;

  function set(id,value){var el=document.getElementById(id);if(el)el.textContent=value;}

  function relocateCountdown(){
    var countdown=document.querySelector('.election-countdown');
    var main=document.getElementById('main');
    if(countdown&&main&&main.firstElementChild!==countdown){main.insertBefore(countdown,main.firstElementChild);}
  }

  function setMessage(html){
    var msg=document.getElementById('election-countdown-message');
    if(msg)msg.innerHTML=html;
  }

  function finalWeekMessage(days){
    if(days>=7)return 'Learn · Prepare · Participate · Vote<span>Explore the Election Day Initiative →</span>';
    if(days===6)return 'Learn Before You Vote<span>Review candidates, offices &amp; ballot questions →</span>';
    if(days===5)return 'Discuss With Respect<span>We do not have to vote alike to participate together →</span>';
    if(days===4)return 'Prepare Your Voting Plan<span>Know when, where &amp; how you will vote →</span>';
    if(days===3)return 'Help Someone Else Participate<span>Check in with family, friends &amp; neighbors →</span>';
    if(days===2)return 'Make Participation a Tradition<span>Our Family Participates · Our Community Participates →</span>';
    if(days===1)return 'Election Day Is Tomorrow<span>Be ready · Participate · Vote →</span>';
    return 'Election Day Is Almost Here<span>Learn · Prepare · Participate · Vote →</span>';
  }

  function updateElectionCountdown(){
    var target=new Date(config.target).getTime();
    var end=new Date(config.postElection).getTime();
    var now=Date.now();
    var diff=target-now;
    var clock=document.getElementById('election-countdown-clock');
    if(!clock)return;

    if(now>=target&&now<end){
      clock.innerHTML='<div class="count-box" style="min-width:260px"><strong style="font-size:1.25rem">ELECTION DAY IS TODAY</strong><span>PARTICIPATE · VOTE</span></div>';
      setMessage('Election Day Belongs to the People.<span>Voting information &amp; civic resources →</span>');
      return;
    }
    if(now>=end){
      clock.innerHTML='<div class="count-box" style="min-width:260px"><strong style="font-size:1.2rem">CITIZENSHIP CONTINUES</strong><span>AFTER ELECTION DAY</span></div>';
      setMessage('Stay Informed · Stay Involved · Stay Engaged<span>Follow results, certification &amp; the civic process →</span>');
      return;
    }

    var total=Math.max(0,Math.floor(diff/1000));
    var days=Math.floor(total/86400);
    set('count-days',days);
    set('count-hours',Math.floor((total%86400)/3600));
    set('count-minutes',Math.floor((total%3600)/60));
    set('count-seconds',total%60);
    setMessage(finalWeekMessage(days));
  }

  function init(){
    relocateCountdown();
    updateElectionCountdown();
    window.setInterval(updateElectionCountdown,1000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();