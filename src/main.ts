import './style.css';
import {Simulation} from './simulation';
import {FLOOR,type FlightInput} from './flight';
import type {FlightView} from './view';

const app=document.querySelector<HTMLElement>('#app')!;
app.innerHTML=`
  <canvas id="world" tabindex="0" aria-label="Flight scene. W and S control speed, A and D steer, Space rises, Shift descends, P pauses, R resets."></canvas>
  <div class="wash" aria-hidden="true"></div>
  <header><a class="wordmark" href="#" aria-label="The Infinite Orb, return to launch"><span class="emblem" aria-hidden="true">✳</span> THE INFINITE ORB</a><span class="edition">FLIGHT STUDY <b>001</b></span><button id="pause" disabled>Pause <kbd>P</kbd></button></header>
  <section class="intro" aria-labelledby="title">
    <p class="eyebrow"><span></span> A LITTLE FURTHER FROM EVERYDAY</p>
    <h1 id="title">Take the<br><em>scenic route.</em></h1>
    <p class="description" id="description">An enclosed motorcycle. A quiet stretch of sky.<br>No race to win. Just a little room to wander.</p>
    <button class="primary" id="launch" disabled aria-label="Take flight">Preparing scene <span aria-hidden="true">↗</span></button>
    <p class="small-print" id="support">Desktop keyboard · local prototype · no rider</p>
  </section>
  <div class="scene-note"><span class="marker"></span><div>CELESTIAL TEST MEADOW<br><small>Motorcycle blockout / not final art</small></div></div>
  <section class="instruments" aria-label="Flight instruments"><div><span>AIRSPEED</span><p><output id="speed">00</output><small>m/s</small></p></div><i></i><div><span>ALTITUDE</span><p><output id="altitude" data-value="0">00</output><small>m</small></p></div><i></i><div><span>TRAVELLED</span><p><output id="distance" data-value="0">00</output><small>m</small></p></div></section>
  <p id="message" class="message" role="status">Preparing the scene…</p>
  <footer><div class="controls"><span><kbd>W S</kbd> accelerate / brake</span><span><kbd>A D</kbd> steer</span><span><kbd>SPACE</kbd> rise</span><span><kbd>SHIFT</kbd> descend</span><span class="orbit-hint">drag to look</span></div><button id="reset" aria-label="Return to launch">↺ <span>Return to launch</span></button></footer>
  <aside class="options"><label><input id="motion" type="checkbox"> Reduced motion</label><label><input id="quality" type="checkbox"> Low graphics</label></aside>
  <p class="credit">A PLAYABLE SKETCH BY FWAZ <span> / </span> UNOFFICIAL FAN CONCEPT</p>
`;
const byId=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=byId<HTMLCanvasElement>('world');
const launch=byId<HTMLButtonElement>('launch');
const pauseButton=byId<HTMLButtonElement>('pause');
const message=byId('message');
const motion=byId<HTMLInputElement>('motion');
const quality=byId<HTMLInputElement>('quality');
const sim=new Simulation();
let view:FlightView|undefined;
let mode:'booting'|'ready'|'flying'|'paused'|'error'|'unsupported'='booting';
let frame=0,last=0,disposed=false;
const keys=new Set<string>();
motion.checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
const events=new AbortController();
const on=(target:EventTarget,name:string,fn:EventListener)=>target.addEventListener(name,fn,{signal:events.signal});
function setMode(next:typeof mode){mode=next;document.body.dataset.mode=next;}
function updateInstruments(){
  byId('speed').textContent=Math.abs(sim.state.speed).toFixed(0).padStart(2,'0');
  const altitude=Math.max(0,sim.state.y-FLOOR);
  byId('altitude').textContent=altitude.toFixed(0).padStart(2,'0');byId('altitude').dataset.value=altitude.toFixed(3);
  byId('distance').textContent=sim.state.distance.toFixed(0).padStart(2,'0');byId('distance').dataset.value=sim.state.distance.toFixed(3);
}
function pause(){
  if(mode!=='flying')return;
  keys.clear();sim.pause();setMode('paused');
  byId('title').innerHTML='A moment<br><em>of stillness.</em>';
  byId('description').textContent='Your flight is paused. Pick up where you left off, or return to the launch pad.';
  launch.innerHTML='Resume flight <span aria-hidden="true">↗</span>';launch.setAttribute('aria-label','Resume flight');
  pauseButton.disabled=true;message.textContent='Paused · your motorcycle is holding position';launch.focus({preventScroll:true});
}
function start(){
  if(!view||(mode!=='ready'&&mode!=='paused'))return;
  keys.clear();sim.resume();setMode('flying');pauseButton.disabled=false;last=performance.now();
  canvas.focus({preventScroll:true});message.textContent='Hold Space to lift off. There is no hurry.';
}
function reset(){
  keys.clear();sim.reset();view?.resetCamera();updateInstruments();message.textContent='Back at the launch pad.';
  if(mode==='flying')canvas.focus({preventScroll:true});
}
function failure(text:string){
  keys.clear();sim.pause();setMode('error');message.textContent=text;
  byId('title').innerHTML='A small<br><em>detour.</em>';byId('description').textContent=text;
  launch.disabled=false;launch.textContent='Reload scene';launch.setAttribute('aria-label','Reload scene');pauseButton.disabled=true;
}
on(launch,'click',()=>mode==='error'?location.reload():start());
on(pauseButton,'click',pause);
on(byId('reset'),'click',reset);
on(document.querySelector('.wordmark')!,'click',e=>{e.preventDefault();reset();});
on(window,'keydown',event=>{
  const e=event as KeyboardEvent;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.target instanceof HTMLElement && e.target.closest('button,input,a,select,textarea'))return;
  if(['KeyP','Escape'].includes(e.code)&&mode==='flying'){e.preventDefault();pause();return;}
  if(e.code==='KeyR'&&mode==='flying'){e.preventDefault();reset();return;}
  if(mode!=='flying')return;
  if(['KeyW','KeyS','KeyA','KeyD','Space','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}
});
on(window,'keyup',event=>keys.delete((event as KeyboardEvent).code));
on(window,'blur',pause);
on(document,'visibilitychange',()=>{if(document.hidden)pause();});
on(document,'focusin',event=>{if(event.target!==canvas)keys.clear();});
on(window,'resize',()=>{view?.resize();if(innerWidth<700)pause();});
on(quality,'change',()=>view?.quality(quality.checked));
let dragging=false,pointerX=0,pointerY=0;
on(canvas,'pointerdown',event=>{const e=event as PointerEvent;if(mode!=='flying')return;dragging=true;pointerX=e.clientX;pointerY=e.clientY;canvas.setPointerCapture(e.pointerId);canvas.focus();});
on(canvas,'pointermove',event=>{if(!dragging||mode!=='flying')return;const e=event as PointerEvent;view?.orbit(e.clientX-pointerX,e.clientY-pointerY);pointerX=e.clientX;pointerY=e.clientY;});
on(canvas,'pointerup',()=>{dragging=false;});on(canvas,'pointercancel',()=>{dragging=false;});
on(canvas,'webglcontextlost',event=>{event.preventDefault();failure('The graphics context was interrupted. Reload to return safely to the launch pad.');});
function input():FlightInput{
  const held=(...names:string[])=>names.some(name=>keys.has(name))?1:0;
  return {thrust:held('KeyW','ArrowUp')-held('KeyS','ArrowDown'),turn:held('KeyD','ArrowRight')-held('KeyA','ArrowLeft'),lift:held('Space')-held('ShiftLeft','ShiftRight')};
}
function loop(now:number){
  if(disposed)return;
  const dt=Math.min(0.1,Math.max(0,(now-last)/1000));last=now;
  if(mode!=='error'&&!document.hidden){
    sim.advance(dt,input());
    view?.render(sim.state,sim.previous,sim.running?sim.alpha:1,dt,mode==='ready',motion.checked,mode==='flying');
    updateInstruments();
    if(mode==='flying')message.textContent=sim.state.boundary?'Edge of the test meadow · turn back or press R':sim.state.grounded?'On the ground · hold Space to lift off':'Free flight · release controls to settle into a hover';
  }
  frame=requestAnimationFrame(loop);
}
function dispose(){disposed=true;cancelAnimationFrame(frame);events.abort();view?.dispose();}
on(window,'pagehide',event=>{if(!(event as PageTransitionEvent).persisted)dispose();else pause();});
if(import.meta.hot)import.meta.hot.dispose(dispose);
async function boot(){
  if(innerWidth<700||matchMedia('(pointer: coarse)').matches){
    setMode('unsupported');byId('title').innerHTML='A little sky.<br><em>A bigger screen.</em>';
    byId('description').textContent='This first flight study needs a desktop keyboard and WebGL. Touch controls are not ready yet.';
    launch.textContent='Desktop keyboard required';launch.disabled=true;message.textContent='Mobile gameplay is not supported in this build.';return;
  }
  try{
    const {FlightView}=await import('./view');
    view=new FlightView(canvas);setMode('ready');launch.disabled=false;launch.innerHTML='Take flight <span aria-hidden="true">↗</span>';
    message.textContent='Ready when you are.';last=performance.now();frame=requestAnimationFrame(loop);
  }catch(error){failure('This browser could not start the 3D scene. Enable hardware acceleration or try another desktop browser.');console.warn('Flight scene unavailable:',error);}
}
void boot();
