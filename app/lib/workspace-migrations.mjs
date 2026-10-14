import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
export const WORKSPACE_MIGRATIONS=[{
  version:'one-workspace-0001',
  sql:`CREATE TABLE staff_roles_workspace (
    user_id INTEGER PRIMARY KEY,staff_role TEXT NOT NULL DEFAULT 'trainer' CHECK(staff_role IN ('super_admin','administrator','trainer','assistant','course_editor')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  INSERT INTO staff_roles_workspace SELECT user_id,staff_role,created_at,updated_at FROM staff_roles;
  DROP TABLE staff_roles;
  ALTER TABLE staff_roles_workspace RENAME TO staff_roles;
  CREATE TABLE workspace_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,kind TEXT NOT NULL CHECK(kind IN ('participants','staff')),name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',tags_json TEXT NOT NULL DEFAULT '[]',owner_id INTEGER NOT NULL,
    archived_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(owner_id) REFERENCES users(id));
  CREATE TABLE workspace_group_members (
    group_id INTEGER NOT NULL,user_id INTEGER NOT NULL,added_by INTEGER NOT NULL,added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(group_id,user_id),FOREIGN KEY(group_id) REFERENCES workspace_groups(id) ON DELETE CASCADE,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(added_by) REFERENCES users(id));
  CREATE TABLE class_join_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,class_id INTEGER NOT NULL,student_id INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','cancelled')),
    requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,decided_at TEXT,decided_by INTEGER,note TEXT NOT NULL DEFAULT '',revision INTEGER NOT NULL DEFAULT 1,
    UNIQUE(class_id,student_id),FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE,FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE,FOREIGN KEY(decided_by) REFERENCES users(id));
  CREATE TABLE profile_media (
    user_id INTEGER PRIMARY KEY,asset_key TEXT NOT NULL,mime_type TEXT NOT NULL,size_bytes INTEGER NOT NULL,sha256 TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE bulk_operation_previews (
    token TEXT PRIMARY KEY,actor_id INTEGER NOT NULL,operation TEXT NOT NULL,payload_json TEXT NOT NULL,source_sha256 TEXT NOT NULL,expires_at TEXT NOT NULL,applied_at TEXT,
    FOREIGN KEY(actor_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE INDEX idx_workspace_groups_owner ON workspace_groups(owner_id,kind,archived_at);
  CREATE INDEX idx_workspace_group_members_user ON workspace_group_members(user_id,group_id);
  CREATE INDEX idx_class_join_requests_status ON class_join_requests(class_id,status,requested_at);
  CREATE INDEX idx_class_join_requests_student ON class_join_requests(student_id,status);
  CREATE INDEX idx_bulk_operation_previews_expiry ON bulk_operation_previews(expires_at);
  INSERT INTO schema_meta(key,value) VALUES('workspace_schema','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value;`
},{version:'one-workspace-0002',sql:`CREATE TABLE archive_records (
  entity_type TEXT NOT NULL CHECK(entity_type IN ('course','class','participant','staff','group')),entity_id INTEGER NOT NULL,snapshot_json TEXT NOT NULL,archived_by INTEGER NOT NULL,archived_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,restored_at TEXT,
  PRIMARY KEY(entity_type,entity_id),FOREIGN KEY(archived_by) REFERENCES users(id));
  INSERT INTO schema_meta(key,value) VALUES('workspace_schema','2') ON CONFLICT(key) DO UPDATE SET value=excluded.value;`},{version:'one-workspace-0003',sql:`ALTER TABLE account_controls ADD COLUMN account_kind TEXT NOT NULL DEFAULT 'registered' CHECK(account_kind IN ('registered','legacy_guest'));
  INSERT INTO account_controls(user_id,account_kind) SELECT u.id,'legacy_guest' FROM users u WHERE u.role='student' AND EXISTS(SELECT 1 FROM activity_events e WHERE e.event_type='guest_joined' AND e.entity_type='student' AND CAST(e.entity_id AS INTEGER)=u.id) ON CONFLICT(user_id) DO UPDATE SET account_kind='legacy_guest';
  INSERT INTO schema_meta(key,value) VALUES('workspace_schema','3') ON CONFLICT(key) DO UPDATE SET value=excluded.value;`},{version:'one-workspace-0004',sql:`CREATE TABLE professional_report_snapshots (
  id TEXT PRIMARY KEY,owner_id INTEGER NOT NULL,template TEXT NOT NULL,resource_id INTEGER NOT NULL,data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,expires_at TEXT NOT NULL,exported_at TEXT,file_sha256 TEXT,
  FOREIGN KEY(owner_id) REFERENCES users(id));
  CREATE INDEX idx_professional_reports_owner ON professional_report_snapshots(owner_id,created_at);
  INSERT INTO schema_meta(key,value) VALUES('workspace_schema','4') ON CONFLICT(key) DO UPDATE SET value=excluded.value;`}];
