import {parentPort,workerData} from 'node:worker_threads';
import runtime from '../vendor/pdf/runtime.cjs';
const {PDFDocument,bidi}=runtime;
const data=workerData,rtl=data.language==='ar';
try{
 const doc=new PDFDocument({size:'A4',margin:0,bufferPages:true,font:data.font_paths.en,fontLayoutCache:false,info:{Title:data.title+' — '+data.resource_name,Author:data.organization.name,Subject:'Training Engine ONE recorded evidence',CreationDate:new Date(data.created_at),ModDate:new Date(data.created_at)}}),chunks=[];
 doc.on('data',chunk=>chunks.push(chunk));doc.on('error',error=>parentPort.postMessage({error:error.message}));doc.on('end',()=>parentPort.postMessage({bytes:Buffer.concat(chunks)}));
 for(const language of ['en','ar'])doc.registerFont(language,data.font_paths[language]);
 let runDirection='ltr';const wrapped=new WeakSet();
 function font(language,size){doc.font(language).fontSize(size);const embedded=doc._font.font;if(!wrapped.has(embedded)){const original=embedded.layout.bind(embedded);embedded.layout=(text,features)=>original(text,features,undefined,undefined,runDirection);wrapped.add(embedded)}return doc;}
 function runs(text){
  const result=bidi.getEmbeddingLevels(text,rtl?'rtl':'ltr'),levels=result.levels,list=[];let last=null;
  for(let index=0;index<text.length;){const ch=String.fromCodePoint(text.codePointAt(index)),level=levels[index]??0,language=/[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/u.test(ch)||level%2?'ar':'en';if(last&&last.level===level&&last.language===language)last.text+=ch;else{last={text:ch,level,language};list.push(last)}index+=ch.length;}
  let max=Math.max(0,...list.map(x=>x.level)),min=Math.min(...list.filter(x=>x.level%2).map(x=>x.level));for(let level=max;level>=min;level--)for(let i=0;i<list.length;){if(list[i].level<level){i++;continue}let j=i+1;while(j<list.length&&list[j].level>=level)j++;list.splice(i,j-i,...list.slice(i,j).reverse());i=j}return list;
 }
 function width(text,size){return runs(text).reduce((total,run)=>{runDirection=run.level%2?'rtl':'ltr';font(run.language,size);return total+doc.widthOfString(run.text,{features:{kern:true}})},0);}
 function drawLine(text,x,y,w,size=10,color='#253650',align=rtl?'right':'left'){
  const pieces=runs(text);let cursor=x+(align==='right'?Math.max(0,w-width(text,size)):align==='center'?Math.max(0,(w-width(text,size))/2):0);
  for(const run of pieces){doc.markContent('Span',{actual:run.text,lang:run.language});runDirection=run.level%2?'rtl':'ltr';font(run.language,size);const advance=doc.widthOfString(run.text,{features:{kern:true}});doc.fillColor(color).text(run.text,cursor,y,{lineBreak:false,features:{kern:true}});cursor+=advance;doc.endMarkedContent();}
 }
 function lines(value,w,size=10){const text=String(value??'—'),out=[];for(const paragraph of text.replaceAll('\r','').split('\n')){let line='';const tokens=paragraph.match(/\S+\s*/gu)||[''];for(const token of tokens){const combined=line+token;if(width(combined.trimEnd(),size)<=w){line=combined;continue}if(line.trim())out.push(line.trimEnd());line='';if(width(token.trimEnd(),size)<=w){line=token;continue}for(const {segment} of new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(token)){if(line&&width(line+segment,size)>w){out.push(line);line=''}line+=segment;}}out.push(line.trimEnd());}return out;}
 function lineHeight(size){return Math.max(...['en','ar'].map(language=>{font(language,size);return doc.currentLineHeight(true)}),size*1.5)+2;}
 function block(text,x,y,w,size=10,color='#253650'){const ls=lines(text,w,size),h=lineHeight(size);ls.forEach((line,i)=>drawLine(line,x,y+i*h,w,size,color));return ls.length*h;}
 const W=doc.page.width,H=doc.page.height,M=42,CW=W-2*M;let pageNumber=0,y=0,top=0;
 const footerText=data.organization.footer||'',footerLines=lines(footerText,CW,8),footerH=footerLines.length*lineHeight(8)+38,bottom=H-M-footerH;
 function header(){pageNumber++;doc.save().rect(0,0,W,9).fill('#5946d2').restore();let textWidth=CW,logoX=rtl?M:W-M-54,textX=rtl?M+68:M;
  if(data.organization.logo){try{doc.image(Buffer.from(data.organization.logo,'base64'),logoX,27,{fit:[54,54],align:'center',valign:'center'});textWidth-=68}catch{throw new Error('Saved company logo cannot be rendered.')}}else textX=M;
  let hy=27;hy+=block(data.organization.name,textX,hy,textWidth,14,'#17243a');if(data.organization.contact)hy+=block(data.organization.contact,textX,hy+2,textWidth,8,'#4a5b73')+3;
  hy=Math.max(hy,85)+12;hy+=block(data.title,M,hy,CW,22,'#17243a');hy+=block(data.resource_name,M,hy+3,CW,12,'#5946d2')+7;
  const date=new Intl.DateTimeFormat(rtl?'ar-LB-u-nu-latn':'en-GB',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Beirut'}).format(new Date(data.created_at)),range=data.range.from||data.range.to?`${data.range.from||'…'} — ${data.range.to||'…'}`:rtl?'كل التواريخ المسجلة':'All recorded dates';
  hy+=block(`${date} · ${range}`,M,hy,CW,8,'#4a5b73')+14;doc.moveTo(M,hy-6).lineTo(W-M,hy-6).strokeColor('#dce2ed').stroke();top=hy;y=top;
 }
 function newPage(){doc.addPage();header()}
 function ensure(height){if(y+height>bottom)newPage()}
 header();
 const metricW=(CW-30)/4,metricH=Math.max(...data.metrics.map(m=>lines(m.label,metricW-18,9).length))*lineHeight(9)+43;
 data.metrics.forEach((metric,i)=>{const x=M+(rtl?3-i:i)*(metricW+10);doc.roundedRect(x,y,metricW,metricH,8).fill('#f1f3fb');block(String(metric.value),x+9,y+8,metricW-18,21,'#17243a');block(metric.label,x+9,y+35,metricW-18,9,'#4a5b73')});y+=metricH+22;
 function heading(title){const h=lines(title,CW,13).length*lineHeight(13)+12;ensure(h+28);y+=block(title,M,y,CW,13,'#17243a')+9;}
 for(const chart of data.charts){heading(chart.title);if(!chart.rows.length){y+=block(rtl?'لا توجد بيانات مسجلة':'No recorded data',M,y,CW,10)+12;continue}const maximum=Math.max(1,...chart.rows.map(x=>x.value));for(const row of chart.rows){const labelW=CW*.47,ls=lines(row.label,labelW-8,9),rh=Math.max(25,ls.length*lineHeight(9)+5);ensure(rh);block(row.label,rtl?M+CW-labelW:M,y,labelW-8,9);const bx=rtl?M:M+labelW+7,bw=CW-labelW-48;doc.roundedRect(bx,y+5,bw,7,3).fill('#e9edf5');if(row.value>0)doc.roundedRect(bx,y+5,Math.max(1,bw*row.value/maximum),7,3).fill('#5946d2');drawLine(String(row.value),rtl?M+bw+6:W-M-37,y,32,9,'#253650','center');y+=rh;}y+=17;}
 for(const section of data.sections){heading(section.title);const count=section.columns.length,colW=CW/count,pad=7,size=count>5?8:9,lh=lineHeight(size);const cols=rtl?[...section.columns].reverse():section.columns;
  const headerLines=cols.map(value=>lines(value,colW-2*pad,size)),hh=Math.max(...headerLines.map(x=>x.length))*lh+14;
  function tableHeader(){ensure(hh+24);doc.rect(M,y,CW,hh).fill('#263552');headerLines.forEach((ls,i)=>ls.forEach((line,j)=>drawLine(line,M+i*colW+pad,y+7+j*lh,colW-2*pad,size,'#ffffff')));y+=hh;}
  tableHeader();if(!section.rows.length){y+=block(rtl?'لا توجد بيانات مسجلة':'No recorded data',M+pad,y+8,CW-2*pad,10)+18;continue}
  for(let ri=0;ri<section.rows.length;ri++){const row=rtl?[...section.rows[ri]].reverse():section.rows[ri],cells=row.map(value=>lines(value,colW-2*pad,size)),max=Math.max(1,...cells.map(x=>x.length));let offset=0;
   while(offset<max){if(bottom-y<lh+14){newPage();tableHeader()}const take=Math.min(max-offset,Math.floor((bottom-y-14)/lh));if(take<1)throw new Error('Report header leaves insufficient room for table content.');const height=take*lh+14;doc.rect(M,y,CW,height).fill(ri%2?'#f2f4f9':'#ffffff');cells.forEach((ls,i)=>ls.slice(offset,offset+take).forEach((line,j)=>drawLine(line,M+i*colW+pad,y+7+j*lh,colW-2*pad,size)));doc.moveTo(M,y+height).lineTo(W-M,y+height).strokeColor('#dce2ed').stroke();y+=height;offset+=take;if(offset<max){newPage();tableHeader()}}
  }y+=20;
 }
 for(const note of data.notes){const ls=lines(note,CW,8),height=ls.length*lineHeight(8)+8;ensure(height);y+=block(note,M,y,CW,8,'#4a5b73')+8;}
 const range=doc.bufferedPageRange();for(let index=range.start;index<range.start+range.count;index++){doc.switchToPage(index);const fy=H-M-footerH+12;doc.moveTo(M,fy-6).lineTo(W-M,fy-6).strokeColor('#dce2ed').stroke();footerLines.forEach((line,i)=>drawLine(line,M,fy+i*lineHeight(8),CW,8,'#4a5b73'));drawLine(rtl?`صفحة ${index+1} من ${range.count}`:`Page ${index+1} / ${range.count}`,M,H-M-14,CW,8,'#4a5b73');}
 doc.end();
}catch(error){parentPort.postMessage({error:error.message});}
