import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const page of ['admin','trainer','student','present','builder','live']){
  const html=read(`app/public/${page}.html`);
  assert.match(html,/name="viewport"[^>]+width=device-width/,`${page}: viewport missing`);
  assert.match(html,new RegExp(`/${page}\\.js`),`${page}: dedicated script missing`);
}
const live=read('app/public/live.js');
for(const term of ['Course Flow','Participants','Help Queue','Review','Random picker','Projector','Live time','Planned remaining']) assert.ok(live.includes(term),`live console missing ${term}`);
for(const forbidden of ['Reports & history','User administration','System backups','Course Builder']) assert.ok(!live.includes(forbidden),`live console must not expose dashboard workspace: ${forbidden}`);
assert.ok(live.includes('classId=Number(params.get(\'class_id\')'), 'live console must be bound to exactly one class context');
const presenter=read('app/public/present.js');
assert.ok(!presenter.includes('User administration'),'projector must not contain administration UI');
assert.ok(!presenter.includes('Reports & history'),'projector must not contain trainer reporting UI');
const trainer=read('app/public/trainer.js');
assert.ok(trainer.includes('/live?class_id='),'trainer workspace must open a dedicated live-class surface');
const student=read('app/public/student.js');
assert.ok(student.includes('/api/student/join'),'student surface must own class joining');
const admin=read('app/public/admin.js');
assert.ok(admin.includes('Super Admin'),'admin surface must be explicit');
console.log('ROLE_SURFACES_PASS');
