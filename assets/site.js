document.getElementById('year').textContent = new Date().getFullYear();
const btn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if(btn && nav){
  btn.addEventListener('click',()=> {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

const visitorCount = document.getElementById('visitor-count');
if (visitorCount) {
  fetch('/.netlify/functions/visitor-counter')
    .then(response => response.json())
    .then(data => { visitorCount.textContent = Number(data.count).toLocaleString(); })
    .catch(() => { visitorCount.textContent = '—'; });
}

/* Citizens Branch constitutional framework enhancement */
if (document.body && /(^|\/)citizens-branch\.html$/.test(window.location.pathname)) {
  const hero = document.querySelector('main .page-hero');
  if (hero) {
    const style = document.createElement('style');
    style.textContent = `
      .civic-framework{padding:84px 0;background:#fff;border-bottom:1px solid #dce3eb}.civic-framework .framework-head{max-width:900px;margin:0 auto 38px;text-align:center}.civic-framework h2{font-family:Georgia,serif;color:#003B8F;font-size:clamp(2rem,4vw,3.15rem);line-height:1.12;margin:.2em 0 .45em}.civic-framework .framework-lede{font-size:1.12rem;line-height:1.75;color:#42536a}.framework-flow{max-width:1080px;margin:42px auto;display:grid;grid-template-columns:repeat(9,auto);align-items:center;justify-content:center;gap:10px}.framework-node{min-height:116px;min-width:150px;padding:20px 15px;border:2px solid #003B8F;border-radius:16px;background:#f7faff;text-align:center;display:flex;flex-direction:column;justify-content:center}.framework-node strong{display:block;color:#003B8F;font-family:Georgia,serif;font-size:1.15rem;margin-bottom:6px}.framework-node span{font-size:.9rem;line-height:1.4;color:#46566a}.framework-node.people{background:#003B8F}.framework-node.people strong,.framework-node.people span{color:#fff}.framework-node.role{border-color:#D71920;background:#fff8f8}.framework-arrow{font-size:1.7rem;color:#b08a35;font-weight:900}.branch-trio{max-width:940px;margin:30px auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.branch-card{padding:24px;border-radius:15px;background:#f7f8fa;border-top:5px solid #003B8F}.branch-card h3{margin:0 0 8px;color:#003B8F;font-family:Georgia,serif}.branch-card p{margin:0;line-height:1.65;color:#46566a}.framework-clarification{max-width:940px;margin:32px auto 0;padding:28px 30px;background:#fff;border-left:7px solid #D71920;box-shadow:0 10px 28px rgba(0,34,87,.08);border-radius:0 14px 14px 0}.framework-clarification h3{margin:0 0 10px;color:#003B8F;font-family:Georgia,serif}.framework-clarification p{line-height:1.7}.civic-actions{max-width:940px;margin:34px auto 0}.civic-actions h3{text-align:center;color:#003B8F;font-family:Georgia,serif}.action-chips{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}.action-chips span{padding:9px 14px;border:1px solid #ccd6e2;border-radius:999px;background:#fff;font-weight:700;color:#34445a}.framework-cta{text-align:center;margin-top:34px}.framework-cta a{display:inline-block;background:#003B8F;color:#fff;text-decoration:none;font-weight:800;padding:13px 20px;border-radius:9px}@media(max-width:900px){.framework-flow{grid-template-columns:1fr;max-width:560px}.framework-arrow{transform:rotate(90deg);text-align:center}.framework-node{min-width:0}.branch-trio{grid-template-columns:1fr}}@media(max-width:620px){.civic-framework{padding:60px 0}.framework-clarification{padding:22px 20px}}
    `;
    document.head.appendChild(style);

    const section = document.createElement('section');
    section.className = 'civic-framework';
    section.setAttribute('aria-labelledby','constitutional-framework-title');
    section.innerHTML = `
      <div class="wrap">
        <header class="framework-head">
          <p class="eyebrow">How the idea fits constitutional government</p>
          <h2 id="constitutional-framework-title">We the People → Constitution → Government → Continuing Civic Participation</h2>
          <p class="framework-lede">The Citizens Branch is a civic framework for understanding the people's continuing role in a constitutional republic. It does not create governmental power. It connects popular sovereignty to constitutional institutions and to the lawful ways citizens participate in, evaluate, and hold government accountable.</p>
        </header>
        <div class="framework-flow" aria-label="Constitutional relationship from We the People through the Constitution and three branches to citizens' continuing civic role">
          <div class="framework-node people"><strong>We the People</strong><span>Source of legitimate political authority</span></div><div class="framework-arrow" aria-hidden="true">→</div>
          <div class="framework-node"><strong>The Constitution</strong><span>Establishes powers, limits, rights, and institutions</span></div><div class="framework-arrow" aria-hidden="true">→</div>
          <div class="framework-node"><strong>Three Branches</strong><span>Legislative • Executive • Judicial</span></div><div class="framework-arrow" aria-hidden="true">→</div>
          <div class="framework-node role"><strong>Citizens' Continuing Role</strong><span>Learn • Vote • Petition • Question • Serve • Hold accountable</span></div>
        </div>
        <div class="branch-trio">
          <article class="branch-card"><h3>Legislative</h3><p>Congress exercises legislative powers granted by the Constitution. Citizens influence representation through elections, petitions, communication, public comment, advocacy, and lawful civic organization.</p></article>
          <article class="branch-card"><h3>Executive</h3><p>The President and Executive Branch execute federal law within constitutional authority. Citizens participate through elections and may communicate, petition, organize, scrutinize policy, and seek lawful change.</p></article>
          <article class="branch-card"><h3>Judicial</h3><p>Federal courts exercise judicial power under the Constitution. Citizens remain subject to lawful court authority while retaining constitutional rights and lawful avenues to seek review, reform, and accountability.</p></article>
        </div>
        <aside class="framework-clarification"><h3>The Citizens Branch is not a fourth branch of government</h3><p>The Constitution establishes the Legislative, Executive, and Judicial branches of the federal government. The <strong>Citizens Branch</strong> is an educational civic concept describing the people's continuing participation around those institutions. It exercises no separate governmental authority, creates no office, and gives no person immunity from law, courts, taxes, licensing, regulations, or other lawful civic obligations.</p></aside>
        <div class="civic-actions"><h3>What participation looks like</h3><div class="action-chips" aria-label="Examples of lawful civic participation"><span>Learn</span><span>Vote</span><span>Petition</span><span>Contact Representatives</span><span>Attend Public Meetings</span><span>Evaluate Information</span><span>Peacefully Assemble</span><span>Serve the Community</span><span>Defend Rights</span><span>Question Power</span><span>Seek Accountability</span><span>Preserve the Republic</span></div></div>
        <div class="framework-cta"><a href="participate.html">Explore the Citizen Action Guide</a></div>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }
}
