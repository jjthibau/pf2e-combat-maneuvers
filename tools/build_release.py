import argparse,hashlib,json,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=['module.json','scripts/main.js','scripts/sources.js','styles/maneuvers.css','README.md','LICENSE','CHANGELOG.md','docs/architecture.md','docs/testing.md']
parser=argparse.ArgumentParser();parser.add_argument('--tag');args=parser.parse_args()
manifest=json.loads((root/'module.json').read_text(encoding='utf-8'))
if args.tag is not None and args.tag!='v'+manifest['version']:raise SystemExit('Release tag must match module version.')
out=root/'dist';out.mkdir(exist_ok=True)
with zipfile.ZipFile(out/'module.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in files:
  entry=zipfile.ZipInfo(name,(2026,1,1,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED
  z.writestr(entry,(root/name).read_bytes())
proof={'id':'pf2e-combat-maneuvers','version':json.loads((root/'module.json').read_text())['version'],'sha256':hashlib.sha256((out/'module.zip').read_bytes()).hexdigest(),'files':{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in files}}
(out/'build.json').write_text(json.dumps(proof,indent=2))
(out/'module.json').write_bytes((root/'module.json').read_bytes())
(out/'SHA256SUMS').write_text(''.join(f'{hashlib.sha256((out/name).read_bytes()).hexdigest()}  {name}\n' for name in ['module.json','module.zip']),encoding='utf-8')
(out/'RELEASE_NOTES.md').write_text(f"PF2e Combat Maneuvers {manifest['version']}\n\nCompact native-style maneuver controls with automatic hand/weapon selection, MAP and native target defense checks.\n\nTested on Foundry 14.369 / PF2e 8.6.0. See README for scope and limitations.\n\nInstall manifest: {manifest['manifest']}\n",encoding='utf-8')
print(f'Built {len(files)} allowlisted files for {manifest["version"]}.')
