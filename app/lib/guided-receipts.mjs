import crypto from 'node:crypto';
// Invoke inside the same synchronous transaction as progress/response writes.
// Receipts survive leaving a path and do not silently expire after 64 changes.
export function guidedMutation(db,{classId,userId,kind,body},apply){
 const id=body.client_write_id;
 if(id!==undefined&&!/^[a-f0-9]{32}$/.test(id))throw Object.assign(Error('Invalid retry identifier.'),{status:400});
 const hash=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
 if(id){const prior=db.prepare('SELECT kind,payload_sha256,reply_json FROM guided_mutation_receipts WHERE class_id=? AND user_id=? AND mutation_id=?').get(classId,userId,id);
  if(prior){if(prior.kind!==kind||prior.payload_sha256!==hash)throw Object.assign(Error('This retry does not match the saved change.'),{status:409});return {...JSON.parse(prior.reply_json),replayed:true}}
  if(body.guided_action!=='choose'&&!Number.isInteger(body.expected_revision))throw Object.assign(Error('Refresh your progress before continuing.'),{status:409});
 }
 const reply={...apply(),...(id?{mutation_id:id}:{}),code:'CONFIRMED'};
 if(id)db.prepare('INSERT INTO guided_mutation_receipts(class_id,user_id,mutation_id,kind,payload_sha256,reply_json) VALUES(?,?,?,?,?,?)').run(classId,userId,id,kind,hash,JSON.stringify(reply));
 return reply;
}
