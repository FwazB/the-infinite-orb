import {PLANET_RADIUS,DRY_MASS,FUEL_CAPACITY,applyThruster,gravityAt,stepBallistic,type Vector} from './physics';
export {PLANET_RADIUS} from './physics';
export interface FlightState {
  x:number; y:number; z:number; fx:number; fy:number; fz:number;
  speed:number; vy:number; altitude:number; bank:number; distance:number; grounded:boolean;
  velocityX:number; velocityY:number; velocityZ:number; fuel:number; thrust:number;
}
export interface FlightInput { thrust:number; turn:number; lift:number }
export const IDLE:Readonly<FlightInput>=Object.freeze({thrust:0,turn:0,lift:0});
export const FLOOR=0.86;
const CONTACT_RADIUS=PLANET_RADIUS+FLOOR;
export function createState():FlightState{
  return {x:0,y:CONTACT_RADIUS,z:0,fx:0,fy:0,fz:-1,speed:0,vy:0,altitude:0,bank:0,distance:0,grounded:true,velocityX:0,velocityY:0,velocityZ:0,fuel:FUEL_CAPACITY,thrust:0};
}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const add=(a:Vector,b:Vector):Vector=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const scale=(a:Vector,s:number):Vector=>({x:a.x*s,y:a.y*s,z:a.z*s});
const dot=(a:Vector,b:Vector)=>a.x*b.x+a.y*b.y+a.z*b.z;
const cross=(a:Vector,b:Vector):Vector=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
const norm=(a:Vector)=>Math.hypot(a.x,a.y,a.z);
const unit=(a:Vector)=>scale(a,1/norm(a));

/** Ground contact is an ideal no-slip constraint; airborne translation obeys Newton's laws. */
function integrate(s:FlightState,input:FlightInput,dt:number,multiplier=10):FlightState{
  const p={x:s.x,y:s.y,z:s.z},radius=norm(p),n=scale(p,1/radius);
  let f=unit(add({x:s.fx,y:s.fy,z:s.fz},scale(n,-(s.fx*n.x+s.fy*n.y+s.fz*n.z))));
  let velocity=s.grounded?scale(f,s.speed):{x:s.velocityX,y:s.velocityY,z:s.velocityZ};
  const mass=DRY_MASS+FUEL_CAPACITY,g=gravityAt(radius,multiplier),radial=dot(velocity,n);
  const tangentSpeed=norm(add(velocity,scale(n,-radial)));
  // The flight controller requests thrust, never an imposed vertical velocity or height.
  const requested=input.lift>0?mass*Math.max(0,g-tangentSpeed*tangentSpeed/radius+clamp((5*input.lift-radial)*12,-30,70)):0;
  const burn=applyThruster(requested,dt);
  const support=mass*(g-tangentSpeed*tangentSpeed/radius)-burn.thrust;
  const yawLimit=s.grounded?Math.min(1.7,0.7*Math.max(0,support)/(mass*Math.max(0.1,Math.abs(s.speed)))):1.7;
  const yaw=-input.turn*yawLimit*dt;
  f=unit(add(scale(f,Math.cos(yaw)),scale(cross(n,f),Math.sin(yaw))));
  const next={...s,fuel:burn.fuel,thrust:burn.thrust};
  next.bank+=(-input.turn*0.22*Math.min(1,Math.abs(s.speed)/5)-next.bank)*(1-Math.exp(-5*dt));
  if(s.grounded&&support>=0){
    // SI force integration; wheel motor governor and rolling resistance are explicit assumptions.
    const target=input.thrust>0?8*input.thrust:3*input.thrust;
    const rolling=Math.sign(s.speed||input.thrust)*0.02*support;
    const motor=input.thrust!==0?clamp(mass*clamp((target-s.speed)*4,-8,8)+rolling,-3000,3000):0;
    let speed=s.speed+(motor-rolling)/mass*dt;
    if(input.thrust===0&&Math.sign(speed)!==Math.sign(s.speed))speed=0;
    const distance=speed*dt,angle=distance/CONTACT_RADIUS,c=Math.cos(angle),sn=Math.sin(angle);
    const normal=unit(add(scale(n,c),scale(f,sn)));
    f=unit(add(scale(f,c),scale(n,-sn)));
    const position=scale(normal,CONTACT_RADIUS);velocity=scale(f,speed);
    Object.assign(next,position,{speed,altitude:0,vy:0,grounded:true,distance:s.distance+Math.abs(distance)});
  }else{
    // Steering changes the ideal attitude controller's heading, not airborne momentum.
    const external=scale(n,burn.deltaV/dt);
    const moved=stepBallistic(p,velocity,external,dt,multiplier);
    let position=moved.position;velocity=moved.velocity;
    let newRadius=norm(position);const normal=scale(position,1/newRadius);
    const rotation=cross(n,normal),cosine=dot(n,normal);
    if(cosine>-0.999999)f=add(add(f,cross(rotation,f)),scale(cross(rotation,cross(rotation,f)),1/(1+cosine)));
    f=unit(add(f,scale(normal,-dot(f,normal))));
    next.grounded=false;
    if(newRadius<=CONTACT_RADIUS){
      newRadius=CONTACT_RADIUS;position=scale(normal,newRadius);
      velocity=add(velocity,scale(normal,-Math.min(0,dot(velocity,normal))));
      next.grounded=true;
      // Landing is inelastic; tires scrub lateral slip. Structural damage is not modeled.
      velocity=scale(f,dot(velocity,f));
    }
    Object.assign(next,position,{altitude:Math.max(0,newRadius-CONTACT_RADIUS),vy:dot(velocity,normal),speed:dot(velocity,f),distance:s.distance+norm(velocity)*dt});
  }
  return {...next,fx:f.x,fy:f.y,fz:f.z,velocityX:velocity.x,velocityY:velocity.y,velocityZ:velocity.z};
}

export function stepFlight(previous:FlightState,input:FlightInput,dt:number,multiplier=10):FlightState{
  if(Object.values(previous).some(v=>typeof v==='number'&&!Number.isFinite(v)))return createState();
  if(!Number.isFinite(dt)||dt<=0)return {...previous};
  const r=Math.hypot(previous.x,previous.y,previous.z);
  const normal={x:previous.x/r,y:previous.y/r,z:previous.z/r};
  const forward={x:previous.fx,y:previous.fy,z:previous.fz};
  if(!Number.isFinite(r)||r<1e-8||norm(add(forward,scale(normal,-dot(forward,normal))))<1e-8)return createState();
  const safe=(n:number)=>Number.isFinite(n)?clamp(n,-1,1):0;
  const controls={thrust:safe(input.thrust),turn:safe(input.turn),lift:safe(input.lift)};
  const duration=Math.min(dt,1/30),steps=Math.ceil(duration/(1/600)),h=duration/steps;
  let state={...previous,fuel:FUEL_CAPACITY};
  for(let i=0;i<steps;i++)state=integrate(state,controls,h,multiplier);
  return state;
}
