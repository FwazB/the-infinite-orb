# Verification state — first local playable

## Current scope

Fwaz approved the enclosed motorcycle direction with no character and authorized building. A standalone simulation was tested first; the browser view/UI was then integrated in a separate step. The result is a local M1-style playable blockout, not the final game. The procedural bike is provisional and not a Blender deliverable. Public source publication is authorized; hosted-game release, final art approval and rights clearance remain separate.

## Executed checks

- Twelve Node/unit/integration cases passed: simulation invariants and cadence equivalence; credential/source-art ignore rules; encoded-path denial against a real fixture server; rejection of sensitive public files, symlinks and private raw imports; successful safe-asset builds; and production/header configuration consistency.
- Five Playwright scenarios passed against development and again against the built production preview in locally installed Chrome: keyboard flight/recovery; small-screen fallback; synthetic WebGL failures; settings/private-path denial; and actual response headers with normal flight free of CSP violations and an injected inline probe blocked.
- TypeScript checking and production build passed. Build retains one advisory warning: the isolated Three.js chunk exceeds 500 kB minified (about 135 kB gzip in this build). It is not a failed build.
- All-dependency and production-only audits reported zero known vulnerabilities; registry signature verification passed. These checks are not a comprehensive security guarantee.
- Documentation/provenance checks and their failure-path regression test passed, including stale procedural-source hashes.
- Built preview returned HTTP 200 and loaded its JS/CSS. Its artifact list contains HTML/CSS/JS and a static-host header policy, not private reference pictures.
- An actual browser loaded the built preview at 1920x1080, took off and moved using keyboard events, then paused. Visible altitude/distance changed. Preview and flight screenshots were inspected.

## Limits

No Blender installation/MCP, GLB export, final art approval, route gameplay, full-world or obstacle-collision implementation, audio, real-phone test, Safari/Firefox regression, sustained performance benchmark, GPU-memory benchmark, forced physical GPU-loss test or human playtest. Synthetic context-loss dispatch tests the UI recovery handler, not actual driver failure. Low graphics reduces pixel ratio; reduced-motion also disables bike banking/bobbing and tightens camera follow.

All flat ground is landable in v0. Distant trees are decorative and outside the flight boundary. The 60-FPS and broader scene budgets remain goals rather than verified release criteria. M1's final feel approval awaits Fwaz trying it.

## Local state

The initial reviewed source snapshot targets the public FwazB/the-infinite-orb repository on main. A temporary loopback preview can be run with npm run preview. Source publication does not deploy the game or change the portfolio. Private reference material remains excluded. The motorcycle is the selected direction.

## Security remediation — October 18, 2026

Expanded credential and recursive Blender exclusions; added development/preview path guards and build-time public-asset/import guards; removed unnecessary personal metadata from publication documents. Strict production browser headers now have matching Vercel and compatible static-host configuration. See [Security](SECURITY.md). This is locally verified configuration, not a deployed-host audit. Licensing, asset-release flags and rights approval were not changed.

## Next gate

Review the playable feel and motorcycle silhouette before detailed Blender work or expanding the world. See the roadmap for subsequent independent capabilities.
