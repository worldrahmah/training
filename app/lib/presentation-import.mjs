import zlib from 'node:zlib';

const u16=(b,o)=>b.readUInt16LE(o),u32=(b,o)=>b.readUInt32LE(o);
const xmlText=s=>String(s||'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));

export function unzipEntries(buf){
  if(!Buffer.isBuffer(buf))buf=Buffer.from(buf);
  let eocd=-1;for(let i=Math.max(0,buf.length-0x10000-22);i<=buf.length-22;i++)if(u32(buf,i)===0x06054b50)eocd=i;
  if(eocd<0)throw new Error('Invalid ZIP/PPTX file.');
  const count=u16(buf,eocd+10),cdOffset=u32(buf,eocd+16);let p=cdOffset;const out=new Map();
  for(let i=0;i<count;i++){
    if(u32(buf,p)!==0x02014b50)throw new Error('Invalid ZIP central directory.');
    const method=u16(buf,p+10),compSize=u32(buf,p+20),nameLen=u16(buf,p+28),extraLen=u16(buf,p+30),commentLen=u16(buf,p+32),localOffset=u32(buf,p+42),name=buf.subarray(p+46,p+46+nameLen).toString('utf8');
    if(u32(buf,localOffset)!==0x04034b50)throw new Error('Invalid ZIP local entry.');
    const ln=u16(buf,localOffset+26),le=u16(buf,localOffset+28),start=localOffset+30+ln+le,compressed=buf.subarray(start,start+compSize);
    let data;if(method===0)data=Buffer.from(compressed);else if(method===8)data=zlib.inflateRawSync(compressed);else{p+=46+nameLen+extraLen+commentLen;continue;}
    out.set(name,data);p+=46+nameLen+extraLen+commentLen;
  }
  return out;
}
export function parsePptxSlides(buf){
  const entries=unzipEntries(buf),slides=[];
  const names=[...entries.keys()].filter(x=>/^ppt\/slides\/slide\d+\.xml$/i.test(x)).sort((a,b)=>Number(a.match(/slide(\d+)/i)?.[1]||0)-Number(b.match(/slide(\d+)/i)?.[1]||0));
  for(const name of names){const xml=entries.get(name).toString('utf8'),texts=[...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)].map(m=>xmlText(m[1]).trim()).filter(Boolean);slides.push({title:texts[0]||`Slide ${slides.length+1}`,body:texts.slice(1).join('\n')});}
  if(!slides.length)throw new Error('No readable slides were found in the PPTX file.');
  return {slides,warnings:slides.some(s=>!s.body)?['Some slides contain no extractable text. Visual media remains available from the original PPTX asset.']:[]};
}
export function presentationBlockFromUpload({name,mime,assetKey,buffer}){
  const lower=String(name||assetKey||'').toLowerCase();
  if(lower.endsWith('.pdf')||String(mime).includes('pdf'))return {block:{type:'document',title:String(name||'PDF document'),asset:assetKey,document_kind:'pdf'},warnings:[]};
  if(lower.endsWith('.pptx')||String(mime).includes('presentationml')){const parsed=parsePptxSlides(buffer);return {block:{type:'slide_deck',title:String(name||'Presentation'),asset:assetKey,slides:parsed.slides,source_format:'pptx'},warnings:parsed.warnings};}
  throw new Error('Only PDF and PPTX presentation imports are supported.');
}
