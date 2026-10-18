"""Exercise the plan validator against real disposable file trees."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PlanCheckTest(unittest.TestCase):
    def test_accepts_plan_and_rejects_broken_document_or_manifest(self):
        with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as temp:
            clone = Path(temp) / 'plan'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns('.git', '__pycache__', 'node_modules', 'dist', 'test-results', 'private'))

            def run():
                return subprocess.run([sys.executable, str(clone / 'scripts/check_plan.py')],
                                      text=True, capture_output=True)

            result = run()
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            readme = clone / 'README.md'
            original = readme.read_text()
            readme.write_text(original + '\n[Broken](docs/absent.md)\n')
            result = run()
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('absent.md', result.stdout + result.stderr)
            readme.write_text(original)
            manifest = clone / 'assets/manifest.json'
            saved = manifest.read_text()
            manifest.write_text('{invalid')
            result = run()
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('manifest', result.stdout + result.stderr)
            manifest.write_text(saved)
            source = clone / 'src/motorcycle.ts'
            before = source.read_text()
            source.write_text(before + '\n// changed asset source\n')
            result = run()
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('hash', result.stdout + result.stderr)
            source.write_text(before)
            (clone / 'docs/ROADMAP.md').unlink()
            result = run()
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('ROADMAP.md', result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
