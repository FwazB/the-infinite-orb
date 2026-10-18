/** Original procedural gas hiss. Created only after an explicit user gesture; no audio assets or requests. */
export class ThrusterAudio {
  private context?:AudioContext;
  private gain?:GainNode;
  private analyser?:AnalyserNode;
  private source?:AudioBufferSourceNode;
  private samples=new Float32Array(256);
  private enabled=false;
  async setEnabled(enabled:boolean){
    this.enabled=enabled;
    if(!enabled){if(this.context)await this.context.suspend();return;}
    if(!this.context){
      const context=this.context=new AudioContext();
      const buffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
      const data=buffer.getChannelData(0);let seed=713;
      for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;data[i]=(seed/4294967296)*2-1;}
      const source=this.source=context.createBufferSource();source.buffer=buffer;source.loop=true;
      const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2200;
      const gain=this.gain=context.createGain();gain.gain.value=0;
      const analyser=this.analyser=context.createAnalyser();analyser.fftSize=256;
      source.connect(filter).connect(gain).connect(analyser).connect(context.destination);source.start();
    }
    await this.context.resume();
  }
  update(power:number,active:boolean){
    if(!this.context||!this.gain||!this.analyser)return 0;
    this.gain.gain.setTargetAtTime(this.enabled&&active?0.07*Math.sqrt(Math.max(0,Math.min(1,power))):0,this.context.currentTime,0.015);
    if(this.context.state!=='running')return 0;
    this.analyser.getFloatTimeDomainData(this.samples);
    return Math.sqrt(this.samples.reduce((sum,value)=>sum+value*value,0)/this.samples.length);
  }
  dispose(){this.source?.stop();void this.context?.close();}
}
