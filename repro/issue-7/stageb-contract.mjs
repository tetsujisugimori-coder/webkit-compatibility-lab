import assert from 'node:assert/strict';
export function classify(row,payload){
 assert.ok(row && ['module200','module404','fetch404','module-revalidation'].includes(row.scenario));
 const cached=row.scenario==='module-revalidation', error=row.scenario.includes('404');
 assert.equal(row.attempts?.length,cached?2:1);
 assert.ok(Array.isArray(row.server)&&row.server.length>0);
 assert.equal(row.server[0].status,error?404:200);
 for(const r of row.server){assert.equal(r.method,'GET');assert.equal(r.path,'/assets/index-D_Wx_CwS.js');assert.ok(r.finishAt,'server response finish required');}
 assert.ok(row.server.length<=(cached?2:1));
 for(const [i,a] of row.attempts.entries()){
  if(!a.page||!a.terminal||!Number.isInteger(a.serverStart)||!Number.isInteger(a.serverEnd))throw new Error('INCOMPLETE_ATTEMPT');
  if(!Array.isArray(a.events)||!a.events.some(e=>e.event==='request')||!a.events.some(e=>e.event==='response'))throw new Error('INCOMPLETE_EVENT_CHAIN');
  assert.equal(a.events.filter(e=>e.event==='request').length,1);
  const responses=a.events.filter(e=>e.event==='response');
  assert.equal(responses.length,1);assert.equal(responses[0].status,a.responseStatus);
  if(!a.events.some(e=>e.event===a.terminal.via))throw new Error('INCOMPLETE_TERMINAL_EVENT');
  assert.deepEqual(a.events.map(e=>e.event),['request','response',a.terminal.via]);
  assert.equal(a.events[0].method,'GET');
  assert.equal(a.events[0].path,'/assets/index-D_Wx_CwS.js');
  assert.ok(Number.isFinite(a.terminal.elapsedMs)&&a.terminal.elapsedMs>=0&&a.terminal.elapsedMs<5000);
  assert.equal(a.terminal.via,row.scenario==='module404'?'requestfailed':'requestfinished');
  assert.equal(a.terminal.status,row.scenario==='module404'?'FAIL':'PASS');
  if(!cached||i===0)assert.equal(a.responseStatus,error?404:200);
  else assert.ok([200,304].includes(a.responseStatus));
  if(row.scenario==='fetch404'){
   assert.equal(a.page.status,404);assert.equal(a.page.ok,false);assert.equal(a.page.bytes,payload.bytes);assert.equal(a.page.sha256,payload.sha256);assert.equal(a.page.marker,null);
  }else{
   assert.equal(a.page.event,error?'error':'load');assert.equal(a.page.marker,error?null:'synthetic-module-v1');
  }
 }
 if(!cached){assert.equal(row.server.length,1);return 'PASS';}
 if(row.server.length!==2||row.server[1].status!==304)return 'UNKNOWN';
 assert.equal(row.attempts[0].serverStart,0);assert.equal(row.attempts[0].serverEnd,1);
 assert.equal(row.attempts[1].serverStart,1);assert.equal(row.attempts[1].serverEnd,2);
 assert.equal(row.server[0].ifNoneMatch,null);
 assert.ok(typeof row.server[0].etag==='string'&&row.server[0].etag.length>0);
 assert.equal(row.server[1].ifNoneMatch,row.server[0].etag);assert.equal(row.server[1].bodyBytes,0);
 // Page-visible 200 is not a wire 200; only server evidence establishes 304.
 return 'PASS';
}
