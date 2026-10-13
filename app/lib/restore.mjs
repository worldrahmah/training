import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {copyDir,ensureDir} from './utils.mjs';

// Filesystem journal, independent of the database being replaced. All paths are
// derived from configured roots and an opaque identifier, never read from JSON.
function locations(config,id){
  if(!/^[a-f0-9]{32}$/.test(id))throw new Error('Invalid restore journal identifier.');
  const prefix=`.one-restore-${id}`,dbRoot=path.dirname(config.dbPath),storageRoot=path.dirname(config.storageDir);
  return {...config,id,journal:path.join(config.dataDir,'restore-journal.json'),dbNew:path.join(dbRoot,`${prefix}-new.sqlite`),dbOld:path.join(dbRoot,`${prefix}-previous.sqlite`),storageNew:path.join(storageRoot,`${prefix}-new-storage`),storageOld:path.join(storageRoot,`${prefix}-previous-storage`)};
}
function journal(swap,phase){
  const temp=swap.journal+'.tmp',fd=fs.openSync(temp,'w');
  try{fs.writeFileSync(fd,JSON.stringify({version:1,id:swap.id,phase})+'\n');fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
  fs.renameSync(temp,swap.journal);
}
function removeDatabase(file){for(const suffix of ['','-wal','-shm'])fs.rmSync(file+suffix,{force:true})}
function cleanup(swap){
  removeDatabase(swap.dbNew);removeDatabase(swap.dbOld);
  fs.rmSync(swap.storageNew,{recursive:true,force:true});fs.rmSync(swap.storageOld,{recursive:true,force:true});
  fs.rmSync(swap.journal,{force:true});fs.rmSync(swap.journal+'.tmp',{force:true});
}
export function prepareRestore(config,{sourceDb,sourceStorage}){
  ensureDir(config.dataDir);ensureDir(path.dirname(config.storageDir));
  if(fs.existsSync(path.join(config.dataDir,'restore-journal.json')))throw new Error('Resolve the pending restore before starting another.');
  const swap=locations(config,crypto.randomBytes(16).toString('hex'));
  try{fs.copyFileSync(sourceDb,swap.dbNew);ensureDir(swap.storageNew);if(fs.existsSync(sourceStorage))copyDir(sourceStorage,swap.storageNew);journal(swap,'prepared');return swap}
  catch(error){cleanup(swap);throw error}
}
export function swapRestore(swap){
  // Close/checkpoint every live database connection before entering this function.
  journal(swap,'swapping');
  fs.renameSync(swap.dbPath,swap.dbOld);fs.renameSync(swap.dbNew,swap.dbPath);
  ensureDir(swap.storageDir);fs.renameSync(swap.storageDir,swap.storageOld);fs.renameSync(swap.storageNew,swap.storageDir);
}
export function rollbackRestore(swap){
  // Each step is repeatable after interruption. Keep the journal until recovery
  // is complete, including assets, so startup never seeds over a missing database.
  if(fs.existsSync(swap.dbOld)){removeDatabase(swap.dbPath);fs.renameSync(swap.dbOld,swap.dbPath)}
  if(fs.existsSync(swap.storageOld)){fs.rmSync(swap.storageDir,{recursive:true,force:true});fs.renameSync(swap.storageOld,swap.storageDir)}
  cleanup(swap);
}
export function finishRestore(swap){
  // Mark accepted only after the new runtime/database passes integrity checks.
  journal(swap,'committed');
  try{cleanup(swap);return true}catch(error){console.warn('Restore accepted; journal cleanup will resume at startup.');return false}
}
export function recoverPendingRestore(config){
  const file=path.join(config.dataDir,'restore-journal.json');if(!fs.existsSync(file))return false;
  const record=JSON.parse(fs.readFileSync(file,'utf8'));
  if(record.version!==1||!['prepared','swapping','committed'].includes(record.phase))throw new Error('Unsupported restore journal; startup stopped to preserve data.');
  const swap=locations(config,record.id);
  if(record.phase==='committed')cleanup(swap);else rollbackRestore(swap);
  return true;
}
