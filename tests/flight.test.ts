import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, stepFlight, IDLE } from '../src/flight.ts';

test('a hovering bike accelerates forward, stays finite, and brakes to a stop', () => {
  let state = {...createState(), y: 6};
  const start = state.z;
  for (let i=0;i<600;i++) state=stepFlight(state,{...IDLE,thrust:1},1/60);
  assert.ok(state.z < start);
  assert.ok(state.speed > 0 && state.speed <= 26);
  for (let i=0;i<600;i++) state=stepFlight(state,IDLE,1/60);
  assert.ok(Math.abs(state.speed)<0.05);
  assert.equal(state.y,6);
  assert.ok(Object.values(state).filter(v=>typeof v==='number').every(Number.isFinite));
});

test('flight contains altitude, world edges and invalid values safely', () => {
  let s = createState();
  for(let i=0;i<1800;i++) s=stepFlight(s,{thrust: 100, turn: 0, lift: -100},1/60);
  assert.ok(s.y>=0.86 && Math.hypot(s.x,s.z)<=220.001);
  for(let i=0;i<1200;i++) s=stepFlight(s,{...IDLE,lift:1},1/60);
  assert.ok(s.y<=55);
  assert.deepEqual(stepFlight({...s,x:NaN},IDLE,1/60),createState());
  const clean=stepFlight(createState(),{thrust:NaN,turn:Infinity,lift:NaN},1/60);
  assert.ok(Object.values(clean).filter(v=>typeof v==='number').every(Number.isFinite));
  assert.deepEqual(stepFlight(s,IDLE,NaN),s);
});
