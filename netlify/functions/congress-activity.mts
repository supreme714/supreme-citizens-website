import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

// Lightweight Congress.gov tracker. Historical full-session scans must not run
// on every page view: they previously caused repeated 8-second aborts.
type Bill = { type?: string; originChamber?: string; introducedDate?: string; latestAction?: { actionDate?: string } };
type Bills = { bills?: Bill[]; laws?: Bill[] };
type Dates = { houseLastIntroduced: string|null; senateLastIntroduced: string|null; lastBecameLaw: string|null };
const KEY = "congress-dates-v2";
const isDate=(value:unknown):value is string=>typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+"T12:00:00Z"));
const maxDate=(values:unknown[]):string|null=>values.filter(isDate).sort().at(-1)||null;
async function api(path:string,params:Record<string,string>):Promise<Bills>{
 const key=Netlify.env.get("CONGRESS_API_KEY");
 if(!key)throw Error("Congress.gov API key is missing");
 const url=new URL("https://api.congress.gov/v3"+path);
 url.searchParams.set("format","json");Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5500);
 try{const response=await fetch(url,{signal:controller.signal,headers:{"X-Api-Key":key,Accept:"application/json"}});
 if(!response.ok)throw Error("Congress.gov HTTP "+response.status+" for "+url.pathname);
 return await response.json() as Bills;
 }finally{clearTimeout(timer);}
}
async function billDates():Promise<Pick<Dates,"houseLastIntroduced"|"senateLastIntroduced">>{
 const data=await api("/bill/119",{limit:"250",offset:"0",sort:"introducedDate+desc"});
 const bills=data.bills||[];
 if(!bills.length)throw Error("No recent bills returned");
 const house=bills.filter(x=>x.originChamber==="House"||/^(hr|hjres|hconres|hres)$/i.test(x.type||""));
 const senate=bills.filter(x=>x.originChamber==="Senate"||/^(s|sjres|sconres|sres)$/i.test(x.type||""));
 return {houseLastIntroduced:maxDate(house.map(x=>x.introducedDate)),senateLastIntroduced:maxDate(senate.map(x=>x.introducedDate))};
}
async function lawDate():Promise<string|null>{
 const data=await api("/law/119",{limit:"100",offset:"0"});
 const laws=data.bills||data.laws||[];
 return maxDate(laws.map(x=>x.latestAction?.actionDate));
}
type Snapshot={dates:Dates;verifiedAt:string};
async function cached():Promise<Snapshot|null>{
 try{const item=await getStore("congress-activity-snapshots").get(KEY,{type:"json"}) as Snapshot|null;
 return item&&item.dates&&isDate(item.verifiedAt.slice(0,10))?item:null;
 }catch(e){console.warn("Congress cache read failed",e);return null;}
}
export default async (_request:Request,_context:Context)=>{
 // All requests and optional cache read run concurrently, bounded by individual timeouts.
 const [bills,laws,previous]=await Promise.all([billDates().then(value=>({value})).catch(error=>({error})),lawDate().then(value=>({value})).catch(error=>({error})),cached()]);
 if("error" in bills)console.error("Congress latest bills request failed",bills.error);
 if("error" in laws)console.error("Congress latest law request failed",laws.error);
 const dates:Dates={
  houseLastIntroduced:"value" in bills?bills.value.houseLastIntroduced:previous?.dates.houseLastIntroduced??null,
  senateLastIntroduced:"value" in bills?bills.value.senateLastIntroduced:previous?.dates.senateLastIntroduced??null,
  lastBecameLaw:"value" in laws?laws.value:previous?.dates.lastBecameLaw??null
 };
 const complete="value" in bills&&"value" in laws&&Boolean(dates.houseLastIntroduced&&dates.senateLastIntroduced&&dates.lastBecameLaw);
 const someLive=("value" in bills&&Boolean(dates.houseLastIntroduced||dates.senateLastIntroduced))||("value" in laws&&Boolean(dates.lastBecameLaw));
 const now=new Date().toISOString();
 if(complete){try{await getStore("congress-activity-snapshots").setJSON(KEY,{dates,verifiedAt:now});}catch(e){console.warn("Congress cache write failed",e);}}
 const sourceStatus=complete?"live":someLive?"partial":previous?"cached":"unavailable";
 return Response.json({
  congress:119,session:2,...dates,sourceStatus,verifiedAt:complete?now:previous?.verifiedAt??null,updatedAt:now,source:"Congress.gov API",
  // Not estimated: these values require separate verified session indexing.
  houseSessionDays:null,senateSessionDays:null,congressionalRecordDays:null,
  houseSessionDaysSinceIntroduced:null,senateSessionDaysSinceIntroduced:null,latestCongressionalRecordDate:null,
  totals:null,stages:null,stageIndex:null
 },{status:someLive||previous?200:503,headers:{"Cache-Control":"public, max-age=0, s-maxage=900, stale-while-revalidate=300","Content-Type":"application/json; charset=utf-8"}});
};
export const config:Config={path:"/api/congress-activity",method:"GET"};
