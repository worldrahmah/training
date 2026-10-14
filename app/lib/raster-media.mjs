import zlib from 'node:zlib';
import runtime from '../vendor/pdf/runtime.cjs';
const crcTable=Uint32Array.from({length:256},(_,value)=>{for(let i=0;i<8;i++)value=value&1?0xedb88320^(value>>>1):value>>>1;return value>>>0});
function crc(bytes){let value=0xffffffff;for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8);return (value^0xffffffff)>>>0;}
export function validateRaster(bytes){
 const fail=()=>{throw Object.assign(new Error('Choose a valid PNG or JPEG image up to 2 MB and 4096 × 4096 pixels.'),{status:400})};
 if(!Buffer.isBuffer(bytes)||!bytes.length||bytes.length>2*1024*1024)fail();
 const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),jpeg=bytes[0]===255&&bytes[1]===216;if(!png&&!jpeg)fail();
 let image;try{image=runtime.PDFDocument.prototype.openImage.call({_imageRegistry:{}},bytes)}catch{fail()}
 if(!image||!Number.isInteger(image.width)||!Number.isInteger(image.height)||image.width<1||image.height<1||image.width>4096||image.height>4096)fail();
 if(png){let offset=8,header=null,ended=false,compressed=[];while(offset<bytes.length){if(offset+12>bytes.length)fail();const length=bytes.readUInt32BE(offset),end=offset+12+length;if(end>bytes.length)fail();const kind=bytes.toString('ascii',offset+4,offset+8);if(crc(bytes.subarray(offset+4,end-4))!==bytes.readUInt32BE(end-4))fail();if(offset===8&&kind!=='IHDR')fail();if(kind==='IHDR'){if(header||length!==13)fail();header=bytes.subarray(offset+8,end-4);}if(kind==='IDAT')compressed.push(bytes.subarray(offset+8,end-4));offset=end;if(kind==='IEND'){if(length||offset!==bytes.length)fail();ended=true;break;}}
  if(!header||!ended||!compressed.length)fail();const depth=header[8],color=header[9],channels={0:1,2:3,3:1,4:2,6:4}[color];if(!channels||![1,2,4,8,16].includes(depth)||header[10]!==0||header[11]!==0||header[12]>1)fail();const passes=header[12]?[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]]:[[0,0,1,1]],rows=[];let expected=0;
  for(const [x,y,dx,dy] of passes){const width=Math.max(0,Math.ceil((image.width-x)/dx)),height=Math.max(0,Math.ceil((image.height-y)/dy));if(!width||!height)continue;const size=1+Math.ceil(width*channels*depth/8);for(let row=0;row<height;row++){rows.push([expected,size]);expected+=size}}
  let raw;try{raw=zlib.inflateSync(Buffer.concat(compressed),{maxOutputLength:expected+1})}catch{fail()}if(raw.length!==expected||rows.some(([start])=>raw[start]>4))fail();
 }else if(bytes.lastIndexOf(Buffer.from([255,217]))<2)fail();
 return {mime:png?'image/png':'image/jpeg',extension:png?'png':'jpg',width:image.width,height:image.height};
}
