import {defineConfig} from 'vite';
import {privateFileGuard} from './security/vite-guard.ts';
import {productionHeaders,developmentHeaders} from './security/headers.ts';
export default defineConfig({
  plugins:[privateFileGuard()],
  server:{host:'127.0.0.1',headers:developmentHeaders,fs:{strict:true,deny:[
    '**/.env*','**/.npmrc*','**/.pypirc*','**/.git/**','**/.ssh/**',
    '**/references/private/**','**/private/**','**/blender/**',
    '**/*.{pem,PEM,key,KEY,p12,pfx,crt,cer}','**/id_{rsa,ed25519,ecdsa,dsa}*','**/*.blend*'
  ]}},
  preview:{host:'127.0.0.1',headers:productionHeaders},
  build:{target:'es2022',rollupOptions:{output:{manualChunks:(id:string)=>id.includes('/node_modules/three/')?'three':undefined}}}
});
