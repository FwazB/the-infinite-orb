import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,symlinkSync,readFileSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {createServer,build} from 'vite';
import {productionHeaders,developmentHeaders} from '../security/headers.ts';

const configFile=resolve('vite.config.ts');
const sentinel='fixture-only-not-a-secret';
function fixture(){
  const base=process.env.SECURITY_TEST_TMPDIR||resolve('test-results');
  mkdirSync(base,{recursive:true});
  const root=mkdtempSync(join(base,'security-fixture-'));
  writeFileSync(join(root,'index.html'),'<!doctype html><title>Security fixture</title><p>Public fixture</p>');
  return root;
}
function file(root:string,name:string,body=sentinel){const path=join(root,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,body);}

test('actual dev server denies synthetic sensitive files even in publicDir and encoded URLs',async()=>{
  const root=fixture();
  const names=['.npmrc','keys/key.pem','keys/key.PEM','.env','nested/.env','private/receipt.txt','references/private/example.jpg','blender/nested/model.blend','blender/nested/renders/view.png','.git/config'];
  for(const name of names){file(root,name);file(root,'public/'+name);}
  file(root,'public/assets/safe.txt','safe public asset');
  const server=await createServer({configFile,root,logLevel:'silent',server:{host:'127.0.0.1',port:0,strictPort:true}});
  try{
    await server.listen();
    const address=server.httpServer!.address();assert.ok(address&&typeof address!=='string');
    const origin=`http://127.0.0.1:${address.port}`;
    for(const name of names){
      for(const path of ['/'+name,'/public/'+name,'/'+name+'?raw','/'+encodeURIComponent(name),'/@fs/'+join(root,name)]){
        const response=await fetch(origin+path);
        assert.equal(response.status,403,path);
        assert.ok(!(await response.text()).includes(sentinel),path);
      }
    }
    const safe=await fetch(origin+'/assets/safe.txt');assert.equal(safe.status,200);assert.equal(await safe.text(),'safe public asset');
    const home=await fetch(origin+'/');assert.equal(home.status,200,await home.text());
    for(const [name,value] of Object.entries(developmentHeaders))assert.equal(home.headers.get(name),value,name);
  }finally{await server.close();rmSync(root,{recursive:true,force:true});}
});

test('production build refuses sensitive public assets instead of silently copying them',async()=>{
  const root=fixture();file(root,'public/nested/.npmrc');
  try{await assert.rejects(()=>build({configFile,root,logLevel:'silent'}),/Sensitive public asset/);}
  finally{rmSync(root,{recursive:true,force:true});}
});

test('production build rejects sensitive files beneath literal URL delimiters',async()=>{
  for(const name of ['foo#/.env','foo?/.env','foo%23/.env','foo%3f/.env']){
    const root=fixture();file(root,'public/'+name);
    try{await assert.rejects(()=>build({configFile,root,logLevel:'silent'}),/Sensitive public asset/);}
    finally{rmSync(root,{recursive:true,force:true});}
  }
});

test('production build refuses public symlinks that could import files outside the release',async()=>{
  const root=fixture();file(root,'outside.txt');mkdirSync(join(root,'public'));
  symlinkSync(join(root,'outside.txt'),join(root,'public','innocent.txt'));
  try{await assert.rejects(()=>build({configFile,root,logLevel:'silent'}),/Public asset symlink/);}
  finally{rmSync(root,{recursive:true,force:true});}
});

test('production build also rejects a raw import from private source material',async()=>{
  const root=fixture();
  file(root,'index.html','<!doctype html><script type="module" src="/entry.js"></script>');
  file(root,'entry.js',"import text from './private/note.txt?raw';document.body.textContent=text;");
  file(root,'private/note.txt');
  try{await assert.rejects(()=>build({configFile,root,logLevel:'silent'}),/Sensitive source import/);}
  finally{rmSync(root,{recursive:true,force:true});}
});

test('a safe public asset still builds and is copied unchanged',async()=>{
  const root=fixture();file(root,'public/assets/safe.txt','safe public asset');
  try{await build({configFile,root,logLevel:'silent'});assert.equal(readFileSync(join(root,'dist/assets/safe.txt'),'utf8'),'safe public asset');}
  finally{rmSync(root,{recursive:true,force:true});}
});

test('hosting configuration matches the locally exercised production header policy',()=>{
  const vercel=JSON.parse(readFileSync('vercel.json','utf8'));
  assert.equal(vercel.outputDirectory,'dist');
  const rule=vercel.headers.find((item:{source:string})=>item.source==='/(.*)');
  assert.deepEqual(Object.fromEntries(rule.headers.map((item:{key:string,value:string})=>[item.key,item.value])),productionHeaders);
  const staticHeaders=readFileSync('public/_headers','utf8');
  assert.equal(staticHeaders,'/*\n'+Object.entries(productionHeaders).map(([key,value])=>`  ${key}: ${value}`).join('\n')+'\n');
});
