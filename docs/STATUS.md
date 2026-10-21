# Rust/WASM migration — 2026-10-19, local only

The full browser runtime is now Rust: simulation, input/state/UI, direct WebGL2 rendering, both cameras, stages/aura/clouds and opt-in synthesized audio. All four existing destinations and their gravity disclosures remain. The generated JS provides browser bindings/loading only. Original TypeScript remains unchanged as a parity reference and offline geometry source, not a shipped game runtime. See [Rust architecture](RUST_PORT.md).

Verified on the local Chrome setup:
- 16 native Rust tests passed, including 12 recorded parity traces across four worlds and 30/60/144 Hz, plus force/gravity, timing, invalid-input, circuit, respawn and sustained-lift regressions.
- 44 existing reference/asset/security Node tests passed. `npm test` now runs both these and the Rust tests.
- All 26 development and all 26 built-production browser scenarios passed. These exercise real keyboard controls, four worlds, cockpit, starter, stages, lift, reverse, audio, pause/reset, layout, private-path restrictions and CSP inline-script denial.
- Eight actual 1920×1080 overview/cockpit captures were inspected across the four worlds. This is visual inspection, not pixel-equivalence certification.
- Typecheck, release build, Rust formatting and warning-free native/WASM Clippy passed. Documentation/provenance validation and its two regression tests passed.
- npm audit and cargo audit reported zero known vulnerabilities in their respective current dependency sets. Redacted source and static-text secret scans found no detected leaks; WASM also passed bounded forbidden-string checks. The binary scan is not an exhaustive secrets audit.
- Static build: five files, 1,247,437 raw bytes; local per-file gzip-9 total 377,909 bytes (not a measured network transfer). This is larger than the preceding JavaScript build, not a size or performance improvement claim.
- Task-owned development/preview listeners were closed at completion.

Changes remain uncommitted on `rust-port`; no push or deployment was performed. The public game remains the preceding release. Safari/Firefox, physical phones, real-speaker listening, sustained performance and hands-on handling approval remain unverified. The custom renderer is not claimed pixel-identical to Three.js.

# Signed drive velocity release

The HUD now shows signed forward/reverse drive velocity (+ forward, - reverse, 00 stopped) instead of hiding direction with an absolute speed value. Existing reverse physics and stage thresholds are unchanged. This is not vertical climb/descent velocity. Verified 44 unit/integration tests, six focused development and six production-preview browser scenarios, and typecheck/build. Browser checks cover braking into reverse on King Kai and Beerus, reset, and display fit at 1920x1080, 1280x720 and 800x600. The 1080p Beerus capture was inspected. Production publication is authorized; deployment evidence is recorded outside the public source tree.

# Starter power-up release

Hold E for two uninterrupted seconds at Stock, grounded and stopped, to prime Stage I. This makes a fresh Beerus start able to drive and lift without lowering 100g. Cooldown is 12 seconds from activation; the ordinary four-second slowdown downgrade remains. Higher stages still require speed. HUD charging/cooling feedback, pause cancellation, cooldown preservation across worlds and reset behavior are covered.

Verified: 44 unit/integration tests, 19 development and 19 production-preview browser scenarios; typecheck/build, unused-symbol check and documentation/provenance validation passed. Real keyboard tests exercised a fresh Beerus start, charge, drive, lift, idle loss, cooldown and reset. A 1080p capture was visually inspected. No new dependency or visual asset. Local test listeners are closed. Production publication is authorized for this starter update; deployment verification is recorded outside the public source tree. Difficulty tuning still needs hands-on feedback.

# Powertrain and intro-layout release

Automatic speed-earned stages, hysteresis/countdown, carried hardware between destinations, bounded torque/power/traction, stage aura and instanced cloud exhaust are implemented locally. See [powertrain rules](POWERTRAIN.md). The intro panel is bounded away from the fixed HUD and scrolls for larger text/short viewports. Verification: 38 unit/integration tests, 16 development and 16 production-preview browser scenarios passed; the final stage/layout refinements also passed a focused development rerun. Typecheck/build, unused-symbol checks and provenance validation passed. Stage III aura/cloud screenshots were inspected at 1080p. No new dependencies. The user authorized GitHub publication and static Vercel hosting for this update; deployment verification is recorded outside the public source tree. The following multi-world verification is the preceding release history.

# Multi-world release candidate — 2026-10-18

Four destinations are implemented locally: King Kai (10g canon), Earth (1g reference), Namek (1.5g assumption) and Beerus (100g fictional Whis training mode, not natural planetary gravity). The latter two values are visibly marked not canon. Distinct scenery includes a domed Kai home, Earth highlands/island home, Namek village/Ajisa-inspired trees and an inverted-pyramid Beerus realm with a tree temple. Beerus uses flat contact and edge-fall respawn. Geometry/layout remain stylized, and landmarks are not obstacle colliders.

