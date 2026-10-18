import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.ts';
import {IDLE,createState} from '../src/flight.ts';

test('fixed-step simulation agrees at 30/60/144 Hz; pause and reset discard elapsed time',()=>{
  function fly(hz:number){const sim=new Simulation();sim.resume();for(let i=0;i<hz*6;i++)sim.advance(1/hz,{thrust:1,turn:0.2,lift:0.3});return sim.state;}
  const a=fly(30),b=fly(60),c=fly(144);
  for(const key of ['x','y','z','yaw','speed'] as const){assert.ok(Math.abs(a[key]-b[key])<1e-8);assert.ok(Math.abs(b[key]-c[key])<1e-8);}
  const sim=new Simulation();sim.resume();sim.advance(0.1,{...IDLE,thrust:1});sim.pause();
  const saved={...sim.state};sim.advance(999,{...IDLE,thrust:1});assert.deepEqual(sim.state,saved);
  sim.reset();assert.deepEqual(sim.state,createState());
  sim.resume();sim.advance(999,{...IDLE,thrust:1});assert.ok(sim.state.distance<3);
  const current={...sim.state};sim.advance(NaN,IDLE);assert.deepEqual(sim.state,current);
});
