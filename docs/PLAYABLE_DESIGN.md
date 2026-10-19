# Tiny-planet playable decisions

## Local multi-world extension

The header now selects King Kai, Earth, Namek or Beerus. Switching pauses/resets the ride and returns to overview; R retains the destination. Three worlds use spherical contact; Beerus has a flat plateau and inverted-pyramid/tree-temple silhouette. Canon gravity, Earth reference and explicit gameplay assumptions are distinguished in the UI. See [worlds and sources](WORLDS.md). These are stylized scenes with decorative landmarks, not complete canonical geography or terrain collision.

The selected setting is King Kai's small planet at 10g, following the user's official-lore choice. Earlier Supreme Kai / Grand Kai interpretations are superseded. The entire globe remains visible in the default Planet view. The enclosed scooter has no character; final vehicle design remains subject to Fwaz's approval.

## Automatic powertrain stages

Speed-earned hardware stages add bounded wheel power and lift capacity, a gold/amber/pale-gold field and instanced condensation clouds. The stage HUD shows threshold charge and slow-speed downgrade grace. See [powertrain behavior and limits](POWERTRAIN.md). Mass, gravity and grip are not multiplied; current shape and cockpit remain unchanged.

## Movement

Ground motion uses spherical contact with wheel-force acceleration, rolling resistance and seam-free steering over poles and the underside. Space activates unlimited-supply lift; release or Shift cuts thrust. Fuel does not drain and vehicle mass stays constant. This is an explicit arcade concession, not realistic fuel conservation. Airborne translation follows inverse-square gravity and applied force. R resets; P/Escape pauses. See [physics equations and assumptions](PHYSICS.md).

## Two camera views

V or the View button toggles Planet and Cockpit views without resetting the vehicle. The first-person perspective camera sits inside the canopy, follows planetary up and supports bounded drag-look. It retains the empty dashboard, with lighter interior glass and a hidden central canopy arch to preserve visibility. These interior cutaway choices do not change the exterior vehicle design. Pause and reset retain the selected mode. Planet view uses altitude-aware orthographic framing. Reduced motion remains available.

## Rendering and limits

Toon materials, pastel landscape, gas puffs and optional synthesized hiss are procedural. No imported geometry, textures, fonts or sound recordings were added. Trees and lakes remain decorative, not colliders. No full canonical-landmark reconstruction, final Blender vehicle, touch gameplay, physical-device performance guarantee or engineering-grade propulsion model is claimed.
