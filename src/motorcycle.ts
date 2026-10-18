import * as T from 'three';

/** Disposable primitive silhouette, not the final Blender vehicle. Nose points -Z. */
export function createMotorcycle(gradient:T.Texture|null=null){
  const root=new T.Group();
  const cream=new T.MeshToonMaterial({color:'#fff1cc',gradientMap:gradient});
  const trim=new T.MeshToonMaterial({color:'#66587c',gradientMap:gradient});
  const tire=new T.MeshToonMaterial({color:'#38304d',gradientMap:gradient});
  const orange=new T.MeshToonMaterial({color:'#ed8061',gradientMap:gradient});
  const rim=new T.MeshToonMaterial({color:'#fff1d4',gradientMap:gradient});
  const dark=new T.MeshToonMaterial({color:'#404c65',gradientMap:gradient});
  const glass=new T.MeshToonMaterial({color:'#7fd4e1',gradientMap:gradient,transparent:true,opacity:0.68,depthWrite:false,side:T.DoubleSide});
  const outline=new T.MeshBasicMaterial({color:'#3e3849',side:T.BackSide});
  function part(geometry:T.BufferGeometry,material:T.Material,position:number[],scale:number[]=[1,1,1],edged=false){
    const m=new T.Mesh(geometry,material);m.position.set(position[0],position[1],position[2]);m.scale.set(scale[0],scale[1],scale[2]);root.add(m);
    if(edged){const edge=new T.Mesh(geometry,outline);edge.scale.setScalar(1.035);m.add(edge);}
    return m;
  }
  const ball=new T.SphereGeometry(1,24,16);
  part(ball,cream,[0,0.1,0.05],[0.72,0.56,1.27],true);
  part(ball,trim,[0,-0.17,0],[0.57,0.23,1.4]);
  part(ball,cream,[0,0.13,-1.08],[0.57,0.46,0.61],true);
  part(ball,orange,[0,0.13,0.06],[0.737,0.075,1.23]);
  part(new T.BoxGeometry(0.63,0.17,0.67),dark,[0,0.57,0.22]);
  const seat=part(new T.BoxGeometry(0.63,0.64,0.16),dark,[0,0.8,0.54]);seat.rotation.x=-0.13;
  part(new T.BoxGeometry(0.57,0.17,0.29),trim,[0,0.78,-0.62]);
  const screen=part(new T.BoxGeometry(0.28,0.04,0.12),new T.MeshBasicMaterial({color:'#e4da9b'}),[0,0.88,-0.61]);screen.rotation.x=0.1;
  part(new T.SphereGeometry(1,32,24,0,Math.PI*2,0,Math.PI*0.53),glass,[0,0.54,0],[0.67,1.38,1.05]);
  const arch=part(new T.TorusGeometry(1,0.035,8,48,Math.PI),cream,[0,0.54,0],[1.03,1.38,0.67]);arch.rotation.y=Math.PI/2;
  const seal=part(new T.TorusGeometry(1,0.035,8,48),trim,[0,0.54,0],[0.67,1.05,1]);seal.rotation.x=Math.PI/2;
  const wheels:T.Group[]=[];
  for(const [z,radius,width] of [[1.05,0.68,0.52],[-1.03,0.59,0.35]]){
    const wheel=new T.Group();wheel.position.set(0,-0.18,z);root.add(wheel);wheels.push(wheel);
    const rubber=new T.Mesh(new T.CylinderGeometry(radius,radius,width,32),tire);rubber.rotation.z=Math.PI/2;wheel.add(rubber);
    for(const side of [-1,1]){
      const hub=new T.Mesh(new T.CylinderGeometry(radius*0.52,radius*0.52,0.025,24),rim);hub.rotation.z=Math.PI/2;hub.position.x=side*(width/2+0.01);wheel.add(hub);
      const cap=new T.Mesh(new T.CylinderGeometry(radius*0.19,radius*0.19,0.03,16),trim);cap.rotation.z=Math.PI/2;cap.position.x=side*(width/2+0.03);wheel.add(cap);
    }
  }
  const fender=part(new T.TorusGeometry(0.77,0.11,8,28,Math.PI),cream,[0,-0.18,1.05]);fender.rotation.y=Math.PI/2;
  const light=part(new T.CylinderGeometry(0.2,0.2,0.12,24),dark,[0,0.17,-1.64]);light.rotation.x=Math.PI/2;
  const lens=part(new T.CircleGeometry(0.156,24),new T.MeshBasicMaterial({color:'#fff3b9'}),[0,0.17,-1.707]);lens.rotation.y=Math.PI;
  const tailMat=new T.MeshBasicMaterial({color:'#d85b49'});
  for(const side of [-1,1]){
    part(ball,tailMat,[side*0.41,0.35,1.08],[0.12,0.075,0.07]);
    const pipe=part(new T.CylinderGeometry(0.115,0.14,0.65,12),trim,[side*0.57,-0.06,1.0]);pipe.rotation.x=Math.PI/2;
    const exhaust=part(new T.CircleGeometry(0.09,12),dark,[side*0.57,-0.06,1.33]);
    const fork=part(new T.CylinderGeometry(0.052,0.052,0.7,8),rim,[side*0.25,0.06,-0.97]);fork.rotation.x=-0.28;
    part(new T.BoxGeometry(0.15,0.07,0.48),trim,[side*0.66,-0.17,0.25]);
    exhaust.name='exhaust';
    part(new T.CylinderGeometry(0.12,0.2,0.2,12),rim,[side*0.62,-0.3,0.35]);
    const liftPort=part(new T.CircleGeometry(0.145,12),dark,[side*0.62,-0.405,0.35]);
    liftPort.rotation.x=Math.PI/2;liftPort.name='lift-nozzle';
  }
  return {root,wheels,glass,canopyArch:arch};
}
