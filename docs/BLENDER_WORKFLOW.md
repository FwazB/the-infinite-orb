# Blender authoring and optional MCP

## Current status

No Blender installation or MCP configuration was performed. A bounded check found no blender executable on PATH and no Blender-named app in /Applications or ~/Applications. This is not an exhaustive inventory of the machine; an installation elsewhere remains possible. Resolve the actual Blender executable and version before setup.

## Preferred process

Use Blender as the editable art source and GLB as the runtime artifact. Fwaz may model by hand with guidance, or approve bounded scripts for construction and cleanup. Save versioned checkpoints before destructive operations. Export to a staging directory, validate, then promote the approved runtime asset.

## MCP is optional

The community MCP for Blender repository documents a socket bridge and arbitrary Python execution. Its README warns the socket has no authentication or encryption. It is not required to build this game and should not become a runtime dependency.

Before any authorized installation:
1. Verify the exact upstream repository and pin a reviewed release/commit.
2. Locate Blender and back up the dedicated project, not all user files.
3. Configure loopback-only access and verify the actual listening interface.
4. Disable telemetry and unused third-party asset/generation integrations; verify through the pinned version's settings rather than assuming defaults.
5. Start with a disposable scene and a read-only scene query, then a small cube-create/save/export test.
6. Confirm no secret/project uploads and no listening public port.
7. Close the bridge when unused. Do not expose it to the deployed website.

Safe mode, when available in the pinned revision, is defense in depth rather than a sandbox. Arbitrary scripts require inspection and explicit scope. Do not install Computer Use/CuaDriver or drive the GUI with hidden synthetic input. Ask Fwaz to perform physical GUI steps where needed.

## Export rehearsal

Use a tiny asymmetric model to check meters, root orientation, lighting, normals, transparency and any intended animation. glTF exports supported material structures; arbitrary Blender node graphs must not be assumed portable. Implement the final stylized effect in the browser or bake supported properties where appropriate.

Before promoting an export, check object count, mesh triangles, material slots, embedded/external textures, animations, bounding box, missing textures and actual GLTFLoader load. Inspect rendered output from front, rear and a moving chase camera. Exporting successfully alone does not establish correctness.

## Storage and provenance

Keep masters under blender/ locally; runtime assets eventually under public/assets/. Record source, creator, license/permission evidence, modifications, hash and release status in assets/manifest.json. Do not include personal absolute paths in public asset metadata. No ripped game/anime assets or external paid generators by default.
