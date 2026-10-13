import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {EngineDb} from '../app/lib/db.mjs';
import {APP_VERSION,CORE_SCHEMA_VERSION} from '../app/lib/version.mjs';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const fixture=path.join(root,'tests/fixtures/v211-populated.sqlite');
const expectedFixtureSha='5939b82cceab933ed29df5a00e6c15329b773a839dbec555e07e21c153cad4ee';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(sha(fixture),expectedFixtureSha,'Exact populated v2.1.1 migration fixture changed');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'training-engine-one-migration-'));
const dbPath=path.join(dir,'training-engine.sqlite');fs.copyFileSync(fixture,dbPath);
const engine=new EngineDb(dbPath),db=engine.db;
try{
  const user=db.prepare("SELECT username,display_name,email,active FROM users WHERE username='MIGSTUDENT'").get();
  assert.deepEqual({...user},{username:'MIGSTUDENT',display_name:'Migration Student',email:'migstudent@example.test',active:1});
  const trainer=db.prepare("SELECT username,display_name FROM users WHERE username='MIGTRAIN'").get();assert.equal(trainer.display_name,'Migration Trainer');
  const course=db.prepare("SELECT c.title,cv.version,cv.status,cv.content_json FROM courses c JOIN course_versions cv ON cv.course_id=c.id WHERE c.slug='migration-preservation-course'").get();
  assert.equal(course.title,'Migration Preservation Course');assert.equal(course.version,'1.0');assert.equal(course.status,'published');assert.match(course.content_json,/This record must survive migration/);
  const klass=db.prepare("SELECT cl.title,cl.location,cl.capacity,cl.timezone,e.status enrollment_status FROM classes cl JOIN enrollments e ON e.class_id=cl.id JOIN users u ON u.id=e.student_id WHERE cl.title='Migration Live Class' AND u.username='MIGSTUDENT'").get();
  assert.equal(klass.location,'Migration Room');assert.equal(klass.capacity,24);assert.equal(klass.timezone,'Asia/Beirut');assert.equal(klass.enrollment_status,'active');
  assert.equal(db.prepare("SELECT COUNT(*) c FROM class_sessions cs JOIN classes cl ON cl.id=cs.class_id WHERE cl.title='Migration Live Class'").get().c,1);
  assert.equal(db.prepare("SELECT text_value FROM submissions s JOIN users u ON u.id=s.student_id WHERE u.username='MIGSTUDENT' AND text_value='Preserved submission text'").get().text_value,'Preserved submission text');
  assert.equal(db.prepare("SELECT COUNT(*) c FROM activity_events WHERE event_type='migration_fixture_marker'").get().c,1);
  for(const table of ['consent_history','saved_views','login_attempts','projector_pairs','authoring_templates','rubrics','certificates','course_prerequisites','class_waitlist','course_surveys','survey_responses']) assert.ok(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(table),`Missing ONE table ${table}`);
  const classCols=new Set(db.prepare('PRAGMA table_info(classes)').all().map(x=>x.name));for(const c of ['join_code','join_policy'])assert.ok(classCols.has(c),`Missing migrated classes.${c}`);
  const sessionCols=new Set(db.prepare('PRAGMA table_info(sessions)').all().map(x=>x.name));for(const c of ['expires_at','device_label','user_agent','ip_address','rotated_at'])assert.ok(sessionCols.has(c),`Missing migrated sessions.${c}`);
  const submissionCols=new Set(db.prepare('PRAGMA table_info(submissions)').all().map(x=>x.name));for(const c of ['review_status','review_score','review_max_score','review_feedback','rubric_json','reviewed_by','reviewed_at'])assert.ok(submissionCols.has(c),`Missing migrated submissions.${c}`);
  const meta=Object.fromEntries(db.prepare('SELECT key,value FROM schema_meta').all().map(x=>[x.key,x.value]));assert.equal(meta.core_schema,CORE_SCHEMA_VERSION);assert.equal(meta.app_version,APP_VERSION);
  assert.equal(String(db.prepare('PRAGMA integrity_check').get().integrity_check).toLowerCase(),'ok');assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);
  console.log('V211_TO_ONE_POPULATED_MIGRATION_PASS');
} finally {engine.close();fs.rmSync(dir,{recursive:true,force:true});}
