import * as T from 'three';
interface Puff{position:T.Vector3;velocity:T.Vector3;age:number}
/** Stylized condensation cues, not a compressible-fluid or plume simulation. */
export class GasExhaust {
  readonly mesh=new T.InstancedMesh(new T.SphereGeometry(1,8,6),new T.MeshBasicMaterial({color:'#f8f7f1',transparent:true,opacity:0.42,depthWrite:false}),80);
  private puffs:Puff[]=[];
  private clock=0;
  private dummy=new T.Object3D();
  constructor(){this.mesh.name='cold-gas-exhaust';this.mesh.frustumCulled=false;this.mesh.count=0;}
  update(position:T.Vector3,up:T.Vector3,right:T.Vector3,back:T.Vector3,velocity:T.Vector3,power:number,dt:number,reduced:boolean){
    if(reduced){this.puffs=[];this.mesh.count=0;return;}
    for(const puff of this.puffs){puff.age+=dt;puff.position.addScaledVector(puff.velocity,dt);}
    this.puffs=this.puffs.filter(p=>p.age<0.55);
    this.clock+=dt;
    if(power>0.001&&this.clock>1/40){
      this.clock=0;
      for(const side of [-1,1])if(this.puffs.length<80)this.puffs.push({
        position:position.clone().addScaledVector(up,-0.42).addScaledVector(right,side*0.62).addScaledVector(back,0.35),
        velocity:velocity.clone().addScaledVector(up,-4).addScaledVector(right,side*0.7),age:0
      });
    }
    this.puffs.forEach((p,i)=>{
      this.dummy.position.copy(p.position);this.dummy.scale.setScalar((0.12+p.age*0.7)*(1-p.age/0.55));
      this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);
    });
    this.mesh.count=this.puffs.length;this.mesh.instanceMatrix.needsUpdate=true;
  }
  clear(){this.puffs=[];this.mesh.count=0;this.clock=0;}
}
