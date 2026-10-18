import {createState,stepFlight,type FlightInput} from './flight';
import {worldById} from './worlds';
import {stepPlateau} from './plateau-flight';
const STEP=1/60;
/** Renderer-independent fixed-step clock. Never catches up hidden-tab time. */
export class Simulation {
  private selectedWorld=worldById('king-kai');
  get world(){return this.selectedWorld;}
  changeWorld(id:string){const world=worldById(id);this.pause();this.selectedWorld=world;this.reset();}
  state=createState();
  previous=createState();
  running=false;
  private accumulator=0;
  get alpha(){return this.accumulator/STEP;}
  resume(){this.accumulator=0;this.running=true;}
  pause(){this.running=false;this.accumulator=0;this.previous={...this.state};}
  reset(){this.state=createState();this.previous=createState();this.accumulator=0;}
  advance(seconds:number,input:FlightInput){
    if(!this.running||!Number.isFinite(seconds)||seconds<=0)return;
    this.accumulator+=Math.min(seconds,0.1);
    while(this.accumulator+1e-10>=STEP){
      this.previous=this.state;
      this.state=this.world.shape==='plateau'?stepPlateau(this.state,input,STEP,this.world.gravity):stepFlight(this.state,input,STEP,this.world.gravity);
      this.accumulator=Math.max(0,this.accumulator-STEP);
    }
  }
}
