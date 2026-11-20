import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createFixtureServer} from './stageb-server.mjs';
const path='/assets/index-D_Wx_CwS.js';
test('HTTP client control: 200, 404, exact/mismatched/absent validator; not browser evidence',{timeout:10000},async()=>{
 for(const scenario of ['module200','module404','fetch404','module-revalidation']){
  const row={server:[]},body=Buffer.from('synthetic module'),etag='W/"test"';
  const server=createFixtureServer({scenario,row,path,body,etag,save:()=>{}});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  try{for(const validator of [null,etag,'W/"different"']){
   const reply=await new Promise((resolve,reject)=>{
    const req=http.get({hostname:'127.0.0.1',port:server.address().port,path,headers:validator?{'If-None-Match':validator}:{}},res=>{let chunks=[];res.on('data',b=>chunks.push(b));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));res.on('error',reject);});req.setTimeout(2000,()=>req.destroy(new Error('HTTP deadline')));req.on('error',reject);
   });
   const status=scenario.includes('404')?404:scenario==='module-revalidation'&&validator===etag?304:200;
   assert.equal(reply.status,status);assert.equal(reply.headers['content-type'],'text/javascript');assert.equal(reply.headers.vary,'Origin');
   assert.deepEqual(reply.body,status===304?Buffer.alloc(0):body);
   if(status===304)assert.equal(reply.headers['content-length'],undefined);
   console.log(JSON.stringify({scenario,validator,status,bytes:reply.body.length}));
  }assert.equal(row.server.length,3);assert.ok(row.server.every(r=>r.finishAt&&r.closeAt));}
  finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
 }
});
