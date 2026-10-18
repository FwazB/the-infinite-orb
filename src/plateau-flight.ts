import {createState,FLOOR,type FlightState,type FlightInput} from './flight';
import {EARTH_GRAVITY,PLANET_RADIUS,DRY_MASS,FUEL_CAPACITY,applyThruster} from './physics';
export const PLATEAU_HALF=14;
/** Flat training-ground approximation. Scenic tree/temples are not obstacle colliders. */
export function stepPlateau(previous:FlightState,input:FlightInput,dt:number,multiplier:number):FlightState{
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
  const burn=applyThruster(lift>0?mass*(g+Math.max(-30,Math.min(70,(5*lift-s.vy)*12))):0,h);
  if(s.grounded&&supported){
   const target=drive>0?8*drive:3*drive;
   const resistance=Math.sign(s.speed)*0.02*g;
   const motor=drive!==0?Math.max(-10,Math.min(10,(target-s.speed)*4+resistance)):0;
   const speed=s.speed+(motor-resistance)*h;
   s.speed=drive===0&&Math.sign(speed)!==Math.sign(s.speed)?0:speed;
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
