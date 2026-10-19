import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation';
import {IDLE} from '../src/flight';
test('Beerus uses a flat plateau, gravity-driven falls and safe respawn beyond the edge',()=>{
 const sim=new Simulation();sim.changeWorld('beerus');sim.resume();
 for(let i=0;i<60;i++)sim.advance(1/60,{...IDLE,thrust:1});
 assert.equal(sim.state.z,0,'stock drive cannot overcome 100g rolling resistance');assert.equal(sim.state.y,18.86);
 sim.state={...sim.state,x:17,speed:0,velocityX:0,velocityZ:0};
 sim.advance(0.1,IDLE);assert.ok(sim.state.y<18.86);assert.equal(sim.state.grounded,false);
 for(let i=0;i<180;i++)sim.advance(1/60,IDLE);
 assert.equal(sim.state.x,0);assert.equal(sim.state.y,18.86);assert.equal(sim.world.id,'beerus');
});
