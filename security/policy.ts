/** Conservative path policy for accidental local credential/source-art disclosure. */
export function isSensitivePath(input:string):boolean {
  let path=input;
  try {
    for(let i=0;i<3;i++){
      path=path.split(/[?#]/,1)[0];
      const decoded=decodeURIComponent(path);
      if(decoded===path)break;
      path=decoded;
    }
  }catch{return true;}
  path=path.split(/[?#]/,1)[0].replaceAll('\\','/').toLowerCase();
  if(path.includes('\0')||path.includes('%'))return true;
  const parts=path.split('/');
  if(parts.some(part=>['.git','.ssh','private','blender'].includes(part)))return true;
  const name=parts.at(-1)||'';
  return name.startsWith('.env')||name.startsWith('.npmrc')||name.startsWith('.pypirc')||
    /^id_(rsa|ed25519|ecdsa|dsa)(\.|$)/.test(name)||
    /\.(pem|key|p12|pfx|crt|cer|blend\d*)$/.test(name);
}
