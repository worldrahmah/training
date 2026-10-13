import {readZipEntries as unzipEntries} from './zip.mjs';

const xmlText=s=>String(s||'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));

export {readZipEntries as unzipEntries} from './zip.mjs';
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
