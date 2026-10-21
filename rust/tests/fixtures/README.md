# Frozen TypeScript parity oracle

`legacy-parity.json` records the independently authored TypeScript simulation at game revision `9ca0a2dbe337f3616a022b3d66dfdc35e0cb7a10`. Those reference `src/*.ts` files are retained unchanged and are not imported by the browser entry point.

From the repository root, `npx tsx rust/tests/generate-parity.ts` regenerates actual observations for four worlds at 30/60/144 Hz: starter, forward driving, steering, lift, reverse and idle. The Rust integration test replays the inputs and compares every recorded numeric state/powertrain field at absolute tolerance 1e-7, plus boolean fields exactly. Do not modify the reference controller or hand-edit expected numbers to accommodate a Rust regression.
