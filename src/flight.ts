export interface FlightState {
  x: number; y: number; z: number; yaw: number; speed: number; vy: number;
  bank: number; distance: number; grounded: boolean; boundary: boolean;
}
export interface FlightInput { thrust: number; turn: number; lift: number }
export const IDLE: Readonly<FlightInput> = Object.freeze({ thrust: 0, turn: 0, lift: 0 });
export const FLOOR = 0.86;
export function createState(): FlightState {
  return {x: 0, y: FLOOR, z: 26, yaw: 0, speed: 0, vy: 0, bank: 0, distance: 0, grounded: true, boundary: false};
}
const damp = (a: number, b: number, rate: number, dt: number) => a+(b-a)*(1-Math.exp(-rate*dt));
export function stepFlight(previous: FlightState, input: FlightInput, dt: number): FlightState {
  if (Object.values(previous).some(v=>typeof v==='number' && !Number.isFinite(v))) return createState();
  if (!Number.isFinite(dt) || dt<=0) return {...previous};
  dt=Math.min(dt,1/30);
  const normalize=(n:number)=>Number.isFinite(n)?Math.max(-1,Math.min(1,n)):0;
  input={thrust:normalize(input.thrust),turn:normalize(input.turn),lift:normalize(input.lift)};
  const s = {...previous};
  s.speed = damp(s.speed, input.thrust > 0 ? 26*input.thrust : 5*input.thrust, input.thrust < 0 ? 3 : input.thrust > 0 ? 1.4 : 1.3, dt);
  s.yaw -= input.turn*1.35*dt;
  s.bank = damp(s.bank, -input.turn*0.26*Math.min(1,Math.abs(s.speed)/10), 5, dt);
  s.vy = damp(s.vy, input.lift*8, 4, dt);
  s.x -= Math.sin(s.yaw)*s.speed*dt;
  s.z -= Math.cos(s.yaw)*s.speed*dt;
  s.y += s.vy*dt;
  if(s.y<=FLOOR){s.y=FLOOR;s.vy=0;}
  if(s.y>=55){s.y=55;s.vy=0;}
  s.grounded=s.y<=FLOOR+0.015;
  const radius=Math.hypot(s.x,s.z);
  s.boundary=radius>205;
  if(radius>220){s.x*=220/radius;s.z*=220/radius;s.speed=0;}
  s.yaw=Math.atan2(Math.sin(s.yaw),Math.cos(s.yaw));
  s.distance += Math.abs(s.speed)*dt;
  return s;
}
