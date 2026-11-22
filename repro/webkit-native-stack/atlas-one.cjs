'use strict';
// Issue #18: ONE Atlas r2215 case. Debug the WebProcess, not the verdict helper.
// Raw PR #17/#19 records remain unchanged.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const {webkit} = require(path.resolve('.native-one/driver/node_modules/playwright'));
const output = path.resolve(process.argv[2] || 'evidence/atlas-native-one');
fs.mkdirSync(output, {recursive: true});
const atlasHtml = fs.readFileSync('atlas-old/prototype/eikyouki/index.html');
const binary = path.resolve('.native-one/browsers/webkit-2215/pw_run.sh');
const reportPath = path.join(output, 'result.json');
const gdbPath = path.join(output, 'gdb-backtrace.txt');
const readyPath = path.join(output, 'gdb-ready');
const report = {
  schema: 1, scope: 'one Atlas reference-prior-reload, r2215 only',
  playwright_driver: '1.56.1', browser_revision: 2215,
  atlas_head: '3e56d13d77048d056e79c6971e6e7d24ad92b4ff',
  started_at: new Date().toISOString(), result: 'NOT_TESTED',
  events: [], webprocess_candidates: [], selected_webprocess: null,
  gdb: {attempted: false, attached: false, output_file: path.basename(gdbPath),
    signal: 'UNKNOWN', native_function: 'UNKNOWN', index_reference: 'UNKNOWN'},
};
const log = (kind, extra={}) => {
  report.events.push({at: new Date().toISOString(), event: kind, ...extra});
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
};
function procInfo(pid) {
  try {
    const comm = fs.readFileSync('/proc/' + pid + '/comm', 'utf8').trim();
    if (!/^(WPEWebProcess|WebKitWebProcess)$/.test(comm)) return null;
    const cmd = fs.readFileSync('/proc/' + pid + '/cmdline', 'utf8')
      .replace(/\0/g, ' ').trim();
    const exe = fs.readlinkSync('/proc/' + pid + '/exe');
    const status = fs.readFileSync('/proc/' + pid + '/status', 'utf8');
    const ppid = +(status.match(/^PPid:\s*(\d+)/m)||[])[1];
    return {pid, ppid, comm, exe, cmdline: cmd.slice(0, 500)};
  } catch { return null; }
}
function webProcesses() {
  const list=[];
  for (const item of fs.readdirSync('/proc')) {
    if (!/^\d+$/.test(item)) continue;
    const found=procInfo(+item);
    if (found && (found.exe.includes('webkit-2215') || found.cmdline.includes('webkit-2215')))
      list.push(found);
  }
  return list.sort((a,b)=>a.pid-b.pid);
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForReady(gdb, ms) {
  const until=Date.now()+ms;
  while(Date.now()<until) {
    if (fs.existsSync(readyPath)) return true;
    if (gdb.exitCode!==null || gdb.signalCode!==null) return false;
    await sleep(100);
  }
  return false;
}
async function waitForExit(gdb, ms) {
  if (!gdb || gdb.exitCode!==null || gdb.signalCode!==null) return;
  await Promise.race([new Promise(resolve=>gdb.once('exit',resolve)),sleep(ms)]);
  if(gdb.exitCode===null && gdb.signalCode===null) {
    gdb.kill('SIGTERM');
    await sleep(350);
    if(gdb.exitCode===null && gdb.signalCode===null) gdb.kill('SIGKILL');
  }
}
async function main() {
  const server=http.createServer((req,res)=>{
    if(new URL(req.url,'http://localhost').pathname!=='/atlas'){
      res.writeHead(404);res.end('not found');return;
    }
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    res.end(atlasHtml);
  });
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const origin='http://127.0.0.1:'+server.address().port;
  let browser,context,gdb,stderrFd;
  let caught=null, crashed=false;
  try {
    const before=webProcesses();
    log('prelaunch.webprocess.count',{count:before.length});
    browser=await webkit.launch({headless:true,executablePath:binary});
    context=await browser.newContext({viewport:{width:390,height:1000},reducedMotion:'no-preference'});
    const page=await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(15000);
    page.on('crash',()=>{crashed=true;log('page.crash');});
    page.on('load',()=>log('page.load'));
    page.on('response',response=>{
      if (response.request().isNavigationRequest())
        log('navigation.http.response',{status:response.status(),url:response.url()});
    });
    const step=async(name,action)=>{
      log('step.start',{name});
      try { const result=await action();log('step.end',{name});return result; }
      catch(e){log('step.error',{name,error:String(e).slice(0,400)});throw e;}
    };
    await step('navigate EK-0119',()=>page.goto(origin+'/atlas#EK-0119'));
    assert.equal(await page.locator('#EK-0119').getAttribute('open'),'');
    await step('click EK-0120 reference',()=>page.locator('.narrative-reference').filter({hasText:'EK-0120'}).click());
    assert.equal(new URL(page.url()).hash,'#EK-0120');
    await step('prior page.reload',()=>page.reload());
    assert.equal(await page.locator('#EK-0120').getAttribute('open'),'');
    await step('navigate C05',()=>page.goto(origin+'/atlas#EK-0120-C05'));
    const after=webProcesses();
    report.webprocess_candidates=after;
    log('webprocess.discovered',{count:after.length,pids:after.map(p=>p.pid)});
    const candidates=after.filter(p=>!before.some(old=>old.pid===p.pid));
    if(candidates.length===1){
      report.selected_webprocess=candidates[0];
      report.gdb.attempted=true;
      log('gdb.start',{target_pid:candidates[0].pid});
      stderrFd=fs.openSync(gdbPath,'w');
      const args=['-n','gdb','--nx','--quiet','--batch',
        '-p',String(candidates[0].pid),
        '-ex','set pagination off',
        '-ex','set confirm off',
        '-ex','set print pretty on',
        '-ex','set print static off',
        '-ex','handle SIGABRT stop print pass',
        '-ex','shell touch '+readyPath,
        '-ex','continue',
        '-ex','info program',
        '-ex','thread apply all bt full 30',
        '-ex','info registers',
        '-ex','info proc mappings',
        '-ex','detach',
        '-ex','quit'];
      gdb=cp.spawn('sudo',args,{stdio:['ignore',stderrFd,stderrFd]});
      gdb.on('error',error=>log('gdb.spawn.error',{error:String(error)}));
      report.gdb.attached=await waitForReady(gdb,15000);
      log(report.gdb.attached?'gdb.attach.confirmed':'gdb.attach.not_confirmed',
        {target_pid:candidates[0].pid});
    }else{
      log('gdb.attach.not_attempted',{reason:'WebProcess PID is not uniquely identified',candidates:candidates.map(p=>p.pid)});
    }
    await step('final C05 page.reload',()=>page.reload());
    assert.equal(await page.locator('#EK-0120').getAttribute('open'),'');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'EK-0120-C05');
    report.result='PASS';
  }catch(e){
    caught=e;
    report.error=String(e&& (e.stack||e)).slice(0,3000);
    report.result=crashed||/Page crashed/i.test(report.error)?'CRASH':
      /Timeout/i.test(report.error)?'TIMEOUT':'FAIL';
    log('case.failure',{classification:report.result,error:String(e).slice(0,350)});
  }finally{
    await waitForExit(gdb,3500);
    if(stderrFd!==undefined)fs.closeSync(stderrFd);
    if(fs.existsSync(gdbPath)){
      const raw=fs.readFileSync(gdbPath,'utf8');
      report.gdb.signal=/received signal SIGABRT/i.test(raw)?'SIGABRT':'UNKNOWN';
      report.gdb.native_function=/WebCore::Navigation::initializeForNewWindow/.test(raw)
        ?'WebCore::Navigation::initializeForNewWindow':'UNKNOWN';
      report.gdb.backtrace_bytes=Buffer.byteLength(raw);
      report.gdb.webprocess_pid_confirmed=/Attaching to process/.test(raw) &&
        report.gdb.attached;
      log('gdb.output.assessed',{signal:report.gdb.signal,function:report.gdb.native_function});
    }
    if(context)try{await context.close();}catch(e){log('context.close.error',{error:String(e)});}
    if(browser)try{await browser.close();}catch(e){log('browser.close.error',{error:String(e)});}
    await new Promise(resolve=>server.close(resolve));
    report.finished_at=new Date().toISOString();
    log('investigation.end',{result:report.result});
    console.log(JSON.stringify({case:'atlas-reference-prior-reload-one',result:report.result,
      webprocess:report.selected_webprocess?.pid??null,gdb:report.gdb,
      one_attempt:true,diagnostic_only:true}));
    // Diagnosis is complete even when the reproduced browser case is TIMEOUT.
    // Failure to collect a native stack remains UNKNOWN, never a fake PASS.
  }
}
main().catch(error=>{
  report.fatal_error=String(error.stack||error);
  report.result='INCOMPLETE';
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.error(error);
  process.exitCode=1;
});
