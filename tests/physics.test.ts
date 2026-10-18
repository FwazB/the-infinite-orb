import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as P from '../src/physics.ts';

test('unpowered flight accelerates inward and conserves orbital energy',()=>{
  const dt=1/600,zero={x:0,y:0,z:0};
  const drop=P.stepBallistic({x:0,y:30,z:0},zero,zero,dt);
  assert.ok(Math.abs(drop.velocity.y+P.gravityAt(30)*dt)<1e-6);
  assert.ok(drop.position.y<30);
  const underside=P.stepBallistic({x:0,y:-30,z:0},zero,zero,dt);
  assert.ok(underside.velocity.y>0);
  let p={x:0,y:30,z:0},v={x:Math.sqrt(P.MU/30),y:0,z:0};
  const energy=(p:P.Vector,v:P.Vector)=>(v.x*v.x+v.y*v.y+v.z*v.z)/2-P.MU/Math.hypot(p.x,p.y,p.z);
  const initial=energy(p,v);
  for(let i=0;i<5000;i++){const next=P.stepBallistic(p,v,zero,dt);p=next.position;v=next.velocity;}
  assert.ok(Math.abs((energy(p,v)-initial)/initial)<1e-7);
});

test('unlimited supply keeps finite force and obeys constant-mass F=ma',()=>{
  const dt=0.01,burn=P.applyThruster(1000,dt);
  assert.equal(burn.fuel,P.FUEL_CAPACITY);
  assert.equal(burn.thrust,1000);
  assert.equal(burn.deltaV,1000*dt/(P.DRY_MASS+P.FUEL_CAPACITY));
  assert.equal(P.applyThruster(0,dt).thrust,0);
  assert.equal(P.applyThruster(-100,dt).thrust,0);
  assert.equal(P.applyThruster(1e9,dt).thrust,P.MAX_THRUST);
  assert.equal(P.applyThruster(NaN,dt).thrust,0);
  assert.equal(P.applyThruster(1000,NaN).thrust,0);
});

test('King Kai gravity is ten Earth gravities at the surface and inverse square outside',()=>{
  assert.equal(P.SURFACE_GRAVITY,10*9.80665);
  assert.equal(P.gravityAt(P.PLANET_RADIUS),P.SURFACE_GRAVITY);
  assert.equal(P.gravityAt(P.PLANET_RADIUS*2),P.SURFACE_GRAVITY/4);
});
