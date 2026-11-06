/* Supreme Citizens 2026 early-voting participation counter.
   Historical snapshot: UF Election Lab, Nov. 1, 2026 at 12:33 p.m. ET.
   The counter is intentionally framed as participation data, not election results. */
(function(){
  if(!(location.pathname==='/'||/(^|\/)index\.html$/.test(location.pathname))) return;
  if(document.getElementById('early-vote-participation')) return;
  var countdown=document.querySelector('.election-countdown');
  if(!countdown) return;

  var style=document.createElement('style');
  style.textContent=`
  .early-vote-participation{background:#fff;border-bottom:1px solid #d9dee5;padding:34px 0;color:#23364f}
  .early-vote-shell{border:1px solid #d7dfe8;border-top:6px solid #c79a26;border-radius:14px;overflow:hidden;box-shadow:0 10px 28px rgba(0,47,115,.10);background:#fff}
  .early-vote-head{background:#003b8f;color:#fff;text-align:center;padding:20px 22px 17px}
  .early-vote-kicker{display:block;color:#f1cf6a;font-size:.76rem;font-weight:900;letter-spacing:.13em;margin-bottom:5px}
  .early-vote-head h2{color:#fff;margin:0;font:700 clamp(1.5rem,3vw,2.15rem)/1.1 Georgia,serif}
  .early-vote-main{text-align:center;padding:25px 18px 18px}
  .early-vote-total{display:block;color:#003b8f;font-size:clamp(3rem,8vw,5.4rem);font-weight:950;line-height:.95;letter-spacing:-.04em}
  .early-vote-total-label{display:block;margin-top:8px;color:#a71b23;font-size:.82rem;font-weight:950;letter-spacing:.12em}
  .early-vote-grid{display:grid;grid-template-columns:repeat(3,1fr);max-width:860px;margin:22px auto 0;border-top:1px solid #dce3eb;border-bottom:1px solid #dce3eb}
  .early-vote-stat{padding:16px 12px;border-right:1px solid #dce3eb}.early-vote-stat:last-child{border-right:0}
  .early-vote-stat strong{display:block;color:#003b8f;font-size:clamp(1.35rem,3vw,2rem)}.early-vote-stat span{display:block;margin-top:3px;font-size:.72rem;font-weight:850;letter-spacing:.07em;color:#526174}
  .early-vote-message{font-weight:850;color:#003b8f;margin:18px 0 4px}.early-vote-message span{color:#a71b23}
  .early-vote-meta{text-align:center;padding:0 18px 21px;font-size:.76rem;line-height:1.55;color:#607086}
  .early-vote-meta a{color:#003b8f;font-weight:850}.early-vote-disclaimer{display:block;margin-top:5px}
  @media(max-width:680px){.early-vote-participation{padding:24px 0}.early-vote-grid{grid-template-columns:1fr}.early-vote-stat{border-right:0;border-bottom:1px solid #dce3eb}.early-vote-stat:last-child{border-bottom:0}.early-vote-total{font-size:clamp(2.8rem,16vw,4.5rem)}}`;
  document.head.appendChild(style);

  var section=document.createElement('section');
  section.className='early-vote-participation';section.id='early-vote-participation';section.setAttribute('aria-labelledby','early-vote-title');
  section.innerHTML=`<div class="wrap"><div class="early-vote-shell">
    <header class="early-vote-head"><span class="early-vote-kicker">AMERICA IS VOTING · 2026</span><h2 id="early-vote-title">Early Voting Participation</h2></header>
    <div class="early-vote-main" aria-live="polite"><strong class="early-vote-total">53.6 MILLION+</strong><span class="early-vote-total-label">EARLY BALLOTS CAST NATIONWIDE</span>
      <div class="early-vote-grid"><div class="early-vote-stat"><strong>29.8M+</strong><span>IN-PERSON EARLY VOTES</span></div><div class="early-vote-stat"><strong>23.9M+</strong><span>MAIL BALLOTS RETURNED</span></div><div class="early-vote-stat"><strong>NOV. 3</strong><span>ELECTION DAY 2026</span></div></div>
      <p class="early-vote-message">Prepare today. Make your voice heard. <span>We the People Are Not an Audience.</span></p>
    </div>
    <div class="early-vote-meta">Source: <a href="https://election.lab.ufl.edu/early-vote/2026-early-voting/" target="_blank" rel="noopener noreferrer">University of Florida Election Lab — 2026 Early Voting Tracker</a> · Snapshot updated Nov. 1, 2026 at 12:33 p.m. ET.
      <span class="early-vote-disclaimer">Preliminary participation totals. States report on different schedules. These figures show ballots cast/returned, not candidate selections or election results.</span></div>
  </div></div>`;
  // After Election Day, keep the verified early-vote snapshot but never imply it is a final national tally.
  var electionOver=Date.now()>=new Date('2026-11-04T00:00:00-05:00').getTime();
  if(electionOver){
    section.querySelector('.early-vote-kicker').textContent='ELECTION 2026 · THE PEOPLE PARTICIPATED';
    section.querySelector('#early-vote-title').textContent='2026 Election Participation';
    section.querySelector('.early-vote-total-label').textContent='REPORTED EARLY BALLOTS · NOV. 1 SNAPSHOT';
    section.querySelector('.early-vote-grid').lastElementChild.innerHTML='<strong>ONGOING</strong><span>CIVIC PARTICIPATION</span>';
    section.querySelector('.early-vote-message').innerHTML='Election Day has passed. <span>Citizenship continues every day.</span>';
    section.querySelector('.early-vote-disclaimer').textContent='Historical early-voting snapshot from Nov. 1, not a final 2026 nationwide vote count. Election Day and later-counted ballots are not included; state reporting and certification continue.';
  }
  if(electionOver){
    section.querySelector('.early-vote-total').textContent='124.33 MILLION';
    section.querySelector('.early-vote-total-label').textContent='ESTIMATED BALLOTS CAST NATIONWIDE';
    var stats=section.querySelectorAll('.early-vote-stat');
    stats[0].innerHTML='<strong>49.42%</strong><span>ESTIMATED ELIGIBLE-VOTER TURNOUT</span>';
    stats[1].innerHTML='<strong>PRELIMINARY</strong><span>NOT YET CERTIFIED</span>';
    stats[2].innerHTML='<strong>2026</strong><span>GENERAL ELECTION</span>';
    section.querySelector('.early-vote-meta').innerHTML='Source: <a href="https://election.lab.ufl.edu/2026-general-election-turnout/" target="_blank" rel="noopener noreferrer">University of Florida Election Lab — 2026 General Election Turnout</a> · Source updated Nov. 4, 2026 at 9:50 p.m. ET.<span class="early-vote-disclaimer">Estimated total ballots counted and voting-eligible population turnout. Not final or certified; totals may change as remaining ballots are counted and states certify results.</span>';
  }
  countdown.insertAdjacentElement('afterend',section);
  // Third-party results widget updates independently as race calls change.
  var congress=document.createElement('section');
  congress.id='congress-election-results-2026';
  congress.setAttribute('aria-labelledby','congress-election-results-title');
  congress.style.cssText='background:#f4f7fc;padding:32px 0;border-bottom:1px solid #d9dee5';
  congress.innerHTML='<div class="wrap"><div style="max-width:980px;margin:auto;text-align:center"><p class="eyebrow">2026 CONGRESSIONAL ELECTIONS</p><h2 id="congress-election-results-title" style="color:#003b8f;font-family:Georgia,serif">House &amp; Senate Election Results</h2><p>Seats won by party, majority thresholds, and outstanding races. Live race calls are unofficial until certified by the states.</p><iframe src="https://polling-desk.com/embed/control" title="Live 2026 U.S. House and Senate seat results from Polling Desk" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" style="display:block;width:100%;max-width:520px;height:250px;border:0;margin:18px auto" ></iframe><p style="font-size:.8rem;color:#526174">Source: <a href="https://polling-desk.com/results" target="_blank" rel="noopener noreferrer">Polling Desk / civicAPI</a>. The display refreshes as the provider updates its race calls. A race call is not official certification.</p></div></div>';
  section.insertAdjacentElement('afterend',congress);
  // Certification is a separate legal process from media projections.
  // Do not infer certification from a live results widget.
  var certification=document.createElement('section');
  certification.id='congress-certification-2026';
  certification.setAttribute('aria-labelledby','congress-certification-title');
  certification.style.cssText='background:#fff;padding:26px 0 38px;border-bottom:1px solid #d9dee5';
  certification.innerHTML=`<div class="wrap"><div style="max-width:980px;margin:auto;border:1px solid #d7dfe8;border-top:5px solid #c79a26;border-radius:12px;padding:22px">
    <p class="eyebrow">OFFICIAL RESULTS &amp; CERTIFICATION</p>
    <h2 id="congress-certification-title" style="color:#003b8f;font:700 clamp(1.35rem,2.7vw,2rem) Georgia,serif;margin:8px 0">2026 Congressional Certification Status</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin:18px 0">
      <article style="background:#f4f7fc;border-radius:9px;padding:16px"><strong style="color:#003b8f">U.S. House</strong><p style="margin:8px 0;font-weight:700">Certification: Not yet independently verified</p><small>Each state's official congressional election returns must be checked.</small></article>
      <article style="background:#f4f7fc;border-radius:9px;padding:16px"><strong style="color:#003b8f">U.S. Senate</strong><p style="margin:8px 0;font-weight:700">Certification: Not yet independently verified</p><small>Certification applies to Senate contests held in 2026, not holdover seats.</small></article>
    </div>
    <p style="font-size:.9rem;line-height:1.6">Race calls and party seat projections are unofficial. States certify election results on different schedules; recounts, contests, and outstanding ballots may affect final totals. This panel does not automatically determine certification and will remain unverified until official records are checked.</p>
    <p style="font-size:.85rem"><a href="https://www.nass.org/can-I-vote" target="_blank" rel="noopener noreferrer">Find state election officials</a> · <a href="https://www.house.gov/" target="_blank" rel="noopener noreferrer">U.S. House</a> · <a href="https://www.senate.gov/" target="_blank" rel="noopener noreferrer">U.S. Senate</a></p>
    </div></div>`;
  congress.insertAdjacentElement('afterend',certification);


})();
