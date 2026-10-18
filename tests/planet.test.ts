import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createState,stepFlight,IDLE} from '../src/flight.ts';

test('the scooter can complete a continuous great-circle lap on a spherical planet',()=>{
  const start=createState();
  const radius=18+0.86;
  assert.ok(Math.abs(Math.hypot(start.x,start.y,start.z)-radius)<1e-9,'spawn must be on the planet, not a flat field');
  let state={...start,speed:8};
  const steps=720,dt=2*Math.PI*radius/(8*steps);
  let visitedUnderside=false;
  for(let i=0;i<steps;i++){
    state=stepFlight(state,{...IDLE,thrust:1},dt);
    assert.ok(Math.abs(Math.hypot(state.x,state.y,state.z)-radius)<1e-8);
    if(state.y<0)visitedUnderside=true;
  }
  assert.ok(visitedUnderside,'the underside must be traversable');
  assert.ok(Math.hypot(state.x-start.x,state.y-start.y,state.z-start.z)<1e-7,'a lap must return to its starting point');
  assert.ok(Math.abs(state.distance-2*Math.PI*radius)<1e-7);
});
