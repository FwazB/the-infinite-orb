# Automatic powertrain stages

This local prototype uses the user-approved 1 / 50 / 100 / 400 output progression as fictional hardware tiers, not literal character transformations. The earlier discussion attributed the familiar SS1–3 ratios to guidebook material, but original guidebook pages were not directly inspected. These are agreed game constants, not a newly verified canon claim. No extra multipliers for divine forms or GT are invented.

## Progression

- Stock: ×1. Stage I: ×50, unlock at 6 m/s, hold above 4 m/s.
- Stage II: ×100, unlock at 12 m/s, hold above 8 m/s.
- Stage III: ×400, unlock at 22 m/s, hold above 15 m/s.
- Stay above the next threshold for 1.5 continuous simulation seconds to advance one stage.
- Stay below the current holding threshold for 4 continuous simulation seconds to lose one stage. Each further loss needs its own four seconds. Recovering speed clears the countdown.
- Beyond the manual starter below, only forward grounded driving earns upgrades. Reverse, freefall and hovering cannot farm upgrades. Forward motion or positive climb speed can maintain an earned stage in flight; falling speed alone does not count.
- Pausing freezes progression/cooldown and cancels partial starter charge. Destination changes carry hardware and starter cooldown but reset position and progression timers. R, a fall-respawn or reload returns to Stock. No saved progression or backend.
- Stock cannot get moving or lift on the 100g plateau. Charge the starter there or bring a stage from King Kai; upgraded thrusters can lift. Leaving a low-gravity sphere at high speed is a physical consequence, not a guaranteed ability to reach every stage on every world.

## Starter power-up

Hold **E** for 2 uninterrupted simulation seconds at Stock while grounded, below 0.5 m/s, with drive and lift released. The fictional capacitor primes **Stage I only**; it does not teleport, multiply velocity or reduce gravity. Releasing E, driving or lifting cancels partial charge. Stages II/III still require speed.

The 12-second cooldown starts on activation. The normal 4-second slowdown grace still applies: drive above 4 m/s or climb fast enough to keep Stage I. Sitting still loses the stage and cannot immediately re-charge. Cooldown pauses with the game and survives world switching. R and fall-respawn start a fresh attempt. A dedicated HUD bar shows charging and cooldown. These are gameplay tuning values, not a canon technique or an energy-storage simulation.

## Mechanics

Vehicle mass, gravity and tire grip do not multiply. Wheel output is bounded by torque-equivalent force (3,000 N × output), power (24,000 W × output / speed), and 0.7 × normal load. Rolling resistance is 0.02 × normal load; longitudinal road drag is 0.4 × speed² N. Opposing input brakes before reversing. Resistance cannot propel a stationary scooter backwards.

Independent geared governor settings are 8 / 16 / 28 / 38 m/s forward; reverse remains 3 m/s. These conservative road limits are gameplay hardware settings, NOT lore speed multipliers. This is a simplified ideal transmission and no-slip contact model, not an RPM/clutch/gearbox, combined tire-slip or thermal simulation.

Lift capacity is 45,000 N × output; a feedback controller requests only the force needed, subject to the cap. Climb governor settings are 5 / 10 / 16 / 24 m/s, with bounded acceleration requests. No instantaneous velocity multiplication. Unlimited supply remains an explicitly fictional exception; the game does not simulate the powerplant or energy cost required for these outputs.

## Visuals and accessibility

Stage I uses gold, II amber, III pale gold. A low-poly shell and up to three thin ribbons surround the unchanged vehicle geometry. No strobing, bloom, textures or new dependencies. Cockpit view hides the outside aura. Reduced motion retains a static aura and removes thruster clouds.

Thrusters emit expanding, three-lobed white condensation clouds in one instanced draw, capped at 32 puffs / 96 lobes. They expire after 0.85 seconds and clear on reset. These are decorative cues, not fluid physics. Aura geometry/materials use the existing scene disposal path.

The HUD displays stage, output ratio, charge progress and downgrade countdown. Thresholds, timings, road limits and colors are initial tuning choices, not canonical numbers. See [physics](PHYSICS.md) and [worlds](WORLDS.md).
