import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createPlanet} from '../src/planet-world';
import {WORLDS} from '../src/worlds';
test('each destination has distinct geography and a characteristic landmark, not just a palette swap',()=>{
 const gradient=new T.Texture();
 const landmarks=['kai-home','earth-highlands','namek-village','beerus-tree-temple'];
 WORLDS.forEach((world,i)=>{
  const scene=createPlanet(gradient,world);
  assert.ok(scene.getObjectByName(landmarks[i]),world.id);
  assert.equal(scene.userData.worldId,world.id);
  if(world.id==='beerus'){assert.ok(scene.getObjectByName('inverted-pyramid'));assert.equal(scene.getObjectByName('planet-surface'),undefined);}
  const bounds=new T.Box3().setFromObject(scene);assert.ok(Number.isFinite(bounds.max.y));
 });
});
