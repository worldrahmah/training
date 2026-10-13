import assert from 'node:assert/strict';
import {validateCourseObject} from '../app/lib/course-package.mjs';

function courseWith(workflow,{activities=[],paths=[],missions=[]}={}){
  return {format:'training-engine-course',schema_version:'2.0',course:{id:'wf-validation',title:'Workflow validation',language:'en',direction:'ltr',modules:[{id:'m1',title:'M1',activities,missions,paths,workflow}]}};
}
function errorsOf(workflow,parts){return validateCourseObject(courseWith(workflow,parts)).errors.join('\n');}
function assertInvalid(workflow,parts,pattern){const r=validateCourseObject(courseWith(workflow,parts));assert.equal(r.ok,false,'expected invalid workflow');assert.match(r.errors.join('\n'),pattern);}

const valid={start_node_id:'intro',nodes:[
  {id:'intro',type:'trainer_scene'},
  {id:'practice',type:'practice_start'},
  {id:'a',type:'participant_path',path_id:'a'},
  {id:'b',type:'participant_path',path_id:'b'},
  {id:'join',type:'convergence'},
  {id:'close',type:'closing'}
],edges:[
  {from:'intro',to:'practice',scope:'class'},
  {from:'practice',to:'a',scope:'participant',condition:{path_id:'a'}},
  {from:'practice',to:'b',scope:'participant',condition:{path_id:'b'}},
  {from:'a',to:'join',scope:'participant'},
  {from:'b',to:'join',scope:'participant'},
  {from:'join',to:'close',scope:'class'}
]};
const parts={paths:[
  {id:'a',title:'A',steps:[{id:'a1',title:'A1',completion:{type:'acknowledge'}}]},
  {id:'b',title:'B',steps:[{id:'b1',title:'B1',completion:{type:'acknowledge'}}]}
]};
let r=validateCourseObject(courseWith(valid,parts));
assert.equal(r.ok,true,r.errors.join('\n'));

assertInvalid({...valid,start_node_id:''},parts,/requires exactly one start_node_id/);
assertInvalid({...valid,nodes:[...valid.nodes,{id:'orphan',type:'closing'}]},parts,/orphaned\/unreachable/);
assertInvalid({...valid,edges:valid.edges.filter(e=>e.from!=='intro')},parts,/non-terminal dead end/);
assertInvalid({...valid,nodes:valid.nodes.map(n=>n.id==='a'?{...n,path_id:'missing'}:n)},parts,/missing participant path/);
assertInvalid({...valid,edges:valid.edges.filter(e=>!(e.from==='a'&&e.to==='join'))},parts,/participant path node a must converge/);
assertInvalid({start_node_id:'x',nodes:[{id:'x',type:'trainer_scene'},{id:'y',type:'trainer_scene'}],edges:[{from:'x',to:'y',scope:'class'},{from:'y',to:'x',scope:'class'}]}, {}, /requires at least one recognizable terminal node|cannot reach a terminal node/);
assertInvalid({start_node_id:'branch',nodes:[{id:'branch',type:'trainer_scene'},{id:'a',type:'closing'},{id:'b',type:'closing'}],edges:[{from:'branch',to:'a',scope:'class'},{from:'branch',to:'b',scope:'class'}]}, {}, /requires an explicit condition/);

// Accepted v2.0 compatibility: a final convergence node is recognized as a
// terminal when older packages did not yet carry terminal:true.
r=validateCourseObject(courseWith({start_node_id:'start',nodes:[{id:'start',type:'trainer_scene'},{id:'join',type:'convergence'}],edges:[{from:'start',to:'join',scope:'class'}]}));
assert.equal(r.ok,true,r.errors.join('\n'));

console.log('WORKFLOW_VALIDATION_PASS');
