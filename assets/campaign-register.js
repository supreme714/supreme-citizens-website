/* Source-based Campaign Commitment Register: chronological filtering and source-safe rendering. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const search=$('commitment-search'),office=$('commitment-office'),status=$('commitment-status'),year=$('commitment-year'),person=$('commitment-person'),topic=$('commitment-topic'),sort=$('commitment-sort'),results=$('register-results'),count=$('register-count');
if([search,office,status,year,person,topic,sort,results,count].some(x=>!x))return;
let records=[];
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
function isoDate(value){if(typeof value!=='string'||!datePattern.test(value))return '';const date=new Date(value+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===value?value:'';}
function showDate(value){const date=isoDate(value);if(!date)return 'Not documented';return new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
function validUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch(_){return null;}}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;}
function addLink(parent,title,url){const safe=validUrl(url);if(!safe)return;const a=el('a',null,title);a.href=safe;a.target='_blank';a.rel='noopener noreferrer';parent.appendChild(a);}
function fillSelect(node,values,emptyLabel){const keep=node.value;node.replaceChildren(new Option(emptyLabel,''));for(const value of values.sort((a,b)=>String(a).localeCompare(String(b),'en',{numeric:true}))){node.add(new Option(String(value),String(value)));}if([...node.options].some(option=>option.value===keep))node.value=keep;}
function initializeFilters(){
fillSelect(year,[...new Set(records.map(r=>String(r.election_year||'')).filter(Boolean))],'All election years');
fillSelect(person,[...new Set(records.map(r=>r.official).filter(Boolean))],'All officials');
fillSelect(topic,[...new Set(records.map(r=>r.topic).filter(Boolean))],'All policy categories');
}
function compareRecords(a,b){
const ad=isoDate(a.commitment_date),bd=isoDate(b.commitment_date);
if(ad&&bd&&ad!==bd)return sort.value==='oldest'?ad.localeCompare(bd):bd.localeCompare(ad);
if(ad!==bd)return ad?-1:1; // undated entries always last rather than pretending their review date is the commitment date
const name=String(a.official).localeCompare(String(b.official),'en');
if(name)return name;return String(a.id||'').localeCompare(String(b.id||''),'en');
}
function render(){
const query=search.value.trim().toLocaleLowerCase();
const filtered=records.filter(r=>(!query||[r.official,r.office,r.commitment,r.topic,r.election_cycle,r.context].some(v=>String(v||'').toLowerCase().includes(query)))&&(!office.value||r.office===office.value)&&(!status.value||r.status===status.value)&&(!year.value||String(r.election_year)===year.value)&&(!person.value||r.official===person.value)&&(!topic.value||r.topic===topic.value)).sort(compareRecords);
results.replaceChildren();count.textContent=filtered.length+' of '+records.length+' published records · Ordered by campaign statement date ('+(sort.value==='oldest'?'oldest first':'newest first')+')';
if(!filtered.length){results.appendChild(el('div','register-empty',records.length?'No records match these filters. Clear a filter or try another search.':'No reviewed campaign commitments have been published.'));return;}
for(const r of filtered){
const card=el('article','register-item');card.appendChild(el('h3',null,r.commitment));
card.appendChild(el('p','register-muted',r.official+' · '+r.office+' · '+r.election_cycle+' · '+r.topic));
card.appendChild(el('p','register-muted','Campaign statement: '+showDate(r.commitment_date)));
card.appendChild(el('p',null,'Record status: '+r.status));
if(r.context)card.appendChild(el('p',null,r.context));
const p=el('p');p.appendChild(el('strong',null,'Original campaign source: '));addLink(p,'View statement',r.source_url);card.appendChild(p);
if(r.action_url){card.appendChild(el('p','register-muted',(r.action_date_description||'Related action date')+': '+showDate(r.action_date)));const q=el('p');q.appendChild(el('strong',null,'Official action source: '));addLink(q,'View official record',r.action_url);card.appendChild(q);}
card.appendChild(el('p','register-muted','Record last reviewed: '+showDate(r.reviewed_on)));results.appendChild(card);
}
}
(async function(){
try{
const response=await fetch('data/mandate-commitments.json',{cache:'no-store'});if(!response.ok)throw new Error('Records unavailable');
const json=await response.json();if(!json||!Array.isArray(json.entries))throw new Error('Invalid record format');
records=json.entries.filter(r=>r&&typeof r.official==='string'&&typeof r.commitment==='string'&&typeof r.source_url==='string'&&validUrl(r.source_url)&&typeof r.status==='string'&&isoDate(r.reviewed_on)&&(!r.commitment_date||isoDate(r.commitment_date))&&(!r.action_date||isoDate(r.action_date)));
initializeFilters();render();
}catch(_){count.textContent='Register unavailable';results.replaceChildren(el('div','register-empty','The public records could not be loaded. Please try again later.'));}
})();
[search,office,status,year,person,topic,sort].forEach(node=>node.addEventListener(node===search?'input':'change',render));
})();