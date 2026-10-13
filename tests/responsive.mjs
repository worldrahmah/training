import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('app/public/styles.css');
const required=[
  '@media(max-width:980px)',
  '@media(max-width:760px)',
  '@media(max-width:480px)',
  '@media(max-width:340px)',
  '@media(max-height:520px) and (orientation:landscape)',
  '.form-grid .span-2{grid-column:1/-1}',
  '.modal.wide{width:min(980px,100%)}',
  '.table-wrap,.workflow-canvas,.builder-tabs{max-width:100%',
  '.mobile-menu-list{display:grid',
  '.student-hero{min-height:270px',
  '.tree-node-actions{grid-template-columns:repeat(2,minmax(0,1fr))}',
  '.projector{height:100vh',
  '.projector-safe-frame{width:min(100%,calc(92vh * 16 / 9))'
];
for(const x of required){if(!css.includes(x))throw new Error(`Responsive contract missing: ${x}`)}
for(const file of ['admin.html','trainer.html','student.html','present.html','builder.html','preview.html']){
  const html=read(`app/public/${file}`);
  if(!/name="viewport"[^>]+width=device-width/.test(html))throw new Error(`${file}: viewport meta missing`);
}
const admin=read('app/public/admin.js'),trainer=read('app/public/trainer.js');
for(const [name,src] of [['admin',admin],['trainer',trainer]]){
  if(!src.includes('data-action="mobile-more"'))throw new Error(`${name}: responsive More navigation missing`);
  if(!src.includes('showMobileMenu'))throw new Error(`${name}: mobile navigation sheet missing`);
}
// Only locally scrollable data/workflow regions may intentionally exceed narrow viewports.
if(!css.includes('.table-wrap{overflow:auto') && !css.includes('.table-wrap,.workflow-canvas'))throw new Error('Tables do not have a local overflow container');
if(!css.includes('.workflow-canvas{overflow:auto'))throw new Error('Workflow canvas does not have local horizontal scrolling');
console.log('RESPONSIVE_UI_PASS');
