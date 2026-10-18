import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation';
import {IDLE,createState} from '../src/flight';
import {stepPlateau} from '../src/plateau-flight';
import {EARTH_GRAVITY,MAX_THRUST,FUEL_CAPACITY,DRY_MASS} from '../src/physics';
import {worldById} from '../src/worlds';
test('Whis training applies real 100g downward acceleration, not merely a badge',()=>{
 const world=worldById('beerus');
 assert.equal(world.gravityBasis,'assumed');assert.match(world.gravityNote,/100g.*not canon/);
 const airborne={...createState(),x:17,y:30,grounded:false};
 const next=stepPlateau(airborne,IDLE,1/60,world.gravity);
 assert.ok(Math.abs(next.vy+100*EARTH_GRAVITY/60)<1e-9);
});
test('100g cannot be overcome by the unchanged bounded thruster even with unlimited fuel',()=>{
 const sim=new Simulation();sim.changeWorld('beerus');sim.resume();
 assert.ok((DRY_MASS+FUEL_CAPACITY)*EARTH_GRAVITY*sim.world.gravity>MAX_THRUST);
 for(let i=0;i<600;i++)sim.advance(1/60,{...IDLE,lift:1});
 assert.equal(sim.state.altitude,0);assert.equal(sim.state.grounded,true);
 assert.equal(sim.state.thrust,MAX_THRUST);assert.equal(sim.state.fuel,FUEL_CAPACITY);
 assert.ok(Object.values(sim.state).filter(v=>typeof v==='number').every(Number.isFinite));
});
