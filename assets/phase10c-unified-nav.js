/* Phase 11 unified production navigation — one sitewide source of truth */
(function(){
  function initUnifiedNavigation(){
    const menus=document.querySelectorAll('.main-nav');
    if(!menus.length)return;
    if(!document.getElementById('phase10c-nav-css')){
      const style=document.createElement('style');
      style.id='phase10c-nav-css';
      style.textContent=`
.site-header .nav-wrap{gap:28px}
.site-header .brand{flex:0 0 auto;min-width:315px}
.main-nav.phase10c-nav{display:flex;align-items:center;justify-content:flex-end;gap:4px 10px;flex-wrap:nowrap;white-space:nowrap;margin-left:auto;min-width:0}
.phase10c-nav>a,.phase10c-group>button{font:inherit;font-size:.82rem;font-weight:700;color:inherit;text-decoration:none;background:transparent;border:0;padding:8px 1px;cursor:pointer;white-space:nowrap}
.main-nav.phase10c-nav>[data-nav-order="1"]{order:1!important}.main-nav.phase10c-nav>[data-nav-order="2"]{order:2!important}.main-nav.phase10c-nav>[data-nav-order="3"]{order:3!important}.main-nav.phase10c-nav>[data-nav-order="4"]{order:4!important}.main-nav.phase10c-nav>[data-nav-order="5"]{order:5!important}.main-nav.phase10c-nav>[data-nav-order="6"]{order:6!important}.main-nav.phase10c-nav>[data-nav-order="7"]{order:7!important}.main-nav.phase10c-nav>[data-nav-order="8"]{order:8!important}.main-nav.phase10c-nav>[data-nav-order="9"]{order:9!important}
.phase10c-group{position:relative;display:inline-flex;align-items:center}.phase10c-group>button::after{content:' ▾';font-size:.78em}.phase10c-submenu{display:none;position:absolute;z-index:1200;top:100%;right:0;min-width:270px;padding:9px;background:#fff;border:1px solid #d7dfe8;border-radius:10px;box-shadow:0 14px 32px rgba(0,35,82,.16)}.phase10c-submenu a{display:block;padding:10px 12px;border-radius:7px;color:#10233f;text-decoration:none;font-weight:700;white-space:nowrap}.phase10c-submenu a:hover,.phase10c-submenu a:focus{background:#f1f5fa;color:#003B8F}.phase10c-group:hover .phase10c-submenu,.phase10c-group:focus-within .phase10c-submenu,.phase10c-group.open .phase10c-submenu{display:block}
@media(max-width:1240px) and (min-width:901px){.site-header .nav-wrap{gap:18px}.site-header .brand{min-width:285px}.main-nav.phase10c-nav{gap:2px 6px}.phase10c-nav>a,.phase10c-group>button{font-size:.74rem}}
@media(max-width:900px){.site-header .brand{min-width:0}.main-nav.phase10c-nav:not(.open){display:none}.main-nav.phase10c-nav.open{display:flex;flex-direction:column;align-items:stretch;width:100%;gap:0;white-space:normal;margin-left:0}.phase10c-nav>a,.phase10c-group>button{display:block;width:100%;box-sizing:border-box;text-align:center;padding:11px 8px;font-size:.9rem}.phase10c-group{display:block;width:100%}.phase10c-submenu{position:static;min-width:0;width:100%;box-sizing:border-box;box-shadow:none;border:0;border-radius:0;background:#f5f7fa;padding:4px 12px 9px}.phase10c-submenu a{text-align:center;white-space:normal;padding:9px}.phase10c-group:hover .phase10c-submenu{display:none}.phase10c-group.open .phase10c-submenu{display:block}}
`;
      document.head.appendChild(style);
    }
    const markup=`<a data-nav-order="1" href="index.html">Home</a><a data-nav-order="2" href="charter.html">Charter</a><a data-nav-order="3" href="principles.html">12 Principles</a><a data-nav-order="4" href="identity.html">Supreme Citizen</a><a data-nav-order="5" href="citizens-branch.html">Citizens Branch</a><a data-nav-order="6" href="community-consensus.html">Community of Consensus</a><a data-nav-order="7" href="participate.html">Participate</a><span data-nav-order="8" class="phase10c-group"><button type="button" aria-expanded="false">Elections &amp; Government</button><span class="phase10c-submenu"><a href="election-day.html">Election Day</a><a href="voting.html">Voting</a><a href="public-office-qualifications.html">Candidate Qualifications</a><a href="election-participation-pathway.html">Election Participation Pathway</a><a href="congressional-certification.html">Congressional Certification</a><a href="january-6.html">January 6</a><a href="congress.html">Connect With Congress</a></span></span><span data-nav-order="9" class="phase10c-group"><button type="button" aria-expanded="false">Resources</button><span class="phase10c-submenu"><a href="citizenship.html">Citizenship &amp; Due Process</a><a href="continuous-civic-participation.html">Continuous Civic Participation</a><a href="founding-documents.html">Founding Documents</a><a href="about.html">About</a><a href="contact.html">Info &amp; Contact</a></span></span>`;
    menus.forEach(menu=>{
      menu.classList.add('phase10c-nav');
      menu.innerHTML=markup;
      menu.querySelectorAll('.phase10c-group>button').forEach(button=>button.addEventListener('click',event=>{
        event.stopPropagation();
        const group=button.parentElement;
        const wasOpen=group.classList.contains('open');
        menu.querySelectorAll('.phase10c-group.open').forEach(item=>{item.classList.remove('open');item.querySelector('button').setAttribute('aria-expanded','false');});
        if(!wasOpen){group.classList.add('open');button.setAttribute('aria-expanded','true');}
      }));
    });
    document.addEventListener('click',()=>document.querySelectorAll('.phase10c-group.open').forEach(item=>{item.classList.remove('open');item.querySelector('button').setAttribute('aria-expanded','false');}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initUnifiedNavigation);else initUnifiedNavigation();
})();
