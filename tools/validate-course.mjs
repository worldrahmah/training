import {APP_VERSION} from '../app/lib/version.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {parseCoursePackage} from '../app/lib/course-package.mjs';
const file=process.argv[2];
if(!file){console.error('Usage: node tools/validate-course.mjs <course.json|course.zip>');process.exit(2)}
const full=path.resolve(file);if(!fs.existsSync(full)){console.error('File not found:',full);process.exit(2)}
const result=parseCoursePackage(fs.readFileSync(full),path.basename(full));
console.log(`Training Engine ONE Course Validator ${APP_VERSION}`);
console.log('File:',full);
if(result.summary){console.log(`Course: ${result.summary.title}`);console.log(`Modules: ${result.summary.modules} | Activities: ${result.summary.activities} | Missions: ${result.summary.missions} | Minutes: ${result.summary.duration_minutes}`)}
if(result.warnings.length){console.log('\nWarnings:');for(const w of result.warnings)console.log(' -',w)}
if(result.errors.length){console.log('\nErrors:');for(const e of result.errors)console.log(' -',e)}
console.log('\nVerdict:',result.ok?'VALID':'INVALID');
process.exit(result.ok?0:1);
