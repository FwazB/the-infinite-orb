import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {StageAura} from '../src/stage-aura';
import {GasExhaust} from '../src/exhaust';
test('aura follows stage, hides in cockpit and stock, and reduced motion is static',()=>{
 const aura=new StageAura();
 aura.update(3,1/60,false,false,true);assert.equal(aura.root.visible,true);
 aura.update(3,1/60,true,false,true);const a=aura.root.children.map(x=>x.rotation.z);
 for(let i=0;i<120;i++)aura.update(3,1/60,true,false,true);
 assert.deepEqual(aura.root.children.map(x=>x.rotation.z),a);
 aura.update(3,1/60,false,true,true);assert.equal(aura.root.visible,false);
 aura.update(0,1/60,false,false,true);assert.equal(aura.root.visible,false);
});
test('cloud lobes stay bounded, expire and disappear with reduced motion or reset',()=>{
 const p=new GasExhaust(),zero=new T.Vector3(),up=new T.Vector3(0,1,0),right=new T.Vector3(1,0,0),back=new T.Vector3(0,0,1);
 for(let i=0;i<600;i++)p.update(zero,up,right,back,zero,1,1/60,false);
 assert.ok(p.mesh.count>0&&p.mesh.count<=96);assert.equal(p.mesh.count%3,0);
 for(let i=0;i<60;i++)p.update(zero,up,right,back,zero,0,1/60,false);
 assert.equal(p.mesh.count,0);
 p.update(zero,up,right,back,zero,1,0.1,false);assert.ok(p.mesh.count>0);
 p.update(zero,up,right,back,zero,1,0.1,true);assert.equal(p.mesh.count,0);
 p.clear();assert.equal(p.mesh.count,0);
});
