import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {prepareRestore,swapRestore,rollbackRestore,finishRestore,recoverPendingRestore} from '../app/lib/restore.mjs';

const root=fs.mkdtempSync(path.join(os.tmpdir(),'one-restore-recovery-'));let count=0;
function fixture(name){
  const dir=path.join(root,name),config={dataDir:path.join(dir,'data'),dbPath:path.join(dir,'data','training-engine.sqlite'),storageDir:path.join(dir,'assets','storage')};
  fs.mkdirSync(config.dataDir,{recursive:true});fs.mkdirSync(config.storageDir,{recursive:true});fs.mkdirSync(path.join(dir,'source-storage','nested'),{recursive:true});
  fs.writeFileSync(config.dbPath,'original populated database');fs.writeFileSync(path.join(config.storageDir,'original.txt'),'original asset');
  fs.writeFileSync(path.join(dir,'source.sqlite'),'replacement populated database');fs.writeFileSync(path.join(dir,'source-storage','nested','replacement.txt'),'replacement asset');
  return {config,sourceDb:path.join(dir,'source.sqlite'),sourceStorage:path.join(dir,'source-storage')};
}
function original(config){assert.equal(fs.readFileSync(config.dbPath,'utf8'),'original populated database');assert.equal(fs.readFileSync(path.join(config.storageDir,'original.txt'),'utf8'),'original asset');assert.ok(!fs.existsSync(path.join(config.storageDir,'nested','replacement.txt')));assert.ok(!fs.existsSync(path.join(config.dataDir,'restore-journal.json')));count++}
try{
  const a=fixture('normal');let swap=prepareRestore(a.config,a);swapRestore(swap);assert.equal(fs.readFileSync(a.config.dbPath,'utf8'),'replacement populated database');assert.equal(fs.readFileSync(path.join(a.config.storageDir,'nested','replacement.txt'),'utf8'),'replacement asset');finishRestore(swap);assert.equal(recoverPendingRestore(a.config),false);count++;
  const b=fixture('validation-failure');swap=prepareRestore(b.config,b);swapRestore(swap);rollbackRestore(swap);original(b.config);
  const c=fixture('prepared-interruption');prepareRestore(c.config,c);assert.equal(recoverPendingRestore(c.config),true);original(c.config);
  // Independently construct interrupted on-disk states at each rename boundary.
  for(const boundary of [1,2,3,4]){
    const f=fixture(`interruption-${boundary}`),s=prepareRestore(f.config,f);fs.writeFileSync(s.journal,JSON.stringify({version:1,id:s.id,phase:'swapping'}));
    fs.renameSync(s.dbPath,s.dbOld);
    if(boundary>=2)fs.renameSync(s.dbNew,s.dbPath);
    if(boundary>=3)fs.renameSync(s.storageDir,s.storageOld);
    if(boundary>=4)fs.renameSync(s.storageNew,s.storageDir);
    assert.equal(recoverPendingRestore(f.config),true);original(f.config);assert.equal(recoverPendingRestore(f.config),false);
  }
  const d=fixture('accepted-cleanup-interruption');swap=prepareRestore(d.config,d);swapRestore(swap);fs.writeFileSync(swap.journal,JSON.stringify({version:1,id:swap.id,phase:'committed'}));assert.equal(recoverPendingRestore(d.config),true);assert.equal(fs.readFileSync(d.config.dbPath,'utf8'),'replacement populated database');count++;
  const e=fixture('malformed-journal');fs.writeFileSync(path.join(e.config.dataDir,'restore-journal.json'),JSON.stringify({version:1,id:'../../outside',phase:'swapping'}));assert.throws(()=>recoverPendingRestore(e.config),/Invalid restore journal/);assert.equal(fs.readFileSync(e.config.dbPath,'utf8'),'original populated database');count++;
  console.log(`RESTORE_RECOVERY_PASS ${count} scenarios: commit, failure rollback, interrupted rename boundaries, accepted cleanup and fail-closed malformed journal`);
}finally{fs.rmSync(root,{recursive:true,force:true})}
