import {writeFileSync,mkdirSync} from 'node:fs';
import {Simulation} from '../../src/simulation.ts';
const cases=[];
for(const world of ['king-kai','earth','namek','beerus'])for(const hz of [30,60,144]){
 const sim=new Simulation();sim.changeWorld(world);sim.resume();const steps=[];
 for(const [seconds,input] of [[2,{powerUp:true}],[3,{thrust:1}],[2,{thrust:1,turn:.5}],[2,{lift:1}],[3,{thrust:-1}],[1,{}]] as const){
  const controls={thrust:0,turn:0,lift:0,...input};const ticks=seconds*hz;
  for(let i=0;i<ticks;i++)sim.advance(1/hz,controls);
  steps.push({ticks,input:controls,state:{...sim.state},power:{stage:sim.powertrain.stage,charge:sim.powertrain.charge,slow:sim.powertrain.slow,starterCharge:sim.powertrain.starterCharge,starterCooldown:sim.powertrain.starterCooldown}});
 }
 cases.push({world:['king-kai','earth','namek','beerus'].indexOf(world),hz,steps});
}
mkdirSync('rust/tests/fixtures',{recursive:true});writeFileSync('rust/tests/fixtures/legacy-parity.json',JSON.stringify(cases));
console.log('Recorded',cases.length,'legacy input traces; actual states, not hand-written expected results.');
