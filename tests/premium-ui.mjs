import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const pub=path.join(root,'app','public');
const pages={
  'admin.html':'one-app one-admin',
  'trainer.html':'one-app one-trainer',
  'student.html':'one-app one-student',
  'builder.html':'one-app one-builder',
  'live.html':'one-app one-live one-live-body',
  'present.html':'one-app one-present',
  'preview.html':'one-app one-builder one-preview',
  'certificate.html':'one-app one-student one-certificate'
};
for(const [file,classes] of Object.entries(pages)){
  const html=fs.readFileSync(path.join(pub,file),'utf8');
  assert.match(html,/href="\/one-ui\.css"/m,`${file} must load premium UI layer`);
  for(const c of classes.split(/\s+/))assert.match(html,new RegExp(`\\b${c}\\b`),`${file} missing ${c}`);
}
const css=fs.readFileSync(path.join(pub,'one-ui.css'),'utf8');
for(const token of ['--one-brand','--one-sidebar','--one-shadow-lg','--role','--primary'])assert.ok(css.includes(token),`missing design token ${token}`);
for(const selector of ['.one-admin','.one-trainer','.one-student','.one-builder','.one-live-body','.one-projector','.login-page','.side','.nav button.active'])assert.ok(css.includes(selector),`missing premium selector ${selector}`);
assert.match(css,/prefers-reduced-motion/,'reduced-motion support required');
assert.doesNotMatch(css,/https?:\/\//,'premium UI must remain local-first and not load remote assets');
for(const file of ['admin.js','trainer.js']){
  const js=fs.readFileSync(path.join(pub,file),'utf8');
  assert.match(js,/<svg viewBox=/,'desktop navigation must use local vector icons');
}
console.log('PREMIUM_UI_SYSTEM_PASS');
