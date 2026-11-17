"""Offline evidence consistency only; does not run source tests or use network."""
import hashlib,json,re,stat,zipfile
from pathlib import Path,PurePosixPath

def require(ok,reason):
    if not ok: raise ValueError(reason)

def audit_zip(path):
    raw=Path(path).read_bytes()
    with zipfile.ZipFile(path) as z:
        names=z.namelist();require(names and len(names)==len(set(names)), 'empty/duplicate ZIP')
        for i in z.infolist():
            p=PurePosixPath(i.filename)
            require(not p.is_absolute() and '..' not in p.parts and '\\' not in i.filename and ':' not in i.filename,'unsafe ZIP path')
            require(not stat.S_ISLNK(i.external_attr>>16),'ZIP symlink')
        require(z.testzip() is None,'ZIP CRC')
        require('manifest.json' in names,'manifest missing')
        m=json.loads(z.read('manifest.json'));m=m['files'] if isinstance(m,dict) else m
        require(isinstance(m,list) and m,'empty manifest')
        require(len(m)==len({r['path'] for r in m}),'duplicate manifest')
        require({r['path'] for r in m}==set(names)-{'manifest.json'},'manifest set')
        for r in m:
            b=z.read(r['path']);require(type(r['bytes']) is int and len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256'],'manifest bytes/hash')
    return {'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'entries':len(names),'manifest_files':len(m),'crc':'PASS','manifest':'PASS','unsafe_paths':False,'duplicates':False,'symlinks':False}

def verify(d):
    require(isinstance(d,dict),'object')
    for key in ['source_head','source_tree','merge_checkout','merge_tree','lab_base','lab_tree']:
        require(isinstance(d[key],str) and re.fullmatch('[0-9a-f]{40}',d[key]),key)
    require(d['source_tree']==d['merge_tree'],'merge tree mismatch')
    require(d['schema']==1,'schema')
    ev=d['evidence'];require(isinstance(ev,list) and ev,'evidence empty')
    ids=[e['id'] for e in ev];require(len(ids)==len(set(ids)),'duplicate evidence')
    for e in ev:
        require(e['basis'] in ['D','R','U'] and type(e['acquired']) is bool and e['reason'],'evidence type/reason')
        require(e['integrity']=='NOT_TESTED' if not e['acquired'] else e['integrity'] in ['PASS','PARTIAL'],'unacquired integrity')
        if 'commit' in e:require(e['commit']==d['source_head'] and e['tree']==d['source_tree'],'evidence version')
        if e['integrity']=='PASS':
            require(type(e['bytes']) is int and e['bytes']>0 and re.fullmatch('[0-9a-f]{64}',e['sha256']) and e['crc']=='PASS' and e['manifest']=='PASS','integrity evidence')
    runs=d['runs'];jobs=d['jobs'];arts=d['artifacts']
    for rows,key in [(runs,'run_id'),(jobs,'job_id'),(arts,'artifact_id')]:
        require(rows and all(type(x[key]) is int and x[key]>0 for x in rows),'id format')
        require(len(rows)==len({x[key] for x in rows}),'duplicate id')
    rr={r['run_id']:r for r in runs};jj={j['job_id']:j for j in jobs}
    require(len(runs)==19 and sum(r['conclusion']=='success' for r in runs)==17 and sum(r['conclusion']=='failure' for r in runs)==2,'formal history')
    require({r['run_id'] for r in runs if r['conclusion']=='failure'}=={44071325311,44071333914},'failure identity swap')
    for r in runs:require(r['attempt']==1 and r['head']==d['source_head'] and r['event'] in ['push','pull_request'],'run scope')
    for j in jobs:require(j['run_id'] in rr and j['attempt']==rr[j['run_id']]['attempt'],'job linkage')
    require(len(arts)==38,'artifact count')
    for a in arts:
        require(a['run_id'] in rr and a['event']==rr[a['run_id']]['event'] and a['attempt']==1,'artifact linkage')
        require(a['job_id'] is None or a['job_id'] in jj and jj[a['job_id']]['run_id']==a['run_id'],'artifact job')
        require(a['job_basis'],'job correspondence reason')
        if a['job_id'] is not None:
            require(a['engine'] in ['Chromium','WebKit'] and a['engine'].lower() in jj[a['job_id']]['name'].lower(),'artifact engine job mismatch')
        require(type(a['bytes']) is int and a['bytes']>0 and isinstance(a['sha256'],str) and re.fullmatch('[0-9a-f]{64}',a['sha256']),'artifact size/hash')
        require(type(a['fresh_acquisition']) is bool and a['fresh_acquisition']==(a['artifact_id']==14321924744),'artifact acquisition')
        require(a['new_integrity']==('PASS' if a['fresh_acquisition'] else 'NOT_TESTED'),'artifact audit promotion')
        if a['fresh_acquisition']:
            e=next(e for e in ev if e['id']=='failure-original')
            require(a['bytes']==e['bytes'] and a['sha256']==e['sha256'],'artifact raw identity')
    for group in ['gates','issues','next_gates']:
        rows=d[group];require(rows and len(rows)==len({r['id'] for r in rows}),'empty/duplicate '+group)
        for r in rows:require(r['reason'] and r['refs'] and set(r['refs'])<=set(ids),'missing basis')
    expected_issues={'formal-normal':'FAIL','missing-runtime':'UNKNOWN','byte-attribution':'UNKNOWN','terminal-events':'NOT_RECORDED','legacy-p3':'UNKNOWN'}
    require({r['id']:r['status'] for r in d['issues']}==expected_issues,'issue history overwrite')
    require({r['id']:r['status'] for r in d['next_gates']}=={'outer-review':'BLOCKED','formal-safe':'BLOCKED','browser-start':'BLOCKED'},'start gate bypass')
    gates={g['id']:g for g in d['gates']};require(set(gates)=={'G1','G2','G3','G4','G5'},'gate set')
    require([gates[g]['status'] for g in ['G1','G2','G3','G4','G5']]==['UNKNOWN','UNKNOWN','PASS','FAIL','BLOCKED'],'gate promotion')
    require(gates['G3']['scope']=='historical local six controls','local scope')
    require(d['formal']=={'normal':'FAIL','remaining_five':'NOT_TESTED','phase':'UNKNOWN','residual':'UNKNOWN','cause':'UNKNOWN','safety':'FAIL','browser':'FAIL'},'formal overwrite/unknown invention')
    require(d['local_slots']=={'planned':4,'workers':1,'browser_attempts':0,'BLOCKED':1,'NOT_TESTED':3},'slot conflation')
    require(d['acceptance']=={'contract304':'NOT_ADOPTED','stage3b':'HOLD','source_merge':'NO','production_bytes':'UNKNOWN','terminal_notifications':'NOT_RECORDED'},'acceptance overwrite')
    return 'PASS: offline record consistency only; formal safety remains FAIL'

if __name__=='__main__':
    import sys
    print(verify(json.loads(Path(sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name('ledger.json')).read_text())))
