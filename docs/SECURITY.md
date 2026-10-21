# Security policy and release checks

## Scope

This is a static, local-first browser prototype: no account system, backend, analytics or external asset service. These controls reduce accidental disclosure and browser injection risk; they are not a guarantee against unknown vulnerabilities or a substitute for asset-rights review.

## File boundaries

- Git ignores local environment files, credential-bearing package configuration, private keys/certificates, private reference trees, and Blender masters/backups at any depth. A sanitized `.env.example` may be committed deliberately; it is not served.
- Vite filesystem restrictions and an early development/preview middleware deny sensitive filenames and private/source-art paths, including encoded and raw-query requests. Keep both servers bound to loopback.
- Vite's `public/` directory can bypass ordinary filesystem deny rules. The middleware also covers it. Production builds reject sensitive public filenames and public symlinks before copying assets, and reject imports from sensitive source paths.
- Synthetic regression fixtures contain only a nonsecret marker and never depend on real private references. Filename rules cannot recognize every possible secret: scan the exact publication candidates and built output before each release. Never force-add ignored material. Inspect any already-tracked sensitive files and history separately.
- Publish only `dist/`, never the repository root, development server, references, test output or dependencies. Renaming a secret to an ordinary asset filename does not make it safe.

## Browser and hosting policy

`security/headers.ts` defines the development and production policies. The production policy restricts scripts/styles/assets/connections to approved local sources, prohibits inline scripts and JavaScript eval, permits only WebAssembly compilation through `wasm-unsafe-eval`, denies framing/forms/objects/workers, disables selected device permissions, suppresses referrers and enables MIME-sniffing protection. HTTPS responses carry one-year HSTS without a subdomain-wide or preload directive. Development alone allows Vite's injected styles and loopback hot-reload WebSockets.

- `vercel.json` supplies the same production headers and limits the hosting output directory to `dist` for a future Vercel deployment.
- `public/_headers` is copied into `dist` for static hosts that explicitly support that convention. Other servers may ignore it.
- Tests ensure both files match the shared production policy. Update all three together.
- Portfolio linking remains a separate, unperformed action; embedding is intentionally denied. Revisit both CSP `frame-ancestors` and X-Frame-Options before an explicitly approved embedding change.
- No hosting provider, domain, HTTPS service or live header behavior is established merely by committing these files. Verify the actual origin and built asset responses after an authorized deployment. Never deploy the Vite development server.

## Reproduce verification

```sh
npm ci --ignore-scripts
npm test
npm run test:browser
npm run test:browser:production
python3 scripts/check_plan.py
python3 scripts/test_check_plan.py
npm audit
npm audit --omit=dev
npm audit signatures
```

The production browser suite builds first, exercises normal flight under the strict policy, checks real response headers, and verifies that an injected nonsecret inline probe is blocked. It uses a separate loopback port and closes its test server. Browser executables must be installed explicitly as described in the README.

Before public source publication, run a redacted secret scan over the exact candidate contents (including lockfiles), inspect commit identity/metadata, confirm destination and visibility, and resolve source licensing and asset-release approval. No changes here authorize a push, deployment, remote settings changes or portfolio edits.
