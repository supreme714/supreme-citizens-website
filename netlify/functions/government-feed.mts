import type { Config, Context } from "@netlify/functions";

type CongressBill = { congress?: number; type?: string; number?: string; title?: string; latestAction?: { actionDate?: string; text?: string } };
type GovernmentItem = { date: string; title: string; type: string; url: string };

function stripHtml(value = "") { return value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#8217;|&rsquo;/g, "’").replace(/&#8211;|&ndash;/g, "–").replace(/&#8212;|&mdash;/g, "—").replace(/&#038;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(); }
function absoluteCourtUrl(href: string) { return href.startsWith("http") ? href : `https://www.supremecourt.gov${href.startsWith("/") ? "" : "/"}${href}`; }
function parseCourtDate(value: string) { const m=value.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/); if(!m)return ""; const year=m[3].length===2?`20${m[3]}`:m[3]; return `${year}-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}T12:00:00.000Z`; }

function billLabel(type="",number=""){ const labels:Record<string,string>={HR:"H.R.",S:"S.",HJRES:"H.J.Res.",SJRES:"S.J.Res.",HCONRES:"H.Con.Res.",SCONRES:"S.Con.Res.",HRES:"H.Res.",SRES:"S.Res."}; return `${labels[type.toUpperCase()]??type} ${number}`.trim(); }
function congressGovUrl(bill:CongressBill){ const paths:Record<string,string>={hr:"house-bill",s:"senate-bill",hjres:"house-joint-resolution",sjres:"senate-joint-resolution",hconres:"house-concurrent-resolution",sconres:"senate-concurrent-resolution",hres:"house-resolution",sres:"senate-resolution"}; const p=paths[(bill.type??"").toLowerCase()]; return p&&bill.congress&&bill.number?`https://www.congress.gov/bill/${bill.congress}th-congress/${p}/${bill.number}`:"https://www.congress.gov/"; }

async function fetchText(url:string){ const r=await fetch(url,{headers:{Accept:"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8","User-Agent":"Mozilla/5.0 (compatible; SupremeCitizens.org/1.0; +https://supremecitizens.org/)"}}); if(!r.ok) throw new Error(`${url} returned ${r.status}`); return r.text(); }

async function fetchWhiteHouseCategory(category:string,type:string):Promise<GovernmentItem[]>{ const xml=await fetchText(`https://www.whitehouse.gov/presidential-actions/${category}/feed/`); return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0,10).map(m=>{const x=m[1]; const title=x.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1]??x.match(/<title>([\s\S]*?)<\/title>/i)?.[1]??""; const link=x.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim()??""; const pub=x.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim()??""; return {date:pub?new Date(pub).toISOString():"",title:stripHtml(title),type,url:link};}); }

async function fetchSupremeCourtOrders():Promise<GovernmentItem[]>{
 const html=await fetchText("https://www.supremecourt.gov/orders/ordersofthecourt"); const items:GovernmentItem[]=[];
 for(const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){ const href=m[1]; const label=stripHtml(m[2]); if(!/Order List|Miscellaneous Order/i.test(label))continue; const context=stripHtml(html.slice(Math.max(0,(m.index??0)-600),m.index??0)); const dates=[...context.matchAll(/\d{1,2}\/\d{1,2}\/\d{2,4}/g)]; const raw=dates.at(-1)?.[0]??""; const date=parseCourtDate(raw); if(!date)continue; items.push({date,title:label,type:/Miscellaneous/i.test(label)?"Miscellaneous Order":"Order List",url:absoluteCourtUrl(href)}); }
 return items.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
}

async function fetchSupremeCourtRelatedOpinions():Promise<GovernmentItem[]>{
 const html=await fetchText("https://www.supremecourt.gov/opinions/relatingtoorders"); const items:GovernmentItem[]=[];
 for(const row of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)){ const text=stripHtml(row[1]); const date=parseCourtDate(text); if(!date)continue; const link=row[1].match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i); if(!link)continue; const cells=[...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c=>stripHtml(c[1])).filter(Boolean); const caseName=cells.find(c=>/ v\. | in re | ex rel\./i.test(c))??stripHtml(link[2])??"Opinion Relating to Orders"; items.push({date,title:caseName,type:"Opinion Relating to Orders",url:absoluteCourtUrl(link[1])}); }
 return items.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
}

async function fetchSupremeCourtActivity():Promise<GovernmentItem[]>{
 const results=await Promise.allSettled([fetchSupremeCourtOrders(),fetchSupremeCourtRelatedOpinions()]); const merged=results.flatMap(r=>r.status==="fulfilled"?r.value:[]); const unique=new Map<string,GovernmentItem>(); for(const item of merged.sort((a,b)=>b.date.localeCompare(a.date))) unique.set(`${item.date}|${item.title}|${item.url}`,item);
 if(unique.size) return [...unique.values()].slice(0,5);
 return [{date:"",title:"View the latest Supreme Court orders and opinions",type:"Official Supreme Court source",url:"https://www.supremecourt.gov/orders/ordersofthecourt"}];
}

export default async (_req:Request,_context:Context)=>{
 let whiteHouse:GovernmentItem[]=[]; let supremeCourt:GovernmentItem[]=[];
 const courtResult=await Promise.allSettled([fetchSupremeCourtActivity()]); if(courtResult[0].status==="fulfilled") supremeCourt=courtResult[0].value; else console.error("Supreme Court feed failed",courtResult[0].reason);
 try{ const [eo,memo]=await Promise.all([fetchWhiteHouseCategory("executive-orders","Executive Order"),fetchWhiteHouseCategory("presidential-memoranda","Presidential Memorandum")]); whiteHouse=[...eo,...memo].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5); }catch(e){console.error("White House feed failed",e);}
 let congress:any[]=[];
 try{ const apiKey=Netlify.env.get("CONGRESS_API_KEY"); if(!apiKey)throw new Error("Congress API key is not configured"); const url=new URL("https://api.congress.gov/v3/bill/119"); url.searchParams.set("format","json");url.searchParams.set("limit","250");url.searchParams.set("offset","0"); const r=await fetch(url,{headers:{"X-Api-Key":apiKey,Accept:"application/json"}}); if(!r.ok)throw new Error(`Congress.gov returned ${r.status}`); const data=await r.json(); const bills:CongressBill[]=Array.isArray(data?.bills)?data.bills:[]; congress=bills.sort((a,b)=>(b.latestAction?.actionDate??"").localeCompare(a.latestAction?.actionDate??"")).slice(0,5).map(b=>({date:b.latestAction?.actionDate??"",identifier:billLabel(b.type,b.number),title:b.title??"Untitled legislative item",latestAction:b.latestAction?.text??"",url:congressGovUrl(b)})); }catch(e){console.error("Congress feed failed",e);}
 return Response.json({whiteHouse,supremeCourt,congress,updatedAt:new Date().toISOString()},{headers:{"Cache-Control":"public, max-age=0, s-maxage=900"}});
};
export const config:Config={path:"/api/government-feed"};
