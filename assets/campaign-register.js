/* Source-based Campaign Commitment Register. The published JSON is editorially reviewed; no browser submissions. */
(function(){
'use strict';
const search=document.getElementById('commitment-search'),office=document.getElementById('commitment-office'),status=document.getElementById('commitment-status'),results=document.getElementById('register-results'),count=document.getElementById('register-count');
if(!search||!office||!status||!results||!count)return;
let records=[];
function validUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch(_){return null;}}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function addLink(parent,title,url){const safe=validUrl(url);if(!safe)return;const a=el('a',null,title);a.href=safe;a.target='_blank';a.rel='noopener noreferrer';parent.appendChild(a);}
function render(){
const query=search.value.trim().toLocaleLowerCase();
const filtered=records.filter(r=>(!query||[r.official,r.office,r.commitment,r.topic,r.election_cycle].some(v=>String(v||'').toLowerCase().includes(query)))&&(!office.value||r.office===office.value)&&(!status.value||r.status===status.value));
results.replaceChildren();count.textContent=filtered.length+' of '+records.length+' published records';
if(!filtered.length){results.appendChild(el('div','register-empty',records.length?'No records match your search. Try clearing filters.':'No verified campaign commitment records have been published yet. The search interface is ready for reviewed, source-backed entries.'));return;}
filtered.forEach(r=>{
const card=el('article','register-item');card.appendChild(el('h3',null,r.commitment));card.appendChild(el('p','register-muted',r.official+' · '+r.office+' · '+r.election_cycle+' · '+r.topic));
card.appendChild(el('p',null,'Record status: '+r.status));if(r.context)card.appendChild(el('p',null,r.context));
const p=el('p');p.appendChild(el('strong',null,'Original source: '));addLink(p,'View statement',r.source_url);card.appendChild(p);
if(r.action_url){const q=el('p');q.appendChild(el('strong',null,'Official action: '));addLink(q,'View official record',r.action_url);card.appendChild(q);}
card.appendChild(el('p','register-muted','Last reviewed: '+r.reviewed_on));results.appendChild(card);
});
}
Promise.resolve().then(async()=>{
try{
const response=await fetch('data/mandate-commitments.json',{cache:'no-store'});if(!response.ok)throw new Error('Unable to load records');
const json=await response.json();if(!json||!Array.isArray(json.entries))throw new Error('Invalid record format');
records=json.entries.filter(r=>r&&typeof r.official==='string'&&typeof r.commitment==='string'&&typeof r.source_url==='string'&&validUrl(r.source_url)&&typeof r.status==='string'&&typeof r.reviewed_on==='string');
render();
}catch(_){count.textContent='Register unavailable';results.replaceChildren(el('div','register-empty','The public records could not be loaded. Please try again later. No conclusions about any official can be drawn from this error.'));}
});
[search,office,status].forEach(node=>node.addEventListener(node===search?'input':'change',render));
})();