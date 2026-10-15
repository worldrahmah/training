// RC1R10 scoped messaging. Audiences resolve on the server at send time.
import crypto from 'node:crypto';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
export function notificationVisible(n,u,{db,canManageClass,canViewCourse}){
 if(!n)return false;if(n.expires_at){const value=String(n.expires_at),at=Date.parse(/[zZ]$|[+-]\d\d:\d\d$/.test(value)?value:value.replace(' ','T')+'Z');if(!Number.isFinite(at)||at<Date.now())return false;}
 if(n.scope_type==='system')return true;if(n.scope_type==='user')return String(n.scope_id)===String(u.id);
 if(n.scope_type==='class')return u.role==='trainer'?canManageClass(u,Number(n.scope_id)):!!db.prepare("SELECT 1 FROM enrollments WHERE class_id=? AND student_id=? AND status<>'withdrawn'").get(Number(n.scope_id),u.id);
 if(n.scope_type==='course')return u.role==='trainer'?canViewCourse(u,Number(n.scope_id)):!!db.prepare("SELECT 1 FROM enrollments e JOIN classes cl ON cl.id=e.class_id JOIN course_versions cv ON cv.id=cl.course_version_id WHERE cv.course_id=? AND e.student_id=? AND e.status<>'withdrawn'").get(Number(n.scope_id),u.id);return false;
}
function audiences(u,c){
 const {db,isAdminLike,classList,classPermission}=c,admin=isAdminLike(u),classes=classList(u).filter(cl=>classPermission(u,cl.id,'message'));
 const people=db.prepare("SELECT u.id,u.display_name,u.role FROM users u LEFT JOIN staff_roles sr ON sr.user_id=u.id WHERE u.active=1 AND COALESCE(sr.staff_role,'')<>'course_editor'").all(),allowed=new Set([u.id]);
 for(const cl of classes){for(const row of db.prepare("SELECT student_id id FROM enrollments WHERE class_id=? AND status='active' UNION SELECT user_id id FROM class_trainers WHERE class_id=?").all(cl.id,cl.id))allowed.add(row.id)}
 if(admin)for(const p of people)allowed.add(p.id);const active=new Set(people.map(p=>p.id));
 const out=[],add=(key,kind,name,ids)=>{const recipients=[...new Set(ids)].filter(id=>active.has(id));if(recipients.length&&recipients.every(id=>allowed.has(id)))out.push({key,kind,name,count:recipients.length,recipients})};
 if(admin)add('system','System','',people.map(p=>p.id));
 for(const [role,label] of [['trainer','Trainers'],['student','Participants']])add('role:'+role,label,'',people.filter(p=>p.role===role&&allowed.has(p.id)).map(p=>p.id));
 for(const cl of classes){const learners=db.prepare("SELECT student_id id FROM enrollments WHERE class_id=? AND status='active'").all(cl.id).map(p=>p.id),trainers=db.prepare('SELECT user_id id FROM class_trainers WHERE class_id=?').all(cl.id).map(p=>p.id);add('class:'+cl.id,'Class',cl.title,[...learners,...trainers]);add('class-participants:'+cl.id,'Participants',cl.title,learners);add('class-trainers:'+cl.id,'Trainers',cl.title,trainers);for(const team of db.prepare('SELECT id,name FROM teams WHERE class_id=?').all(cl.id))add('team:'+team.id,'Team',cl.title+' · '+team.name,db.prepare('SELECT student_id id FROM team_members WHERE team_id=?').all(team.id).map(p=>p.id));}
 for(const group of db.prepare('SELECT id,name,owner_id FROM workspace_groups WHERE archived_at IS NULL').all())if(admin||group.owner_id===u.id)add('group:'+group.id,'Group',group.name,db.prepare('SELECT user_id id FROM workspace_group_members WHERE group_id=?').all(group.id).map(p=>p.id));
 return out;
}
export async function handleExperienceApi(req,res,url,c){
 if(!['/api/experience/audiences','/api/experience/messages'].includes(url.pathname))return false;
 const u=c.requireUser(req,res,url,['trainer']);if(!u)return true;if(u.staff_role==='course_editor')fail('Classroom messaging access is required.',403);
 const catalog=audiences(u,c);
 if(req.method==='GET'&&url.pathname.endsWith('/audiences')){c.json(res,200,{ok:true,audiences:catalog.map(({recipients,...a})=>a)});return true;}
 if(req.method!=='POST'||!url.pathname.endsWith('/messages'))fail('Unsupported message action.',405);
 const b=await c.readJson(req),title=String(b.title||'').trim(),body=String(b.body||'').trim(),requestId=String(b.request_id||'');
 if(!title||title.length>160||!body||body.length>5000)fail('Enter a title up to 160 characters and a message up to 5000 characters.');
 if(!/^[a-zA-Z0-9-]{16,80}$/.test(requestId))fail('A valid send request is required.');
 if(!Array.isArray(b.audiences)||!b.audiences.length||b.audiences.length>100)fail('Choose at least one audience.');
 const keys=[...new Set(b.audiences.map(String))].sort(),selected=keys.map(key=>catalog.find(a=>a.key===key));if(selected.some(a=>!a))fail('You do not have permission to message one of these audiences.',403);
 const recipients=[...new Set(selected.flatMap(a=>a.recipients))];if(!recipients.length||recipients.length>5000)fail('Choose an audience with 1 to 5000 active recipients.');
 const priority=['low','normal','high'].includes(b.priority)?b.priority:'normal',digest=crypto.createHash('sha256').update(JSON.stringify({keys,title,body,priority})).digest('hex');
 const old=c.db.prepare("SELECT link_json FROM notifications WHERE sender_id=? AND json_extract(link_json,'$.send_request')=? LIMIT 1").get(u.id,requestId);
 if(old){const link=JSON.parse(old.link_json);if(link.digest!==digest)fail('This send request has already been used for a different message.',409);c.json(res,200,{ok:true,sent:link.sent,replayed:true});return true;}
 c.engine.transaction(()=>{for(const id of recipients)c.db.prepare("INSERT INTO notifications(sender_id,scope_type,scope_id,title,body,priority,link_json) VALUES(?,'user',?,?,?,?,?)").run(u.id,String(id),title,body,priority,JSON.stringify({send_request:requestId,digest,sent:recipients.length}));c.engine.log(null,u.id,'notification_batch_sent','notification',requestId,{recipients:recipients.length,audience_count:keys.length});});
 c.refresh(null,'notification');c.json(res,201,{ok:true,sent:recipients.length,replayed:false});return true;
}
