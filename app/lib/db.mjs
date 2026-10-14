import {protectWorkspaceUpgrade,migrateWorkspace} from './workspace-migrations.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ensureDir, hashPassword, nowIso, safeJsonParse, slugify } from './utils.mjs';
import { APP_VERSION, CORE_SCHEMA_VERSION } from './version.mjs';

export class EngineDb {
  constructor(dbPath,upgradePaths={}){
    this.upgradePaths=upgradePaths;
    this.dbPath=dbPath;
    ensureDir(path.dirname(dbPath));
    this.open();
  }
  open(){
    this.db=new DatabaseSync(this.dbPath);
    this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;');
    this.upgradeBackup=protectWorkspaceUpgrade(this.db,{dbPath:this.dbPath,...this.upgradePaths});
    this.initSchema();
  }
  close(){ try{this.db.close();}catch{} }
  reopen(){ this.close(); this.open(); }
  initSchema(){
    this.db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL UNIQUE COLLATE NOCASE,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('trainer','student')),
 display_name TEXT NOT NULL,
 email TEXT,
 active INTEGER NOT NULL DEFAULT 1,
 is_demo INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS profiles (
 user_id INTEGER PRIMARY KEY,
 profile_json TEXT NOT NULL DEFAULT '{}',
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS sessions (
 token TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 expires_at TEXT,
 device_label TEXT NOT NULL DEFAULT '',
 user_agent TEXT NOT NULL DEFAULT '',
 ip_address TEXT NOT NULL DEFAULT '',
 rotated_at TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS courses (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 slug TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 language TEXT NOT NULL DEFAULT 'en',
 direction TEXT NOT NULL DEFAULT 'ltr' CHECK(direction IN ('ltr','rtl')),
 is_demo INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS course_versions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 course_id INTEGER NOT NULL,
 version TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 content_json TEXT NOT NULL,
 source_manifest_json TEXT NOT NULL DEFAULT '{}',
 checksum TEXT NOT NULL,
 is_demo INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(course_id,version),
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS course_assets (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 course_version_id INTEGER NOT NULL,
 asset_key TEXT NOT NULL,
 stored_path TEXT NOT NULL,
 mime_type TEXT NOT NULL,
 size_bytes INTEGER NOT NULL,
 sha256 TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(course_version_id,asset_key),
 FOREIGN KEY(course_version_id) REFERENCES course_versions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS classes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 course_version_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 start_date TEXT,
 end_date TEXT,
 start_time TEXT,
 end_time TEXT,
 location TEXT NOT NULL DEFAULT '',
 timezone TEXT NOT NULL DEFAULT '',
 join_code TEXT,
 join_policy TEXT NOT NULL DEFAULT 'enrolled_only' CHECK(join_policy IN ('enrolled_only','self_enroll')),
 capacity INTEGER NOT NULL DEFAULT 20,
 trainer_id INTEGER,
 status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','active','completed','cancelled')),
 is_demo INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(course_version_id) REFERENCES course_versions(id),
 FOREIGN KEY(trainer_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS class_sessions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 session_date TEXT,
 start_time TEXT,
 end_time TEXT,
 status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned','active','completed')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS enrollments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','completed','withdrawn')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(class_id,student_id),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS teams (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 name TEXT NOT NULL,
 is_demo INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(class_id,name),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS team_members (
 team_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 PRIMARY KEY(team_id,student_id),
 FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS student_notes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 trainer_id INTEGER NOT NULL,
 note TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(trainer_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS classroom_state (
 class_id INTEGER PRIMARY KEY,
 module_id TEXT,
 activity_id TEXT,
 phase TEXT NOT NULL DEFAULT 'waiting',
 payload_json TEXT NOT NULL DEFAULT '{}',
 revision INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS activity_instances (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 module_id TEXT,
 activity_id TEXT NOT NULL,
 activity_type TEXT NOT NULL,
 title TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','revealed','completed')),
 definition_json TEXT NOT NULL,
 opened_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 closed_at TEXT,
 revealed_at TEXT,
 created_by INTEGER,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS responses (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 instance_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 answer_json TEXT NOT NULL,
 score REAL,
 submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(instance_id,student_id),
 FOREIGN KEY(instance_id) REFERENCES activity_instances(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS mission_progress (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 module_id TEXT,
 mission_id TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','in_progress','completed')),
 progress_json TEXT NOT NULL DEFAULT '{}',
 score REAL,
 started_at TEXT,
 completed_at TEXT,
 UNIQUE(class_id,student_id,mission_id),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS team_responses (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 instance_id INTEGER NOT NULL,
 team_id INTEGER NOT NULL,
 submitted_by INTEGER NOT NULL,
 answer_json TEXT NOT NULL,
 score REAL,
 submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(instance_id,team_id),
 FOREIGN KEY(instance_id) REFERENCES activity_instances(id) ON DELETE CASCADE,
 FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
 FOREIGN KEY(submitted_by) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS objective_progress (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 objective_id TEXT NOT NULL,
 evidence_count INTEGER NOT NULL DEFAULT 0,
 achieved INTEGER NOT NULL DEFAULT 0,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(class_id,student_id,objective_id),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS submissions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 module_id TEXT,
 activity_id TEXT,
 mission_id TEXT,
 kind TEXT NOT NULL,
 text_value TEXT,
 url_value TEXT,
 stored_path TEXT,
 original_name TEXT,
 mime_type TEXT,
 size_bytes INTEGER,
 review_status TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN ('pending','approved','revise','reviewed')),
 review_score REAL,
 review_max_score REAL,
 review_feedback TEXT NOT NULL DEFAULT '',
 rubric_json TEXT NOT NULL DEFAULT '{}',
 reviewed_by INTEGER,
 reviewed_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS achievements (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 achievement_key TEXT NOT NULL,
 title TEXT NOT NULL,
 metadata_json TEXT NOT NULL DEFAULT '{}',
 awarded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(class_id,student_id,achievement_key),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS attendance (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_session_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'present' CHECK(status IN ('present','late','absent','excused','left_early')),
 note TEXT NOT NULL DEFAULT '',
 noted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(class_session_id,student_id),
 FOREIGN KEY(class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS activity_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER,
 user_id INTEGER,
 event_type TEXT NOT NULL,
 entity_type TEXT,
 entity_id TEXT,
 payload_json TEXT NOT NULL DEFAULT '{}',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE SET NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS settings (
 key TEXT PRIMARY KEY,
 value_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS staff_roles (
 user_id INTEGER PRIMARY KEY,
 staff_role TEXT NOT NULL DEFAULT 'trainer' CHECK(staff_role IN ('administrator','trainer','assistant')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS class_trainers (
 class_id INTEGER NOT NULL,
 user_id INTEGER NOT NULL,
 assignment_role TEXT NOT NULL DEFAULT 'trainer' CHECK(assignment_role IN ('lead','trainer','assistant')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(class_id,user_id),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS account_controls (
 user_id INTEGER PRIMARY KEY,
 must_change_password INTEGER NOT NULL DEFAULT 0,
 last_password_reset_at TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS class_lifecycle (
 class_id INTEGER PRIMARY KEY,
 lifecycle_status TEXT NOT NULL DEFAULT 'draft' CHECK(lifecycle_status IN ('draft','scheduled','active','completed','archived')),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS report_snapshots (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 scope_type TEXT NOT NULL CHECK(scope_type IN ('course','class','student','trainer')),
 scope_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 payload_json TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_class_time ON activity_events(class_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_instance ON responses(instance_id);
CREATE INDEX IF NOT EXISTS idx_team_responses_instance ON team_responses(instance_id);
CREATE INDEX IF NOT EXISTS idx_objective_progress_student ON objective_progress(class_id,student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
`);
    this.migrateV2();
    this.migrateOne();
    migrateWorkspace(this.db);
  }
  migrateV2(){
    const cols=(table)=>this.db.prepare(`PRAGMA table_info(${table})`).all().map(r=>r.name);
    const tableSql=(table)=>this.db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table)?.sql||'';
    const addCol=(table,def)=>{ const name=def.trim().split(/\s+/)[0]; if(!cols(table).includes(name)) this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${def}`); };
    // v1.2 administrator becomes v2 super administrator. Rebuild to widen the CHECK safely.
    if(tableSql('staff_roles') && !tableSql('staff_roles').includes('super_admin')){
      this.db.exec('PRAGMA foreign_keys=OFF');
      this.db.exec(`ALTER TABLE staff_roles RENAME TO staff_roles_v12;
CREATE TABLE staff_roles (
 user_id INTEGER PRIMARY KEY,
 staff_role TEXT NOT NULL DEFAULT 'trainer' CHECK(staff_role IN ('super_admin','administrator','trainer','assistant')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO staff_roles(user_id,staff_role,created_at,updated_at) SELECT user_id,CASE WHEN staff_role='administrator' THEN 'super_admin' ELSE staff_role END,created_at,updated_at FROM staff_roles_v12;
DROP TABLE staff_roles_v12;`);
      this.db.exec('PRAGMA foreign_keys=ON');
    }
    addCol('course_versions','parent_version_id INTEGER');
    addCol('course_versions',"schema_version TEXT NOT NULL DEFAULT '1.1'");
    addCol('course_versions',"updated_at TEXT");
    addCol('courses',"archived_at TEXT");
    addCol('classes',"timezone TEXT NOT NULL DEFAULT ''");
    addCol('users',"preferred_language TEXT");
    addCol('users',"last_login_at TEXT");
    this.db.exec(`
CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS permission_grants (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, resource_type TEXT NOT NULL, resource_id TEXT NOT NULL DEFAULT '*', action TEXT NOT NULL, granted_by INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id,resource_type,resource_id,action), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(granted_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS notifications (
 id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER, scope_type TEXT NOT NULL CHECK(scope_type IN ('user','class','course','system')), scope_id TEXT, title TEXT NOT NULL, body TEXT NOT NULL, priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('low','normal','high')), link_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, expires_at TEXT,
 FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS notification_receipts (
 notification_id INTEGER NOT NULL, user_id INTEGER NOT NULL, read_at TEXT, PRIMARY KEY(notification_id,user_id), FOREIGN KEY(notification_id) REFERENCES notifications(id) ON DELETE CASCADE, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS consents (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, consent_key TEXT NOT NULL, granted INTEGER NOT NULL DEFAULT 0, policy_version TEXT NOT NULL DEFAULT '1.0', recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id,consent_key), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS participant_runtime_state (
 class_id INTEGER NOT NULL, student_id INTEGER NOT NULL, module_id TEXT, path_id TEXT, activity_id TEXT, step_index INTEGER NOT NULL DEFAULT 0, step_total INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','working','need_help','finished')), progress_json TEXT NOT NULL DEFAULT '{}', started_at TEXT, finished_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(class_id,student_id), FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE, FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS help_requests (
 id INTEGER PRIMARY KEY AUTOINCREMENT, class_id INTEGER NOT NULL, student_id INTEGER NOT NULL, module_id TEXT, path_id TEXT, activity_id TEXT, step_index INTEGER, message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','helping','resolved')), requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, helping_at TEXT, resolved_at TEXT, resolved_by INTEGER, FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE, FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(resolved_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS class_workflow_progress (
 class_id INTEGER NOT NULL, module_id TEXT NOT NULL, node_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('current','completed','skipped')), selected_next_node_id TEXT, started_at TEXT, completed_at TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_by INTEGER,
 PRIMARY KEY(class_id,module_id,node_id), FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE, FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS course_draft_snapshots (
 id INTEGER PRIMARY KEY AUTOINCREMENT, course_version_id INTEGER NOT NULL, revision INTEGER NOT NULL, content_json TEXT NOT NULL, saved_by INTEGER, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(course_version_id,revision), FOREIGN KEY(course_version_id) REFERENCES course_versions(id) ON DELETE CASCADE, FOREIGN KEY(saved_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_permission_grants_user ON permission_grants(user_id,resource_type,resource_id);
CREATE INDEX IF NOT EXISTS idx_help_class_status ON help_requests(class_id,status,requested_at);
CREATE INDEX IF NOT EXISTS idx_runtime_class_status ON participant_runtime_state(class_id,status);
CREATE INDEX IF NOT EXISTS idx_workflow_progress_class ON class_workflow_progress(class_id,module_id,status);
CREATE INDEX IF NOT EXISTS idx_notifications_scope ON notifications(scope_type,scope_id,created_at DESC);
`);
    this.db.prepare(`INSERT INTO schema_meta(key,value) VALUES('baseline_schema','2.1') ON CONFLICT(key) DO NOTHING`).run();
  }
  migrateOne(){
    const cols=(table)=>this.db.prepare(`PRAGMA table_info(${table})`).all().map(r=>r.name);
    const tableSql=(table)=>this.db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table)?.sql||'';
    const addCol=(table,def)=>{ const name=def.trim().split(/\s+/)[0]; if(!cols(table).includes(name)) this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${def}`); };
    const hasTable=(table)=>!!this.db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(table);

    // Professional Core / ONE is an additive migration from the accepted v2.1.1 database.
    addCol('sessions',"expires_at TEXT");
    addCol('sessions',"device_label TEXT NOT NULL DEFAULT ''");
    addCol('sessions',"user_agent TEXT NOT NULL DEFAULT ''");
    addCol('sessions',"ip_address TEXT NOT NULL DEFAULT ''");
    addCol('sessions',"rotated_at TEXT");
    addCol('classes',"join_code TEXT");
    addCol('classes',"join_policy TEXT NOT NULL DEFAULT 'enrolled_only'");
    addCol('classes',"projector_theme TEXT");
    addCol('attendance',"note TEXT NOT NULL DEFAULT ''");
    addCol('submissions',"review_status TEXT NOT NULL DEFAULT 'pending'");
    addCol('submissions',"review_score REAL");
    addCol('submissions',"review_max_score REAL");
    addCol('submissions',"review_feedback TEXT NOT NULL DEFAULT ''");
    addCol('submissions',"rubric_json TEXT NOT NULL DEFAULT '{}'");
    addCol('submissions',"reviewed_by INTEGER");
    addCol('submissions',"reviewed_at TEXT");
    addCol('course_assets',"updated_at TEXT");
    addCol('classroom_state',"updated_by INTEGER");
    addCol('participant_runtime_state',"revision INTEGER NOT NULL DEFAULT 1");
    addCol('class_sessions',"notes TEXT NOT NULL DEFAULT ''");

    // v2.1.1 attendance CHECK cannot be widened with ALTER TABLE, rebuild without deleting data.
    const attSql=tableSql('attendance');
    if(attSql && !attSql.includes("left_early")){
      this.db.exec('PRAGMA foreign_keys=OFF');
      this.db.exec(`ALTER TABLE attendance RENAME TO attendance_v211;
CREATE TABLE attendance (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_session_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'present' CHECK(status IN ('present','late','absent','excused','left_early')),
 note TEXT NOT NULL DEFAULT '',
 noted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(class_session_id,student_id),
 FOREIGN KEY(class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO attendance(id,class_session_id,student_id,status,note,noted_at)
 SELECT id,class_session_id,student_id,status,COALESCE(note,''),noted_at FROM attendance_v211;
DROP TABLE attendance_v211;`);
      this.db.exec('PRAGMA foreign_keys=ON');
    }

    this.db.exec(`
CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_join_code ON classes(join_code) WHERE join_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_user_seen ON sessions(user_id,last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_review ON submissions(class_id,review_status,created_at DESC);

CREATE TABLE IF NOT EXISTS consent_history (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 consent_key TEXT NOT NULL,
 granted INTEGER NOT NULL CHECK(granted IN (0,1)),
 policy_version TEXT NOT NULL DEFAULT '1.0',
 changed_by INTEGER,
 source TEXT NOT NULL DEFAULT 'profile',
 changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(changed_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_consent_history_user ON consent_history(user_id,consent_key,changed_at DESC);

CREATE TABLE IF NOT EXISTS saved_views (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER NOT NULL,
 surface TEXT NOT NULL,
 name TEXT NOT NULL,
 query_json TEXT NOT NULL DEFAULT '{}',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id,surface,name),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS login_attempts (
 username TEXT PRIMARY KEY COLLATE NOCASE,
 failure_count INTEGER NOT NULL DEFAULT 0,
 first_failure_at TEXT,
 last_failure_at TEXT,
 blocked_until TEXT
);

CREATE TABLE IF NOT EXISTS projector_pairs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 token_hash TEXT NOT NULL UNIQUE,
 label TEXT NOT NULL DEFAULT 'Projector',
 created_by INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 expires_at TEXT NOT NULL,
 revoked_at TEXT,
 last_seen TEXT,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_projector_pairs_class ON projector_pairs(class_id,expires_at);

CREATE TABLE IF NOT EXISTS authoring_templates (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 course_id INTEGER,
 template_type TEXT NOT NULL,
 name TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 content_json TEXT NOT NULL,
 is_system INTEGER NOT NULL DEFAULT 0,
 created_by INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(course_id,template_type,name),
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rubrics (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 course_id INTEGER,
 title TEXT NOT NULL,
 definition_json TEXT NOT NULL DEFAULT '{}',
 created_by INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS certificates (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 verification_code TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 metadata_json TEXT NOT NULL DEFAULT '{}',
 issued_by INTEGER,
 issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 revoked_at TEXT,
 UNIQUE(class_id,student_id),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(issued_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_prerequisites (
 course_id INTEGER NOT NULL,
 prerequisite_course_id INTEGER NOT NULL,
 required_status TEXT NOT NULL DEFAULT 'completed',
 PRIMARY KEY(course_id,prerequisite_course_id),
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY(prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS class_waitlist (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','offered','enrolled','withdrawn')),
 position INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(class_id,student_id),
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_surveys (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 definition_json TEXT NOT NULL DEFAULT '{}',
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed')),
 created_by INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS survey_responses (
 survey_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 response_json TEXT NOT NULL,
 submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(survey_id,student_id),
 FOREIGN KEY(survey_id) REFERENCES course_surveys(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_banks (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 course_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 settings_json TEXT NOT NULL DEFAULT '{}',
 created_by INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS question_bank_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bank_id INTEGER NOT NULL,
 question_type TEXT NOT NULL CHECK(question_type IN ('single_choice','multiple_choice','true_false','short_answer','numeric_answer')),
 prompt TEXT NOT NULL,
 options_json TEXT NOT NULL DEFAULT '[]',
 answer_json TEXT NOT NULL DEFAULT '{}',
 explanation TEXT NOT NULL DEFAULT '',
 tags_json TEXT NOT NULL DEFAULT '[]',
 difficulty TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy','medium','hard')),
 points REAL NOT NULL DEFAULT 1,
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_question_bank_items_bank ON question_bank_items(bank_id,active,difficulty);

CREATE TABLE IF NOT EXISTS class_quizzes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 class_id INTEGER NOT NULL,
 bank_id INTEGER NOT NULL,
 title TEXT NOT NULL,
 question_count INTEGER NOT NULL DEFAULT 5,
 random_seed TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed')),
 created_by INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
 quiz_id INTEGER NOT NULL,
 student_id INTEGER NOT NULL,
 questions_json TEXT NOT NULL DEFAULT '[]',
 answers_json TEXT NOT NULL DEFAULT '{}',
 score REAL,
 max_score REAL,
 submitted_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(quiz_id,student_id),
 FOREIGN KEY(quiz_id) REFERENCES class_quizzes(id) ON DELETE CASCADE,
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learner_transcript_entries (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 student_id INTEGER NOT NULL,
 class_id INTEGER NOT NULL,
 course_id INTEGER NOT NULL,
 course_version_id INTEGER NOT NULL,
 completion_status TEXT NOT NULL DEFAULT 'in_progress' CHECK(completion_status IN ('in_progress','completed','withdrawn')),
 completion_percent REAL NOT NULL DEFAULT 0,
 final_score REAL,
 completed_at TEXT,
 metadata_json TEXT NOT NULL DEFAULT '{}',
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(student_id,class_id),
 FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
 FOREIGN KEY(course_version_id) REFERENCES course_versions(id)
);
CREATE TABLE IF NOT EXISTS class_delivery_settings (
 class_id INTEGER PRIMARY KEY,
 delivery_mode TEXT NOT NULL DEFAULT 'trainer_paced' CHECK(delivery_mode IN ('trainer_paced','participant_paced','front_of_room')),
 guest_participation INTEGER NOT NULL DEFAULT 0,
 guest_limit INTEGER NOT NULL DEFAULT 30,
 updated_by INTEGER,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,
 FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_class_delivery_mode ON class_delivery_settings(delivery_mode);
CREATE INDEX IF NOT EXISTS idx_transcript_student ON learner_transcript_entries(student_id,updated_at DESC);
`);

    // Seed professional policies only when the installation has no explicit owner choice.
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('security_policy',?)").run(JSON.stringify({session_idle_minutes:720,max_sessions_per_user:3,login_failure_limit:5,login_block_minutes:15,password_min_length:8}));
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('backup_policy',?)").run(JSON.stringify({retention_count:12,auto_backup_on_restore:true,verify_after_create:true,auto_enabled:true,interval_hours:24}));
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('live_policy',?)").run(JSON.stringify({allow_multiple_live_classes:true,projector_pair_hours:8}));
    this.db.prepare(`INSERT INTO schema_meta(key,value) VALUES('core_schema',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(CORE_SCHEMA_VERSION);
    this.db.prepare(`INSERT INTO schema_meta(key,value) VALUES('app_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(APP_VERSION);
  }

  seedBase(){
    const trainer=this.db.prepare("SELECT id FROM users WHERE role='trainer' ORDER BY id LIMIT 1").get();
    if(!trainer){
      const info=this.db.prepare('INSERT INTO users(username,password_hash,role,display_name,is_demo) VALUES(?,?,?,?,0)')
        .run('TRAINER',hashPassword('TRAIN1234'),'trainer','Trainer');
      this.db.prepare('INSERT OR IGNORE INTO profiles(user_id,profile_json) VALUES(?,?)').run(Number(info.lastInsertRowid),'{}');
    }
    const primaryTrainer=this.db.prepare("SELECT id FROM users WHERE role='trainer' ORDER BY id LIMIT 1").get();
    if(primaryTrainer){ const existing=this.db.prepare('SELECT staff_role FROM staff_roles WHERE user_id=?').get(primaryTrainer.id); if(!existing)this.db.prepare("INSERT INTO staff_roles(user_id,staff_role) VALUES(?, 'super_admin')").run(primaryTrainer.id); else if(existing.staff_role==='administrator')this.db.prepare("UPDATE staff_roles SET staff_role='super_admin',updated_at=CURRENT_TIMESTAMP WHERE user_id=?").run(primaryTrainer.id); }
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('brand',?)").run(JSON.stringify({name:'Training Engine ONE'}));
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('ui',?)").run(JSON.stringify({language:'en',theme:'system'}));
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('typography',?)").run(JSON.stringify({ui:{ar:'Tahoma, Arial, sans-serif',en:'Inter, Arial, sans-serif'},presentation:{ar:'Tahoma, Arial, sans-serif',en:'Inter, Arial, sans-serif'},title:{ar:'Tahoma, Arial, sans-serif',en:'Inter, Arial, sans-serif'},body:{ar:'Tahoma, Arial, sans-serif',en:'Inter, Arial, sans-serif'}}));
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('profile_requirements',?)").run(JSON.stringify({required:['full_name_ar','full_name_en','email','mobile'],optional:['whatsapp','telegram','organization','specialty','job_title','city','country','linkedin','website','interests','learning_goals','profile_photo']}));
    this.db.prepare("INSERT OR IGNORE INTO settings(key,value_json) VALUES('projector_control_key',?)").run(JSON.stringify(crypto.randomBytes(24).toString('hex')));
    this.seedDemo();
  }
  seedDemo(){
    const exists=this.db.prepare("SELECT COUNT(*) c FROM courses WHERE is_demo=1").get().c;
    if(exists) return;
    const trainer=this.db.prepare("SELECT id FROM users WHERE role='trainer' ORDER BY id LIMIT 1").get();
    const students=[];
    for(let i=1;i<=8;i++){
      const username=`DEMO${String(i).padStart(2,'0')}`;
      let u=this.db.prepare('SELECT id FROM users WHERE username=?').get(username);
      if(!u){
        const r=this.db.prepare('INSERT INTO users(username,password_hash,role,display_name,is_demo) VALUES(?,?,?,?,1)')
          .run(username,hashPassword(`D${1000+i}`),'student',`Demo Student ${i}`);
        u={id:Number(r.lastInsertRowid)};
        this.db.prepare('INSERT OR IGNORE INTO profiles(user_id,profile_json) VALUES(?,?)').run(u.id,JSON.stringify({role:'Student',organization:'Demo University',specialty:i%2?'Business':'Engineering',ai_experience:'Beginner'}));
      }
      students.push(u.id);
    }
    const demoContent={
      format:'training-engine-course',schema_version:'1.0',
      course:{id:'demo-course',title:'Interactive Learning Demo',subtitle:'A reusable live-classroom sample',description:'Demonstrates the Training Engine without tying it to a specific subject.',language:'en',direction:'ltr',duration_minutes:90,objectives:['Experience live interaction','Complete a short mission'],modules:[
        {id:'welcome',title:'Welcome & Interaction',duration_minutes:45,objectives:['Participate in live activities'],activities:[
          {id:'welcome-scene',type:'presentation',title:'Welcome',content:{heading:'Welcome to the class',body_md:'Your trainer controls the shared experience while your device becomes interactive when needed.'}},
          {id:'quick-poll',type:'poll',title:'Quick pulse',content:{question:'How ready do you feel to start?',options:['Ready','Curious','Need a minute']},results_display:'horizontal_bar'},
          {id:'short-answer',type:'short_answer',title:'One thought',content:{question:'What would make this session valuable for you?',placeholder:'Write a short answer…'}},
          {id:'confidence',type:'rating',title:'Confidence check',content:{question:'How confident do you feel right now?',min:1,max:5,min_label:'Not yet',max_label:'Very confident'},results_display:'bar'}
        ],missions:[
          {id:'first-mission',title:'First Practice Mission',goal:'Complete a small guided task and reflect on it.',estimated_minutes:10,steps:[{title:'Choose a small task',body_md:'Pick something you can complete in a few minutes.'},{title:'Do it',body_md:'Use the tool or method suggested by your trainer.'},{title:'Reflect',body_md:'Write one sentence about what changed.'}],submission:{type:'text',prompt:'What did you learn?'},completion:{required:true},score:{completion:10}}
        ]}
      ]}
    };
    const courseInfo=this.db.prepare('INSERT INTO courses(slug,title,description,language,direction,is_demo) VALUES(?,?,?,?,?,1)')
      .run('interactive-learning-demo',demoContent.course.title,demoContent.course.description,'en','ltr');
    const courseId=Number(courseInfo.lastInsertRowid);
    const contentJson=JSON.stringify(demoContent);
    const versionInfo=this.db.prepare('INSERT INTO course_versions(course_id,version,status,content_json,checksum,is_demo) VALUES(?,?,?,?,?,1)')
      .run(courseId,'1.0','published',contentJson,'demo');
    const versionId=Number(versionInfo.lastInsertRowid);
    const today=new Date(); const start=today.toISOString().slice(0,10); const end=start;
    const classInfo=this.db.prepare('INSERT INTO classes(course_version_id,title,start_date,end_date,start_time,end_time,location,capacity,trainer_id,status,is_demo) VALUES(?,?,?,?,?,?,?,?,?,?,1)')
      .run(versionId,'Demo Class',start,end,'10:00','11:30','Training Room',20,trainer?.id||null,'planned');
    const classId=Number(classInfo.lastInsertRowid);
    this.db.prepare("INSERT OR IGNORE INTO class_lifecycle(class_id,lifecycle_status) VALUES(?, 'scheduled')").run(classId);
    if(trainer?.id) this.db.prepare("INSERT OR IGNORE INTO class_trainers(class_id,user_id,assignment_role) VALUES(?,?,'lead')").run(classId,trainer.id);
    this.db.prepare('INSERT OR IGNORE INTO class_sessions(class_id,title,session_date,start_time,end_time) VALUES(?,?,?,?,?)').run(classId,'Session 1',start,'10:00','11:30');
    for(const sid of students) this.db.prepare('INSERT OR IGNORE INTO enrollments(class_id,student_id) VALUES(?,?)').run(classId,sid);
    for(let t=1;t<=2;t++){
      const tr=this.db.prepare('INSERT INTO teams(class_id,name,is_demo) VALUES(?,?,1)').run(classId,`Team ${t}`);
      const teamId=Number(tr.lastInsertRowid);
      for(const sid of students.slice((t-1)*4,t*4)) this.db.prepare('INSERT OR IGNORE INTO team_members(team_id,student_id) VALUES(?,?)').run(teamId,sid);
    }
    this.db.prepare('INSERT OR IGNORE INTO classroom_state(class_id,phase,payload_json) VALUES(?,?,?)').run(classId,'waiting','{}');
    this.setSetting('active_class_id',classId);
  }
  setSetting(key,value){ this.db.prepare('INSERT INTO settings(key,value_json) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json').run(key,JSON.stringify(value)); }
  getSetting(key,fallback=null){ const r=this.db.prepare('SELECT value_json FROM settings WHERE key=?').get(key); return r?safeJsonParse(r.value_json,fallback):fallback; }
  log(classId,userId,eventType,entityType=null,entityId=null,payload={}){
    this.db.prepare('INSERT INTO activity_events(class_id,user_id,event_type,entity_type,entity_id,payload_json) VALUES(?,?,?,?,?,?)')
      .run(classId||null,userId||null,eventType,entityType,entityId==null?null:String(entityId),JSON.stringify(payload||{}));
  }
  removeDemo(){
    const tx=()=>this.transaction(()=>{
      this.db.prepare('DELETE FROM classes WHERE is_demo=1').run();
      this.db.prepare('DELETE FROM course_versions WHERE is_demo=1').run();
      this.db.prepare('DELETE FROM courses WHERE is_demo=1').run();
      this.db.prepare("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE is_demo=1)").run();
      this.db.prepare("DELETE FROM users WHERE is_demo=1").run();
      this.db.prepare("DELETE FROM settings WHERE key='active_class_id'").run();
    });
    tx();
  }
  transaction(fn){
    this.db.exec('BEGIN IMMEDIATE');
    try{ const out=fn(); this.db.exec('COMMIT'); return out; }
    catch(e){ try{this.db.exec('ROLLBACK');}catch{} throw e; }
  }
  checkpoint(){ try{this.db.exec('PRAGMA wal_checkpoint(FULL);');}catch{} }
}
