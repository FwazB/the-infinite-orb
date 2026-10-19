import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation';
import {IDLE} from '../src/flight';

test('sustained driving automatically earns stages without directly multiplying velocity',()=>{
 const sim=new Simulation();sim.resume();
 for(let i=0;i<900;i++)sim.advance(1/60,{...IDLE,thrust:1});
 assert.equal(sim.powertrain?.stage,3);
 assert.ok(sim.state.speed>22&&sim.state.speed<=38.01);
 assert.ok(Object.values(sim.state).filter(v=>typeof v==='number').every(Number.isFinite));
});

import {Powertrain,STAGES,driveSpeed} from '../src/powertrain';
import {MAX_THRUST,applyThruster} from '../src/physics';
import {stepPlateau} from '../src/plateau-flight';
import {createState} from '../src/flight';

test('upshift needs continuous threshold speed; downshift has a four-second grace and hysteresis',()=>{
 const p=new Powertrain();
 for(let i=0;i<89;i++)p.advance(6,1/60);
 assert.equal(p.stage,0);p.advance(5,1/60);assert.equal(p.charge,0);
 for(let i=0;i<90;i++)p.advance(6,1/60);
 assert.equal(p.stage,1);
 for(let i=0;i<239;i++)p.advance(0,1/60);
 assert.equal(p.stage,1);p.advance(5,1/60);assert.equal(p.slow,0);
 for(let i=0;i<240;i++)p.advance(0,1/60);
 assert.equal(p.stage,0);
 p.advance(NaN,1);p.advance(100,NaN);assert.equal(p.stage,0);
});
test('flight can sustain an earned stage but cannot charge stages from falling or hovering',()=>{
 const p=new Powertrain();p.stage=1;
 for(let i=0;i<600;i++)p.advance(30,1/60,false);
 assert.equal(p.stage,1);assert.equal(p.charge,0);
});
test('pause freezes timers, destinations carry earned hardware, and reset clears it',()=>{
 const sim=new Simulation();sim.resume();
 for(let i=0;i<900;i++)sim.advance(1/60,{...IDLE,thrust:1});
 sim.pause();const before=sim.powertrain.stage;
 sim.advance(100,IDLE);assert.equal(sim.powertrain.stage,before);
 sim.changeWorld('beerus');assert.equal(sim.powertrain.stage,before);assert.equal(sim.powertrain.slow,0);
 sim.resume();for(let i=0;i<60;i++)sim.advance(1/60,{...IDLE,lift:1});
 assert.ok(sim.state.altitude>1,'earned thruster stage can overcome 100g');
 sim.reset();assert.equal(sim.powertrain.stage,0);
});
test('power is force-limited and grip is not multiplied; reverse and resistance remain bounded',()=>{
 assert.deepEqual(STAGES.map(s=>s.multiplier),[1,50,100,400]);
 for(let stage=0;stage<4;stage++){
  const result=driveSpeed(0,1,300,3000,0.01,stage);
  assert.ok(result<=0.7*3000/300*0.01);
  assert.equal(driveSpeed(0,1,300,0,0.01,stage),0);
 }
 assert.equal(driveSpeed(0,1,300,300000,0.01,0),0);
 assert.equal(applyThruster(1e10,1/60,50).thrust,MAX_THRUST*50);
 let lifted=createState();for(let i=0;i<60;i++)lifted=stepPlateau(lifted,{...IDLE,lift:1},1/60,100,1);
 assert.ok(lifted.altitude>1);
});
test('stage timing and resulting motion agree at 30, 60 and 144 Hz',()=>{
 const states=[30,60,144].map(hz=>{const sim=new Simulation();sim.resume();for(let i=0;i<hz*12;i++)sim.advance(1/hz,{...IDLE,thrust:1});return sim;});
 for(const sim of states){assert.equal(sim.powertrain.stage,3);assert.ok(Math.abs(sim.state.distance-states[0].state.distance)<1e-7);}
});
