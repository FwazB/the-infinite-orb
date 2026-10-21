// Browser/WASM binding only. All game behavior lives in rust/src/.
import './style.css';
import init from '../rust/pkg/infinite_orb.js';
import wasmUrl from '../rust/pkg/infinite_orb_bg.wasm?url';
init({module_or_path:wasmUrl}).catch(error=>{
 console.error('The Rust game could not start:',error);
 document.body.dataset.mode='error';
 const root=document.getElementById('app');
 root.replaceChildren();
 const message=document.createElement('p');
 message.textContent='The Infinite Orb could not load. Please reload in a browser with WebAssembly and WebGL2 enabled.';
 root.append(message);
});
