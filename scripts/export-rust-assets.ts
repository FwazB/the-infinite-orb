/// <reference types="node" />
// Offline conversion of this project's original geometry; no Three.js ships in the Rust runtime.
import * as T from 'three';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createPlanet} from '../src/planet-world.ts';
import {createMotorcycle} from '../src/motorcycle.ts';
import {WORLDS} from '../src/worlds.ts';
const geometries:{vertices:number[],indices:number[]}[]=[],lookup=new Map<string,number>();
const instances:{name:string,flags:number,geometry:number,matrix:number[],color:number[],unlit:number}[]=[];
function geometryId(geometry:T.BufferGeometry){
 const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal'),vertices:number[]=[],indices:number[]=[];
 for(let i=0;i<p.count;i++)vertices.push(p.getX(i),p.getY(i),p.getZ(i),n?.getX(i)??0,n?.getY(i)??1,n?.getZ(i)??0);
 if(geometry.index)indices.push(...geometry.index.array);else for(let i=0;i<p.count;i++)indices.push(i);
 const hash=createHash('sha256').update(Buffer.from(new Float32Array(vertices).buffer)).update(Buffer.from(new Uint32Array(indices).buffer)).digest('hex');
 let id=lookup.get(hash);if(id===undefined){id=geometries.length;geometries.push({vertices,indices});lookup.set(hash,id);}return id;
}
function collect(name:string,root:T.Object3D,predicate:(o:T.Object3D)=>boolean=()=>true,offset=new T.Matrix4()){
 root.updateMatrixWorld(true);
 root.traverse(o=>{
  if(!(o instanceof T.Mesh||o instanceof T.Points)||!predicate(o))return;
  if(Array.isArray(o.material))throw Error('Unexpected multi-material asset');
  const m=o.material as T.MeshToonMaterial;
  const flags=(m.side===T.BackSide?2:m.side===T.DoubleSide?1:0)|(m.transparent?4:0)|(o instanceof T.Points?8:0),geometry=geometryId(o.geometry);
  const count=o instanceof T.InstancedMesh?o.count:1;
  for(let instance=0;instance<count;instance++){
   const transform=offset.clone().multiply(o.matrixWorld),instanceColor=new T.Color(0xffffff);
   if(o instanceof T.InstancedMesh){const matrix=new T.Matrix4();o.getMatrixAt(instance,matrix);transform.multiply(matrix);if(o.instanceColor)o.getColorAt(instance,instanceColor);}
   const color=m.color.clone().multiply(instanceColor);
   instances.push({name,flags,geometry,matrix:transform.toArray(),color:[color.r,color.g,color.b,m.opacity],unlit:m instanceof T.MeshBasicMaterial||o instanceof T.Points?1:0});
  }
 });
}
for(const world of WORLDS)collect('world:'+world.id,createPlanet(null as unknown as T.Texture,world));
const bike=createMotorcycle();const below=(o:T.Object3D,parent:T.Object3D):boolean=>o===parent||!!o.parent&&below(o.parent,parent);
collect('bike:body',bike.root,o=>!bike.wheels.some(w=>below(o,w))&&!below(o,bike.canopyArch)&&(!(o instanceof T.Mesh)||o.material!==bike.glass));
collect('bike:arch',bike.root,o=>below(o,bike.canopyArch));collect('bike:glass',bike.root,o=>o instanceof T.Mesh&&o.material===bike.glass);
bike.wheels.forEach((wheel,i)=>collect('bike:wheel'+i,bike.root,o=>below(o,wheel),new T.Matrix4().makeTranslation(0,.18,-wheel.position.z)));
for(const [name,geometry] of [['fx:sphere',new T.SphereGeometry(1,16,12)],['fx:cloud',new T.SphereGeometry(1,8,6)],['fx:torus',new T.TorusGeometry(1,.04,4,40)],['fx:shadow',new T.CircleGeometry(1,40)]] as const)collect(name,new T.Mesh(geometry,new T.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,side:T.DoubleSide})));
const chunks:Buffer[]=[Buffer.from('ORB2')];const u32=(v:number)=>{const b=Buffer.alloc(4);b.writeUInt32LE(v);chunks.push(b);};
const floats=(values:number[])=>{const b=Buffer.alloc(values.length*4);values.forEach((v,i)=>b.writeFloatLE(v,i*4));chunks.push(b);};
u32(geometries.length);for(const g of geometries){u32(g.vertices.length);floats(g.vertices);u32(g.indices.length);for(const i of g.indices)u32(i);}
u32(instances.length);for(const i of instances){const name=Buffer.from(i.name);u32(name.length);chunks.push(name);u32(i.flags);u32(i.geometry);floats([...i.matrix,...i.color,i.unlit]);}
mkdirSync('rust/generated',{recursive:true});const data=Buffer.concat(chunks);writeFileSync('rust/generated/scene.bin',data);writeFileSync('rust/generated/worlds.json',JSON.stringify(WORLDS));
console.log(JSON.stringify({geometries:geometries.length,instances:instances.length,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')}));
