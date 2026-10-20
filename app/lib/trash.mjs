import fs from 'node:fs';
import path from 'node:path';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
export function inTrash(db,type,id){return !!db.prepare('SELECT 1 FROM trash_records WHERE entity_type=? AND entity_id=?').get(type,Number(id))}

// Trash is separate from intentional archiving. No historical record is erased
// until an administrator confirms a permanent deletion of an already trashed item.
export async function handleTrashApi(req,res,url,c){
 const p=url.pathname,deleted=p.match(/^\/api\/(courses|classes)\/(\d+)$/),archived=p.match(/^\/api\/courses\/(\d+)\/archive$/);
 if(!(deleted&&req.method==='DELETE')&&!(archived&&req.method==='POST')&&!p.startsWith('/api/workspace/trash'))return false;
 const {db,engine,json,readJson,requireUser,isAdminLike,canViewCourse,classPermission,getClassRow,refresh,STORAGE_DIR}=c;
 const user=requireUser(req,res,url);if(!user)return true;
 if(user.role!=='trainer'||user.staff_role==='course_editor')fail('Trainer or administrator access is required.',403);
 const rowFor=(type,id)=>type==='course'?db.prepare('SELECT * FROM courses WHERE id=?').get(id):getClassRow(id);
 const access=(type,id,action='delete')=>{const row=rowFor(type,id);if(!row)fail('Record not found.',404);if(type==='class'?!classPermission(user,id,action):!canViewCourse(user,id)||(!isAdminLike(user)&&!c.hasGrant(user,'course',id,action)))fail('You do not have permission to delete this record.',403);return row};
 if(archived){const id=Number(archived[1]);engine.transaction(()=>{const row=access('course',id);if(inTrash(db,'course',id))fail('Restore this item from Trash first.',409);if(row.archived_at)return;db.prepare('INSERT INTO archive_records(entity_type,entity_id,snapshot_json,archived_by) VALUES(?,?,?,?) ON CONFLICT(entity_type,entity_id) DO UPDATE SET snapshot_json=excluded.snapshot_json,archived_by=excluded.archived_by,archived_at=CURRENT_TIMESTAMP,restored_at=NULL').run('course',id,JSON.stringify(row),user.id);db.prepare('UPDATE courses SET archived_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(id);engine.log(null,user.id,'course_archived','course',id,{intent:'archive'});});refresh(null,'courses');json(res,200,{ok:true,archived:true});return true;}
 if(deleted){const type=deleted[1]==='courses'?'course':'class',id=Number(deleted[2]);engine.transaction(()=>{const row=access(type,id);if(inTrash(db,type,id))return;if(type==='class'&&row.status==='active')fail('Finish the live class before moving it to Trash.',409);db.prepare('INSERT INTO trash_records(entity_type,entity_id,snapshot_json,deleted_by) VALUES(?,?,?,?)').run(type,id,JSON.stringify(row),user.id);
   if(type==='course')db.prepare('UPDATE courses SET archived_at=COALESCE(archived_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE id=?').run(id);
   else {const applicants=db.prepare("SELECT id,student_id FROM class_join_requests WHERE class_id=? AND status='pending'").all(id);for(const applicant of applicants)db.prepare("INSERT INTO notifications(sender_id,scope_type,scope_id,title,body,link_json) VALUES(?,'user',?,?,?,?)").run(user.id,String(applicant.student_id),'Class admission cancelled','The class is closed to admission.',JSON.stringify({type:'admission',class_id:id,request_id:applicant.id}));db.prepare("UPDATE classes SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);db.prepare("INSERT INTO class_lifecycle(class_id,lifecycle_status) VALUES(?,'archived') ON CONFLICT(class_id) DO UPDATE SET lifecycle_status='archived',updated_at=CURRENT_TIMESTAMP").run(id);db.prepare("UPDATE class_join_requests SET status='cancelled',decided_by=?,decided_at=CURRENT_TIMESTAMP,revision=revision+1,note='Class moved to Trash' WHERE class_id=? AND status='pending'").run(user.id,id);if(Number(engine.getSetting('active_class_id',0))===id)engine.setSetting('active_class_id',0);}
   engine.log(type==='class'?id:null,user.id,'record_trashed',type,id,{history_preserved:true});
  });refresh(type==='class'?id:null,'trash');json(res,200,{ok:true,trashed:true});return true;}
 if(p==='/api/workspace/trash'&&req.method==='GET'){
  const records=db.prepare('SELECT * FROM trash_records ORDER BY deleted_at DESC,entity_id DESC').all().flatMap(t=>{const row=rowFor(t.entity_type,t.entity_id);if(!row)return [];const allowed=t.entity_type==='class'?classPermission(user,row.id,'delete'):canViewCourse(user,row.id)&&(isAdminLike(user)||c.hasGrant(user,'course',row.id,'delete'));if(!allowed)return [];return [{id:row.id,type:t.entity_type,name:row.title,deleted_at:t.deleted_at,can_purge:isAdminLike(user),dependent_classes:t.entity_type==='course'?Number(db.prepare('SELECT COUNT(*) n FROM classes cl JOIN course_versions cv ON cv.id=cl.course_version_id WHERE cv.course_id=?').get(row.id).n):0}]});json(res,200,{ok:true,records});return true;
 }
 if(['/api/workspace/trash/restore','/api/workspace/trash/purge'].includes(p)&&req.method==='POST'){
  const b=await readJson(req),id=Number(b.id),type=String(b.type);if(!['course','class'].includes(type)||!Number.isSafeInteger(id)||id<1)fail('Choose an item in Trash.');
  const files=[];let restoredTo='workspace';
  engine.transaction(()=>{const row=access(type,id),saved=db.prepare('SELECT * FROM trash_records WHERE entity_type=? AND entity_id=?').get(type,id);if(!saved)fail('This item is not in Trash.',409);
   if(p.endsWith('/restore')){const prior=JSON.parse(saved.snapshot_json);if(type==='course'){db.prepare('UPDATE courses SET archived_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(prior.archived_at||null,id);if(prior.archived_at)restoredTo='archive';}
    else {const status=['planned','completed','cancelled'].includes(prior.status)?prior.status:'planned',lifecycle=['draft','scheduled','completed','archived'].includes(prior.lifecycle_status)?prior.lifecycle_status:status==='completed'?'completed':'scheduled';db.prepare('UPDATE classes SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status,id);db.prepare('UPDATE class_lifecycle SET lifecycle_status=?,updated_at=CURRENT_TIMESTAMP WHERE class_id=?').run(lifecycle,id);if(lifecycle==='archived')restoredTo='archive';}
    db.prepare('DELETE FROM trash_records WHERE entity_type=? AND entity_id=?').run(type,id);engine.log(type==='class'?id:null,user.id,'trash_record_restored',type,id,{destination:restoredTo});return;
   }
   if(!isAdminLike(user))fail('Only an administrator can permanently delete items.',403);
   if(String(b.confirmation||'')!==row.title)fail('Type the exact name to confirm permanent deletion.');
   if(type==='course'&&db.prepare('SELECT 1 FROM classes cl JOIN course_versions cv ON cv.id=cl.course_version_id WHERE cv.course_id=? LIMIT 1').get(id))fail('This course still has classes. Permanently delete those classes from Trash first.',409);
   const stored=type==='course'?db.prepare('SELECT a.stored_path FROM course_assets a JOIN course_versions cv ON cv.id=a.course_version_id WHERE cv.course_id=?').all(id):db.prepare('SELECT stored_path FROM submissions WHERE class_id=? AND stored_path IS NOT NULL').all(id);files.push(...stored.map(x=>x.stored_path));
   db.prepare("DELETE FROM report_snapshots WHERE scope_type=? AND scope_id=?").run(type,id);const reports=type==='class'?db.prepare("SELECT id FROM professional_report_snapshots WHERE EXISTS(SELECT 1 FROM json_each(data_json,'$.class_ids') WHERE CAST(value AS INTEGER)=?)").all(id):db.prepare("SELECT id FROM professional_report_snapshots WHERE template='course' AND resource_id=?").all(id);for(const report of reports){if(/^[a-f0-9-]+$/.test(report.id))files.push(path.join(STORAGE_DIR,'professional-reports',report.id+'.pdf'));db.prepare('DELETE FROM professional_report_snapshots WHERE id=?').run(report.id)}
   db.prepare("DELETE FROM notifications WHERE (scope_type=? AND scope_id=?) OR CAST(json_extract(link_json,?) AS INTEGER)=?").run(type,String(id),type==='class'?'$.class_id':'$.course_id',id);
   db.prepare('DELETE FROM permission_grants WHERE resource_type=? AND resource_id=?').run(type,String(id));
   // SQLite's existing foreign-key cascades remove only this object's dependent rows.
   db.prepare(type==='course'?'DELETE FROM courses WHERE id=?':'DELETE FROM classes WHERE id=?').run(id);
   db.prepare('DELETE FROM archive_records WHERE entity_type=? AND entity_id=?').run(type,id);db.prepare('DELETE FROM trash_records WHERE entity_type=? AND entity_id=?').run(type,id);
   engine.log(null,user.id,'record_permanently_deleted',type,id,{title:row.title});
  });
  let cleanupPending=false;for(const stored of files){const target=path.resolve(stored),base=path.resolve(STORAGE_DIR);if(!target.startsWith(base+path.sep))continue;if(db.prepare('SELECT 1 FROM course_assets WHERE stored_path=? UNION ALL SELECT 1 FROM submissions WHERE stored_path=? LIMIT 1').get(stored,stored))continue;try{fs.rmSync(target,{force:true})}catch{cleanupPending=true}}
  refresh(null,'trash');json(res,200,{ok:true,restored:p.endsWith('/restore'),permanently_deleted:p.endsWith('/purge'),destination:restoredTo,storage_cleanup_pending:cleanupPending});return true;
 }
 fail('Unsupported Trash action.',405);
}
