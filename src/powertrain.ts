/** Fictional hardware stages; output ratios are design inputs, not speed multipliers. */
export const STAGES=Object.freeze([
 {name:'Stock',multiplier:1,enter:0,hold:0,roadLimit:8,liftLimit:5,color:'#cddce1'},
 {name:'Stage I',multiplier:50,enter:6,hold:4,roadLimit:16,liftLimit:10,color:'#ffd866'},
 {name:'Stage II',multiplier:100,enter:12,hold:8,roadLimit:28,liftLimit:16,color:'#ffab46'},
 {name:'Stage III',multiplier:400,enter:22,hold:15,roadLimit:38,liftLimit:24,color:'#fff2ba'},
] as const);
export const UPSHIFT_SECONDS=1.5;
export const DOWNSHIFT_SECONDS=4;
export const STARTER_SECONDS=2;
export const STARTER_COOLDOWN=12;
export class Powertrain {
 stage=0;
 starterCharge=0;
 starterCooldown=0;
 charge=0;
 slow=0;
 get spec(){return STAGES[this.stage];}
 reset(){this.stage=0;this.charge=0;this.slow=0;this.starterCharge=0;this.starterCooldown=0;}
 /** Stationary capacitor charge supplies only the starting stage, never higher tiers. */
 chargeStarter(held:boolean,stationary:boolean,dt:number){
  if(!Number.isFinite(dt)||dt<=0)return;
  this.starterCooldown=Math.max(0,this.starterCooldown-dt);
  if(!held||!stationary||this.stage!==0||this.starterCooldown>0){this.starterCharge=0;return;}
  this.starterCharge+=dt;
  if(this.starterCharge+1e-9>=STARTER_SECONDS){
   this.stage=1;this.clearTimers();this.starterCharge=0;this.starterCooldown=STARTER_COOLDOWN;
  }
 }
 clearTimers(){this.charge=0;this.slow=0;}
 advance(speed:number,dt:number,canCharge=true){
  if(!Number.isFinite(speed)||!Number.isFinite(dt)||dt<=0)return;
  // Called only by the simulation's fixed-step clock, never wall-clock time.
  const velocity=Math.max(0,speed);
  const next=STAGES[this.stage+1];
  this.charge=canCharge&&next&&velocity>=next.enter?this.charge+dt:0;
  this.slow=this.stage>0&&velocity<this.spec.hold?this.slow+dt:0;
  if(this.slow+1e-9>=DOWNSHIFT_SECONDS){this.stage--;this.clearTimers();}
  else if(next&&this.charge+1e-9>=UPSHIFT_SECONDS){this.stage++;this.clearTimers();}
 }
}
/** Geared speed governor, finite wheel torque/power and unchanged tire grip.
 * Drag and rolling resistance oppose motion; a stationary vehicle cannot be
 * pushed backwards by resistance alone. This is an idealized longitudinal model.
 */
export function driveSpeed(speed:number,throttle:number,mass:number,normalLoad:number,dt:number,stage=0){
 const spec=STAGES[stage]??STAGES[0],support=Math.max(0,normalLoad);
 const target=throttle>=0?spec.roadLimit*throttle:3*throttle;
 const sign=Math.sign(speed||throttle);
 const rolling=0.02*support,drag=0.4*speed*speed;
 const braking=throttle!==0&&speed*throttle<0;
 const grip=0.7*support;
 const forceLimit=braking?Math.min(3000,grip):Math.min(3000*spec.multiplier,24000*spec.multiplier/Math.max(1,Math.abs(speed)),grip);
 const wanted=throttle===0?0:mass*(target-speed)*4+sign*(rolling+drag);
 const motor=Math.max(-forceLimit,Math.min(forceLimit,wanted));
 const resistance=Math.abs(speed)<1e-6?sign*Math.min(rolling+drag,Math.abs(motor)):sign*(rolling+drag);
 const result=speed+(motor-resistance)/mass*dt;
 if(Math.sign(result)!==Math.sign(speed)&&speed!==0)return 0;
 return result;
}
