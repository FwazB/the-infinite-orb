# Destination gravity and unlimited-supply thruster

The local selector uses per-world gravity. See [worlds and evidence](WORLDS.md). King Kai remains the default 10g world described below. Earth uses 1g; Namek 1.5g and Beerus 100g are explicitly labeled gameplay assumptions. Spherical worlds retain inverse-square gravity. Beerus uses a flat 28 m square platform, constant downward gravity and edge-fall respawn, integrated in microsteps with bounded thrust; its vertical solver is semi-implicit Euler rather than the spherical velocity-Verlet solver.

The selected lore is King Kai / North Kaio's small planet at 10g. The radius and vehicle specifications are prototype assumptions, not canonical dimensions or Tesla specifications.

## Current model

- SI units: Earth reference g = 9.80665 m/s²; surface gravity = 98.0665 m/s² at radius 18 m. Central inverse-square acceleration uses mu = surface gravity × radius².
- Airborne motion uses velocity-Verlet with microsteps no larger than 1/600 s inside the fixed 60-Hz clock. There is no altitude ceiling.
- **Thruster fuel is unlimited at the user's request.** No depletion, pressure fade or mass loss is simulated. Nominal dry mass 220 kg plus a fixed 80 kg reservoir gives constant wet mass. The HUD displays infinity rather than a draining percentage. Numerical state remains finite; it does not contain JavaScript Infinity.
- Stock thrust is capped at 45 kN; earned stages scale capacity by the output ratios in [powertrain rules](POWERTRAIN.md). Velocity change is force × time / constant mass. The earlier finite-tank mass-flow and rocket-equation model has been replaced, not secretly retained alongside the unlimited label.
- Space requests upward motion through a force controller. Releasing Space or holding Shift cuts thrust; gravity still acts. R resets position, not fuel availability.
- Ground driving uses bounded wheel torque/power and unmultiplied tire grip, rolling resistance of 0.02 × normal load and road drag of 0.4 × speed² N. Stock has an 8 m/s forward / 3 m/s reverse governor; earned stages use separate higher forward limits. Steering in the air changes assumed attitude, not translational momentum. Landing is inelastic.
- Overview camera distance and clipping planes expand with altitude to avoid losing the scooter during sustained lift. First-person clipping range also expands. Planet view remains available with V.

## 100g training consequences

The user-selected Whis challenge is an artificial, non-canon gameplay mode. At 300 kg, 100g produces 294,199.5 N weight. Stock 45,000 N lift cannot overcome it, and stock 3,000 N wheel force cannot overcome the 5,883.99 N rolling-resistance load. Stock stays stationary rather than numerically jittering. Earned hardware stages carry between destinations and can supply sufficient lift, without reducing gravity. See [powertrain rules](POWERTRAIN.md).

## Limits

Unlimited replenishment is a deliberate **arcade exception to fuel and energy conservation**, not a real rocket design. The underlying gravity and bounded force integration do not make this an engineering-grade simulation. Airborne aerodynamic drag, suspension, structural/impact failure, full attitude dynamics and battery supply are omitted. Gas puffs and hiss are decorative, independently generated effects. No physical human/rider is simulated.

## Reference

[Official Dragon Ball: North Kaio](https://en.dragon-ball-official.com/news/01_657.html) supports the 10g setting. All vehicle and thruster numbers remain game assumptions.
