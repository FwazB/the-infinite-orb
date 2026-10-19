import './style.css';
import {Simulation} from './simulation';
import {WORLDS,worldById} from './worlds';
import {STAGES,UPSHIFT_SECONDS,DOWNSHIFT_SECONDS,STARTER_SECONDS} from './powertrain';
import {FUEL_CAPACITY,GRAVITY_MULTIPLIER,MAX_THRUST} from './physics';
import {ThrusterAudio} from './thruster-audio';
import type {FlightInput} from './flight';
import type {FlightView} from './view';

const app=document.querySelector<HTMLElement>('#app')!;
app.innerHTML=`
  <canvas id="world" tabindex="0" aria-label="Tiny cartoon planet. W and S drive the scooter, A and D steer, Space burns lift gas, E charges starter power while stopped, Shift cuts thrust, V switches camera, P pauses, R resets."></canvas>
  <div class="wash" aria-hidden="true"></div>
  <header><a class="wordmark" href="#" aria-label="The Infinite Orb, back to start"><span class="emblem" aria-hidden="true">✳</span> THE INFINITE ORB</a><label class="edition world-picker"><span class="sr-only">Destination</span><select id="destination" aria-label="Destination" disabled></select><b id="gravity-badge">10G</b></label><button id="pause" disabled>Pause <kbd>P</kbd></button></header>
  <section class="intro" aria-labelledby="title">
    <p class="eyebrow"><span></span> A LITTLE FURTHER FROM EVERYDAY</p>
    <h1 id="title">Tiny planet.<br><em>Heavy gravity.</em></h1>
    <p class="description" id="description">King Kai’s planet. Ten times Earth’s gravity.<br>Wheel drive. Unlimited thruster fuel.</p>
    <button class="primary" id="launch" disabled aria-label="Ride scooter">Preparing scene <span aria-hidden="true">↗</span></button>
    <p class="small-print" id="support">Desktop keyboard · gas-assisted scooter · no rider</p>
  </section>
  <div class="scene-note"><span class="marker"></span><div><span id="gravity-note" data-basis="canon">10g · confirmed in the manga</span><br><small id="world-summary">Whole planet. Unlimited thruster fuel.</small></div></div>
  <section class="powertrain-panel" aria-label="Powertrain stage"><strong id="stage" data-stage="0">Stock · ×1</strong><span id="stage-hint">Drive at 6 m/s to charge</span><progress id="stage-progress" max="1" value="0" aria-label="Stage charge"></progress><span id="starter-hint">Hold E at rest to power up</span><progress id="starter-progress" max="1" value="0" aria-label="Starter power charge"></progress></section>
  <section class="instruments" aria-label="Scooter instruments"><div><span>SPEED</span><p><output id="speed">00</output><small>m/s</small></p></div><i></i><div><span>HEIGHT</span><p><output id="altitude" data-value="0">00</output><small>m</small></p></div><i></i><div><span>TRAVELLED</span><p><output id="distance" data-value="0">00</output><small>m</small></p></div><i></i><div><span>THRUSTER</span><p><output id="fuel" aria-label="Unlimited thruster fuel" data-value="${FUEL_CAPACITY}">∞</output><small>fuel</small></p></div><i></i><div><span>SURFACE GRAVITY</span><p><output id="gravity" data-value="${GRAVITY_MULTIPLIER}">${GRAVITY_MULTIPLIER}</output><small>g</small></p></div></section>
  <p id="message" class="message" role="status">Preparing the scene…</p>
  <footer><div class="controls"><span><kbd>W S</kbd> drive / reverse</span><span><kbd>A D</kbd> steer</span><span><kbd>SPACE</kbd> gas lift</span><span><kbd>SHIFT</kbd> cut thrust</span><span class="orbit-hint">drag to look</span></div><button id="reset" aria-label="Back to start">↺ <span>Back to start</span></button></footer>
  <aside class="options"><button id="camera" disabled aria-label="Switch to cockpit view" aria-pressed="false">View: Planet <kbd>V</kbd></button><label><input id="sound" type="checkbox"> Thruster sound</label><label><input id="motion" type="checkbox"> Reduced motion</label><label><input id="quality" type="checkbox"> Low graphics</label></aside>
  <p class="credit">A PLAYABLE SKETCH BY FWAZ <span> / </span> UNOFFICIAL FAN CONCEPT · IDEALIZED PHYSICS</p>
`;
const byId=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=byId<HTMLCanvasElement>('world');
const launch=byId<HTMLButtonElement>('launch');
const starterHint=byId('starter-hint'),starterProgress=byId<HTMLProgressElement>('starter-progress');
const pauseButton=byId<HTMLButtonElement>('pause');
const message=byId('message');
const motion=byId<HTMLInputElement>('motion');
const quality=byId<HTMLInputElement>('quality');
const sim=new Simulation();
const destination=byId<HTMLSelectElement>('destination');
for(const world of WORLDS){const option=document.createElement('option');option.value=world.id;option.textContent=world.name;destination.append(option);}
const audio=new ThrusterAudio();
const sound=byId<HTMLInputElement>('sound');
let view:FlightView|undefined;
let mode:'booting'|'ready'|'flying'|'paused'|'error'|'unsupported'='booting';
let frame=0,last=0,disposed=false;
const keys=new Set<string>();
motion.checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
const events=new AbortController();
const on=(target:EventTarget,name:string,fn:EventListener)=>target.addEventListener(name,fn,{signal:events.signal});
function setMode(next:typeof mode){mode=next;document.body.dataset.mode=next;}
function updateInstruments(){
  const power=sim.powertrain,spec=power.spec,next=STAGES[power.stage+1];
  const starterText=power.starterCooldown>0?`Cooling · ${Math.ceil(power.starterCooldown)}s`:power.stage>0?'Starter grants Stage I only':power.starterCharge>0?`Charging · ${(power.starterCharge/STARTER_SECONDS*100).toFixed(0)}%`:`Hold E ${STARTER_SECONDS}s at rest → Stage I`;
  if(starterHint.textContent!==starterText)starterHint.textContent=starterText;
  starterProgress.value=power.starterCharge/STARTER_SECONDS;
  starterProgress.hidden=power.stage>0||power.starterCooldown>0;
  if(sim.world.id==='beerus')byId('world-summary').textContent=power.stage===0?'Stock lift cannot overcome 100g · hold E to power up':'Powertrain active · upgraded lift available';
  byId('stage').textContent=`${spec.name} · ×${spec.multiplier}`;byId('stage').dataset.stage=String(power.stage);
  const hint=power.slow>0?`Drop in ${(DOWNSHIFT_SECONDS-power.slow).toFixed(1)}s · hold ${spec.hold} m/s`:next?`Drive ${next.enter} m/s for ${UPSHIFT_SECONDS}s · ${(power.charge/UPSHIFT_SECONDS*100).toFixed(0)}%`:'Maximum stage · hold 15 m/s';
  byId('stage-hint').textContent=hint;
  byId<HTMLProgressElement>('stage-progress').value=power.slow>0?1-power.slow/DOWNSHIFT_SECONDS:next?power.charge/UPSHIFT_SECONDS:1;
  byId('speed').textContent=Math.abs(sim.state.speed).toFixed(0).padStart(2,'0');
  byId('fuel').textContent='∞';byId('fuel').dataset.value=sim.state.fuel.toFixed(3);
  const altitude=sim.state.altitude;
  byId('altitude').textContent=altitude.toFixed(0).padStart(2,'0');byId('altitude').dataset.value=altitude.toFixed(3);
  byId('distance').textContent=sim.state.distance.toFixed(0).padStart(2,'0');byId('distance').dataset.value=sim.state.distance.toFixed(3);
}
function pause(){
  if(mode!=='flying')return;
  keys.clear();sim.pause();audio.update(0,false);setMode('paused');
  byId('title').innerHTML='A moment<br><em>of stillness.</em>';
  byId('description').textContent='Your ride is paused. The little planet will be right here.';
  launch.innerHTML='Resume ride <span aria-hidden="true">↗</span>';launch.setAttribute('aria-label','Resume ride');
  pauseButton.disabled=true;message.textContent='Paused · your scooter is holding position';launch.focus({preventScroll:true});
}
function start(){
  if(!view||(mode!=='ready'&&mode!=='paused'))return;
  keys.clear();sim.resume();setMode('flying');pauseButton.disabled=false;last=performance.now();
  canvas.focus({preventScroll:true});message.textContent=sim.world.id==='beerus'?(sim.powertrain.stage===0?'100g training: hold E for 2s while stopped, then drive or lift before the stage fades.':'100g training: earned powertrain active. Keep moving to retain it.'):'Hold W to ride. The road goes all the way around.';
}
function reset(){
  keys.clear();sim.reset();audio.update(0,false);view?.resetCamera();updateInstruments();message.textContent='Back at the start. Thruster fuel is unlimited.';
  if(mode==='flying')canvas.focus({preventScroll:true});
}
function failure(text:string){
  keys.clear();sim.pause();audio.update(0,false);setMode('error');message.textContent=text;
  byId('title').innerHTML='A small<br><em>detour.</em>';byId('description').textContent=text;
  launch.disabled=false;launch.textContent='Reload scene';launch.setAttribute('aria-label','Reload scene');pauseButton.disabled=true;
}
function changeWorld(){
  if(!view||mode==='error'||mode==='unsupported')return;
  const world=worldById(destination.value);
  keys.clear();dragging=false;audio.update(0,false);sim.changeWorld(world.id);view.setWorld(world);setMode('ready');
  pauseButton.disabled=true;launch.disabled=false;launch.textContent='Ride scooter';launch.setAttribute('aria-label','Ride scooter');
  byId('title').innerHTML='Another world.<br><em>A different pull.</em>';byId('description').textContent=world.description;
  byId('gravity-badge').textContent=world.gravity+'G'+(world.gravityBasis==='assumed'?'*':'');
  byId('gravity-note').textContent=world.gravityNote;byId('gravity-note').dataset.basis=world.gravityBasis;
  byId('world-summary').textContent=world.shape==='plateau'?(sim.powertrain.stage===0?'Stock lift cannot overcome 100g · hold E to power up':'Powertrain active · upgraded lift available'):'Spherical miniature · stylized scale';
  byId('gravity').textContent=String(world.gravity);byId('gravity').dataset.value=String(world.gravity);
  const button=byId('camera');button.innerHTML='View: Planet <kbd>V</kbd>';button.setAttribute('aria-label','Switch to cockpit view');button.setAttribute('aria-pressed','false');
  document.body.dataset.camera='planet';updateInstruments();message.textContent='Destination changed. Your ride is reset and paused.';
}
on(destination,'change',changeWorld);
function toggleCamera(){
  if(!view||mode==='error'||mode==='unsupported')return;
  const cockpit=view.toggleCamera(),button=byId('camera');
  button.innerHTML=`View: ${cockpit?'Cockpit':'Planet'} <kbd>V</kbd>`;
  button.setAttribute('aria-label',cockpit?'Switch to planet view':'Switch to cockpit view');
  button.setAttribute('aria-pressed',String(cockpit));document.body.dataset.camera=cockpit?'cockpit':'planet';keys.clear();
  if(mode==='flying')canvas.focus({preventScroll:true});
}
on(byId('camera'),'click',toggleCamera);
on(launch,'click',()=>mode==='error'?location.reload():start());
on(pauseButton,'click',pause);
on(byId('reset'),'click',reset);
on(document.querySelector('.wordmark')!,'click',e=>{e.preventDefault();reset();});
on(window,'keydown',event=>{
  const e=event as KeyboardEvent;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.target instanceof HTMLElement && e.target.closest('button,input,a,select,textarea'))return;
  if(['KeyP','Escape'].includes(e.code)&&mode==='flying'){e.preventDefault();pause();return;}
  if(e.code==='KeyV'&&!e.repeat&&(mode==='flying'||mode==='paused')){e.preventDefault();toggleCamera();return;}
  if(e.code==='KeyR'&&mode==='flying'){e.preventDefault();reset();return;}
  if(mode!=='flying')return;
  if(['KeyW','KeyS','KeyA','KeyD','KeyE','Space','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}
});
on(window,'keyup',event=>keys.delete((event as KeyboardEvent).code));
on(window,'blur',pause);
on(document,'visibilitychange',()=>{if(document.hidden)pause();});
on(document,'focusin',event=>{if(event.target!==canvas)keys.clear();});
on(window,'resize',()=>{view?.resize();if(innerWidth<700)pause();});
on(quality,'change',()=>view?.quality(quality.checked));
on(sound,'change',async()=>{
  try{await audio.setEnabled(sound.checked);}catch{sound.checked=false;await audio.setEnabled(false);message.textContent='Audio is unavailable in this browser.';}
  if(mode==='flying')canvas.focus({preventScroll:true});
});
let dragging=false,pointerX=0,pointerY=0;
on(canvas,'pointerdown',event=>{const e=event as PointerEvent;if(mode!=='flying')return;dragging=true;pointerX=e.clientX;pointerY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.focus();});
on(canvas,'pointermove',event=>{if(!dragging||mode!=='flying')return;const e=event as PointerEvent;view?.orbit(e.clientX-pointerX,e.clientY-pointerY);pointerX=e.clientX;pointerY=e.clientY;});
on(canvas,'pointerup',()=>{dragging=false;});on(canvas,'pointercancel',()=>{dragging=false;});
on(canvas,'webglcontextlost',event=>{event.preventDefault();failure('The graphics context was interrupted. Reload to return safely to the launch pad.');});
function input():FlightInput{
  const held=(...names:string[])=>names.some(name=>keys.has(name))?1:0;
  return {powerUp:keys.has('KeyE'),thrust:held('KeyW','ArrowUp')-held('KeyS','ArrowDown'),turn:held('KeyD','ArrowRight')-held('KeyA','ArrowLeft'),lift:held('Space')-held('ShiftLeft','ShiftRight')};
}
function loop(now:number){
  if(disposed)return;
  const dt=Math.min(0.1,Math.max(0,(now-last)/1000));last=now;
  if(mode!=='error'&&!document.hidden){
    sim.advance(dt,input());
    view?.render(sim.state,sim.previous,sim.running?sim.alpha:1,dt,mode==='ready'||mode==='paused',motion.checked,mode==='flying',sim.powertrain.stage);
    updateInstruments();
    canvas.dataset.audioRms=audio.update(sim.state.thrust/(MAX_THRUST*sim.powertrain.spec.multiplier),mode==='flying').toFixed(6);
    if(mode==='flying'){
      const text=sim.world.id==='beerus'?(sim.powertrain.stage===0?'100g training · hold E at rest to power up · release W and Space to charge':'100g training · staged lift active · keep moving to retain output'):sim.state.grounded?'W/S drive · A/D steer · Space lifts':'Release Space to fall · Shift cuts thrust · unlimited fuel';
      if(message.textContent!==text)message.textContent=text;
    }
  }
  frame=requestAnimationFrame(loop);
}
function dispose(){disposed=true;cancelAnimationFrame(frame);events.abort();audio.dispose();view?.dispose();}
on(window,'pagehide',event=>{if(!(event as PageTransitionEvent).persisted)dispose();else pause();});
if(import.meta.hot)import.meta.hot.dispose(dispose);
async function boot(){
  if(innerWidth<700||matchMedia('(pointer: coarse)').matches){
    setMode('unsupported');byId('title').innerHTML='A little sky.<br><em>A bigger screen.</em>';
    byId('description').textContent='This little planet needs a desktop keyboard and WebGL. Touch controls are not ready yet.';
    launch.textContent='Desktop keyboard required';launch.disabled=true;message.textContent='Mobile gameplay is not supported in this build.';return;
  }
  try{
    const {FlightView}=await import('./view');
    view=new FlightView(canvas);destination.disabled=false;byId<HTMLButtonElement>('camera').disabled=false;setMode('ready');launch.disabled=false;launch.innerHTML='Ride scooter <span aria-hidden="true">↗</span>';
    message.textContent='Ready when you are.';last=performance.now();frame=requestAnimationFrame(loop);
  }catch(error){failure('This browser could not start the 3D scene. Enable hardware acceleration or try another desktop browser.');console.warn('Flight scene unavailable:',error);}
}
void boot();
