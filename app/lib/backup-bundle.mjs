import crypto from 'node:crypto';import zlib from 'node:zlib';import {safeRelativePath} from './utils.mjs';
export const MAX_BACKUP_EXPANDED_BYTES=512*1024*1024;
export function decryptBackupBundle(buf,passphrase,{maxExpandedBytes=MAX_BACKUP_EXPANDED_BYTES}={}){
 const fail=()=>{throw Object.assign(new Error('Encrypted backup could not be decrypted, exceeds portable limits or is corrupt.'),{status:422})};
 try{
  const split=buf.indexOf(10);if(split<1||split>4096)fail();const head=JSON.parse(buf.subarray(0,split).toString('utf8'));
  if(head?.format!=='TEBACKUP1')fail();const salt=Buffer.from(head.salt||'','base64'),iv=Buffer.from(head.iv||'','base64'),tag=Buffer.from(head.tag||'','base64');if(salt.length!==16||iv.length!==12||tag.length!==16)fail();
  const key=crypto.scryptSync(String(passphrase),salt,32),dec=crypto.createDecipheriv('aes-256-gcm',key,iv);dec.setAuthTag(tag);
  const compressed=Buffer.concat([dec.update(buf.subarray(split+1)),dec.final()]);
  const plain=zlib.gunzipSync(compressed,{maxOutputLength:maxExpandedBytes}),payload=JSON.parse(plain.toString('utf8'));
  if(payload?.format!=='training-engine-encrypted-backup'||!Array.isArray(payload.files)||!payload.files.length||payload.files.length>100000)fail();
  const names=new Set();for(const f of payload.files){if(!f||typeof f.path!=='string'||typeof f.data!=='string')fail();const safe=safeRelativePath(f.path);if(!safe||safe!==f.path||names.has(safe.toLowerCase()))fail();names.add(safe.toLowerCase());if(Buffer.from(f.data,'base64').toString('base64')!==f.data)fail();}
  for(const name of names){let parts=name.split('/');while(parts.length>1){parts.pop();if(names.has(parts.join('/')))fail();}}
  return payload;
 }catch{fail()}
}
