/* Phase 10C unified production navigation — implementation source */
(function(){
  function initUnifiedNavigation(){
    const menus=document.querySelectorAll('.main-nav');
    if(!menus.length)return;
    if(!document.getElementById('phase10c-nav-css')){
      const style=document.createElement('style');
      style.id='phase10c-nav-css';
      style.textContent=`.main-nav.phase10c-nav{display:flex;align-items:center;justify-content:flex-end;gap:7px 12px;flex-wrap:wrap}.phase10c-nav>a,.phase10c-group>button{font:inherit;font-weight:700;color:inherit;text-decoration:none;background:transparent;border:0;padding:8px 2px;cursor:pointer;white-space:nowrap}.phase10c-group{position:relative}.phase10c-group>button::after{content:' ▾';font-size:.78em}.phase10c-submenu{display:none;position:absolute;z-index:1200;top:100%;right:0;min-width:270px;padding:9px;background:#fff;border:1px solid #d7dfe8;border-radius:10px;box-shadow:0 14px 32px rgba(0,35,82,.16)}.phase10c-submenu a{display:block;padding:10px 12px;border-radius:7px;color:#10233f;text-decoration:none;font-weight:700;white-space:nowrap}.phase10c-submenu a:hover,.phase10c-submenu a:focus{background:#f1f5fa;color:#003B8F}.phase10c-group:hover .phase10c-submenu,.phase10c-group:focus-within .phase10c-submenu,.phase10c-group.open .phase10c-submenu{display:block}@media(max-width:1180px){.main-nav.phase10c-nav{gap:5px 9px}.phase10c-nav>a,.phase10c-group>button{font-size:.9rem}}@media(max-width:900px){.main-nav.phase10c-nav:not(.open){display:none}.main-nav.phase10c-nav.open{display:flex;flex-direction:column;align-items:stretch;width:100%;gap:0}.phase10c-nav>a,.phase10c-group>button{display:block;width:100%;box-sizing:border-box;text-align:center;padding:11px 8px}.phase10c-group{width:100%}.phase10c-submenu{position:static;min-width:0;width:100%;box-sizing:border-box;box-shadow:none;border:0;border-radius:0;background:#f5f7fa;padding:4px 12px 9px}.phase10c-submenu a{text-align:center;white-space:normal;padding:9px}.phase10c-group:hover .phase10c-submenu{display:none}.phase10c-group.open .phase10c-submenu{display:block}}`;
      document.head.appendChild(style);
    }
    const markup=`<a href="index.html">Home</a><a href="charter.html">Charter</a><a href="principles.html">12 Principles</a><a href="identity.html">Supreme Citizen</a><a href="citizens-branch.html">Citizens Branch</a><a href="community-consensus.html">Community of Consensus</a><a href="participate.html">Participate</a><span class="phase10c-group"><button type="button" aria-expanded="false">Elections &amp; Government</button><span class="phase10c-submenu"><a href="election-day.html">Election Day</a><a href="voting.html">Voting</a><a href="election-participation-pathway.html">Election Participation Pathway</a><a href="congressional-certification.html">Congressional Certification</a><a href="january-6.html">January 6</a><a href="congress.html">Connect With Congress</a></span></span><span class="phase10c-group"><button type="button" aria-expanded="false">Resources</button><span class="phase10c-submenu"><a href="citizenship.html">Citizenship &amp; Due Process</a><a href="continuous-civic-participation.html">Continuous Civic Participation</a><a href="founding-documents.html">Founding Documents</a><a href="about.html">About</a><a href="contact.html">Info &amp; Contact</a></span></span>`;
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
