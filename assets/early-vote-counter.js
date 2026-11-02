/* Supreme Citizens 2026 early-voting participation counter.
   Snapshot: UF Election Lab, Nov. 1, 2026 at 12:33 p.m. ET.
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
  countdown.insertAdjacentElement('afterend',section);
})();
