/** Conservative path policy for accidental local credential/source-art disclosure. */
export function isSensitivePath(input:string):boolean {
  let path=input;
  try {
    for(let i=0;i<3;i++){
      const decoded=decodeURIComponent(path);
      if(decoded===path)break;
      path=decoded;
    }
  }catch{return true;}
  path=path.replaceAll('\\','/').toLowerCase();
  if(path.includes('\0')||path.includes('%'))return true;
  // Treat URL delimiters conservatively as boundaries, never discard a suffix.
  // This function also receives filesystem paths containing literal ? or #.
  const parts=path.split(/[/?#]/);
  if(parts.some(part=>['.git','.ssh','private','blender'].includes(part)))return true;
  return parts.some(name=>name.startsWith('.env')||name.startsWith('.npmrc')||name.startsWith('.pypirc')||
    /^id_(rsa|ed25519|ecdsa|dsa)(\.|$)/.test(name)||
    /\.(pem|key|p12|pfx|crt|cer|blend\d*)$/.test(name));
}
