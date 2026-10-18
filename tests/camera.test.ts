import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planetCameraBounds} from '../src/planet-world.ts';
test('whole-globe framing also leaves room for an airborne scooter',()=>{
  for(const [w,h] of [[1920,1080],[800,1000]]){
    const b=planetCameraBounds(w,h,40);
    assert.ok(Math.min(b.right-b.left,b.top-b.bottom)>=2*(18+40+4));
  }
});
