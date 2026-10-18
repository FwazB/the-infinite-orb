"""Dependency-free validation for this planning snapshot, not the game."""
import json
import hashlib
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = ['README.md', 'AGENTS.md', 'assets/manifest.json'] + [
    'docs/' + name + '.md' for name in (
        'GAME_DESIGN', 'ART_DIRECTION', 'VEHICLE_DESIGN', 'BLENDER_WORKFLOW',
        'TECHNICAL_DESIGN', 'ROADMAP', 'ACCEPTANCE', 'PUBLICATION', 'REFERENCES')]
errors = []
for name in REQUIRED:
    path = ROOT / name
    if not path.is_file():
        errors.append('Missing required file: ' + name)
    elif path.suffix == '.md' and not path.read_text().startswith('# '):
        errors.append('Missing document title: ' + name)

markdown = [ROOT / 'README.md', ROOT / 'AGENTS.md', *sorted((ROOT / 'docs').glob('*.md'))]
link_count = 0
for path in markdown:
    if not path.is_file():
        continue
    for target in re.findall(r'\[[^\]]*\]\(([^\s)]+)\)', path.read_text()):
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        link_count += 1
        resolved = (path.parent / unquote(parsed.path)).resolve()
        if ROOT not in resolved.parents or not resolved.is_file():
            errors.append(f'{path.relative_to(ROOT)}: broken/escaping file link {target}')

try:
    manifest = json.loads((ROOT / 'assets/manifest.json').read_text())
    if not isinstance(manifest, dict) or manifest.get('schemaVersion') != 1 or manifest.get('projectState') != 'local-flight-prototype' or manifest.get('publicReleaseApproved') is not False:
        raise ValueError('manifest must describe an unapproved local-flight-prototype')
    assets = manifest.get('assets')
    if not isinstance(assets, list) or not assets:
        raise ValueError('manifest needs procedural source records')
    ids = set()
    for item in assets:
        if not isinstance(item, dict) or not all(isinstance(item.get(k), str) and item[k] for k in ['id','kind','path','creator','source','rightsBasis','releaseStatus','sha256']):
            raise ValueError('manifest has an incomplete asset record')
        if item['id'] in ids:
            raise ValueError('manifest has duplicate asset identifiers')
        ids.add(item['id'])
        path = (ROOT / item['path']).resolve()
        if ROOT not in path.parents or not path.is_file() or item['kind'] != 'procedural-generator' or item['releaseStatus'] != 'review-required':
            raise ValueError('manifest asset path or review state is invalid')
        if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
            errors.append('Asset source hash mismatch: ' + item['path'])
except (OSError, ValueError) as exc:
    errors.append('Cannot read asset manifest: ' + str(exc))

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(markdown)} documents, {link_count} local file links, unapproved procedural-asset manifest.')
print('This command validates documentation/provenance only; use npm test and npm run test:browser for behavior. No rights clearance implied.')
