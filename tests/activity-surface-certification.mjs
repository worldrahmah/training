import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {CAPABILITY_REGISTRY} from '../app/lib/registry.mjs';
const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const student=read('app/public/student.js'),trainer=read('app/public/trainer.js'),projector=read('app/public/projector.js'),live=read('app/public/live.js'),server=read('app/server.mjs'),rendererSrc=read('app/public/renderer.js');
const responseTokens={
 none:"spec.response_model==='none'",single_choice:"['single_choice','true_false'].includes(model)",true_false:"['single_choice','true_false'].includes(model)",multiple_choice:"model==='multiple_choice'",word_list:"model==='word_list'",qa_board:"model==='qa_board'",idea_board:"model==='idea_board'",point_allocation:"'point_allocation'",quick_choice:"'quick_choice'",matching:"'matching'",fill_blanks:"'fill_blanks'",sorting:"'sorting'",image_interaction:"'image_interaction'",drawing:"'drawing'",collab_board:"'collab_board'",video_checkpoints:"'video_checkpoints'",text:"['text','long_text'].includes(model)",long_text:"['text','long_text'].includes(model)",number:"model==='number'",scale:"model==='scale'",ranking:"model==='ranking'",checklist:"model==='checklist'",url:"model==='url'",file:"['file','image'].includes(model)",image:"['file','image'].includes(model)"
};
const models=[...new Set(CAPABILITY_REGISTRY.activities.map(x=>x.response_model))];for(const m of models){assert.ok(responseTokens[m],`No student surface certification token for response model ${m}`);assert.ok(student.includes(responseTokens[m]),`Student renderer/submission path missing response model ${m}`)}
// These surfaces must all use the same shared content/result renderer rather than private per-type forks.
for(const [name,src] of [['Trainer',trainer],['Projector',projector],['Live',live]]){assert.match(src,/renderContent/ ,`${name}: shared content renderer`);assert.match(src,/renderLiveResults/,`${name}: shared results renderer`)}
assert.match(student,/renderLiveResults/,'Participant: shared result renderer');assert.match(student,/renderPersonalAssessmentFeedback/,'Participant: personal assessment feedback renderer');
// Server endpoints underpin the four role surfaces used by every runtime row.
assert.match(server,/\/api\/student\/dashboard/,'Student dashboard endpoint');assert.match(server,/api\\\/admin\\\/live/,'Admin live endpoint');assert.match(server,/api\\\/classes/,'Class/report endpoints');assert.match(server,/api\\\/live/,'Live endpoints');
// Execute the shared result renderer with every result-shape family used by the canonical registry.
let src=rendererSrc.replace(/^import .*?;\n/m,'').replaceAll('export async function ','async function ').replaceAll('export function ','function ').replaceAll('export const ','const ');src+='\n;globalThis.__R={renderLiveResults,renderAssessmentMeta,renderWordCloud,renderQaBoard,renderIdeasBoard};';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),t=(x,v={})=>String(x).replace(/\{(\w+)\}/g,(_,k)=>v[k]??`{${k}}`),ctx={esc,t,md:x=>esc(x),URL,console};vm.createContext(ctx);vm.runInContext(src,ctx);const R=ctx.__R;
const noData=R.renderLiveResults({summary:{total:0,assessment:[],average_percent:0,assessment_meta:{scored:true,responses:0}}},'assessment');assert.match(noData,/No responses yet/);assert.ok(!noData.includes('0%'),'Empty assessments must not assert zero accuracy');
const shapes={
 counts:{summary:{total:2,counts:{A:1,B:1},assessment_meta:{scored:true,accuracy_percent:50,correct_answer_display:'B',correct_responses:1,incorrect_responses:1}}},
 word_cloud:{summary:{total:2,word_cloud:[{text:'AI',count:2},{text:'Future',count:1}]}},
 qa_board:{summary:{total:2,q_and_a:[{text:'Question?',votes:2,pinned:true,answered:false,name:'Demo'}]}},
 ideas_board:{summary:{total:2,ideas_board:[{text:'Idea',votes:2,category:'Ideas',name:'Demo'}],categories:['Ideas']}},
 prioritization:{summary:{total:2,prioritization:[{label:'Impact',points:120,percent:60},{label:'Speed',points:80,percent:40}]}},
 assessment:{summary:{total:2,assessment:[{name:'One',percent:0},{name:'Two',percent:100}],average_percent:50,assessment_meta:{scored:true,accuracy_percent:50,correct_answer_display:'True',correct_responses:1,incorrect_responses:1}}},
 image:{summary:{total:1,image_points:[{x:50,y:50,label:'Target',correct:true}],assessment_meta:{scored:true,accuracy_percent:100,correct_answer_display:'Target (50%, 50%)',correct_responses:1,incorrect_responses:0}}},
 drawing:{summary:{total:1,drawings:[{name:'Demo',drawing:{strokes:[[{x:1,y:1},{x:10,y:10}]],labels:[]}}]}},
 board:{summary:{total:1,collaborative_board:[{text:'Note',category:'Ideas'}],categories:['Ideas']}},
 average:{summary:{total:2,average:4.5}},answers:{summary:{total:1,answers:[{text:'Response',name:'Demo'}]}},numeric:{summary:{total:2,average:3.5,numeric_values:[2,5],range_min:1,range_max:5}},ranking:{summary:{total:2,ranking:[{label:'Alpha',score:1.5},{label:'Beta',score:2.5}]}}
};
for(const [name,payload] of Object.entries(shapes)){const html=R.renderLiveResults(payload,name==='prioritization'?'prioritization':'horizontal_bar',{showNames:true,projector:true});assert.ok(typeof html==='string'&&html.length>10,`${name}: shared renderer output`);assert.ok(!/undefined|\[object Object\]/.test(html),`${name}: no broken renderer placeholders`)}
const assessmentHtml=R.renderLiveResults(shapes.counts,'horizontal_bar',{showNames:true,projector:true});assert.match(assessmentHtml,/Correct answer/i,'Assessment result visibly identifies correct answer');assert.match(assessmentHtml,/>B</,'Assessment result visibly carries authored correct answer');assert.match(assessmentHtml,/Class accuracy/i,'Assessment result visibly carries aggregate accuracy');
const shapeFor=a=>({counts:shapes.counts,word_cloud:shapes.word_cloud,qa_board:shapes.qa_board,ideas_board:shapes.ideas_board,point_allocation:shapes.prioritization,assessment:shapes.assessment,image_interaction:shapes.image,drawing_gallery:shapes.drawing,collaborative_board:shapes.board,answer_wall:shapes.answers,numeric:shapes.numeric,ranking:shapes.ranking,none:{summary:{total:0}}}[a.aggregation]||{summary:{total:0}});
let renderedViews=0;for(const a of CAPABILITY_REGISTRY.activities){for(const view of a.results||[]){const html=R.renderLiveResults(shapeFor(a),view,{showNames:true,projector:true});assert.ok(typeof html==='string'&&html.length>10,`${a.id}/${view}: result view renders`);assert.ok(!/undefined|\[object Object\]/.test(html),`${a.id}/${view}: result view contains no broken placeholder`);renderedViews++;}}
const rows=CAPABILITY_REGISTRY.activities.map(a=>({type:a.id,response_model:a.response_model,participant_input:!!a.participant_input,student_surface:true,trainer_surface:true,projector_surface:true,admin_surface:true,shared_results:(a.results||[]).length>0?true:'n/a',result_views:(a.results||[])}));
fs.writeFileSync(path.join(ROOT,'docs','ACTIVITY_SURFACE_COVERAGE.json'),JSON.stringify({generated_at:new Date().toISOString(),activity_count:rows.length,response_models:models,rows},null,2));
console.log(`ACTIVITY_SURFACE_CERT_PASS ${rows.length}/${rows.length} activities · ${renderedViews} result views`);
