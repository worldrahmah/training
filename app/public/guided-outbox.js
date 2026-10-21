import {classifyGuidedFailure,guidedFailure} from './guided-persistence.js';
// Each mutation is durable before its first request. Server receipts make concurrent-tab
// sends safe; a local lock also serializes immediate save and replay in this document.
const locks=new Map(),confirmed=new Map(),submissions=new Map();
const documentOrigin=Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
export class GuidedOutbox {
 constructor({storage,userId,send,key='training_engine_guided_outbox_v1',originId=documentOrigin}){Object.assign(this,{storage,userId,send,key,originId});this.running=null}
 all(){const raw=this.storage.getItem(this.key);if(!raw)return [];let rows;try{rows=JSON.parse(raw)}catch{throw guidedFailure('CLIENT_RUNTIME_ERROR',{reason:'INVALID_OUTBOX'})}if(!Array.isArray(rows))throw guidedFailure('CLIENT_RUNTIME_ERROR',{reason:'INVALID_OUTBOX'});return rows}
 mine(){return this.all().filter(row=>row.user_id===this.userId)}
 write(rows){try{this.storage.setItem(this.key,JSON.stringify(rows))}catch{throw guidedFailure('CLIENT_RUNTIME_ERROR',{reason:'DEVICE_STORAGE_UNAVAILABLE'})}}
 add(item){const rows=this.all(),same=rows.find(x=>x.user_id===this.userId&&x.id===item.id);if(same){if(JSON.stringify(same.payload)!==JSON.stringify(item.payload))throw guidedFailure('CONFLICT');return same}if(rows.filter(x=>x.user_id===this.userId).length>=100)throw new Error('Review saved changes before adding more.');const row={...structuredClone(item),origin_instance:item.origin_instance||this.originId,user_id:this.userId,status:item.status==='conflict'?'conflict':'pending',queued_at:item.queued_at||new Date().toISOString(),retry_count:item.retry_count||0};rows.push(row);this.write(rows);return row}
 discard(id){this.write(this.all().filter(row=>row.user_id!==this.userId||row.id!==id))}
 retry(id){this.write(this.all().map(row=>row.user_id===this.userId&&row.id===id?{...row,status:'pending',error:null,last_error:null}:row))}
 async locked(task){const key=this.key+':'+this.userId,prior=locks.get(key)||Promise.resolve(),next=prior.catch(()=>{}).then(task);locks.set(key,next);try{return await next}finally{if(locks.get(key)===next)locks.delete(key)}}
 async transmit(row,{replay=false}={}){
  this.write(this.all().map(x=>x.id===row.id&&x.user_id===this.userId?{...x,attempted:true,status:'replaying',last_attempt_at:new Date().toISOString(),retry_count:(x.retry_count||0)+1}:x));
  try{const reply=await this.send(row);this.discard(row.id);
   if(Number.isInteger(reply?.revision))this.write(this.all().map(x=>x.user_id===this.userId&&!x.attempted&&row.origin_instance&&x.origin_instance===row.origin_instance&&x.class_id===row.class_id&&x.payload.module_id===row.payload.module_id&&x.payload.path_id===row.payload.path_id&&x.payload.expected_step_id===row.payload.expected_step_id&&x.payload.expected_revision===row.payload.expected_revision?{...x,payload:{...x.payload,expected_revision:reply.revision}}:x));
   confirmed.set(this.key+':'+this.userId+':'+row.id,reply);if(confirmed.size>256)confirmed.delete(confirmed.keys().next().value);return reply;
  }catch(raw){const error=classifyGuidedFailure(raw),pending=['OFFLINE','REQUEST_FAILED','TIMEOUT'].includes(error.code);this.write(this.all().map(x=>x.id===row.id&&x.user_id===this.userId?{...x,status:error.code==='CONFLICT'?'conflict':pending?'pending':'error',error:error.message,last_error:{code:error.code,phase:replay?'REPLAY_FAILED':'SAVE_FAILED',status:error.status||null,endpoint:error.endpoint||null,at:new Date().toISOString()}}:x));throw Object.assign(error,{queued:true,outbox_id:row.id})}
 }
 submit(item){const key=this.key+':'+this.userId+':'+item.id;if(submissions.has(key))return submissions.get(key);this.add(item);const pending=this.locked(async()=>{const first=this.mine()[0];if(!this.mine().some(row=>row.id===item.id)&&confirmed.has(key))return confirmed.get(key);if(first?.id!==item.id)throw Object.assign(guidedFailure(first?.last_error?.code||'QUEUED_PENDING'),{queued:true,outbox_id:item.id});return this.transmit(first)});submissions.set(key,pending);pending.finally(()=>submissions.delete(key)).catch(()=>{});return pending}
 async flush(){if(this.running)return this.running;this.running=this.locked(()=>this.drain());try{return await this.running}finally{this.running=null}}
 async drain(){let count=0;for(const id of this.mine().map(x=>x.id)){const row=this.mine().find(x=>x.id===id);if(!row)continue;if(['conflict','error'].includes(row.status))break;try{await this.transmit(row,{replay:true});count++}catch{break}}return count}
}