The world picker resets/pauses safely and disposes replaced destination GPU resources. Tests covered per-world acceleration, selection/reset, flat contact/fall/respawn, destination landmarks, cockpit/lift/reset interactions and existing regressions. After the 100g update, final release verification passed 30 unit/integration tests, 14 development plus 14 production browser scenarios, typecheck/build, provenance validation and two validator regressions. The new checks establish actual 100g acceleration and confirm that bounded lift cannot overcome it. The unchanged wheel drive is severely load-limited; UI warnings disclose both limitations. All four destinations had earlier 1080p visual inspection; the updated 100g Beerus view was freshly inspected at 1080p. The short-desktop selector/launch layout also passed at 800x600 and 1280x720.

Source publication and static hosting are authorized for this release. No new dependency, imported asset or portfolio edit is included. The delimiter-path build-guard gap is corrected by retaining and checking all path suffixes; regression fixtures cover literal and encoded question/hash delimiters. Release verification receipts are stored outside the public source tree.

## Previously verified hosted prototype

The evidence below applies to the preceding deployed King Kai release, not this local multi-world iteration.

## Live game

Public production alias: https://the-infinite-orb.vercel.app

Verified deployment: https://the-infinite-ea94ym27u-fwazbs-projects.vercel.app

The user authorized prototype hosting in the personal Vercel project `the-infinite-orb`. Only the built static payload and hosting header configuration were uploaded from an isolated staging directory. No private references, source tree, tests, credentials or dependency directory were uploaded. Hosting was completed separately from source publication. The user subsequently authorized publishing this release to the existing public GitHub repository. No portfolio change was performed.

## Current scope

King Kai-inspired 10g surface gravity; spherical wheel driving; unlimited-fuel lift with bounded thrust; gravity-driven falls; original synthesized hiss and decorative gas puffs. The default whole-planet view is retained. **V or the View button switches to a first-person cockpit** with bounded drag-look, a stable local-up horizon and readable instruments. Switching does not reset movement. Pause/reset retain camera selection. The cockpit glass is lightly tinted and its central arch hidden only in the interior view; exterior geometry remains unchanged. There is no rider.

## Executed verification

- 23 unit/integration tests passed, including inverse-square gravity, constant-mass force consistency, unpowered energy behavior, sustained unlimited supply, exact spherical circuits, steering and frame-rate consistency, geometry and security guards.
- 12 development and 12 production browser scenarios passed in local Chrome. Real keyboard circuits were completed in both camera modes. Tests also cover sustained lift above 110 m, altitude-aware camera range, the infinity fuel display, exhaust, opt-in audio signal, switching, pause/reset, mobile fallback, synthetic WebGL failure, CSP and HUD separation at 1920x1080, 1280x720 and 800x600.
- Typechecking, build, documentation/provenance validation and two validator regression tests passed. The existing Three.js chunk-size advisory remains; performance budgets are not established.
- Gitleaks found no detected secrets in the final built payload. The current npm audit reported zero known dependency vulnerabilities. These are bounded checks, not a security guarantee.
- Anonymous production HTTPS returned 200. All six built files matched local SHA-256 values; configured security headers matched on every file. Eight private/source paths returned 404.
- A fresh live Chrome session verified actual cockpit driving, mode switching, lift/fuel, audio signal and silence on pause, reset, nonoverlapping HUD panels and inline-script denial. No page errors or foreign-origin requests were observed in that exercised flow.
- Actual 1080p local and live cockpit views were visually inspected. Local test servers shut down after their runs; final listener verification is recorded outside the repository.

## Limits

Unlimited replenishment is an explicit arcade exception to fuel and energy conservation. Thrust remains finite and gravity still applies. This is a simplified Newtonian point-mass game model, not Tesla engineering software or a validated physical vehicle. See [physics assumptions](PHYSICS.md). The landscape remains provisional, without full canonical landmarks or obstacle collisions. Final Blender design, Safari/Firefox regression, physical-phone and iOS Safari testing, speaker listening tests and sustained performance benchmarks remain unverified. Prototype hosting approval is not franchise permission or final vehicle approval. GitHub source publication and Vercel hosting are separate operations; this source describes the verified hosted build.

## Touch/mobile support — 2026-10-21

Phones and tablets are now playable. Rust detects coarse pointers (or the first touch) and shows an on-screen pad: steer left/right, drive, brake/reverse, gas lift, cut thrust and starter power. Each finger is tracked by pointer id, so drive and steer can be held together; drag on the sky orbits the camera. A compact layout covers portrait and landscape phones and short/narrow desktop windows, with safe-area insets. While riding, only View and Reset sit above the pad; sound, reduced motion and low graphics appear when paused. Gameplay physics are unchanged.

Verified in local Chrome with real CDP touch events at 320x568, 390x844 and 844x390: launch, two-finger drive+steer, lift, sky drag without page scroll/zoom, cockpit, pause, 100g starter by touch, and HUD blocks on-screen without overlap. Screenshots were inspected. Not verified: physical phones, iOS Safari, Android Firefox, real pinch gestures, notch insets on hardware, or sustained mobile frame rate.
