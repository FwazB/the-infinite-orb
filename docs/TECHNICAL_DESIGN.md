# Technical design

## Proposed stack and architecture

Static browser app using TypeScript, Vite and Three.js. The initial compatible dependencies are now pinned in package.json/package-lock.json; inspect those files for the installed versions. The broader architecture below includes future work beyond the local v0. Use GLTFLoader for runtime models. No backend, accounts, model API, database or unrelated proprietary service dependency.

Keep the first flight-controller capability independent from art/UI integration. Proposed modules:
- input: keyboard/pointer → normalized commands; focus and blur handling;
- flight: pure simulation state and fixed-step update;
- collision: terrain height and simple obstacle queries;
- world: terrain, landmark/landing tags and route data;
- render: scene, lighting, GLB import and quality policy;
- camera: independent chase/orbit behavior;
- game: start/pause/explore/route-complete/reset states;
- ui/audio: explicit user settings and activation.

The UI never directly edits mesh positions. Render state derives from simulation snapshots. Model files do not execute scripts. Local settings, if added, use a versioned optional localStorage record and fail safely when storage is unavailable; no recording or telemetry.

## Simulation contract

FlightState includes position, velocity, heading, visual bank, grounded state and last safe spawn. Input is normalized and clamped. Use a fixed timestep with bounded catch-up and render interpolation. Cap accumulated time after stalls; hidden tabs pause rather than simulating minutes on resume. The same input sequence should produce equivalent results at different render rates within declared tolerance.

Start with damped arcade motion and a terrain heightfield. Use simple capsule/sphere-vs-static proxies and swept movement or substeps near obstacles to avoid high-speed tunneling. A full rigid-body engine is a later decision only if a real behavior requires it. Landing needs tagged surfaces, height tolerance and bounded speed; pressing down elsewhere must not sink the vehicle into terrain.

## Camera and interaction

Third-person only in v1. Camera easing must not lag into geometry: use a ray/sweep toward the desired camera point and shorten its distance when obstructed. Clamp orbit pitch and restore a stable horizon. Accessible DOM buttons own start/pause/reset; a canvas alone is not the entire interface. Help and project description remain readable without WebGL.

## Loading and disposal

Show lightweight poster/help first. Explicit Fly begins loading; show progress, retry and an actionable failure state. Code and asset fetching must not block the existing portfolio page. Validate asset limits, handle decode failure and dispose geometries, materials, textures and listeners when restarting or unmounting. Handle WebGL context loss without a blank permanent screen. AudioContext starts only after user interaction; mute persists only if storage works.

## Proposed performance budgets

These are acceptance targets to measure, not verified capabilities:
- Desktop reference: a documented WebGL2-capable laptop/desktop, 1080p viewport, 60 FPS target on a fixed route; report median/p95 frame time and worst stalls after warm-up.
- Initial compressed download target <=10 MiB before optional assets; total v1 transfer target <=25 MiB.
- Visible scene target <=200,000 triangles and <=120 draw calls; shared materials/instancing encouraged.
- Device pixel ratio capped at 1.5 initially; quality may lower shadow resolution, vegetation and pixel density.
- Proposed texture budget <=256 MiB desktop and <=128 MiB mobile; measure GPU-facing estimates rather than only file sizes.
- Mobile gameplay is deferred. A later touch tier targets 30 FPS on a named real device; emulation alone does not pass it.

Profile before optimizing. Missing a budget triggers scoped simplification or an explicit revised target, not silently degraded functionality.

## Build and test plan

Future scripts should include test, typecheck, build and browser smoke. Unit tests target flight invariants and collision behavior. Browser tests cover focus, pause, reset, load/error states and settings. Visual checks use actual rendered frames and repeatable camera positions. Dependency audit and asset provenance review happen before public release. No production build success is a substitute for physical control testing.
