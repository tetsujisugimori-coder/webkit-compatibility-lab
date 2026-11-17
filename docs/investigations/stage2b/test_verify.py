import copy,hashlib,json,tempfile,unittest,zipfile
from pathlib import Path
from verify import verify,audit_zip
D=json.loads(Path(__file__).with_name('ledger.json').read_text())
class LedgerTests(unittest.TestCase):
 def test_valid(self):self.assertIn('formal safety remains FAIL',verify(D))
 def test_faults(self):
  changes=[lambda d:d['artifacts'][0].update(new_integrity='PASS'),lambda d:d['evidence'][0].update(commit='bad'),lambda d:d['issues'][0].update(status='PASS'),lambda d:d['artifacts'][0].update(sha256='bad'),lambda d:d['next_gates'][0].update(status='PASS'),lambda d:d.update(source_head='x'),lambda d:d.update(merge_tree='0'*40),lambda d:d.update(evidence=[]),lambda d:d['evidence'].append(d['evidence'][0]),lambda d:d['evidence'][2].update(integrity='PASS'),lambda d:d['evidence'][0].update(bytes=0),lambda d:d['runs'][0].update(attempt=2),lambda d:d['runs'][0].update(head='0'*40),lambda d:d['jobs'][0].update(run_id=1),lambda d:d['artifacts'][0].update(job_id=1),lambda d:d['artifacts'].pop(),lambda d:d['gates'][0].update(refs=['unknown']),lambda d:d['gates'][3].update(status='PASS'),lambda d:d['gates'][2].update(scope='formal'),lambda d:d['formal'].update(cause='slow runner'),lambda d:d['formal'].update(remaining_five='BLOCKED'),lambda d:d['local_slots'].update(browser_attempts=1),lambda d:d['acceptance'].update(terminal_notifications='ABSENT'),lambda d:d['acceptance'].update(source_merge='YES'),lambda d:d.update(next_gates=[])]
  for i,f in enumerate(changes):
   with self.subTest(i=i):
    d=copy.deepcopy(D);f(d)
    with self.assertRaises((ValueError,KeyError,TypeError)):verify(d)
 def test_identity_swaps(self):
  d=copy.deepcopy(D);next(a for a in d['artifacts'] if a['artifact_id']==14321924744)['job_id']=133998000362
  with self.assertRaises(ValueError):verify(d)
  d=copy.deepcopy(D);next(r for r in d['runs'] if r['conclusion']=='success')['conclusion']='failure';next(r for r in d['runs'] if r['run_id']==44071325311)['conclusion']='success'
  with self.assertRaises(ValueError):verify(d)
 def test_archive(self):
  with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as td:
   p=Path(td)/'a.zip';data=b'proof';m=[dict(path='proof.txt',bytes=5,sha256=hashlib.sha256(data).hexdigest())]
   cases=[({'proof.txt':data,'manifest.json':json.dumps(m).encode()},True),({'proof.txt':b'wrong','manifest.json':json.dumps(m).encode()},False),({'manifest.json':b'[]'},False),({'proof.txt':data},False),({'../proof':data,'manifest.json':b'[]'},False),({'proof.txt':data,'extra':data,'manifest.json':json.dumps(m).encode()},False)]
   for entries,valid in cases:
    with zipfile.ZipFile(p,'w') as z:
     for n,b in entries.items():z.writestr(n,b)
    if valid:self.assertEqual(audit_zip(p)['manifest'],'PASS')
    else:
     with self.assertRaises(ValueError):audit_zip(p)
 def test_archive_adversarial(self):
  with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as td:
   p=Path(td)/'bad.zip'
   with zipfile.ZipFile(p,'w') as z:
    import warnings
    with warnings.catch_warnings():
     warnings.simplefilter('ignore');z.writestr('a',b'a');z.writestr('a',b'a')
   with self.assertRaises(ValueError):audit_zip(p)
   with zipfile.ZipFile(p,'w') as z:
    i=zipfile.ZipInfo('link');i.create_system=3;i.external_attr=0o120777<<16;z.writestr(i,b'target')
   with self.assertRaises(ValueError):audit_zip(p)
   with zipfile.ZipFile(p,'w',compression=zipfile.ZIP_STORED) as z:z.writestr('proof',b'UNIQUEPROOF')
   b=p.read_bytes();p.write_bytes(b.replace(b'UNIQUEPROOF',b'UNIQUEPROOf'))
   with self.assertRaises((ValueError,zipfile.BadZipFile)):audit_zip(p)
if __name__=='__main__':unittest.main()
