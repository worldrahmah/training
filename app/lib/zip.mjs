import zlib from 'node:zlib';
import path from 'node:path';
import {safeRelativePath} from './utils.mjs';

const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0});
export function crc32(bytes){let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0}

// One bounded, verified reader for declarative course ZIPs and local PPTX.
export function readZipEntries(input,{maxEntries=4096,maxEntryBytes=32*1024*1024,maxTotalBytes=100*1024*1024}={}){
  const buf=Buffer.from(input),out=new Map(),seen=new Set(),folded=new Set(),ranges=[];
  const need=(offset,length)=>{if(offset<0||length<0||offset+length>buf.length)throw new Error('ZIP_TRUNCATED')};
  const u16=o=>{need(o,2);return buf.readUInt16LE(o)},u32=o=>{need(o,4);return buf.readUInt32LE(o)};
  let end=-1;
  for(let i=buf.length-22;i>=Math.max(0,buf.length-65557);i--)if(u32(i)===0x06054b50&&i+22+u16(i+20)===buf.length){end=i;break}
  if(end<0)throw new Error('ZIP_END_RECORD_NOT_FOUND');
  const count=u16(end+10),start=u32(end+16),size=u32(end+12);
  if(u16(end+4)||u16(end+6)||u16(end+8)!==count||count===65535||start===0xffffffff||size===0xffffffff)throw new Error('ZIP_MULTIDISK_OR_ZIP64_UNSUPPORTED');
  if(count>maxEntries||start+size!==end)throw new Error('ZIP_CENTRAL_DIRECTORY_INVALID');
  let p=start,total=0;
  for(let i=0;i<count;i++){
    need(p,46);if(u32(p)!==0x02014b50)throw new Error('ZIP_CENTRAL_DIRECTORY_INVALID');
    const flags=u16(p+8),method=u16(p+10),crc=u32(p+16),compressed=u32(p+20),length=u32(p+24),nl=u16(p+28),el=u16(p+30),cl=u16(p+32),local=u32(p+42);
    need(p+46,nl+el+cl);if(p+46+nl+el+cl>end||u16(p+34))throw new Error('ZIP_CENTRAL_DIRECTORY_INVALID');
    if(flags&1)throw new Error('ZIP_ENCRYPTION_UNSUPPORTED');
    if(![0,8].includes(method))throw new Error('ZIP_COMPRESSION_UNSUPPORTED');
    const raw=buf.subarray(p+46,p+46+nl),name=raw.toString('utf8'),safe=safeRelativePath(name),canonical=safe?path.posix.normalize(safe).replace(/\/$/,''):'';
    if(!safe||!canonical||canonical==='.'||/[\x00-\x1f\x7f\ufffd]/.test(name)||canonical.split('/').some(x=>/[:]|[. ]$/.test(x)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(x)))throw new Error(`ZIP_UNSAFE_PATH:${name}`);
    if(((u32(p+38)>>>16)&0xf000)===0xa000)throw new Error('ZIP_SYMLINK_UNSUPPORTED');
    if(seen.has(canonical)||folded.has(canonical.toLowerCase()))throw new Error(`ZIP_DUPLICATE_PATH:${name}`);
    seen.add(canonical);folded.add(canonical.toLowerCase());
    total+=length;if(length>maxEntryBytes||total>maxTotalBytes)throw new Error('ZIP_EXPANDED_SIZE_LIMIT');
    need(local,30);if(local>=start||u32(local)!==0x04034b50||u16(local+8)!==method||u16(local+6)!==flags)throw new Error('ZIP_LOCAL_HEADER_INVALID');
    const ln=u16(local+26),le=u16(local+28),dataStart=local+30+ln+le,dataEnd=dataStart+compressed;
    need(local+30,ln+le);if(!buf.subarray(local+30,local+30+ln).equals(raw)||dataEnd>start)throw new Error('ZIP_LOCAL_HEADER_INVALID');
    if(!(flags&8)&&(u32(local+14)!==crc||u32(local+18)!==compressed||u32(local+22)!==length))throw new Error('ZIP_LOCAL_METADATA_MISMATCH');
    if(ranges.some(([a,b])=>local<b&&dataEnd>a))throw new Error('ZIP_OVERLAPPING_ENTRIES');ranges.push([local,dataEnd]);
    const data=method===0?Buffer.from(buf.subarray(dataStart,dataEnd)):zlib.inflateRawSync(buf.subarray(dataStart,dataEnd),{maxOutputLength:Math.max(1,Math.min(length,maxEntryBytes))});
    if(data.length!==length)throw new Error(`ZIP_SIZE_MISMATCH:${name}`);
    if(crc32(data)!==crc)throw new Error(`ZIP_CRC_MISMATCH:${name}`);
    if(!name.endsWith('/'))out.set(canonical,data);
    p+=46+nl+el+cl;
  }
  if(p!==end)throw new Error('ZIP_CENTRAL_DIRECTORY_INVALID');
  for(const name of out.keys()){const parts=name.split('/');parts.pop();while(parts.length){if(out.has(parts.join('/')))throw new Error('ZIP_FILE_DIRECTORY_CONFLICT');parts.pop()}}
  return out;
}

export function zipFiles(input){
 const local=[],central=[];let offset=0;
 for(const [name,bytes] of [...input].sort(([a],[b])=>a.localeCompare(b))){
  const n=Buffer.from(name),data=Buffer.from(bytes),crc=crc32(data),h=Buffer.alloc(30),c=Buffer.alloc(46);
  h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(n.length,26);
  c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);
  local.push(h,n,data);central.push(c,n);offset+=h.length+n.length+data.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(input.size,8);end.writeUInt16LE(input.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,directory,end]);
}
