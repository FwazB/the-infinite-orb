import * as T from 'three';
import {createMotorcycle} from './motorcycle';
import {FLOOR,type FlightState} from './flight';

export class FlightView {
  readonly renderer:T.WebGLRenderer;
  private scene=new T.Scene();
  private camera=new T.PerspectiveCamera(42,1,0.1,1400);
  private bike=createMotorcycle();
  private shadow:T.Mesh;
  private look=new T.Vector3(-1.4,1.96,25.5);
  private orbitAngle=0;
  private orbitHeight=0;
  private orbitAge=0;
  private clock=0;
  private smoothPosition=new T.Vector3();
  private target=new T.Vector3();
  private desired=new T.Vector3();
  constructor(canvas:HTMLCanvasElement){
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.renderer.outputColorSpace=T.SRGBColorSpace;
    this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.28;
    this.scene.background=new T.Color('#c4b6d9');
    this.scene.fog=new T.Fog('#d2c5df',110,460);
    this.scene.add(new T.HemisphereLight('#fff7e6','#625380',2.4));
    const sun=new T.DirectionalLight('#ffe8c4',3.2);sun.position.set(-45,90,30);this.scene.add(sun);
    this.scene.add(this.bike.root);
    this.camera.position.set(8,3.76,35);
    const groundMat=new T.MeshToonMaterial({color:'#95c889'});
    const edgeMat=new T.MeshToonMaterial({color:'#9eab84'});
    const ground=new T.Mesh(new T.CylinderGeometry(240,217,12,96,1),[edgeMat,groundMat,edgeMat]);ground.position.y=-6;this.scene.add(ground);
    // Flat test field: all decorative solid landmarks stay outside the flight boundary.
    const wash=new T.Mesh(new T.CircleGeometry(239,96),new T.MeshBasicMaterial({color:'#c4db94',transparent:true,opacity:0.12}));wash.rotation.x=-Math.PI/2;wash.position.y=0.005;this.scene.add(wash);
    const pad=new T.Mesh(new T.CircleGeometry(8,64),new T.MeshToonMaterial({color:'#d9d8af'}));pad.rotation.x=-Math.PI/2;pad.position.set(0,0.012,26);this.scene.add(pad);
    for(const radius of [6.6,7.2,218]){
      const ring=new T.Mesh(new T.RingGeometry(radius,radius+0.06,128),new T.MeshBasicMaterial({color:'#f0edd0',side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(0,0.02,radius>100?0:26);this.scene.add(ring);
    }
    for(const side of [-1,1]){
      const dash=new T.Mesh(new T.PlaneGeometry(0.12,3.5),new T.MeshBasicMaterial({color:'#f1eed2'}));dash.rotation.x=-Math.PI/2;dash.position.set(side*2.6,0.025,26);this.scene.add(dash);
    }
    const dots=new T.InstancedMesh(new T.ConeGeometry(0.16,0.65,3),new T.MeshToonMaterial({color:'#77ac7c'}),300);
    const dummy=new T.Object3D();
    for(let i=0;i<300;i++){
      const angle=i*2.39996, radius=18+Math.sqrt((i*73)%300/300)*205;
      dummy.position.set(Math.cos(angle)*radius,0.23,Math.sin(angle)*radius);dummy.rotation.set(0,angle,0);dummy.scale.setScalar(0.6+(i%4)*0.25);dummy.updateMatrix();dots.setMatrixAt(i,dummy.matrix);
    }this.scene.add(dots);
    this.addTree(65,-250,1.6);this.addTree(-155,-220,0.8);this.addTree(205,162,1.0);
    const moon=new T.Mesh(new T.SphereGeometry(36,48,32),new T.MeshBasicMaterial({color:'#ece0cc',fog:false}));moon.position.set(-110,48,-330);this.scene.add(moon);
    const halo=new T.Mesh(new T.RingGeometry(47,49,100),new T.MeshBasicMaterial({color:'#e5d3dc',side:T.DoubleSide,fog:false,transparent:true,opacity:0.65}));halo.position.copy(moon.position);halo.rotation.set(0.65,0.1,-0.25);this.scene.add(halo);
    const cloud=new T.InstancedMesh(new T.SphereGeometry(1,16,10),new T.MeshBasicMaterial({color:'#eee5e7',transparent:true,opacity:0.62,depthWrite:false}),24);
    for(let i=0;i<24;i++){
      const a=i*2.399;dummy.position.set(Math.sin(a)*430,65+(i%5)*13,Math.cos(a)*430);dummy.rotation.set(0,0,0);dummy.scale.set(25+(i%3)*7,3+(i%2)*2,9);dummy.updateMatrix();cloud.setMatrixAt(i,dummy.matrix);
    }this.scene.add(cloud);
    this.shadow=new T.Mesh(new T.CircleGeometry(1,32),new T.MeshBasicMaterial({color:'#45465a',transparent:true,opacity:0.2,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;this.scene.add(this.shadow);
    this.resize();
  }
  private addTree(x:number,z:number,scale:number){
    const group=new T.Group();group.position.set(x,0,z);group.scale.setScalar(scale);
    const trunk=new T.Mesh(new T.CylinderGeometry(1.2,3.0,23,7),new T.MeshToonMaterial({color:'#8c7275'}));trunk.position.y=11;trunk.rotation.z=-0.1;group.add(trunk);
    const foliage=new T.InstancedMesh(new T.DodecahedronGeometry(1,1),new T.MeshToonMaterial({color:'#638d7f'}),9);const dummy=new T.Object3D();
    for(let i=0;i<9;i++){const a=i*2.4;dummy.position.set(Math.cos(a)*(i?8:0),23+(i%3)*3,Math.sin(a)*(i?7:0));dummy.scale.set(8,4.2,7);dummy.rotation.set(i,0,a);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);}
    group.add(foliage);this.scene.add(group);
  }
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);}
  quality(low:boolean){this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.5));this.resize();}
  orbit(dx:number,dy:number){this.orbitAngle+=dx*0.006;this.orbitHeight=T.MathUtils.clamp(this.orbitHeight+dy*0.015,-1,6);this.orbitAge=0;}
  resetCamera(){this.orbitAngle=0;this.orbitHeight=0;this.camera.position.set(8,3.76,35);this.look.set(0,1.1,26);}
  render(s:FlightState,previous:FlightState,alpha:number,dt:number,preview:boolean,reduced:boolean,animate:boolean){
    if(animate)this.clock+=dt;
    this.smoothPosition.set(T.MathUtils.lerp(previous.x,s.x,alpha),T.MathUtils.lerp(previous.y,s.y,alpha),T.MathUtils.lerp(previous.z,s.z,alpha));
    this.bike.root.position.copy(this.smoothPosition);
    if(!s.grounded&&!reduced&&animate)this.bike.root.position.y+=Math.sin(this.clock*2)*0.035;
    this.bike.root.rotation.set(0,s.yaw,reduced?0:s.bank,'YXZ');
    for(const wheel of this.bike.wheels)wheel.rotation.x=-s.distance/0.68;
    this.shadow.position.set(s.x,0.035,s.z);this.shadow.scale.set(1.0+(s.y-FLOOR)*0.03,1.9+(s.y-FLOOR)*0.03,1);
    (this.shadow.material as T.MeshBasicMaterial).opacity=0.2/(1+(s.y-FLOOR)*0.17);
    this.orbitAge+=dt;
    if(this.orbitAge>2){this.orbitAngle*=Math.exp(-dt*2);this.orbitHeight*=Math.exp(-dt*2);}
    if(preview){
      this.desired.set(s.x+8,s.y+2.9,s.z+9);
      this.target.set(s.x-1.4,s.y+1.1,s.z-0.5);
    }else{
      const yaw=s.yaw+this.orbitAngle,range=8.5+Math.abs(s.speed)*0.035;
      this.desired.set(s.x+Math.sin(yaw)*range,s.y+2.5+this.orbitHeight,s.z+Math.cos(yaw)*range);
      this.target.set(s.x-Math.sin(s.yaw)*2,s.y+0.9,s.z-Math.cos(s.yaw)*2);
    }
    this.desired.y=Math.max(1.5,this.desired.y);
    const blend=1-Math.exp(-dt*(reduced?16:5));this.camera.position.lerp(this.desired,blend);this.look.lerp(this.target,blend);this.camera.lookAt(this.look);
    this.renderer.render(this.scene,this.camera);
  }
  dispose(){
    const geometries=new Set<T.BufferGeometry>();const materials=new Set<T.Material>();
    this.scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.renderer.dispose();
  }
}
