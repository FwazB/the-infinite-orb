import {createState,FLOOR,type FlightState,type FlightInput} from './flight';
import {EARTH_GRAVITY,PLANET_RADIUS,DRY_MASS,FUEL_CAPACITY,applyThruster} from './physics';
import {STAGES,driveSpeed} from './powertrain';
export const PLATEAU_HALF=14;
/** Flat training-ground approximation. Scenic tree/temples are not obstacle colliders. */
export function stepPlateau(previous:FlightState,input:FlightInput,dt:number,multiplier:number,stage=0):FlightState{
 if(Object.values(previous).some(v=>typeof v==='number'&&!Number.isFinite(v)))return createState();
 if(!Number.isFinite(dt)||dt<=0)return {...previous};
 const duration=Math.min(dt,1/30),steps=Math.ceil(duration/(1/600)),h=duration/steps;
 const safe=(v:number)=>Number.isFinite(v)?Math.max(-1,Math.min(1,v)):0;
 const drive=safe(input.thrust),turn=safe(input.turn),lift=safe(input.lift),g=EARTH_GRAVITY*multiplier;
 const mass=DRY_MASS+FUEL_CAPACITY,floor=PLANET_RADIUS+FLOOR;
 let s={...previous};
 for(let i=0;i<steps;i++){
  const heading=Math.atan2(s.fx,-s.fz)-turn*1.35*h;
  s.fx=Math.sin(heading);s.fy=0;s.fz=-Math.cos(heading);
  const supported=Math.abs(s.x)<=PLATEAU_HALF&&Math.abs(s.z)<=PLATEAU_HALF&&s.y>=floor-0.01;
  const spec=STAGES[stage]??STAGES[0];
  const burn=applyThruster(lift>0?mass*(g+Math.max(-30,Math.min(70,(spec.liftLimit*lift-s.vy)*12))):0,h,spec.multiplier);
  if(s.grounded&&supported){
   s.speed=driveSpeed(s.speed,drive,mass,Math.max(0,mass*g-burn.thrust),h,stage);
   s.velocityX=s.fx*s.speed;s.velocityZ=s.fz*s.speed;
  }
  s.x+=s.velocityX*h;s.z+=s.velocityZ*h;
  s.vy+=(burn.thrust/mass-g)*h;s.y+=s.vy*h;
  const onPlateau=Math.abs(s.x)<=PLATEAU_HALF&&Math.abs(s.z)<=PLATEAU_HALF;
  s.grounded=onPlateau&&supported&&s.y<=floor&&s.vy<=0;
  if(s.grounded){s.y=floor;s.vy=0;}
  s.velocityY=s.vy;s.thrust=burn.thrust;s.fuel=FUEL_CAPACITY;
  s.altitude=Math.max(0,s.y-floor);s.bank+=(-turn*0.15-s.bank)*h*5;
  s.distance+=Math.hypot(s.velocityX,s.velocityY,s.velocityZ)*h;
  if(s.y<-35)return createState();
 }
 return s;
}
