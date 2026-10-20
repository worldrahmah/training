import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
import {zipFiles} from '../app/lib/zip.mjs';export {zipFiles} from '../app/lib/zip.mjs';import {parseCoursePackage} from '../app/lib/course-package.mjs';
export function packageFiles(files){
 const manifest={format:'training-engine-course-package',schema_version:'2.0',course_file:'course.json',files:[...files].sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>({path:name,sha256:crypto.createHash('sha256').update(bytes).digest('hex')}))};
 const zip=zipFiles(new Map([...files,['manifest.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n')]]));
 const result=parseCoursePackage(zip,'course.zip');if(!result.ok)throw new Error(result.errors.join('\n'));return zip;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [folder,output]=process.argv.slice(2);if(!folder||!output)throw new Error('Usage: node tools/package-course.mjs <course-directory> <output.course.zip>');
 const root=path.resolve(folder),out=path.resolve(output),files=new Map();
 function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,ent.name);if(ent.isSymbolicLink())throw Error('Symlinks are not permitted');if(ent.isDirectory())walk(f);else{const name=path.relative(root,f).split(path.sep).join('/');if(name!=='manifest.json')files.set(name,fs.readFileSync(f));}}}walk(root);
 if(fs.existsSync(out)||fs.existsSync(out+'.sha256'))throw Error('Output exists; choose a new version/path.');
 const bytes=packageFiles(files),sha=crypto.createHash('sha256').update(bytes).digest('hex');fs.writeFileSync(out,bytes,{flag:'wx'});fs.writeFileSync(out+'.sha256',sha+'  '+path.basename(out)+'\n',{flag:'wx'});console.log('PACKAGE_VALIDATED',path.basename(out),sha);
}
