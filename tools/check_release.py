import hashlib,json,re,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'module.json').read_text(encoding='utf-8'))
p=json.loads((root/'package.json').read_text(encoding='utf-8'))
files=['module.json','scripts/main.js','scripts/sources.js','styles/maneuvers.css','README.md','LICENSE','CHANGELOG.md','docs/architecture.md','docs/testing.md']
assert m['id']==p['name'] and m['version']==p['version']
assert m['manifest']==m['url']+'/releases/latest/download/module.json'
assert m['download']==m['url']+'/releases/download/v'+m['version']+'/module.zip'
assert m['license']=='LICENSE' and 'packs' not in m
assert m['compatibility']['verified']=='14.369'
out=root/'dist'
assert (out/'module.json').read_bytes()==(root/'module.json').read_bytes()
with zipfile.ZipFile(out/'module.zip') as z:
 assert sorted(z.namelist())==sorted(files) and z.testzip() is None
 for name in files:
  assert z.read(name)==(root/name).read_bytes(),name
  assert not re.search(r'C:[/\\]codex|\.cloudapp\.azure\.com|/data/maintenance|FOUNDRY_ADMIN_KEY|session=|Hwayeon|Creed',z.read(name).decode('utf-8')),name
for line in (out/'SHA256SUMS').read_text().splitlines():
 digest,name=line.split('  ',1)
 assert digest==hashlib.sha256((out/name).read_bytes()).hexdigest()
print('Release metadata, exact archive allowlist, source parity, privacy boundaries and checksums verified.')
