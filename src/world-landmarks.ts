import * as T from 'three';
import {PLANET_RADIUS as R} from './physics';
import type {WorldDefinition} from './worlds';
const UP=new T.Vector3(0,1,0);
/** Original low-poly interpretations, not imported franchise models. Scenery is decorative. */
export function addLandmarks(root:T.Group,gradient:T.Texture,world:WorldDefinition){
 const toon=(color:string)=>new T.MeshToonMaterial({color,gradientMap:gradient});
 const part=(group:T.Group,geometry:T.BufferGeometry,color:string,x:number,y:number,z:number)=>{
  const mesh=new T.Mesh(geometry,toon(color));mesh.position.set(x,y,z);group.add(mesh);return mesh;
 };
 const anchor=(name:string,n:T.Vector3)=>{const group=new T.Group();group.name=name;n.normalize();group.position.copy(n).multiplyScalar(R);group.quaternion.setFromUnitVectors(UP,n);root.add(group);return group;};
 if(world.id==='king-kai'){
  const home=anchor('kai-home',new T.Vector3(.35,.92,-.16));
  part(home,new T.CylinderGeometry(1.7,1.7,2.1,24),'#f3ebda',0,1.05,0);
  part(home,new T.SphereGeometry(1.85,24,12,0,Math.PI*2,0,Math.PI/2),'#e0ac70',0,2.1,0);
  part(home,new T.BoxGeometry(.75,1.5,.15),'#685167',0,.75,1.72);
  part(home,new T.TorusGeometry(.5,.1,8,20),'#d99a43',0,2.3,1.7);
  const car=anchor('kai-car',new T.Vector3(-.28,.95,.12));
  part(car,new T.BoxGeometry(1.1,.5,2.3),'#a9364a',0,.55,0);
  part(car,new T.BoxGeometry(.95,.55,1),'#eeeecc',0,1.05,0);
  for(const x of [-.6,.6])for(const z of [-.75,.75]){const wheel=part(car,new T.CylinderGeometry(.3,.3,.18,12),'#343246',x,.3,z);wheel.rotation.z=Math.PI/2;}
 }
 if(world.id==='earth'){
  const mountains=anchor('earth-highlands',new T.Vector3(.7,.2,-.6));
  for(let i=0;i<8;i++){
   const h=2.8+(i%3)*1.3,x=(i%4-1.5)*2.1,z=Math.floor(i/4)*2.3;
   part(mountains,new T.ConeGeometry(2,h,5),'#7e8b8c',x,h/2-.4,z);
   part(mountains,new T.ConeGeometry(.66,h*.28,5),'#eef4e8',x,h*.85-.4,z);
  }
  const island=anchor('island-home',new T.Vector3(-.58,.68,.35));
  part(island,new T.CylinderGeometry(2.6,2.8,.2,24),'#f0da9c',0,.1,0);
  part(island,new T.BoxGeometry(2.2,1.6,1.8),'#e993a4',0,1,0);
  const roof=part(island,new T.ConeGeometry(1.8,1.1,4),'#b64b56',0,2.25,0);roof.rotation.y=Math.PI/4;
  part(island,new T.BoxGeometry(.5,1,.12),'#758eae',0,.7,1);
  part(island,new T.CylinderGeometry(.13,.24,3,7),'#ab865c',2,1.6,0);
  for(let i=0;i<5;i++){const leaf=part(island,new T.SphereGeometry(1,12,6),'#3a966d',2,3.2,0);leaf.scale.set(1.5,.12,.35);leaf.rotation.y=i*Math.PI/2.5;}
 }
 if(world.id==='namek'){
  const village=anchor('namek-village',new T.Vector3(.42,.87,-.22));
  for(const [x,z,s] of [[0,0,1.4],[3,1,1],[-2.5,2,.85]]){
   part(village,new T.SphereGeometry(s,24,12,0,Math.PI*2,0,Math.PI/2),'#e7efc5',x,.1,z);
   const door=part(village,new T.SphereGeometry(.4,12,8),'#536c79',x,.4,z+s*.94);door.scale.set(.8,1.1,.2);
   for(const side of [-1,1]){const horn=part(village,new T.ConeGeometry(.12,.8,6),'#f2efd2',x+side*s*.65,s*.7,z);horn.rotation.z=-side*.4;}
  }
  const mesas=anchor('namek-mesas',new T.Vector3(-.65,.42,-.5));
  for(let i=0;i<5;i++)part(mesas,new T.CylinderGeometry(1.3,1.8,1.4+i*.4,6),'#69a8a1',(i%3-1)*2.5,.6+i*.2,Math.floor(i/3)*2);
  for(let i=0;i<3;i++){const sun=new T.Mesh(new T.SphereGeometry(2.2-i*.35,16,12),new T.MeshBasicMaterial({color:'#f4f1b0'}));sun.name='namek-sun';sun.position.set(-48+i*13,-38,-63-i*5);root.add(sun);}
 }
}
export function createBeerus(gradient:T.Texture,world:WorldDefinition){
 const root=new T.Group();root.name='beerus-realm';root.userData.worldId=world.id;
 const toon=(color:string)=>new T.MeshToonMaterial({color,gradientMap:gradient});
 const part=(geometry:T.BufferGeometry,color:string,x:number,y:number,z:number)=>{const mesh=new T.Mesh(geometry,toon(color));mesh.position.set(x,y,z);root.add(mesh);return mesh;};
 const pyramid=part(new T.CylinderGeometry(19.8,0,30,4),'#8d7289',0,3,0);pyramid.rotation.y=Math.PI/4;pyramid.name='inverted-pyramid';
 part(new T.BoxGeometry(28,.25,28),world.ground,0,17.9,0).name='training-plateau';
 // Gold strata emphasize the inverted silhouette without adding imported textures.
 for(let i=0;i<4;i++){const ring=part(new T.CylinderGeometry(18.8-i*3.2,18.55-i*3.2,.25,4),'#c8aa7f',0,16-i*5,0);ring.rotation.y=Math.PI/4;}
 const lake=part(new T.RingGeometry(3.5,7.1,64),world.water,5,18.06,-4);lake.rotation.x=-Math.PI/2;lake.name='oracle-lake';
 const route=part(new T.RingGeometry(10.4,11.7,80),world.road,0,18.08,0);route.rotation.x=-Math.PI/2;route.name='planet-road';
 const tree=new T.Group();tree.name='beerus-tree-temple';tree.position.set(5,18,-4);root.add(tree);
 const timber=new T.MeshToonMaterial({color:'#735c70',gradientMap:gradient});
 const branch=(a:T.Vector3,b:T.Vector3,r1:number,r2:number)=>{const delta=b.clone().sub(a);const mesh=new T.Mesh(new T.CylinderGeometry(r2,r1,delta.length(),9),timber);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(UP,delta.normalize());tree.add(mesh);};
 branch(new T.Vector3(),new T.Vector3(0,15,0),2.8,.9);
 for(let i=0;i<6;i++){
  const angle=i*2.4,y=7+i*1.25,end=new T.Vector3(Math.cos(angle)*(4+i*.3),y+3,Math.sin(angle)*4);
  branch(new T.Vector3(0,y,0),end,.9,.25);
  branch(end,end.clone().add(new T.Vector3(Math.cos(angle)*1.5,2,Math.sin(angle)*1.5)),.25,.03);
  if(i%2===0){
   const house=new T.Mesh(new T.BoxGeometry(2.5,1.5,2),toon('#e2c99b'));house.position.copy(end);house.position.y+=.6;tree.add(house);
   const roof=new T.Mesh(new T.ConeGeometry(2,1.1,4),toon('#b39476'));roof.position.copy(end);roof.position.y+=1.9;roof.rotation.y=Math.PI/4;tree.add(roof);
  }
 }
 const temple=part(new T.BoxGeometry(4,3,3),'#e5cfaa',5,22,-.5);temple.name='beerus-temple';
 for(let i=0;i<4;i++)part(new T.BoxGeometry(4.8-i*.8,.45,3.8-i*.6),'#bc9b75',5,23.7+i*.45,-.5);
 for(const [x,y,z] of [[-26,12,-15],[28,5,-24],[-19,-5,14]])part(new T.SphereGeometry(1.6,20,12),'#c9a7b8',x,y,z).name='realm-moon';
 return root;
}
/** Dispose only this generated destination; the shared gradient belongs to FlightView. */
export function disposeWorld(root:T.Object3D){
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
 root.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}if(o instanceof T.InstancedMesh)o.dispose();});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());root.removeFromParent();
}
