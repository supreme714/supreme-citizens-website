/* Official election results directory with explicitly dated state-source snapshot.
   This does not calculate a national total or imply live/certified data. */
(function(){
 const parent=document.getElementById('congressional-activity-mini');
 if(!parent || document.getElementById('election-results-official'))return;
 const section=document.createElement('section');
 section.id='election-results-official';section.setAttribute('aria-labelledby','official-election-heading');
 section.innerHTML=`
 <div class="official-election-head">
  <div><small>OFFICIAL STATE ELECTION SOURCES · NOVEMBER 3, 2026</small>
   <h3 id="official-election-heading">Election Vote Totals &amp; Certification Updates</h3></div>
  <span class="official-election-state">Results are unofficial until certified</span>
 </div>
 <p class="official-election-lede">Election officials report and certify results state by state. Explore vote counts, turnout, House and Senate results, and certification updates from the responsible election authorities. A partial tally is not a certified nationwide vote total.</p>
 <div class="official-election-grid">
  <div><strong>Oregon — official state snapshot</strong><span class="official-election-large">1,920,323</span><span>Ballots counted · 61.76% reported turnout</span><small>Source updated Nov 9, 2026, 10:15 PM Pacific · <a href="https://results.oregonvotes.gov/" target="_blank" rel="noopener noreferrer">Verify current Oregon numbers</a></small></div>
  <div><strong>Connecticut — election results</strong><span class="official-election-cta">Official election portal</span><span>State election results and updates</span><small><a href="https://portal.ct.gov/SOTS/" target="_blank" rel="noopener noreferrer">Connecticut Secretary of the State</a></small></div>
  <div><strong>Minnesota — election results</strong><span class="official-election-cta">Official election portal</span><span>State and federal contest totals</span><small><a href="https://electionresults.sos.mn.gov/201" target="_blank" rel="noopener noreferrer">Minnesota election results</a></small></div>
 </div>
 <p class="official-election-foot"><a href="https://www.eac.gov/where-do-i-find-election-results" target="_blank" rel="noopener noreferrer">Find results for every state · U.S. Election Assistance Commission</a> <span>·</span> <a href="https://www.fec.gov/introduction-campaign-finance/election-results-and-voting-information/" target="_blank" rel="noopener noreferrer">Federal Election Commission election information</a></p>
 <p class="official-election-warning">Election results are continually revised during counting and canvassing. The Oregon figure is a dated snapshot, not an automatically refreshed live count. We will not publish unsupported national totals or projections as official results.</p>`;
 const style=document.createElement('style');
 style.textContent=`
 #election-results-official{margin:28px auto;background:#fff;border:1px solid #d7e0ec;border-top:5px solid #b78c28;border-radius:12px;padding:25px;box-shadow:0 8px 24px #062c6412}
 .official-election-head{display:flex;justify-content:space-between;gap:18px;align-items:center}.official-election-head small{font-size:.72rem;letter-spacing:.1em;font-weight:900;color:#b21c28}
 .official-election-head h3{font:700 clamp(1.4rem,2.8vw,2rem)/1.15 Georgia,serif;color:#003b8f;margin:6px 0}
 .official-election-state{font-size:.8rem;color:#843c13;font-weight:750;background:#fff3df;padding:8px 12px;border-radius:7px}
 .official-election-lede{max-width:980px;line-height:1.65;color:#3c5067;margin:16px 0 22px}
 .official-election-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
 .official-election-grid>div{border:1px solid #dde4ee;border-radius:9px;background:#f7f9fc;padding:18px;display:flex;flex-direction:column;gap:7px;min-width:0}
 .official-election-grid strong{font-size:.96rem;color:#003b8f}.official-election-grid span{font-size:.84rem;color:#46576a}
 .official-election-grid .official-election-large{font-size:2rem;color:#003b8f;font-weight:900;line-height:1.15}
 .official-election-grid .official-election-cta{font-size:1.14rem;font-weight:850;color:#003b8f}
 .official-election-grid small{line-height:1.55;color:#516277}.official-election-grid a,.official-election-foot a{color:#003b8f;font-weight:750;text-decoration:underline;text-underline-offset:3px}
 .official-election-foot{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 12px;font-size:.86rem;line-height:1.5}
 .official-election-warning{color:#58677b;font-size:.8rem;line-height:1.55;margin-bottom:0}
 @media(max-width:800px){.official-election-grid{grid-template-columns:1fr}.official-election-head{display:block}.official-election-state{display:inline-block;margin-top:10px}#election-results-official{padding:18px}}
 `;
 document.head.appendChild(style);
 parent.insertAdjacentElement('afterend',section);
})();
