import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createMotorcycle} from '../src/motorcycle.ts';

test('the scooter uses cartoon materials rather than metallic or realistic surface shading',()=>{
  const bike=createMotorcycle();
  let realistic=0;
  bike.root.traverse(object=>{if(object instanceof T.Mesh){const materials=Array.isArray(object.material)?object.material:[object.material];realistic+=materials.filter(material=>material instanceof T.MeshStandardMaterial).length;}});
  assert.equal(realistic,0);
});

test('the cartoon world has a spherical surface and a closed road draped around it',async()=>{
  const {createPlanet,planetCameraBounds}=await import('../src/planet-world.ts');
  const world=createPlanet(new T.Texture());
  const surface=world.getObjectByName('planet-surface') as T.Mesh;
  assert.ok(surface.geometry instanceof T.SphereGeometry);
  assert.equal((surface.geometry as T.SphereGeometry).parameters.radius,18);
  assert.ok(surface.material instanceof T.MeshToonMaterial);
  const road=world.getObjectByName('planet-road') as T.Mesh;
  const positions=road.geometry.getAttribute('position');
  for(let i=0;i<positions.count;i++)assert.ok(Math.abs(Math.hypot(positions.getX(i),positions.getY(i),positions.getZ(i))-18.07)<1e-4);
  assert.ok(new T.Vector3().fromBufferAttribute(positions,0).distanceTo(new T.Vector3().fromBufferAttribute(positions,positions.count-2))<1e-5);
  assert.ok(world.getObjectByName('candy-treetops') instanceof T.InstancedMesh);
  for(const [width,height] of [[1920,1080],[844,390],[700,1000]]){
    const bounds=planetCameraBounds(width,height);
    assert.ok(Math.min(bounds.right-bounds.left,bounds.top-bounds.bottom)>=54,'whole planet plus scenery needs a visible margin');
  }
});
