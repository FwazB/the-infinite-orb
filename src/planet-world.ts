import * as T from 'three';
import {PLANET_RADIUS as R} from './flight';
const UP=new T.Vector3(0,1,0);

export function planetCameraBounds(width:number,height:number,altitude=0){
  const aspect=Math.max(0.1,width/Math.max(1,height));
  const halfSpan=Math.max(27,R+Math.max(0,altitude)+4);
  const halfHeight=Math.max(halfSpan,halfSpan/aspect);
  return {left:-halfHeight*aspect,right:halfHeight*aspect,top:halfHeight,bottom:-halfHeight};
}

function ribbon(radius:number,halfWidth:number,start=0,end=Math.PI*2,segments=160){
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=segments;i++){
    const angle=start+(end-start)*i/segments;
    for(const side of [-1,1]){
      const lat=side*halfWidth/radius;
      vertices.push(Math.sin(lat)*radius,Math.cos(angle)*Math.cos(lat)*radius,-Math.sin(angle)*Math.cos(lat)*radius);
    }
    if(i<segments){const a=i*2;indices.push(a,a+1,a+3,a,a+3,a+2);}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

/** Independently authored toy-world primitives; all scenery is decorative. */
export function createPlanet(gradient:T.Texture){
  const root=new T.Group();root.name='tiny-planet';
  const toon=(color:T.ColorRepresentation)=>new T.MeshToonMaterial({color,gradientMap:gradient});
  const surface=new T.Mesh(new T.SphereGeometry(R,80,48),toon('#8fd366'));surface.name='planet-surface';root.add(surface);
  const outline=new T.Mesh(new T.SphereGeometry(R+0.13,80,48),new T.MeshBasicMaterial({color:'#51416c',side:T.BackSide}));root.add(outline);
  const verge=new T.Mesh(ribbon(R+0.035,1.8),toon('#fff1ba'));root.add(verge);
  const road=new T.Mesh(ribbon(R+0.07,1.5),toon('#efc581'));road.name='planet-road';root.add(road);
  const marks=new T.Group();const markMat=new T.MeshBasicMaterial({color:'#fff6d3'});
  for(let i=0;i<36;i++)marks.add(new T.Mesh(ribbon(R+0.085,0.045,i*Math.PI/18,i*Math.PI/18+0.055,3),markMat));
  // Merge-like single draw batch of repeated road marks through one BufferGeometry.
  const markedVertices:number[]=[];
  marks.children.forEach(object=>{
    const mesh=object as T.Mesh;const geometry=mesh.geometry.toNonIndexed();
    markedVertices.push(...Array.from(geometry.getAttribute('position').array));geometry.dispose();mesh.geometry.dispose();
  });
  const markGeometry=new T.BufferGeometry();markGeometry.setAttribute('position',new T.Float32BufferAttribute(markedVertices,3));root.add(new T.Mesh(markGeometry,markMat));
  const lakeNormals=[new T.Vector3(0.70,0.42,0.58).normalize(),new T.Vector3(-0.72,-0.4,-0.55).normalize(),new T.Vector3(0.68,-0.7,0.1).normalize()];
  for(const normal of lakeNormals){
    for(const [offset,angle,color] of [[0.03,0.255,'#f5dda1'],[0.055,0.22,'#54bbd7']] as const){
      const lake=new T.Mesh(new T.SphereGeometry(R+offset,40,12,0,Math.PI*2,0,angle),toon(color));lake.quaternion.setFromUnitVectors(UP,normal);root.add(lake);
    }
  }
  const positions:T.Vector3[]=[];
  for(let i=0;i<70;i++){
    const y=1-2*(i+0.5)/70,angle=i*2.39996323;
    const normal=new T.Vector3(Math.sqrt(1-y*y)*Math.cos(angle),y,Math.sqrt(1-y*y)*Math.sin(angle));
    if(Math.abs(normal.x)<0.24||lakeNormals.some(lake=>lake.dot(normal)>0.9))continue;
    positions.push(normal);if(positions.length===24)break;
  }
  const trunks=new T.InstancedMesh(new T.CylinderGeometry(0.17,0.27,1.7,7),toon('#9e7281'),positions.length);
  const crowns=new T.InstancedMesh(new T.DodecahedronGeometry(1,1),toon('#ffffff'),positions.length);crowns.name='candy-treetops';
  const tips=new T.InstancedMesh(new T.DodecahedronGeometry(1,1),toon('#ffffff'),positions.length);
  const dummy=new T.Object3D(),color=new T.Color();
  const leafColors=['#3caa90','#67c79c','#ed9ab5','#8abbe0'];
  positions.forEach((normal,i)=>{
    const scale=0.8+(i%4)*0.12;
    dummy.quaternion.setFromUnitVectors(UP,normal);dummy.rotateY(i*1.7);
    dummy.position.copy(normal).multiplyScalar(R+0.85*scale);dummy.scale.setScalar(scale);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
    dummy.position.copy(normal).multiplyScalar(R+2.05*scale);dummy.scale.set(1.25*scale,0.95*scale,1.12*scale);dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);
    dummy.position.copy(normal).multiplyScalar(R+2.9*scale);dummy.scale.set(0.84*scale,0.85*scale,0.78*scale);dummy.updateMatrix();tips.setMatrixAt(i,dummy.matrix);
    color.set(leafColors[i%leafColors.length]);crowns.setColorAt(i,color);tips.setColorAt(i,color);
  });root.add(trunks,crowns,tips);
  const tufts:T.Vector3[]=[];
  for(let i=0;i<240;i++){
    const y=1-2*(i+0.5)/240,a=i*2.39996323;
    const n=new T.Vector3(Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a));
    if(Math.abs(n.x)<0.13||lakeNormals.some(lake=>lake.dot(n)>0.96))continue;
    tufts.push(n);
  }
  const flowers=new T.InstancedMesh(new T.DodecahedronGeometry(0.17,0),toon('#ffffff'),tufts.length);
  tufts.forEach((n,i)=>{dummy.position.copy(n).multiplyScalar(R+0.12);dummy.quaternion.setFromUnitVectors(UP,n);dummy.scale.set(1,0.65,1);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);flowers.setColorAt(i,color.set(['#ffdb7c','#f9f4d0','#f3a5be','#65ad64'][i%4]));});root.add(flowers);
  const cloudNormals=[[0.8,0.25,0.5],[-0.7,0.5,0.4],[0.3,-0.65,0.7],[-0.7,-0.3,-0.6],[0.3,0.55,-0.8]].map(v=>new T.Vector3(...v as [number,number,number]).normalize());
  const clouds=new T.InstancedMesh(new T.SphereGeometry(1,16,10),toon('#fff8f0'),cloudNormals.length*3);clouds.name='puffy-clouds';
  const tangent=new T.Vector3();
  cloudNormals.forEach((n,i)=>{
    tangent.crossVectors(UP,n).normalize();
    for(let j=0;j<3;j++){
      dummy.position.copy(n).multiplyScalar(R+3.1).addScaledVector(tangent,(j-1)*1.3);dummy.quaternion.setFromUnitVectors(UP,n);
      dummy.scale.set(j===1?1.65:1.2,j===1?0.8:0.55,1);dummy.updateMatrix();clouds.setMatrixAt(i*3+j,dummy.matrix);
    }
  });root.add(clouds);
  const stars:number[]=[];
  for(let i=0;i<200;i++){const y=1-2*(i+.5)/200,a=i*2.39996323;stars.push(130*Math.sqrt(1-y*y)*Math.cos(a),130*y,130*Math.sqrt(1-y*y)*Math.sin(a));}
  const starGeometry=new T.BufferGeometry();starGeometry.setAttribute('position',new T.Float32BufferAttribute(stars,3));root.add(new T.Points(starGeometry,new T.PointsMaterial({color:'#fff5d9',size:2.5,sizeAttenuation:false})));
  return root;
}
