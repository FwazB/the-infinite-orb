# The Infinite Orb

**Four-world prototype — King Kai, Earth, Namek and Beerus. Enclosed scooter, unlimited thrusters, overview and cockpit views.**

The multi-world release includes fictional 100g Whis training, with its underpowered-engine limitations clearly disclosed. See [worlds, lore and explicit gravity assumptions](docs/WORLDS.md).

Working title. Unofficial Dragon Ball-inspired fan concept, not a licensed release. The current geometry is an independently authored, disposable procedural blockout; it is not Fwaz's finished Blender model.

## Play

https://the-infinite-orb.vercel.app — desktop keyboard and WebGL required. Press **V** for cockpit view, or use the **View** button.

## Run locally

Node >=22.12.0. Install the pinned dependencies with `npm ci --ignore-scripts`.

```sh
npm run dev
```

Open `http://127.0.0.1:4173` on this computer. The server binds only to loopback. For the production bundle, use `npm run build` then `npm run preview`. Do not run both servers on the same port. Stop with Ctrl-C.

## What works now

- Automatic powertrain stages, colored auras and cloud exhaust; see [stage rules](docs/POWERTRAIN.md). Includes the bounded, scrollable intro-layout fix.

- Header destination picker switches four distinct generated worlds, resets the ride and applies the selected gravity.
- Beerus uses an inverted pyramid and flat 100g Whis training plateau, not spherical contact. Stock hardware is underpowered here. Hold E for 2 seconds while stopped to charge a Stage I starter boost, or bring earned hardware from King Kai. The starter has a 12-second cooldown; idle power still fades. Namek and Beerus gravity values are explicitly labeled non-canon gameplay assumptions.

- Enclosed scooter silhouette with glass canopy, empty seat/dashboard, two wheels and cartoon shading.
- A literal small spherical planet, a wraparound road, pastel trees, lakes, flowers and puffy clouds.
- Fixed-step forward/reverse driving and steering on the curved surface, including the underside and poles.
- An orthographic camera that follows the scooter while keeping the entire globe visible.
- Inverse-square gravity, unlimited thruster fuel, bounded thrust and gravity-driven falls. Constant-mass, unlimited resupply is an explicit arcade concession. See [physics assumptions](docs/PHYSICS.md).
- Optional synthesized gas hiss and small procedural exhaust puffs. No imported audio.
- First-person cockpit view: press V or use the View button; the default whole-planet view remains available.
- Mouse-drag camera orbit, reduced-motion setting and low-resolution graphics option.
- Readable small-screen/unsupported-WebGL fallbacks. No touch gameplay.

Click **Ride scooter**. **W/S** accelerate/brake/reverse; the drive-velocity readout is positive forward and negative in reverse; **A/D** steer; **E** charges starter power while stopped; **Space** activates lift; **Shift** cuts thrust; **V** switches camera; **P/Escape** pause; **R** return to the start. Click Resume ride to continue. Release the controls to coast to a stop. Driving works without taking off. The road is a visual guide, not a rail: the scooter can explore the entire sphere.

## Not built yet

Blender master/GLB, exact final vehicle design, finished King Kai-inspired landmarks, checkpoint gameplay, scenery collisions, calibrated audio, touch controls and portfolio integration. Trees, clouds and lakes are decorative; driving through scenery is not yet blocked. No finished-game, mobile-support, cross-browser or 60-FPS guarantee is claimed.

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
