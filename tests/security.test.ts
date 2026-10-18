import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

export const sensitivePaths=[
  '.env','.env.local','nested/.env','.npmrc','nested/.npmrc','.pypirc',
  'keys/service.pem','keys/service.PEM','keys/service.key','keys/service.p12','keys/service.pfx',
  '.ssh/id_ed25519','id_rsa','blender/bike.blend','blender/vehicles/bike.blend',
  'blender/vehicles/bike.blend1','blender/vehicles/renders/front.png',
  'references/private/reference.jpg','private/receipt.json',
  'foo#/.env','foo?/.env'
];

test('normal Git publication excludes sensitive configuration and nested source art',()=>{
  const result=spawnSync('git',['check-ignore','--no-index','--stdin'],{input:sensitivePaths.join('\n')+'\n',encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const ignored=new Set(result.stdout.trim().split('\n'));
  assert.deepEqual(sensitivePaths.filter(path=>!ignored.has(path)),[]);
  const allowed=spawnSync('git',['check-ignore','--no-index','--stdin'],{input:'.env.example\npublic/assets/bike.glb\n',encoding:'utf8'});
  assert.equal(allowed.status,1,'Sanitized env example and runtime GLB must not be blanket-ignored');
});

test('serving policy blocks sensitive names, source-art trees and encoded variants without blocking runtime assets',async()=>{
  const {isSensitivePath}=await import('../security/policy.ts');
  for(const path of sensitivePaths){
    for(const variant of ['/'+path,'/public/'+path,'/@fs/project/'+path+'?raw', '/'+encodeURIComponent(path)]){
      assert.equal(isSensitivePath(variant),true,variant);
    }
  }
  for(const path of ['/foo%23/.env','/foo%3f/.env','/foo%2523/.env','/.git/config','/%252eenv','/%ZZ','/blender/anything.glb','/keys/a.pem%3fraw'])assert.equal(isSensitivePath(path),true,path);
  for(const path of ['/','/src/main.ts','/public/assets/bike.glb','/assets/app.js','/assets/site.css','/@vite/client'])assert.equal(isSensitivePath(path),false,path);
});
