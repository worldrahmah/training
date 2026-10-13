import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';

// Privileged test evidence: scores remain persisted, but must not be exposed to
// learners as a pre-reveal correctness oracle.
export function storedScore(tmp,instanceId,studentId){
  const db=new DatabaseSync(path.join(tmp,'data','training-engine.sqlite'),{readOnly:true});
  try{return db.prepare('SELECT score FROM responses WHERE instance_id=? AND student_id=?').get(Number(instanceId),Number(studentId))?.score}
  finally{db.close()}
}
