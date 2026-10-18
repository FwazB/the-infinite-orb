# Portfolio, assets and publication

## Intended portfolio placement

fwaz.one links to a separate lightweight game deployment. Do not replace the homepage or force visitors through the game. Proposed card: approved screenshot, working title, one-line concept, Play action, controls/platform note and optional technical case study. Do not assume an existing route or framework: inspect the actual portfolio repository only when integrating it is authorized.

The case study should show Fwaz's sketches, Blender progression, exported model and actual flight footage. Explain what Fwaz designed, which public dependencies were used and what was verified. Do not add AI co-author/generated-by footers. Tool use can be discussed if Fwaz wants, without inventing authorship.

## Fan concept and permissions

The requested concept uses recognizable Dragon Ball setting/vehicle ideas. Keep that intent in the local brief rather than silently rewriting the request. However, modeling assets yourself, keeping a project free or adding an unofficial disclaimer does not by itself establish rights to publish recognizable third-party designs, logos, characters or music. This plan provides no legal clearance.

Public release is a separate decision: obtain appropriate permission or select a sufficiently independent original public direction with Fwaz. Do not contact rightsholders without explicit authorization. Do not claim fair use as a settled conclusion. No monetization or official-affiliation claims are planned.

## Initial source publication

Fwaz authorized publishing the reviewed prototype source to the public FwazB/the-infinite-orb repository. This approval covers the source snapshot, not a hosted-game release, private reference images or final art approval. No source license has been selected; this publication introduces no new license or claim of third-party rights clearance. The asset register retains its review-required status for the separate game/asset release decision.

## Asset register

assets/manifest.json records the local procedural prototype sources and their review-required status. Each future item must identify id, relative runtime path, creator, source reference, rights basis, permission/license evidence, release status and SHA-256. Unknown or review-required status blocks public release. Register original meshes too: original authorship of a file is distinct from rights in an underlying recognizable design.

Never ship extracted commercial game models, anime screenshots as textures, copied soundtracks, or random downloaded fan models with missing provenance. Keep nonshipping reference images separate from public/assets. Dependency licenses and texture/audio/model licenses are separate checks. Do not declare a source-code license as a license for third-party IP; choose repository licensing before publication.

## Hosting and privacy

Static hosting, no accounts, no analytics by default, no tracking pixels or model API calls. Audio and gameplay start only on user action. Use HTTPS and deployment-appropriate security headers; avoid broad wildcard connections. No Blender bridge or local filesystem access from the game. Host assets together where practical; validate any external resource policy before release. The local header policy and static-host configurations are documented in [Security](SECURITY.md); configuration is not evidence of a live deployment.

## Publish checklist

Review exact destination, content and visibility; pin and audit dependencies; inspect public bundle for secrets/private paths; validate manifest and rights decision; complete acceptance evidence; deploy only with approval; read back exact deployed pages/assets; then separately approve and implement the fwaz.one card. Keep rollback to the previous portfolio build available. No service installation or domain/DNS change is part of M0.
