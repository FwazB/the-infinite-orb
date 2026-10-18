# Verified prototype release — 2026-10-18

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
