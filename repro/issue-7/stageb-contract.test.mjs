import test from 'node:test';
import assert from 'node:assert/strict';
import {classify} from './stageb-contract.mjs';
const payload={bytes:3,sha256:'abc'};
const ev=(status=200,via='requestfinished')=>({serverStart:0,serverEnd:1,events:[{event:'request',method:'GET',path:'/assets/index-D_Wx_CwS.js'},{event:'response',status},{event:via}]});
const normal=()=>({scenario:'module200',server:[{status:200,ifNoneMatch:null,method:'GET',path:'/assets/index-D_Wx_CwS.js',finishAt:'synthetic'}],attempts:[{...ev(),responseStatus:200,terminal:{status:'PASS',via:'requestfinished',elapsedMs:1},page:{event:'load',marker:'synthetic-module-v1'}}]});
test('synthetic normal and HTTP error outcomes remain separate',()=>{
 assert.equal(classify(normal(),payload),'PASS');
 const r=normal();r.scenario='module404';r.server[0].status=404;r.attempts[0]={...ev(404,'requestfailed'),responseStatus:404,terminal:{status:'FAIL',via:'requestfailed',elapsedMs:1},page:{event:'error',marker:null}};
 assert.equal(classify(r,payload),'PASS');
 r.scenario='fetch404';r.attempts[0]={...ev(404),responseStatus:404,terminal:{status:'PASS',via:'requestfinished',elapsedMs:1},page:{status:404,ok:false,bytes:3,sha256:'abc',marker:null}};assert.equal(classify(r,payload),'PASS');
});
for(const [name,mutate] of Object.entries({empty:r=>r.attempts=[],deadline:r=>r.attempts[0].terminal.via='deadline',late:r=>r.attempts[0].terminal.elapsedMs=5000,missing:r=>delete r.attempts[0].page,marker:r=>r.attempts[0].page.marker=null,noServer:r=>r.server=[],wrongStatus:r=>r.server[0].status=404,wrongTerminal:r=>r.attempts[0].terminal.status='FAIL'}))test('reject '+name,()=>{const r=normal();mutate(r);assert.throws(()=>classify(r,payload));});
test('real server 304, cached page200 and marker are distinct',()=>{
 const r=normal();r.scenario='module-revalidation';r.attempts.push({...structuredClone(r.attempts[0]),serverStart:1,serverEnd:2});r.server[0].etag='"v1"';
 assert.equal(classify(r,payload),'UNKNOWN');
 r.server.push({method:'GET',path:'/assets/index-D_Wx_CwS.js',finishAt:'synthetic',status:304,ifNoneMatch:'"v1"',bodyBytes:0});assert.equal(classify(r,payload),'PASS');
 r.server[1].bodyBytes=3;assert.throws(()=>classify(r,payload));
 r.server[1].bodyBytes=0;r.server[1].ifNoneMatch=null;assert.throws(()=>classify(r,payload));
 r.server[1].status=200;assert.equal(classify(r,payload),'UNKNOWN');
});

test('reject revalidation attributed to wrong document',()=>{const r=normal();r.scenario='module-revalidation';r.attempts[0].serverEnd=2;r.attempts.push({...structuredClone(r.attempts[0]),serverStart:2,serverEnd:2});r.server[0].etag='v1';r.server.push({...r.server[0],status:304,ifNoneMatch:'v1',bodyBytes:0});assert.throws(()=>classify(r,payload));});

test('reject contradictory first status and mismatched event status for revalidation',()=>{
 const r=normal();r.scenario='module-revalidation';r.attempts.push({...structuredClone(r.attempts[0]),serverStart:1,serverEnd:2});r.server[0].etag='v1';r.server.push({...r.server[0],status:304,ifNoneMatch:'v1',bodyBytes:0});assert.equal(classify(r,payload),'PASS');
 r.attempts[0].responseStatus=404;assert.throws(()=>classify(r,payload));
 r.attempts[0].events[1].status=404;assert.throws(()=>classify(r,payload));
 r.attempts[0].responseStatus=200;r.attempts[0].events[1].status=200;
 r.attempts[1].events[1].status=404;assert.throws(()=>classify(r,payload));
 r.attempts[1].events[1].status=200;r.attempts[1].events.reverse();assert.throws(()=>classify(r,payload));
 r.attempts[1].events.reverse();delete r.attempts[1].terminal;assert.throws(()=>classify(r,payload),/INCOMPLETE_ATTEMPT/);
});

test('P2: incomplete observations are not misclassified as observed failures',()=>{
 const verdict=r=>{try{return classify(r,payload)}catch(error){return error.code==='ERR_ASSERTION'?'FAIL':'INCOMPLETE';}};
 for(const [name,mutate] of Object.entries({
  missingFinish:r=>delete r.server[0].finishAt,
  missingServer:r=>r.server=[],
  missingAttempt:r=>r.attempts=[],
  missingResponseStatus:r=>delete r.attempts[0].responseStatus,
  missingTerminal:r=>delete r.attempts[0].terminal,
  missingElapsed:r=>delete r.attempts[0].terminal.elapsedMs
 })){const r=normal();mutate(r);assert.equal(verdict(r),'INCOMPLETE',name);}
 for(const [name,mutate] of Object.entries({
  wrongStatus:r=>r.server[0].status=404,
  wrongTerminal:r=>r.attempts[0].terminal.status='FAIL',
  wrongRequest:r=>r.attempts[0].events[0].path='/unexpected'
 })){const r=normal();mutate(r);assert.equal(verdict(r),'FAIL',name);}
 assert.equal(verdict(normal()),'PASS');
});
