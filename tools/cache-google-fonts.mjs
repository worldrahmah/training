// Verify/restore the pinned local catalog; never replace selected families with remote CSS.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {FONT_CATALOG} from '../app/public/font-catalog.js';
const optional=process.argv.includes('--optional'),hash=data=>crypto.createHash('sha256').update(data).digest('hex');
let restored=0;
try{
 for(const font of FONT_CATALOG.families)for(const entry of [{file:font.file,url:font.source_url,sha:font.sha256},{file:font.license_file,url:font.license_url,sha:font.license_sha256}]){
  const target=path.resolve(import.meta.dirname,'../app/public'+entry.file),existing=await fs.readFile(target).catch(()=>null);if(existing&&hash(existing)===entry.sha)continue;
  if(optional)throw new Error('A bundled font/license failed verification. Run npm run fonts:cache to restore pinned files.');
  const response=await fetch(entry.url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Pinned font restoration failed: '+response.status);const data=Buffer.from(await response.arrayBuffer());if(hash(data)!==entry.sha)throw new Error('Pinned font checksum mismatch.');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,data);restored++;
 }
 console.log(`FONT_CACHE_READY ${FONT_CATALOG.families.length} licensed local families verified; ${restored} files restored.`);
}catch(error){if(optional){console.warn('FONT_CACHE_UNAVAILABLE '+error.message)}else throw error}
