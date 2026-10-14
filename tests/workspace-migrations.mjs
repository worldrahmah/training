import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {EngineDb} from '../app/lib/db.mjs';
import {migrateWorkspace,WORKSPACE_MIGRATIONS} from '../app/lib/workspace-migrations.mjs';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'one-workspace-migrate-')),dbPath=path.join(temp,'data.sqlite'),storageDir=path.join(temp,'storage'),backupDir=path.join(temp,'backups');
try{
 fs.copyFileSync(path.join(import.meta.dirname,'fixtures/v211-populated.sqlite'),dbPath);fs.mkdirSync(storageDir);fs.writeFileSync(path.join(storageDir,'historical.txt'),'Accepted course assets');
 const initial=new DatabaseSync(dbPath),users=initial.prepare('SELECT id,username,display_name,password_hash FROM users ORDER BY id').all(),responses=initial.prepare('SELECT * FROM responses ORDER BY id').all();initial.close();
 let engine=new EngineDb(dbPath,{storageDir,backupDir});assert.ok(engine.upgradeBackup);assert.equal(engine.db.prepare('SELECT COUNT(*) n FROM schema_migrations').get().n,WORKSPACE_MIGRATIONS.length);assert.deepEqual(engine.db.prepare('SELECT id,username,display_name,password_hash FROM users ORDER BY id').all(),users);assert.deepEqual(engine.db.prepare('SELECT * FROM responses ORDER BY id').all(),responses);
 const backup=engine.upgradeBackup.path;assert.equal(fs.readFileSync(path.join(backup,'storage/historical.txt'),'utf8'),'Accepted course assets');
 for(const line of fs.readFileSync(path.join(backup,'SHA256SUMS.txt'),'utf8').trim().split('\n')){const [expected,file]=line.split('  ');assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(backup,file))).digest('hex'),expected)}
 const old=new DatabaseSync(path.join(backup,'training-engine.sqlite'),{readOnly:true});assert.deepEqual(old.prepare('SELECT id,username,display_name,password_hash FROM users ORDER BY id').all(),users);old.close();engine.close();
 engine=new EngineDb(dbPath,{storageDir,backupDir});assert.equal(engine.upgradeBackup,null);assert.equal(fs.readdirSync(backupDir).length,1);
 assert.throws(()=>migrateWorkspace(engine.db,[{version:'test-failure',sql:'CREATE TABLE incomplete_test(id INTEGER); INSERT INTO table_that_does_not_exist VALUES(1);'}]));assert.equal(engine.db.prepare("SELECT 1 FROM sqlite_master WHERE name='incomplete_test'").get(),undefined);assert.equal(engine.db.prepare("SELECT 1 FROM schema_migrations WHERE version='test-failure'").get(),undefined);
 assert.throws(()=>migrateWorkspace(engine.db,[{...WORKSPACE_MIGRATIONS[0],sql:WORKSPACE_MIGRATIONS[0].sql+'\n-- drift'}]),/checksum/);assert.equal(engine.db.prepare('PRAGMA foreign_key_check').all().length,0);engine.close();
 const rc7path=path.join(temp,'rc7.sqlite'),fixture=path.join(import.meta.dirname,'fixtures/rc1r7-populated.sqlite'),provenance=JSON.parse(fs.readFileSync(path.join(import.meta.dirname,'fixtures/rc1r7-populated.PROVENANCE.json')));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex'),provenance.fixture_sha256);fs.copyFileSync(fixture,rc7path);
 const prior=new DatabaseSync(rc7path),tables=['users','courses','course_versions','classes','enrollments','responses','profiles','activity_instances'],accepted=Object.fromEntries(tables.map(table=>[table,prior.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()]));prior.close();const upgraded=new EngineDb(rc7path,{storageDir,backupDir});assert.ok(upgraded.upgradeBackup);for(const table of tables)assert.deepEqual(upgraded.db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all(),accepted[table],table+' must survive RC1R7 upgrade');assert.equal(upgraded.db.prepare("SELECT ac.account_kind FROM users u JOIN account_controls ac ON ac.user_id=u.id WHERE u.username='DEMO08'").get().account_kind,'legacy_guest');assert.equal(upgraded.db.prepare('PRAGMA foreign_key_check').all().length,0);upgraded.close();
 console.log('WORKSPACE_MIGRATION_PASS populated v2.1.1 and exact RC1R7 fixture data/assets, legacy guest classification, verified pre-upgrade backup, journal checksums, repeat startup, atomic failure rollback and foreign keys');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
