# Acceptance matrix

This is the full-game acceptance matrix, not a claim that every row passes in v0. See [current status](STATUS.md) for the executed simulation/browser subset and explicit remaining limits. Documentation/provenance checks are separate from gameplay tests.

## Flight behavior

- F01: Hold/release thrust: speed approaches the configured limit, braking works and no NaN/Infinity enters state.
- F02: Replay the same fixed-duration input at different render cadences; final position/heading stay within a documented tolerance.
- F03: Change tabs while holding a key; return to a paused scene with no stuck input or large movement jump.
- F04: Land on all tagged pads at low speed; reject unsafe landings and prevent terrain penetration.
- F05: Hit a tree/rock and approach it at maximum speed; no tunneling, permanent trap or camera-through-wall view.
- F06: Reset from collisions, below terrain and outside bounds; return to a known safe state with cleared velocity/input.
- F07: Fly a complete route, miss a ring, and restart: ordered progress cannot double-count or accept rings out of order.

## Visual and user experience

- V01: Vehicle design approved by Fwaz from front/side/rear and in the actual chase view.
- V02: Blender export shows correct scale, axes, materials, normals and any supported animation in the browser.
- V03: Desktop keyboard-only visitor can start, pause, reset, toggle mute and leave the experience without trapped focus.
- V04: Reduced-motion setting visibly reduces decorative/camera effects; no flashing or surprise audio.
- V05: Small-screen or unsupported WebGL view shows readable project information and an honest support state.
- V06: A consenting first-time tester can take off, reach a landmark and recover from a mistake; record observations and confusion without uploading private session data.

## Performance and reliability

- P01: Profile the same 1080p desktop route after warm-up; record hardware, browser, viewport, quality and frame-time distribution against the proposed budgets.
- P02: Measure actual transferred bytes, draw calls, triangles and texture estimates; record deviations honestly.
- P03: Block one asset request and simulate offline loading: retry/help visible, no infinite spinner.
- P04: Repeated resets and scene disposal do not accumulate event listeners, audio nodes or GPU resources.
- P05: Context loss and restore or explicit reload yields a usable state.
- P06: Actual desktop browser smoke on named Chrome/Firefox/Safari versions; failures listed. Real iPhone/Android required before claiming mobile gameplay.

## Provenance and release

- R01: Every shipped asset has an existing manifest path, content hash, creator/source and permission/license evidence; unknown status blocks public release.
- R02: No extracted Dragon Ball/game assets, unlicensed soundtrack, private source, secrets or unrelated proprietary implementation material.
- R03: Public title/content decision is recorded; unofficial notice is present if appropriate but not treated as permission.
- R04: User authorizes the exact deployment and repository visibility; source publication does not imply art redistribution rights.
- R05: Hosted artifact matches reviewed build; no runtime model endpoint/MCP port/private service dependency.
- R06: Portfolio card works without autoloading the game and preserves existing fwaz.one content; mobile and keyboard checks pass.
- R07: Commits and PR/deployment descriptions contain no AI co-author or generated-by attribution; legitimate human/dependency attribution remains.

## Definition of done

M0: plan checker passes and state is explicitly plan-only. M1–M6: relevant behavioral/visual rows executed with evidence. Public completion additionally requires R01–R07. A build alone is not a completed game; a successful deployment alone is not a validated portfolio integration.
