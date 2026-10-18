import {test} from 'node:test';
import assert from 'node:assert/strict';
import {gravityAt,EARTH_GRAVITY,PLANET_RADIUS,stepBallistic} from '../src/physics';
import {createState,stepFlight,IDLE} from '../src/flight';
test('selected gravity changes actual acceleration and flight without changing the default world',()=>{
 assert.ok(Math.abs(gravityAt(PLANET_RADIUS,1)-EARTH_GRAVITY)<1e-9);
 assert.ok(Math.abs(gravityAt(PLANET_RADIUS,12)-12*EARTH_GRAVITY)<1e-9);
 assert.equal(gravityAt(PLANET_RADIUS),10*EARTH_GRAVITY);
 const p={x:0,y:30,z:0},v={x:0,y:0,z:0};
 assert.ok(stepBallistic(p,v,v,0.01,12).velocity.y<stepBallistic(p,v,v,0.01,1).velocity.y);
 const s={...createState(),y:30,altitude:30-18.86,grounded:false};
 assert.ok(stepFlight(s,IDLE,1/60,12).vy<stepFlight(s,IDLE,1/60,1).vy);
});
