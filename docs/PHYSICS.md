# King Kai gravity and unlimited-supply thruster

The selected lore is King Kai / North Kaio's small planet at 10g. The radius and vehicle specifications are prototype assumptions, not canonical dimensions or Tesla specifications.

## Current model

- SI units: Earth reference g = 9.80665 m/s²; surface gravity = 98.0665 m/s² at radius 18 m. Central inverse-square acceleration uses mu = surface gravity × radius².
- Airborne motion uses velocity-Verlet with microsteps no larger than 1/600 s inside the fixed 60-Hz clock. There is no altitude ceiling.
- **Thruster fuel is unlimited at the user's request.** No depletion, pressure fade or mass loss is simulated. Nominal dry mass 220 kg plus a fixed 80 kg reservoir gives constant wet mass. The HUD displays infinity rather than a draining percentage. Numerical state remains finite; it does not contain JavaScript Infinity.
- Thrust is still capped at 45 kN. Velocity change is force × time / constant mass. The earlier finite-tank mass-flow and rocket-equation model has been replaced, not secretly retained alongside the unlimited label.
- Space requests upward motion through a force controller. Releasing Space or holding Shift cuts thrust; gravity still acts. R resets position, not fuel availability.
- Ground driving uses bounded 3000 N wheel force, rolling resistance of 0.02 × normal load, spherical contact and an 8 m/s forward / 3 m/s reverse governor. Steering in the air changes assumed attitude, not translational momentum. Landing is inelastic.
- Overview camera distance and clipping planes expand with altitude to avoid losing the scooter during sustained lift. First-person clipping range also expands. Planet view remains available with V.

## Limits

Unlimited replenishment is a deliberate **arcade exception to fuel and energy conservation**, not a real rocket design. The underlying gravity and bounded force integration do not make this an engineering-grade simulation. Aerodynamic drag, suspension, structural/impact failure, full attitude dynamics and battery supply are omitted. Gas puffs and hiss are decorative, independently generated effects. No physical human/rider is simulated.

## Reference

[Official Dragon Ball: North Kaio](https://en.dragon-ball-official.com/news/01_657.html) supports the 10g setting. All vehicle and thruster numbers remain game assumptions.
