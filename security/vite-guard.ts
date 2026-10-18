import type {Plugin,ResolvedConfig} from 'vite';
import type {IncomingMessage,ServerResponse} from 'node:http';
import {existsSync,lstatSync,readdirSync} from 'node:fs';
import {join,relative,isAbsolute} from 'node:path';
import {isSensitivePath} from './policy.ts';

function blockSensitiveFiles(req:IncomingMessage,res:ServerResponse,next:()=>void){
  if(!isSensitivePath(req.url||'/'))return next();
  res.statusCode=403;
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end('Forbidden');
}

/** Defense in depth: fs.deny alone does not protect Vite's public directory. */
export function privateFileGuard():Plugin{
  let config:ResolvedConfig;
  return {
    name:'private-file-guard',enforce:'pre',
    configResolved(value){config=value;},
    configureServer(server){server.middlewares.use(blockSensitiveFiles);},
    configurePreviewServer(server){server.middlewares.use(blockSensitiveFiles);},
    resolveId(source){
      if(source.startsWith('\0'))return null; // Vite's internal virtual modules, not filesystem paths.
      const path=isAbsolute(source)?relative(config.root,source):source;
      if(isSensitivePath(path))this.error('Sensitive source import is not permitted');
      return null;
    },
    buildStart(){
      if(config.command!=='build'||!config.publicDir||!existsSync(config.publicDir))return;
      const publicDir=config.publicDir;
      const walk=(dir:string)=>{
        if(lstatSync(dir).isSymbolicLink())this.error('Public asset symlink is not permitted');
        for(const entry of readdirSync(dir,{withFileTypes:true})){
          const path=join(dir,entry.name);
          if(entry.isSymbolicLink())this.error('Public asset symlink is not permitted');
          if(isSensitivePath(relative(publicDir,path)))this.error('Sensitive public asset is not permitted');
          if(entry.isDirectory())walk(path);
        }
      };
      walk(publicDir);
    }
  };
}
