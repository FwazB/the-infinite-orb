import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation';
import {IDLE} from '../src/flight';
test('world changes reset and pause the ride, retain the selected gravity on reset and reject unknown IDs',()=>{
 const sim=new Simulation();sim.resume();sim.advance(0.1,{...IDLE,lift:1});
 sim.changeWorld('beerus');
 assert.equal(sim.world.id,'beerus');assert.equal(sim.world.gravity,100);assert.equal(sim.running,false);assert.equal(sim.state.distance,0);assert.deepEqual(sim.previous,sim.state);
 sim.reset();assert.equal(sim.world.id,'beerus');
 assert.throws(()=>sim.changeWorld('not-a-world'));assert.equal(sim.world.id,'beerus');
 sim.changeWorld('earth');sim.resume();sim.advance(0.1,{...IDLE,lift:1});assert.ok(sim.state.altitude>0);
});
