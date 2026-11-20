import {createServer} from 'node:http';
export function createFixtureServer({scenario,row,path,body,etag,save}){
 const server=createServer((req,res)=>{
  if(req.url!==path){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; script-src 'self'; connect-src 'self'; base-uri 'none'"});res.end('<!doctype html><title>Stage B synthetic diagnostic</title>');return;}
  const conditional=scenario==='module-revalidation' && req.headers['if-none-match']===etag;
  const status=conditional?304:scenario.includes('404')?404:200;
  const observation={sequence:row.server.length+1,at:new Date().toISOString(),method:req.method,path:req.url,origin:req.headers.origin??null,accept:req.headers.accept??null,ifNoneMatch:req.headers['if-none-match']??null,ifModifiedSince:req.headers['if-modified-since']??null,status,bodyBytes:status===304?0:body.length,bodyBytesMeaning:'intended application response bytes, not proof of client receipt',contentType:'text/javascript',vary:'Origin',cacheControl:scenario.includes('404')?'no-store':'no-cache',etag:scenario==='module-revalidation'?etag:null};
  row.server.push(observation);save();
  res.once('finish',()=>{observation.finishAt=new Date().toISOString();save();});
  res.once('close',()=>{observation.closeAt=new Date().toISOString();save();});
  res.writeHead(status,{'Content-Type':observation.contentType,'Vary':'Origin','Cache-Control':observation.cacheControl,...(observation.etag?{ETag:etag}:{}),...(status===304?{}:{'Content-Length':observation.bodyBytes})});res.end(status===304?undefined:body);
 });
return server;
}
