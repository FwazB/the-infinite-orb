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

Unlimited replenishment is an explicit arcade exception to fuel and energy conservation. Thrust remains finite and gravity still applies. This is a simplified Newtonian point-mass game model, not Tesla engineering software or a validated physical vehicle. See [physics assumptions](PHYSICS.md). The landscape remains provisional, without full canonical landmarks or obstacle collisions. Final Blender design, touch gameplay, Safari/Firefox regression, physical-phone testing, speaker listening tests and sustained performance benchmarks remain unverified. Prototype hosting approval is not franchise permission or final vehicle approval. GitHub source publication and Vercel hosting are separate operations; this source describes the verified hosted build.
