import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {verifyPassword} from './utils.mjs';
// Only disposable QA installations may opt into historical fixture credentials.
export const testAccountsEnabled=()=>process.env.TRAINING_ENGINE_TEST_ACCOUNTS==='1';
export function knownDefaultPassword(user){
 if(String(user.username).toUpperCase()==='TRAINER')return 'TRAIN1234';
 const match=/^DEMO(0[1-8])$/i.exec(user.username);return match?`D${1000+Number(match[1])}`:null;
}
export function isKnownDefault(user){const password=knownDefaultPassword(user);return !!password&&verifyPassword(password,user.password_hash)}
export function initialAdministrator(dbPath){
 if(testAccountsEnabled())return 'TRAIN1234';
 const password=crypto.randomBytes(24).toString('base64url');
 // Never log or distribute this local operator-only credential. Refuse to overwrite.
 fs.writeFileSync(path.join(path.dirname(dbPath),'INITIAL_ADMIN_PASSWORD.txt'),`Training Engine ONE — initial local administrator\nUsername: TRAINER\nPassword: ${password}\nSign in locally, change this password, then securely delete this file.\n`,{mode:0o600,flag:'wx'});
 return password;
}
export function protectDefaultAccounts(engine){
 if(testAccountsEnabled())return;
 engine.transaction(()=>{
  for(const user of engine.db.prepare("SELECT id,username,password_hash FROM users WHERE username='TRAINER' COLLATE NOCASE OR username GLOB 'DEMO0[1-8]'").all()){
   if(!isKnownDefault(user))continue;
   engine.db.prepare('INSERT INTO account_controls(user_id,must_change_password) VALUES(?,1) ON CONFLICT(user_id) DO UPDATE SET must_change_password=1').run(user.id);
   engine.db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
  }
 });
}
export function localPeer(req){return ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket?.remoteAddress)}
