# Rust/WASM migration

## Runtime

The browser executes Rust, not a wrapper around the previous Three.js game:
- `rust/src/physics.rs`: fixed 60-Hz simulation, bounded catch-up, sphere/plateau integration, gravity, finite thrust with unlimited fuel, drive/reverse, stages and starter.
- `rust/src/render.rs`: direct WebGL2 buffers/shaders, globe/cockpit cameras, wheel animation, bounded cloud exhaust and stage aura. Reduced motion and low-resolution rendering remain available.
- `rust/src/web.rs`: input/focus/visibility lifecycle, world selection, launch/pause/reset, accessible DOM instruments, synthesized opt-in Web Audio and failure handling.
- `rust/src/assets.rs`: validates the compiled geometry and world catalog. All four worlds are uploaded once into bounded batches; switching does not allocate duplicate world resources. GPU resources are released on non-persisted page exit.
- `rust/ui.html` and `src/style.css`: presentation. `src/boot.js` and generated wasm-bindgen JavaScript only load/bind the WASM module; no gameplay or Three.js executes in JavaScript.

Rust binds the browser's WebGL2 and Web Audio APIs through web-sys. This is a browser game, not a native desktop executable. Original geometry is retained; the custom toon renderer is not a pixel-identical Three.js renderer. Procedural hiss preserves the opt-in signal behavior, not a bit-identical noise sequence.

## Source retention and assets

The original `src/*.ts` files remain unchanged from the preceding revision as a frozen numerical oracle and offline procedural geometry source. They are not imported by `src/boot.js` and are not in the production browser request graph. Three.js is now dev-only.

`npm run assets:rust` deterministically exports `rust/generated/scene.bin` and `worlds.json`. Geometry is deduplicated before serialization; materials/transforms are recorded as instances. Rust batches compatible meshes at load time. Ordinary Rust builds use these checked-in, provenance-registered assets and do not run Three.js. Keep the authored UI in `rust/ui.html`, not the retired TypeScript entry point.

`rust/tests/fixtures/legacy-parity.json` contains actual observations from revision `9ca0a2dbe337f3616a022b3d66dfdc35e0cb7a10`: four worlds at 30/60/144 Hz. Native Rust tests replay every checkpoint at absolute numeric tolerance 1e-7. Additional Rust regressions cover high-gravity force limits, edge falls/respawn, a spherical circuit, timing/invalid inputs, conservation behavior and eventual unpowered landing after sustained lift. Existing Node tests still check the frozen reference, asset authorship and security guards; they are not represented as Rust tests.

## Build

Tested with Rust 1.96.0, wasm-pack 0.14.0 and the installed desktop Chrome. `npm run dev` first builds WASM; after editing Rust while Vite is running, run `npm run build:wasm` and reload. Rust files do not have automatic HMR.

`npm run build` typechecks tooling, builds locked release WASM, applies wasm-opt, and packages static output with Vite. The build remaps developer home/repository paths out of WASM diagnostics. Target and binding-output directories are ignored. Cargo.lock is retained; no generated tool caches belong in Git.

The CSP grants `wasm-unsafe-eval` specifically for WASM compilation, not JavaScript `unsafe-eval`. Production retains self-only resources, inline-script denial, private-path protection and no analytics/backend. Update shared/static-host policies together.

## Publication and limits

The migration is local on `rust-port`; the existing live game is unchanged. Publishing source or a new static deployment requires separate approval. Static deployment must use the reviewed `dist/` staging workflow, not upload the repository or assume a Node-only host can compile Rust.

Passing behavioral tests does not prove pixel equivalence, a performance improvement, sustained 60 FPS, Safari/Firefox support or physical-phone compatibility. The WASM transfer is larger than the preceding JavaScript runtime; do not market this as a size optimization. Art, scenery collision and hands-on handling approval remain outside this migration. Touch controls were added afterwards in Rust (`rust/src/web.rs`); they are tested with real Chrome touch events in emulated 320x568, 390x844 and 844x390 viewports, not on physical phones or iOS Safari.