export function workspaceMigrationPending(db){
  if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_migrations'").get())return true;
  return WORKSPACE_MIGRATIONS.some(m=>!db.prepare('SELECT 1 FROM schema_migrations WHERE version=?').get(m.version));
}
export function protectWorkspaceUpgrade(db,{dbPath,storageDir,backupDir}){
  if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'").get()||!workspaceMigrationPending(db))return null;
  const name=`upgrade_${new Date().toISOString().replace(/[-:.]/g,'')}_${crypto.randomBytes(4).toString('hex')}`,base=backupDir||path.join(path.dirname(dbPath),'upgrade-backups'),stage=path.join(base,'.'+name),dest=path.join(base,name);
  if(storageDir&&(path.resolve(base)===path.resolve(storageDir)||path.resolve(base).startsWith(path.resolve(storageDir)+path.sep)))throw new Error('Upgrade backups must be outside the active storage directory.');
  fs.mkdirSync(stage,{recursive:true});const snapshot=path.join(stage,'training-engine.sqlite');
  try{
    db.prepare('VACUUM INTO ?').run(snapshot);
    const verify=new DatabaseSync(snapshot,{readOnly:true});try{const row=verify.prepare('PRAGMA integrity_check').get();if(Object.values(row)[0]!=='ok')throw new Error('Pre-upgrade database integrity failed.')}finally{verify.close()}
    const files=['training-engine.sqlite'];
    function copyTree(src,relative){fs.mkdirSync(path.join(stage,relative),{recursive:true});for(const item of fs.readdirSync(src,{withFileTypes:true})){if(item.isSymbolicLink())throw new Error('Upgrade backup cannot follow symbolic storage links.');const rel=relative+'/'+item.name,p=path.join(src,item.name);if(item.isDirectory())copyTree(p,rel);else if(item.isFile()){fs.copyFileSync(p,path.join(stage,rel));files.push(rel)}}}
    if(storageDir&&fs.existsSync(storageDir))copyTree(storageDir,'storage');else fs.mkdirSync(path.join(stage,'storage'));
    const manifest={name,created_at:new Date().toISOString(),app_name:'Training Engine ONE',reason:'pre-workspace-upgrade',database_sha256:digest(fs.readFileSync(snapshot)),storage_file_count:files.length-1,verification:{ok:true},workspace_migrations:WORKSPACE_MIGRATIONS.map(m=>m.version)};
    fs.writeFileSync(path.join(stage,'manifest.json'),JSON.stringify(manifest,null,2));files.push('manifest.json');
    const sums=files.sort().map(file=>`${digest(fs.readFileSync(path.join(stage,file)))}  ${file}`).join('\n')+'\n';fs.writeFileSync(path.join(stage,'SHA256SUMS.txt'),sums);
    for(const line of sums.trim().split('\n')){const [expected,file]=line.split('  ');if(digest(fs.readFileSync(path.join(stage,file)))!==expected)throw new Error('Pre-upgrade backup checksum failed.');}
    fs.renameSync(stage,dest);return {name,path:dest};
  }catch(error){fs.rmSync(stage,{recursive:true,force:true});throw error;}
}
export function migrateWorkspace(db,migrations=WORKSPACE_MIGRATIONS){
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY,checksum TEXT NOT NULL,applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  for(const migration of migrations){
    const checksum=digest(migration.sql),accepted=db.prepare('SELECT checksum FROM schema_migrations WHERE version=?').get(migration.version);
    if(accepted){if(accepted.checksum!==checksum)throw new Error('Accepted workspace migration checksum has changed: '+migration.version);continue;}
    db.exec('BEGIN IMMEDIATE');try{db.exec(migration.sql);if(db.prepare('PRAGMA foreign_key_check').all().length)throw new Error('Workspace migration foreign-key verification failed.');db.prepare('INSERT INTO schema_migrations(version,checksum) VALUES(?,?)').run(migration.version,checksum);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}
  }
}
