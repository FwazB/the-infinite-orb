# The Infinite Orb

**Local playable v0 — an enclosed flying motorcycle, no character.**

Working title. Unofficial Dragon Ball-inspired fan concept, not a licensed release. The current geometry is an independently authored, disposable procedural blockout; it is not Fwaz's finished Blender model.

## Run locally

Node >=22.12.0. Install the pinned dependencies with `npm ci --ignore-scripts`.

```sh
npm run dev
```

Open `http://127.0.0.1:4173` on this computer. The server binds only to loopback. For the production bundle, use `npm run build` then `npm run preview`. Do not run both servers on the same port. Stop with Ctrl-C.

## What works now

- Enclosed motorcycle silhouette with glass canopy, empty seat/dashboard and two visible wheels.
- Flat test meadow, distant decorative scenery and a launch pad.
- Fixed-step forward/reverse motion, steering, ascent/descent, hover and a chase camera.
- Ground/altitude/world-boundary containment; pause on blur/tab hide; reset.
- Mouse-drag camera orbit, reduced-motion setting and low-resolution graphics option.
- Readable small-screen/unsupported-WebGL fallbacks. No touch gameplay.

Controls: **W/S** accelerate/brake/reverse; **A/D** steer; **Space/Shift** rise/descend; **P/Escape** pause; **R** return to launch. Click Resume to continue. Release thrust to slow into a hover. Every point on the flat field is landable in v0; tagged pads and obstacle gameplay belong to later milestones.

## Not built yet

Blender master/GLB, exact final vehicle design, full Supreme Kai environment, checkpoint route, obstacle collision course, sound, touch controls and portfolio integration. Decorations sit outside the flight boundary. No finished-game, mobile-support, cross-browser or 60-FPS guarantee is claimed.

## Verify

```sh
npm test
npm run build
npm run test:browser
npm run test:browser:production
python3 scripts/check_plan.py
python3 scripts/test_check_plan.py
```

Browser tests use an installed Google Chrome on macOS when present; otherwise set `BROWSER_EXECUTABLE` or install Playwright Chromium explicitly. They start isolated loopback servers on port 4175 (development) or 4176 (built production preview), then close them. Screenshots and JSON output live in ignored `test-results/`. Security fixtures use that ignored directory by default, or an explicitly supplied `SECURITY_TEST_TMPDIR`, and are removed after each test.

## Design and roadmap

1. [Game design and scope](docs/GAME_DESIGN.md)
2. [World and visual direction](docs/ART_DIRECTION.md)
3. [Vehicle design brief](docs/VEHICLE_DESIGN.md)
4. [Blender and optional MCP workflow](docs/BLENDER_WORKFLOW.md)
5. [Technical design](docs/TECHNICAL_DESIGN.md)
6. [Milestones](docs/ROADMAP.md)
7. [Acceptance matrix](docs/ACCEPTANCE.md)
8. [Portfolio and release boundaries](docs/PUBLICATION.md)
9. [Sources and open decisions](docs/REFERENCES.md)
10. [Current verification and limitations](docs/STATUS.md)
11. [First-playable design decisions](docs/PLAYABLE_DESIGN.md)
12. [Security policy and deployment checks](docs/SECURITY.md)

[Procedural asset register](assets/manifest.json) · [Agent boundaries](AGENTS.md)

The broad plan describes future milestones, not everything in v0. Fwaz retains design approval. No unrelated proprietary implementation or private dependencies belong in this project. Source publication, game hosting and portfolio changes require separate approval. No AI co-author or generated-by attribution. The three user-supplied images remain ignored, nonshipping references and are not included in dist.
