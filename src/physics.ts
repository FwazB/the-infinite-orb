/** SI units. The planet size and vehicle numbers are game assumptions, not Tesla specifications. */
export const EARTH_GRAVITY=9.80665;
export const GRAVITY_MULTIPLIER=10;
export const SURFACE_GRAVITY=GRAVITY_MULTIPLIER*EARTH_GRAVITY;
export const PLANET_RADIUS=18;
export const MU=SURFACE_GRAVITY*PLANET_RADIUS**2;
export const gravityAt=(radius:number)=>MU/(radius*radius);
export const DRY_MASS=220;
export const FUEL_CAPACITY=80;
export const MAX_THRUST=45000;
export interface Vector{x:number;y:number;z:number}
/** Velocity-Verlet for a point mass under central gravity and an external acceleration. */
export function stepBallistic(p:Vector,v:Vector,external:Vector,dt:number){
  const acceleration=(q:Vector)=>{
    const scale=-MU/Math.hypot(q.x,q.y,q.z)**3;
    return {x:q.x*scale+external.x,y:q.y*scale+external.y,z:q.z*scale+external.z};
  };
  const a=acceleration(p),half=dt*dt/2;
  const position={x:p.x+v.x*dt+a.x*half,y:p.y+v.y*dt+a.y*half,z:p.z+v.z*dt+a.z*half};
  const b=acceleration(position);
  const velocity={x:v.x+(a.x+b.x)*dt/2,y:v.y+(a.y+b.y)*dt/2,z:v.z+(a.z+b.z)*dt/2};
  return {position,velocity};
}
/** Arcade resupply: finite force, constant wet mass, no depletion or pressure fade. */
export function applyThruster(requestedThrust:number,dt:number){
  const thrust=Number.isFinite(requestedThrust)&&Number.isFinite(dt)&&dt>0?Math.max(0,Math.min(requestedThrust,MAX_THRUST)):0;
  return {fuel:FUEL_CAPACITY,thrust,deltaV:thrust>0?thrust*dt/(DRY_MASS+FUEL_CAPACITY):0};
}
