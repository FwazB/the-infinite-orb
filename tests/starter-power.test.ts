import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation';
import {IDLE} from '../src/flight';
const charging={...IDLE,powerUp:true};
function beerus(){const sim=new Simulation();sim.changeWorld('beerus');sim.resume();return sim;}
test('fresh Beerus start can charge Stage I at rest and drive without lowering gravity',()=>{
 const sim=beerus();
 for(let i=0;i<119;i++)sim.advance(1/60,charging);
 assert.equal(sim.powertrain.stage,0);
 sim.advance(1/60,charging);assert.equal(sim.powertrain.stage,1);
 assert.equal(sim.world.gravity,100);
 for(let i=0;i<30;i++)sim.advance(1/60,{...IDLE,thrust:1});
 assert.ok(sim.state.speed>4);assert.ok(sim.state.distance>1);assert.equal(sim.state.grounded,true);
});

const tick=(sim:Simulation,count:number,input=IDLE)=>{for(let i=0;i<count;i++)sim.advance(1/60,input);};
test('starter requires uninterrupted stationary grounded input and cannot farm higher stages',()=>{
 const sim=beerus();tick(sim,100,charging);tick(sim,1);tick(sim,119,charging);
 assert.equal(sim.powertrain.stage,0);tick(sim,1,charging);assert.equal(sim.powertrain.stage,1);
 tick(sim,100,charging);assert.equal(sim.powertrain.stage,1);assert.equal(sim.powertrain.charge,0);
 sim.reset();tick(sim,150,{...charging,thrust:1});assert.equal(sim.powertrain.stage,0);
 tick(sim,150,{...charging,lift:1});assert.equal(sim.powertrain.stage,0);
 sim.reset();sim.state.grounded=false;sim.state.y+=100;sim.advance(1/60,charging);assert.equal(sim.powertrain.starterCharge,0);
});
test('idle starter boost fades and cooldown blocks immediate repeat',()=>{
 const sim=beerus();tick(sim,120,charging);tick(sim,240,charging);
 assert.equal(sim.powertrain.stage,0);assert.ok(sim.powertrain.starterCooldown>7);
 tick(sim,120,charging);assert.equal(sim.powertrain.stage,0);assert.equal(sim.powertrain.starterCharge,0);
 tick(sim,500,charging);assert.equal(sim.powertrain.stage,1);
});
test('pause cancels partial charge, freezes cooldown and world switching cannot bypass cooling',()=>{
 const sim=beerus();tick(sim,60,charging);sim.pause();assert.equal(sim.powertrain.starterCharge,0);
 sim.advance(10,charging);assert.equal(sim.powertrain.stage,0);sim.resume();tick(sim,120,charging);
 const cooldown=sim.powertrain.starterCooldown;sim.pause();sim.advance(100,charging);
 assert.equal(sim.powertrain.starterCooldown,cooldown);sim.changeWorld('earth');assert.equal(sim.powertrain.starterCooldown,cooldown);
 assert.equal(sim.powertrain.stage,1);sim.reset();assert.equal(sim.powertrain.starterCooldown,0);assert.equal(sim.powertrain.stage,0);
});
test('starter timing is independent of render cadence and ignores invalid time',()=>{
 for(const hz of [30,60,144]){
  const sim=beerus();for(let i=0;i<hz*2;i++)sim.advance(1/hz,charging);
  assert.equal(sim.powertrain.stage,1);assert.equal(sim.powertrain.starterCooldown,12);
  for(const dt of [NaN,Infinity,-1,0])sim.advance(dt,charging);
  assert.equal(sim.powertrain.starterCooldown,12);
 }
});
test('fresh Beerus starter lifts but unpowered falls retain 100g acceleration',()=>{
 const sim=beerus();tick(sim,120,charging);tick(sim,30,{...IDLE,lift:1});
 assert.ok(sim.state.altitude>1);assert.ok(sim.state.vy>4);assert.equal(sim.powertrain.stage,1);
 const vy=sim.state.vy;sim.advance(1/60,IDLE);
 assert.ok(Math.abs(sim.state.vy-(vy-9.80665*100/60))<1e-6);
});
