import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMotorcycle} from '../src/motorcycle.ts';
test('the enclosed scooter has two downward-facing gas lift ports',()=>{
  const bike=createMotorcycle();let ports=0;
  bike.root.traverse(node=>{if(node.name==='lift-nozzle')ports++;});
  assert.equal(ports,2);
});
