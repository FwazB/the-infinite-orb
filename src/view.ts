import * as T from 'three';
import {GasExhaust} from './exhaust';
import {MAX_THRUST} from './physics';
import {StageAura} from './stage-aura';
import {worldById,type WorldDefinition} from './worlds';
import {disposeWorld} from './world-landmarks';
import {createMotorcycle} from './motorcycle';
import {createPlanet,planetCameraBounds} from './planet-world';
import {FLOOR,PLANET_RADIUS,type FlightState} from './flight';

export class FlightView {
  readonly renderer:T.WebGLRenderer;
  private scene=new T.Scene();
  private world=worldById('king-kai');
  private worldGroup:T.Group;
  private camera=new T.OrthographicCamera(-48,48,27,-27,0.1,400);
  private cockpitCamera=new T.PerspectiveCamera(80,1,0.025,400);
  private firstPerson=false;
  private lookTarget=new T.Vector3();
  private gradient=new T.DataTexture(new Uint8Array([90,165,225,255]),4,1,T.RedFormat);
  private bike:ReturnType<typeof createMotorcycle>;
  private shadow:T.Mesh;
  private up=new T.Vector3(0,1,0);
  private forward=new T.Vector3(0,0,-1);
  private right=new T.Vector3(1,0,0);
  private back=new T.Vector3(0,0,1);
  private position=new T.Vector3();
  private basis=new T.Matrix4();
  private bodyFrame=new T.Quaternion();
  private cameraFrame=new T.Quaternion();
  private flatShadow=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2);
  private center=new T.Vector3();
  private projectedCenter=new T.Vector3();
  private projectedBike=new T.Vector3();
  private exhaust=new GasExhaust();
  private aura=new StageAura();
  private velocity=new T.Vector3();
  private orbitAngle=0;
  private orbitHeight=0;
  private orbitAge=0;
  private introShift=0.11;
  private needsSnap=true;

  constructor(private canvas:HTMLCanvasElement){
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.renderer.outputColorSpace=T.SRGBColorSpace;
    this.renderer.toneMapping=T.NoToneMapping;
    this.gradient.minFilter=T.NearestFilter;this.gradient.magFilter=T.NearestFilter;
    this.gradient.generateMipmaps=false;this.gradient.needsUpdate=true;
    this.scene.background=new T.Color('#bcb0e2');
    this.scene.add(new T.HemisphereLight('#fff6e4','#947bbb',1.25));
    const sun=new T.DirectionalLight('#fff6df',1.15);sun.position.set(-25,60,40);this.scene.add(sun);
    this.worldGroup=createPlanet(this.gradient,this.world);this.scene.add(this.worldGroup);
    this.canvas.dataset.destination=this.world.id;
    this.bike=createMotorcycle(this.gradient);this.scene.add(this.bike.root);this.scene.add(this.aura.root);
    this.shadow=new T.Mesh(new T.CircleGeometry(1,40),new T.MeshBasicMaterial({color:'#433458',transparent:true,opacity:0.2,depthWrite:false}));this.scene.add(this.shadow);
    this.scene.add(this.exhaust.mesh);
    canvas.dataset.world='tiny-planet';
    this.resize();
  }
  setWorld(world:WorldDefinition){
    const next=createPlanet(this.gradient,world);disposeWorld(this.worldGroup);this.worldGroup=next;this.scene.add(next);
    this.world=world;this.scene.background=new T.Color(world.sky);this.firstPerson=false;this.center.set(0,world.shape==='plateau'?8:0,0);
    this.canvas.dataset.destination=world.id;this.canvas.dataset.shape=world.shape;this.resetCamera();
  }
  resize(){
    Object.assign(this.camera,planetCameraBounds(innerWidth,innerHeight));
    this.camera.updateProjectionMatrix();
    this.cockpitCamera.aspect=innerWidth/Math.max(1,innerHeight);this.cockpitCamera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth,innerHeight);
  }
  toggleCamera(){this.firstPerson=!this.firstPerson;this.orbitAngle=0;this.orbitHeight=0;this.needsSnap=true;return this.firstPerson;}
  quality(low:boolean){this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.5));this.resize();}
  orbit(dx:number,dy:number){this.orbitAngle+=dx*0.006;this.orbitHeight=T.MathUtils.clamp(this.orbitHeight+dy*0.003,-0.18,0.4);this.orbitAge=0;}
  resetCamera(){this.exhaust.clear();this.orbitAngle=0;this.orbitHeight=0;this.needsSnap=true;for(const wheel of this.bike.wheels)wheel.rotation.x=0;}
  render(s:FlightState,previous:FlightState,alpha:number,dt:number,preview:boolean,reduced:boolean,animate:boolean,stage=0){
    const altitude=T.MathUtils.lerp(previous.altitude,s.altitude,alpha);
    this.position.set(T.MathUtils.lerp(previous.x,s.x,alpha),T.MathUtils.lerp(previous.y,s.y,alpha),T.MathUtils.lerp(previous.z,s.z,alpha));
    const plateau=this.world.shape==='plateau';
    if(plateau)this.up.set(0,1,0);else{this.up.copy(this.position).normalize();this.position.copy(this.up).multiplyScalar(PLANET_RADIUS+FLOOR+altitude);}
    this.forward.set(T.MathUtils.lerp(previous.fx,s.fx,alpha),T.MathUtils.lerp(previous.fy,s.fy,alpha),T.MathUtils.lerp(previous.fz,s.fz,alpha));
    this.forward.addScaledVector(this.up,-this.forward.dot(this.up)).normalize();
    this.right.crossVectors(this.forward,this.up).normalize();this.back.copy(this.forward).negate();
    this.basis.makeBasis(this.right,this.up,this.back);this.bodyFrame.setFromRotationMatrix(this.basis);
    this.bike.glass.opacity=this.firstPerson?0.12:0.68;
    this.bike.canopyArch.visible=!this.firstPerson;
    this.bike.root.position.copy(this.position);this.bike.root.quaternion.copy(this.bodyFrame);
    if(!reduced)this.bike.root.rotateZ(s.bank);
    if(animate)for(const wheel of this.bike.wheels)wheel.rotation.x-=s.speed*dt/0.68;
    if(plateau)this.shadow.position.set(s.x,PLANET_RADIUS+0.11,s.z);else this.shadow.position.copy(this.up).multiplyScalar(PLANET_RADIUS+0.11);
    this.shadow.visible=!plateau||(Math.abs(s.x)<=14&&Math.abs(s.z)<=14&&s.y>=PLANET_RADIUS);
    this.shadow.quaternion.copy(this.bodyFrame).multiply(this.flatShadow);
    this.shadow.scale.set(1+altitude*0.06,1.7+altitude*0.06,1);
    (this.shadow.material as T.MeshBasicMaterial).opacity=0.22/(1+altitude*0.35);
    this.aura.root.position.copy(this.position);this.aura.root.quaternion.copy(this.bodyFrame);
    this.aura.update(stage,dt,reduced,this.firstPerson,animate);
    this.canvas.dataset.aura=this.aura.root.visible?String(stage):'0';
    this.velocity.set(s.velocityX,s.velocityY,s.velocityZ);
    this.exhaust.update(this.position,this.up,this.right,this.back,this.velocity,animate?Math.min(1,s.thrust/MAX_THRUST):0,animate?dt:0,reduced);
    this.canvas.dataset.plumes=String(this.exhaust.mesh.count);
    const framedAltitude=altitude+(plateau?20:0);
    const extent=PLANET_RADIUS+FLOOR+framedAltitude+5,cameraDistance=Math.max(75,2*extent);
    this.camera.far=Math.max(400,4*extent);this.cockpitCamera.far=this.camera.far;
    Object.assign(this.camera,planetCameraBounds(innerWidth,innerHeight,framedAltitude));this.camera.updateProjectionMatrix();this.cockpitCamera.updateProjectionMatrix();
    this.orbitAge+=dt;
    if(this.orbitAge>2){this.orbitAngle*=Math.exp(-dt*2);this.orbitHeight*=Math.exp(-dt*2);}
    const blend=1-Math.exp(-dt*(reduced?16:6));
    if(this.needsSnap){this.cameraFrame.copy(this.bodyFrame);this.needsSnap=false;}
    else this.cameraFrame.slerp(this.bodyFrame,blend);
    this.camera.position.set(Math.sin(0.38+this.orbitAngle)*0.75,0.68+this.orbitHeight,Math.cos(0.38+this.orbitAngle)*0.75).normalize().multiplyScalar(cameraDistance).applyQuaternion(this.cameraFrame);
    this.camera.up.set(0,1,0).applyQuaternion(this.cameraFrame);this.camera.lookAt(this.center);
    this.introShift=T.MathUtils.lerp(this.introShift,preview&&innerWidth/innerHeight>1.5?0.11:0,blend);
    this.camera.setViewOffset(innerWidth,innerHeight,-innerWidth*this.introShift,0,innerWidth,innerHeight);
    if(this.firstPerson){
      // Eye is inside the empty canopy; keep the horizon aligned with local planetary up.
      this.cockpitCamera.position.set(0,1.3,-0.25).applyQuaternion(this.bodyFrame).add(this.position);
      const yaw=T.MathUtils.clamp(this.orbitAngle,-0.85,0.85),pitch=-0.38-this.orbitHeight;
      this.lookTarget.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)).applyQuaternion(this.bodyFrame).add(this.cockpitCamera.position);
      this.cockpitCamera.up.copy(this.up);this.cockpitCamera.lookAt(this.lookTarget);
    }
    const activeCamera=this.firstPerson?this.cockpitCamera:this.camera;
    this.renderer.render(this.scene,activeCamera);
    this.canvas.dataset.camera=this.firstPerson?'cockpit':'planet';
    this.projectedCenter.set(0,0,0).project(this.camera);
    const rx=PLANET_RADIUS*Math.abs(this.camera.projectionMatrix.elements[0]),ry=PLANET_RADIUS*Math.abs(this.camera.projectionMatrix.elements[5]);
    this.canvas.dataset.planetInFrame=String(!this.firstPerson&&Math.abs(this.projectedCenter.x)+rx<1&&Math.abs(this.projectedCenter.y)+ry<1);
    this.projectedBike.copy(this.position).project(this.camera);
    this.canvas.dataset.scooterInFrame=String(!this.firstPerson&&Math.abs(this.projectedBike.x)+2*Math.abs(this.camera.projectionMatrix.elements[0])<1&&Math.abs(this.projectedBike.y)+2*Math.abs(this.camera.projectionMatrix.elements[5])<1&&Math.abs(this.projectedBike.z)<1);
    this.canvas.dataset.drawCalls=String(this.renderer.info.render.calls);
  }
  dispose(){
    const geometries=new Set<T.BufferGeometry>();const materials=new Set<T.Material>();
    this.scene.traverse(object=>{
      if(object instanceof T.Mesh||object instanceof T.Points){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}
      if(object instanceof T.InstancedMesh)object.dispose();
    });
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());this.gradient.dispose();this.renderer.dispose();
  }
}
