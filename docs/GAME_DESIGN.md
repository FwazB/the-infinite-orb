# Game design

## Current local slice

The current user-directed slice is whole-planet scooter driving with a cartoon presentation. The sphere is fully traversable, the camera keeps the whole globe visible, and hover is optional. The older route, collision and tagged-landing proposals below are not implemented. See [playable decisions](PLAYABLE_DESIGN.md) for the active behavior.

## North star

A short, inviting flying experience that makes the player want to look around. The fantasy is visiting the calm, otherworldly landscape associated with Supreme Kai while piloting Fwaz's interpretation of the selected enclosed motorcycle, without a rider character. It is not the dense city from the SpikeRiser reference; that clip informs illustrated rendering and movement appeal, not the setting or asset design.

## Audience and session

Portfolio visitors who should understand the interaction without a tutorial video. Design for a satisfying two-to-five-minute visit, with optional longer free flight. These are design goals, not measured user behavior.

## Core loop

1. A lightweight title/poster loads before the 3D scene.
2. User explicitly starts; controls remain visible and audio stays off until enabled.
3. Lift off from the starting pad and learn steering in open space.
4. Follow one optional landmark route or ignore it and explore.
5. Land at an overlook, inspect the vehicle, or return to the start.
6. Reset route or continue free flight without reloading the page.

## First playable scope

- One vehicle, one compact world, one stable chase camera.
- Six ordered rings on one optional route, plus three scenic landing locations.
- Hover, accelerate, brake, yaw, ascend and descend; gentle visual banking.
- Soft collision response and reset to the last safe landing point.
- Start, pause, restart, mute, quality settings and a visible controls panel.
- Optional route completion feedback; no leaderboard, login, monetization or analytics.
- Fwaz chose an enclosed cockpit with no character; no character likeness, rider model or rider animation is part of this build.

## Controls, proposed

Keyboard: W accelerates, S brakes/reverses slowly, A/D turn, Space ascends, Shift descends, R resets, P/Escape pauses. Mouse drag orbits temporarily; chase framing eases back after release. Avoid pointer lock in v1. Do not capture keys while a UI field has focus. Prevent page scrolling only while the focused game handles a relevant key; clear pressed state on blur.

Boost is deferred until ordinary flight is comfortable. Gamepad and touch are separate later capabilities, not implied by desktop completion. Mobile initially receives an honest preview/description and controls-support notice, never an empty canvas or broken Start button.

## Flight feel

Arcade hovercraft, not an aircraft simulator: no stalls, fuel, gravity-induced freefall or obligatory forward motion. Input acceleration and angular speed are bounded. Visual pitch/roll follows motion but must not distort collider orientation unpredictably. Camera damping and speed curves are tunable data, not scattered constants. Land only below the approved descent/speed thresholds on tagged surfaces; elsewhere hover or slide safely.

## Comfort and recovery

No camera shake or flashing by default. Reduced-motion mode suppresses banking effects, camera lag and decorative motion while preserving steering. Provide a stable horizon and adjustable sensitivity. Pause on tab hide; resume requires user action and discards accumulated elapsed time. World boundaries fade/warn before a soft turnback; an explicit reset handles out-of-bounds or invalid numerical state.

## Not in v1

Combat, quests/dialogue, multiplayer, procedural planets, an explorable city, character animation, cockpit camera, vehicle selection, photo-mode editor, weather simulation, persistent online accounts and paid generation services. They are not hidden acceptance requirements.

## Success definition

A new visitor can start, take off, steer toward a landmark and recover from a mistake without explanation. The vehicle is readable from behind, the world evokes the approved references, and flight remains enjoyable without the ring route. Validate with observation of consenting testers, not only an agent's aesthetic score.
