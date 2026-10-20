// No tokens or other accounts' answers are replayed. Conflicts remain reviewable.
export class GuidedOutbox {
 constructor({storage,userId,send,key='training_engine_guided_outbox_v1'}){Object.assign(this,{storage,userId,send,key});this.running=null}
 all(){try{const rows=JSON.parse(this.storage.getItem(this.key)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}}
 mine(){return this.all().filter(row=>row.user_id===this.userId)}
 write(rows){this.storage.setItem(this.key,JSON.stringify(rows))}
 add(item){const rows=this.all();if(rows.filter(x=>x.user_id===this.userId).length>=100)throw new Error('Review saved changes before adding more.');const row={...structuredClone(item),user_id:this.userId,status:item.status==='conflict'?'conflict':'pending',queued_at:new Date().toISOString()};rows.push(row);this.write(rows);return row}
 discard(id){this.write(this.all().filter(row=>row.user_id!==this.userId||row.id!==id))}
 retry(id){this.write(this.all().map(row=>row.user_id===this.userId&&row.id===id?{...row,status:'pending',error:null}:row))}
 async flush(){if(this.running)return this.running;this.running=this.drain();try{return await this.running}finally{this.running=null}}
 async drain(){let count=0;const ids=this.mine().map(x=>x.id);for(const id of ids){const row=this.mine().find(x=>x.id===id);if(!row||row.status==='conflict')break;try{this.write(this.all().map(x=>x.id===id&&x.user_id===this.userId?{...x,attempted:true}:x));const reply=await this.send(row);this.discard(id);if(row.kind==='progress'&&Number.isInteger(reply?.revision))this.write(this.all().map(x=>x.user_id===this.userId&&!x.attempted&&x.kind==='progress'&&x.class_id===row.class_id&&x.payload.module_id===row.payload.module_id&&x.payload.path_id===row.payload.path_id&&x.payload.expected_step_id===row.payload.expected_step_id&&x.payload.expected_revision===row.payload.expected_revision?{...x,payload:{...x.payload,expected_revision:reply.revision}}:x));count++}catch(error){const retry=!error.status||error.status===401||error.status>=500;this.write(this.all().map(x=>x.id===id&&x.user_id===this.userId?{...x,status:retry?'pending':'conflict',error:error.message}:x));break}}return count}
}
