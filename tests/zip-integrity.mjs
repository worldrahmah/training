import assert from 'node:assert/strict';
import {crc32,readZipEntries} from '../app/lib/zip.mjs';
import {parseCoursePackage} from '../app/lib/course-package.mjs';
import {unzipEntries} from '../app/lib/presentation-import.mjs';

function zip(rows){let offset=0;const locals=[],central=[];
  for(const [name,text] of rows){const n=Buffer.from(name),b=Buffer.from(text),crc=crc32(b),l=Buffer.alloc(30),c=Buffer.alloc(46);l.writeUInt32LE(0x04034b50);l.writeUInt16LE(20,4);l.writeUInt32LE(crc,14);l.writeUInt32LE(b.length,18);l.writeUInt32LE(b.length,22);l.writeUInt16LE(n.length,26);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(crc,16);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);locals.push(l,n,b);central.push(c,n);offset+=30+n.length+b.length;}
  const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(rows.length,8);end.writeUInt16LE(rows.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,cd,end]);
}
const course=JSON.stringify({format:'training-engine-course',schema_version:'2.0',course:{id:'zip-test',version:'1',title:'Verified import',language:'en',direction:'ltr',modules:[{id:'m',title:'Module'}]}}),manifest=JSON.stringify({format:'training-engine-course-package',schema_version:'2.0',course_file:'course.json'}),rows=[['manifest.json',manifest],['course.json',course]],valid=zip(rows);
assert.equal(crc32(Buffer.from('123456789')),0xcbf43926);
assert.equal(parseCoursePackage(valid,'verified.course.zip').ok,true);assert.equal(unzipEntries(valid).get('course.json').toString(),course);
const cases=[['duplicate',zip([...rows,['course.json',course]])],['normalized duplicate',zip([...rows,['./course.json',course]])],['case collision',zip([...rows,['COURSE.JSON',course]])],['traversal',zip([...rows,['../escape.txt','x']])],['file-directory conflict',zip([...rows,['folder','x'],['folder/file.txt','y']])],['Windows reserved name',zip([...rows,['assets/CON.txt','x']])],['truncation',valid.subarray(0,valid.length-3)]];
const crc=Buffer.from(valid);crc.writeUInt32LE(0,crc.indexOf(Buffer.from('PK\x01\x02'))+16);cases.push(['CRC mismatch',crc]);
const mismatch=Buffer.from(valid);mismatch[30]^=1;cases.push(['local name mismatch',mismatch]);
for(const [name,bytes] of cases){assert.equal(parseCoursePackage(bytes,'bad.course.zip').ok,false,name);assert.throws(()=>unzipEntries(bytes),undefined,name);}
assert.throws(()=>readZipEntries(valid,{maxEntries:1}),/ZIP_CENTRAL_DIRECTORY_INVALID/);
assert.throws(()=>readZipEntries(valid,{maxTotalBytes:10}),/ZIP_EXPANDED_SIZE_LIMIT/);
console.log(`ZIP_INTEGRITY_PASS ${cases.length} invalid cases + entry/expanded limits + valid course/PPTX reader`);
