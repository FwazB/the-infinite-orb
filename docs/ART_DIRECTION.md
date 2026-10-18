# World and art direction

## Approved direction versus open choices

The requested setting is Supreme Kai's world from Dragon Ball. Gather a small user-approved reference board before detailed modeling: sky, terrain, trees, landmarks and vehicle. Do not present proposed colors or scenery below as verified canon. The SpikeRiser clip is a separate visual reference, not a model library or license.

## Supplied mood references

The private mood references combine quiet scenes, blue/green expanses, saturated energy effects and colorful skies. Proposed interpretation: nostalgic, playful adventure with calm open space rather than nonstop battle effects. This remains a design proposal, not a new approved art direction. Keep Supreme Kai's setting; do not replace it with incidental scenery from mood references. See the [visual reference brief](VISUAL_REFERENCES.md).

## Composition proposal

Fwaz requested a literal little planet, fully visible while the enclosed scooter drives around it, with more cartoon-like graphics. The current prototype uses a whole sphere rather than a terrain patch or curved-horizon illusion. A wide orthographic view follows the scooter's local surface frame so the world rolls underneath it without losing the globe. A continuous road, pastel trees, small lakes, flowers and clouds form the provisional toy-world composition. These are independently authored design choices, not verified canonical scenery. No buildings or city blocks unless Fwaz adds them to the brief.

Establish a distinct silhouette at each destination. Route rings should guide, not clutter the view. Keep landing pads integrated into terrain. Distant planets or moons are backdrop elements, not destinations, pending reference approval.

## Visual treatment

Implemented treatment: stepped toon lighting, a clean planet outline, bright grass, cream/coral scooter details, pastel treetops and a lavender backdrop. No realistic metallic materials, atmospheric fog, texture downloads or postprocessing stack. Keep the scooter distinguishable at the whole-planet scale. Hand-authored proportions matter more than microtexture. No borrowed Dragon Ball textures or fonts.

First prove the look using one tree, terrain patch, vehicle blockout and sky. Compare a real browser frame with the Blender preview: do not approve a material solely from an offline render.

## Rendering choices to evaluate

Begin with simple GLTF-compatible materials and a runtime lighting pass. Outlines can use selected inverted-hull geometry or a later screen-space approach; choose only after comparing occlusion, mobile cost and visual quality. Do not stack outlines, bloom, depth-of-field and expensive transmission in the first slice. A normal map is not necessary for the blockout.

Use low-detail instanced vegetation, shared materials and baked ambient detail where it helps. Author camera-facing vistas intentionally; inspect full rotation because players are free to turn around.

## Asset inventory, planned only

Vehicle body, cockpit shell, propulsion pieces; small modular rock set; one hero tree and simpler tree variants; grass/ground treatment; landing marker; six route rings; skydome/backdrop; original UI icons; optional original or licensed ambient/engine audio.

## Review gates

A. User approves reference board and setting interpretation.
B. Grayscale world blockout proves landmark visibility and navigation.
C. One browser-rendered scene proves materials and outline approach.
D. Expanded world stays inside measured budgets.
E. Final public content passes the separate provenance/release review.
