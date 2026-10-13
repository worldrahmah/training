import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const trainer=fs.readFileSync(path.join(root,'app/public/trainer.js'),'utf8');
const css=fs.readFileSync(path.join(root,'app/public/styles.css'),'utf8');
const i18n=fs.readFileSync(path.join(root,'app/public/i18n.js'),'utf8');
const requiredTrainer=[
  'workflowModuleOpen',
  'workflowModuleStatus',
  'data-action="toggle-workflow-module"',
  'aria-expanded=',
  'workflow-group-body',
  "t('Jump to Current')",
  "t('Jump to Next')",
  'jumpToWorkflowNode',
  "n.status==='current'||n.status==='next'",
  "['completed','skipped'].includes(n.status)",
  'workflowExpanded'
];
for(const x of requiredTrainer)if(!trainer.includes(x))throw new Error(`Course Flow contract missing: ${x}`);
for(const x of ['.workflow-jumps{','.workflow-group-toggle{','.workflow-group-body{','@media(max-width:390px)'])if(!css.includes(x))throw new Error(`Course Flow CSS missing: ${x}`);
for(const x of ["'Jump to Current':'انتقل إلى الحالي'","'Jump to Next':'انتقل إلى التالي'"])if(!i18n.includes(x))throw new Error(`Course Flow Arabic translation missing: ${x}`);
console.log('COURSE_FLOW_UI_PASS');
