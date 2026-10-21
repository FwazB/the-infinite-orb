# Roadmap and decision gates

## Rust migration — local only

The whole browser game runtime is ported to Rust/WASM with direct WebGL2 and the same four-world gameplay. See [Rust design](RUST_PORT.md) and [verification status](STATUS.md). This changes implementation language, not the unfinished gameplay/art milestones below. This migration has not been pushed or deployed; earlier release authorizations are historical, not new publication permission.

## Current direction update — King Kai at 10g

Fwaz requested the whole planet in view, scooter driving around it and more cartoon-like graphics. The local revision implements a literal spherical surface, seam-free driving, a whole-globe camera and a procedural cartoon scene. This supersedes M1's flat ground and close chase view below. The gravity revision adds unlimited-fuel lift, procedural audio and a first-person cockpit toggle. Prototype hosting is explicitly authorized. Final vehicle modeling, canonical landmarks, collisions, route gameplay and performance benchmarks remain unfinished. See [current status](STATUS.md) and [playable decisions](PLAYABLE_DESIGN.md).

## M0 — Plan (this repository)

Deliverables: product scope, vehicle/world briefs, Blender workflow, architecture, acceptance matrix, provenance register and release boundary. Validate documentation links and manifest. No game, art or benchmark is claimed.

## M1 — Standalone flight blockout (first implementation)

Current: a local playable blockout is implemented and exercised; Fwaz's hands-on feel approval remains pending. See [status](STATUS.md). Later milestones are not complete.

Build only keyboard flight, flat ground, primitive vehicle, chase camera, pause and reset. Run without model imports, portfolio code or network services. Prove frame-rate independence, blur/reset behavior, stopping and boundary handling. Fwaz tests steering manually; tune feel before art. Exit when the movement is enjoyable and the critical behavior tests pass. Do not add a full island or vehicle modeling in this capability's initial change.

## M2 — Vehicle design and export rehearsal

In parallel only if explicitly requested, Fwaz refines the supplied motorcycle reference and authors/approves silhouettes. Establish Blender location/version and decide whether MCP is necessary. Export the simple test model and verify axes/materials in a standalone viewer. Exit with approved rough vehicle and reproducible export. No paid model generation or detailed decoration before approval.

## M3 — Separate integration: approved vehicle into flight

Replace the primitive only after M1 and M2 work independently. Test camera fit, scale, collider dimensions, banking and material appearance. Keep the primitive fallback for diagnosing asset failures. Exit with one flyable approved vehicle in the test environment.

## M4 — World blockout and route

Build the terrain/landmark capability in isolation, then wire it into the flight scene separately. Add tagged landing locations, obstacle handling and six optional route rings. Use rough geometry. Check scale, navigation and camera collision. Exit with an entire short loop, safe reset and no need for final art.

## M5 — One visual slice, then world expansion

Finish one representative tree/terrain/vehicle vista and validate its browser rendering and performance. Fwaz approves it before expanding the remaining world. Add light UI and optional properly sourced audio. Do not substitute a rendered trailer for playable verification.

## M6 — Release candidate

Run the acceptance matrix, measure budgets, test current desktop Chrome/Firefox/Safari on actual available hardware, verify non-WebGL/mobile fallback, conduct provenance review and capture a real 1080p walkthrough. Document unsupported platforms and remaining defects. No public deployment yet.

## M7 — Explicit publication, then portfolio link

Resolve fan-content/publication decision. With approval, deploy the static game separately and verify the exact hosted build and assets. Only then, with portfolio-edit authorization, add a card/link on fwaz.one. Verify the link, keyboard navigation, mobile layout and unchanged existing pages. Source hosting, game deployment and portfolio publication are separate actions.

## Stop or reduce scope

If movement is unsatisfying, do not hide it with art. If rendering misses budgets, simplify vegetation/materials/postprocessing before enlarging the world. If publication rights are unresolved, keep the fan version local; an original-setting alternative requires Fwaz's explicit design choice. If MCP is unavailable, ordinary Blender/headless authoring remains viable after installation is authorized.

## Decisions before M2 and before release

Before M2: final interpretation of the supplied motorcycle reference; hands-on versus directed modeling; approved world reference details. Before release: fan recreation versus original public variant, content permissions, public title, source license/visibility, deployment destination and mobile support claims. These choices need not block M1's neutral primitives.

## Estimates

No reliable completion date is promised before the flight and export spikes. Track time spent by milestone and reassess after M1/M2. Asset iteration and browser/device validation are likely schedule drivers; do not describe this as a finished game after a single coding session.
