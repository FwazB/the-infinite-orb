import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,stepFlight,IDLE,PLANET_RADIUS,FLOOR} from '../src/flight.ts';

test('surface driving accelerates, coasts to a stop and can reverse',()=>{
  let state=createState();
  for(let i=0;i<300;i++)state=stepFlight(state,{...IDLE,thrust:1},1/60);
  assert.ok(state.speed>7&&state.speed<=8);
  assert.ok(state.distance>20);
  assert.equal(state.altitude,0);
  assert.equal(state.grounded,true);
  for(let i=0;i<300;i++)state=stepFlight(state,IDLE,1/60);
  assert.ok(Math.abs(state.speed)<0.01);
  for(let i=0;i<300;i++)state=stepFlight(state,{...IDLE,thrust:-1},1/60);
  assert.ok(state.speed<-2.9);
});

test('steering transports a stable tangent frame through poles and the underside',()=>{
  let state=createState();
  for(let i=0;i<12000;i++){
    state=stepFlight(state,{thrust:1,turn:Math.sin(i/140),lift:0},1/60);
    const r=Math.hypot(state.x,state.y,state.z);
    assert.ok(Math.abs(r-(PLANET_RADIUS+FLOOR))<1e-8);
    assert.ok(Math.abs(Math.hypot(state.fx,state.fy,state.fz)-1)<1e-8);
    assert.ok(Math.abs((state.x*state.fx+state.y*state.fy+state.z*state.fz)/r)<1e-8);
  }
  assert.ok(Object.values(state).filter(v=>typeof v==='number').every(Number.isFinite));
});

test('gas thrust has no artificial altitude ceiling and release returns to the surface',()=>{
  let state=createState();
  for(let i=0;i<100;i++)state=stepFlight(state,{thrust:1,turn:0,lift:100},1/60);
  assert.ok(state.altitude>6);
  assert.ok(Math.abs(Math.hypot(state.x,state.y,state.z)-(PLANET_RADIUS+FLOOR+state.altitude))<1e-8);
  for(let i=0;i<1200;i++)state=stepFlight(state,{thrust:1,turn:0,lift:-100},1/60);
  assert.equal(state.altitude,0);assert.equal(state.grounded,true);
  assert.ok(Math.abs(Math.hypot(state.x,state.y,state.z)-(PLANET_RADIUS+FLOOR))<1e-8);
});

test('invalid state/input and oversized time steps recover without leaving the planet',()=>{
  const state=createState();
  assert.deepEqual(stepFlight({...state,x:NaN},IDLE,1/60),state);
  assert.deepEqual(stepFlight({...state,x:0,y:0,z:0},IDLE,1/60),state);
  assert.deepEqual(stepFlight(state,IDLE,NaN),state);
  assert.deepEqual(stepFlight(state,IDLE,-1),state);
  const clean=stepFlight(state,{thrust:NaN,turn:Infinity,lift:NaN},1/60);
  assert.ok(Object.values(clean).filter(v=>typeof v==='number').every(Number.isFinite));
  assert.deepEqual(stepFlight(state,{...IDLE,thrust:1},999),stepFlight(state,{...IDLE,thrust:1},1/30));
});
