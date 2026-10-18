import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,stepFlight,IDLE} from '../src/flight.ts';
import {FUEL_CAPACITY,gravityAt} from '../src/physics.ts';

test('unlimited gas provides sustained lift without changing mass; release still falls',()=>{
  let s=createState();
  for(let i=0;i<7200;i++)s=stepFlight(s,{...IDLE,lift:1},1/60);
  assert.equal(s.fuel,FUEL_CAPACITY);
  assert.ok(s.altitude>500);assert.ok(s.thrust>0);
  assert.ok(Object.values(s).filter(v=>typeof v==='number').every(Number.isFinite));
  const radius=Math.hypot(s.x,s.y,s.z),oldVy=s.vy;
  const cut=stepFlight(s,IDLE,1/600);
  assert.equal(cut.thrust,0);assert.equal(cut.fuel,FUEL_CAPACITY);
  assert.ok(Math.abs((cut.vy-oldVy)/(1/600)+gravityAt(radius))<0.1);
  // A short burst must still land after release; unlimited supply is not antigravity.
  s=createState();for(let i=0;i<45;i++)s=stepFlight(s,{...IDLE,lift:1},1/60);
  assert.ok(s.altitude>2);
  for(let i=0;i<600;i++)s=stepFlight(s,IDLE,1/60);
  assert.equal(s.altitude,0);assert.equal(s.grounded,true);
});
