import fs from 'node:fs';
import {zipFiles} from './zip.mjs';
import {safeRelativePath,sha256} from './utils.mjs';
import {validateCourseObject,parseCoursePackage} from './course-package.mjs';
function fail(message,status=422){throw Object.assign(new Error(message),{status})}
export function exportCoursePackage(version,assets=[]){
 if(assets.length>4094)fail('Course assets exceed the supported package limits.');let content;try{content=JSON.parse(version.content_json)}catch{fail('This course cannot be exported. Validate its structure first.')}
 if(!content?.course||typeof content.course!=='object')fail('This course cannot be exported. Validate its structure first.');content.course.version=String(version.version);const validation=validateCourseObject(content);if(!validation.ok)fail(validation.errors.join('\n'));
 const files=new Map([['course.json',Buffer.from(JSON.stringify(validation.course,null,2)+'\n')]]);let total=0;
 for(const asset of assets){const key=safeRelativePath(asset.asset_key);if(!key||files.has(key)||key==='manifest.json')fail('A course asset has an invalid or duplicate package path.');let bytes;try{const size=fs.statSync(asset.stored_path).size;if(size>32*1024*1024||total+size>100*1024*1024)fail('Course assets exceed the supported package limits.');bytes=fs.readFileSync(asset.stored_path)}catch(error){if(error.status)throw error;fail('A course asset is unavailable. Restore it before exporting.',409)}if(sha256(bytes)!==asset.sha256)fail('A course asset failed checksum verification. Restore it before exporting.',409);total+=bytes.length;files.set(key,bytes)}
 const manifest={format:'training-engine-course-package',schema_version:'2.0',course_file:'course.json',files:[...files].sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>({path:name,sha256:sha256(bytes)}))};files.set('manifest.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n'));const zip=zipFiles(files),checked=parseCoursePackage(zip,'course.course.zip');if(!checked.ok)fail(checked.errors.join('\n'));return zip;
}
