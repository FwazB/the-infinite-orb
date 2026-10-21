import {spawnSync} from 'node:child_process';
import {homedir} from 'node:os';
import {realpathSync} from 'node:fs';
// Never embed developer home/repository paths in public WASM panic diagnostics.
const root=realpathSync(new URL('..',import.meta.url));
const flags=[process.env.CARGO_ENCODED_RUSTFLAGS,...[root,homedir()].map((path,i)=>`--remap-path-prefix=${path}=${i?'/home/build':'.'}`)].filter(Boolean).join('\x1f');
const result=spawnSync('wasm-pack',['build','rust','--target','web','--release','--','--locked'],{cwd:root,stdio:'inherit',env:{...process.env,CARGO_ENCODED_RUSTFLAGS:flags}});
if(result.error)console.error(result.error.message);
process.exit(result.status??1);
