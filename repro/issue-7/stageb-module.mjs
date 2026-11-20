// Loopback-only synthetic compatibility diagnostic, not product execution.
import assert from 'node:assert/strict';
import {createFixtureServer} from './stageb-server.mjs';
import {createHash} from 'node:crypto';
import {writeFileSync,openSync,ftruncateSync,writeSync,closeSync} from 'node:fs';
import {createRequire} from 'node:module';
import {chromium, webkit} from 'playwright';
import {observeRequest} from './diagnostic.mjs';
import {classify} from './stageb-contract.mjs';
const require=createRequire(import.meta.url);
const deadlineMs=5000, path='/assets/index-D_Wx_CwS.js';
const body=Buffer.from('globalThis.stageBMarker = "synthetic-module-v1"; export const diagnostic = true;\n');
const sha=b=>createHash('sha256').update(b).digest('hex');
const etag='W/"'+sha(body)+'"';
const output=process.env.STAGEB_OUTPUT;
assert.ok(output,'STAGEB_OUTPUT is required');
const outputFd=openSync(output,'wx');
const report={schema:1,scope:'synthetic module morphology; not Yamanaka product execution',source:{repository:'tetsujisugimori-coder/yamanaka-historical-terrain',head:'753922d38c5f9e07f7ca27148ec2a27555dae5e9',tree:'7bce7538e2c2597ee68b0fd3e138960f7e20f66a',artifact:'14585272978',originalProductBodySha256:'2b0dc19bcb8aef451f7ffdd93eeaa031eadc89cbb6a689328b16cc6f06148657',bodyReplaced:true},started:new Date().toISOString(),node:process.version,platform:process.platform,playwright:require('playwright/package.json').version,deadlineMs,path,payload:{bytes:body.length,sha256:sha(body)},rows:[],launches:[]};
const save=()=>{const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');ftruncateSync(outputFd,0);writeSync(outputFd,bytes,0,bytes.length,0);};
async function bounded(p,label){let t;try{return await Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(new Error(label+' deadline')),deadlineMs);})]);}finally{clearTimeout(t);}}
async function run(browser,scenario,row){
 const server=createFixtureServer({scenario,row,path,body,etag,save});
 let context;
 await bounded(new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);}), 'server listen');
 const origin=`http://127.0.0.1:${server.address().port}`;row.origin=origin;save();
 try{
  context=await browser.newContext({serviceWorkers:'block'});
  const page=await context.newPage();
  // Each reload uses a new document/module map in the same context, with cache intact.
  for(let attempt=1;attempt<=(scenario==='module-revalidation'?2:1);attempt++){
   await page.goto(origin,{timeout:deadlineMs});
   const obs={attempt,started:new Date().toISOString(),serverStart:row.server.length,events:[]};row.attempts.push(obs);save();
   const kind=scenario==='fetch404'?'fetch':'script';
   const diagnostic=observeRequest(page,r=>r.url()===origin+path&&r.resourceType()===kind,{deadlineMs});
   const request=r=>{if(r.url()===origin+path&&r.resourceType()===kind){obs.events.push({event:'request',at:new Date().toISOString(),method:r.method(),path,resourceType:r.resourceType()});save();}};
   const response=r=>{if(diagnostic.matches(r.request())){obs.responseStatus=r.status();obs.events.push({event:'response',status:r.status(),at:new Date().toISOString()});save();}};
   page.on('request',request);
   page.on('response',response);
   try{
    const action=page.evaluate(async({kind,path})=>{
     if(kind==='fetch'){const r=await fetch(path);return {status:r.status,ok:r.ok,bytes:[...new Uint8Array(await r.arrayBuffer())],marker:globalThis.stageBMarker??null};}
     return new Promise(resolve=>{const s=document.createElement('script');s.type='module';s.crossOrigin='anonymous';s.src=path;for(const event of ['load','error'])s.addEventListener(event,()=>resolve({event,marker:globalThis.stageBMarker??null}),{once:true});document.head.append(s);});
    },{kind,path}).then(value=>{if(value.bytes){const b=Buffer.from(value.bytes);value.bytes=b.length;value.sha256=sha(b);}obs.page=value;save();});
    const terminal=diagnostic.done.then(value=>{obs.terminal=value;obs.events.push({event:value.via,at:value.at});save();});
    await bounded(Promise.all([action,terminal]),'page observations');
   }finally{obs.serverEnd=row.server.length;diagnostic.dispose();page.off('response',response);page.off('request',request);save();}
  }
  if(scenario==='module-revalidation'){
   row.networkRevalidation=row.server.length===2&&row.server[1].status===304&&row.server[1].ifNoneMatch===etag?'OBSERVED':'NOT_OBSERVED';
   row.cachedModuleExecution=row.attempts[1]?.page?.marker==='synthetic-module-v1'?'OBSERVED':'NOT_OBSERVED';
   row.wireBody304=row.server.filter(x=>x.status===304).map(x=>x.bodyBytes);
  }
  row.result=classify(row,report.payload);
 }finally{
  try{await bounded(context?.close()??Promise.resolve(),'context close');}finally{server.closeAllConnections();await bounded(new Promise(resolve=>server.close(resolve)),'server close');}
 }
}
const requested=process.argv[2]??'both';
assert.ok(['chromium','webkit','both','chromium-system'].includes(requested));
for(const [engine,type] of Object.entries({chromium,webkit})){
 if(requested!=='both'&&requested!==engine&&!(requested==='chromium-system'&&engine==='chromium'))continue;
 const executable=requested==='chromium-system'?process.env.STAGEB_CHROMIUM_EXECUTABLE:undefined;
 if(requested==='chromium-system')assert.ok(executable,'explicit system executable required');
 let browser;const launch={engine,mode:executable?'explicit-system-not-pinned':'playwright-pinned',status:'NOT_TESTED'};report.launches.push(launch);save();
 try{browser=await type.launch({timeout:10000,...(executable?{executablePath:executable}:{})});launch.status='PASS';launch.browserVersion=browser.version();}
 catch(error){launch.status='BLOCKED';launch.error=error.message;for(const scenario of ['module200','module404','fetch404','module-revalidation'])report.rows.push({engine,mode:launch.mode,scenario,result:'NOT_TESTED',reason:'BROWSER_LAUNCH_BLOCKED',server:[],attempts:[]});save();continue;}
 try{for(const scenario of ['module200','module404','fetch404','module-revalidation']){
  const row={engine,browserVersion:browser.version(),mode:launch.mode,scenario,result:'INCOMPLETE',server:[],attempts:[]};report.rows.push(row);save();
  try{await run(browser,scenario,row);}catch(error){row.result=error.code==='ERR_ASSERTION'?'FAIL':'INCOMPLETE';row.error=error.stack;}
  save();
 }}finally{await bounded(browser.close(),'browser close');}
}
report.finished=new Date().toISOString();save();closeSync(outputFd);
console.log(JSON.stringify({launches:report.launches,results:report.rows.map(({engine,scenario,result})=>({engine,scenario,result}))},null,2));
if(report.launches.some(x=>x.status!=='PASS')||report.rows.some(x=>x.result!=='PASS'))process.exitCode=1;
