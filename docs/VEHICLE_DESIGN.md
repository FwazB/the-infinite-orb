# Fwaz's vehicle design brief

## Ownership and supplied references

Fwaz wants to design the vehicle in Blender and has now supplied three images. The first two show closely related compact four-wheel cars, white and green respectively, with short rounded bodies and tall upright glazed cabins. The third shows a separate enclosed motorcycle with a tall bubble fairing and broad rear tire. Do not silently combine the motorcycle and car into a final design. No precise canonical model name is verified.

Fwaz explicitly chose the motorcycle direction and an enclosed cockpit with no character. The third image is now the primary reference; the cars are secondary archived inspiration. See [visual reference observations](VISUAL_REFERENCES.md). Preserve the tall bubble fairing, rounded shell, chunky rear tire and recognizable two-wheel silhouette. The local v0 uses tinted glass, an empty seat/dashboard and visible wheels; these provisional proportions are not a final Blender design approval.

## Design session

Use the supplied references instead of asking for them again. Refine these remaining decisions together:
- recognizable fan recreation versus personal reinterpretation;
- overall silhouette, cockpit, number of seats and approximate scale;
- wheels that retract, fixed pods, or another propulsion treatment;
- color blocks and whether any recognizable branding is part of the design;
- how the rear view communicates speed and steering.

Do not treat the user approving a blockout as public rights clearance.

## Iteration sequence

1. Draw or collect the approved front, side and rear direction.
2. Build at most three rough silhouettes from primitives; no detailed panels.
3. Review orthographic front/side/rear plus a rear three-quarter view.
4. Fwaz selects or revises the silhouette.
5. Import the rough mesh into the flight blockout. Check scale, occlusion, camera framing and banking.
6. Fwaz approves proportions before cockpit details, seams, lights or propulsion animation.
7. Add limited material/color variants, then export and inspect in the browser again.
8. Finish topology, collision proxy, pivots and optional simple animation clips.

## Model contract

Author in meters, with an explicit root Empty named VehicleRoot and Blender Z-up coordinates. Record the authored forward direction explicitly; the runtime expects Y-up and the nose along -Z. Export an asymmetric front-marker test to verify conversion and document any required import rotation rather than assuming Blender and glTF forward axes match. Runtime imports attach beneath a VehiclePivot and never overwrite authored mesh transforms casually.

Proposed named children: Body, Cockpit, PropulsionLeft, PropulsionRight and optional LandingGear. Names are a draft interface, not claims that a mesh exists. Collision uses a separate low-detail proxy defined in runtime data, not the high-detail render mesh.

Optional clips: idle_hover and landing_gear; gameplay owns actual movement. Do not bake world flight into the asset. Use stable material names and explicit texture color spaces.

## Deliverables and budgets

Editable .blend master with organized collections; review turntable at 1920x1080; exported .glb; preview screenshots; asset-manifest record; collider dimensions and axis-verification receipt. Proposed starting budget: vehicle at most 35,000 exported triangles, at most eight materials, texture sizes at most 2048 on desktop. Reduce if measured performance requires it. These are targets, not existing measurements.

.blend masters are initially local and ignored; deliberately choose storage/versioning before publishing them. Source art and runtime assets have separate provenance decisions.

## Approval checklist

- [x] Initial vehicle references supplied by Fwaz (two car images and a separate motorcycle).
- [x] Motorcycle selected; enclosed cockpit and no character approved.
- [ ] Final motorcycle proportions, color and flight mechanism approved.
- [ ] Silhouette and proportions approved.
- [ ] Rear camera view and handling tested together.
- [ ] Browser appearance approved, not only Blender appearance.
- [ ] Collision proxy and model axes verified.
- [ ] Public-release asset status resolved.
