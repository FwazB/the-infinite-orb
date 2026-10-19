import * as T from 'three';
import {STAGES} from './powertrain';
/** Original low-poly field visualization: no sprites, textures, bloom or strobing. */
export class StageAura {
 readonly root=new T.Group();
 private clock=0;
 private material=new T.MeshBasicMaterial({color:'#ffd866',transparent:true,opacity:0.1,depthWrite:false,side:T.BackSide});
 private shell=new T.Mesh(new T.SphereGeometry(1,16,12),this.material);
 private ribbons:T.Mesh[]=[];
 constructor(){
  this.root.name='powertrain-aura';this.root.visible=false;
  this.shell.scale.set(1.7,2,3.1);this.shell.position.y=0.85;this.root.add(this.shell);
  const geometry=new T.TorusGeometry(1,0.04,4,40);
  for(let i=0;i<3;i++){
   const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({color:'#ffd866',transparent:true,opacity:0.6,depthWrite:false}));
   mesh.rotation.set(Math.PI/2,i*0.35,i*0.7);mesh.scale.set(1.7,3.1,1);mesh.position.y=0.7+i*0.3;
   this.ribbons.push(mesh);this.root.add(mesh);
  }
 }
 update(stage:number,dt:number,reduced:boolean,cockpit:boolean,animate:boolean){
  const index=Math.max(0,Math.min(3,Math.floor(stage))),spec=STAGES[index];
  this.root.visible=index>0&&!cockpit;
  if(animate&&!reduced)this.clock+=Math.min(Math.max(dt,0),0.1);
  const pulse=reduced?1:1+0.025*Math.sin(this.clock*2);
  this.root.scale.setScalar(pulse*(1+index*0.04));
  this.material.color.set(spec.color);this.material.opacity=0.08+index*0.035;
  this.ribbons.forEach((mesh,i)=>{
   mesh.visible=i<index;(mesh.material as T.MeshBasicMaterial).color.set(spec.color);
   mesh.rotation.z=reduced?i*0.7:i*0.7+this.clock*0.18*(i%2?-1:1);
  });
 }
}
