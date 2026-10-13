import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function nowIso(){ return new Date().toISOString(); }
export function sha256(data){ return crypto.createHash('sha256').update(data).digest('hex'); }
export function randomToken(bytes=32){ return crypto.randomBytes(bytes).toString('hex'); }
export function slugify(input=''){
  const s=String(input).trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g,'-').replace(/^-+|-+$/g,'');
  return s || `course-${Date.now()}`;
}
export function hashPassword(password, salt=crypto.randomBytes(16).toString('hex')){
  const hash=crypto.scryptSync(String(password),salt,64).toString('hex');
  return `${salt}:${hash}`;
}
export function verifyPassword(password, stored){
  try{
    const [salt,hex]=String(stored||'').split(':');
    if(!salt||!hex) return false;
    const got=crypto.scryptSync(String(password),salt,64);
    const want=Buffer.from(hex,'hex');
    return got.length===want.length && crypto.timingSafeEqual(got,want);
  }catch{return false;}
}
export function safeJsonParse(value,fallback=null){
  try{return JSON.parse(value);}catch{return fallback;}
}
export function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); return p; }
export function safeRelativePath(p){
  const s=String(p||'').replace(/\\/g,'/');
  if(!s || s.startsWith('/') || /^[A-Za-z]:/.test(s) || s.split('/').some(x=>x==='..')) return null;
  return s.replace(/^\.\//,'');
}
export function mimeFromName(name=''){
  const ext=path.extname(name).toLowerCase();
  return ({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.wav':'audio/wav','.m4a':'audio/mp4','.ogg':'audio/ogg','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation','.zip':'application/zip'})[ext]||'application/octet-stream';
}
export function csvEscape(v){
  const s=v==null?'':String(v);
  return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;
}
export function rowsToCsv(headers,rows){
  const lines=[headers.map(csvEscape).join(',')];
  for(const row of rows) lines.push(headers.map(h=>csvEscape(row[h])).join(','));
  return '\uFEFF'+lines.join('\r\n');
}
export function privateLanAddresses(){
  const out=[];
  for(const [name,items] of Object.entries(os.networkInterfaces())){
    for(const item of items||[]){
      if(item.family!=='IPv4'||item.internal) continue;
      const a=item.address;
      const privateIp=/^10\./.test(a)||/^192\.168\./.test(a)||/^172\.(1[6-9]|2\d|3[01])\./.test(a);
      if(!privateIp) continue;
      const n=name.toLowerCase();
      let score=0;
      if(/wi-?fi|wireless|wlan/.test(n)) score+=100;
      if(/ethernet|lan/.test(n)) score+=80;
      if(/^192\.168\./.test(a)) score+=30;
      if(/^10\./.test(a)) score+=20;
      if(/wsl|vethernet|hyper-v|docker|vmware|virtualbox|loopback|tunnel/.test(n)) score-=120;
      out.push({name,address:a,score});
    }
  }
  out.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  return out;
}
export function preferredLanAddress(){ return privateLanAddresses()[0]?.address || '127.0.0.1'; }
export function deepClone(v){ return JSON.parse(JSON.stringify(v)); }
export function clamp(n,min,max){ n=Number(n); return Number.isFinite(n)?Math.min(max,Math.max(min,n)):min; }
export function copyDir(src,dst){
  ensureDir(dst);
  if(!fs.existsSync(src)) return;
  for(const ent of fs.readdirSync(src,{withFileTypes:true})){
    const s=path.join(src,ent.name), d=path.join(dst,ent.name);
    if(ent.isDirectory()) copyDir(s,d); else if(ent.isFile()) fs.copyFileSync(s,d);
  }
}
export function removeDirContents(dir){
  if(!fs.existsSync(dir)) return;
  for(const name of fs.readdirSync(dir)) fs.rmSync(path.join(dir,name),{recursive:true,force:true});
}
