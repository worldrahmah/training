// Current runtime examples derived from verified activity certification cases.
import {CAPABILITY_REGISTRY} from '../app/lib/registry.mjs';
const specs=new Map(CAPABILITY_REGISTRY.activities.map(x=>[x.id,x]));
const firstResult=t=>specs.get(t)?.results?.[0];
function A(id,type,title,extra={}){const r=firstResult(type);return {id,type,title,trainer:{cue:`Trainer cue for ${type}`},content:{question:title,blocks:[{type:'text',title,body_md:`Certification content for ${type}`}],...(extra.content||{})},...(r?{results_display:r}:{}),...extra};}
export function activityExample(type){const id=`a_${type}`;switch(type){
 case 'presentation': return A(id,type,'Presentation',{content:{blocks:[{type:'hero',title:'Presentation',body_md:'Present this.'}]}});
 case 'announcement': return A(id,type,'Announcement',{content:{blocks:[{type:'callout',title:'Announcement',body_md:'Notice'}]}});
 case 'poll': return A(id,type,'Poll',{content:{options:['Yes','No']}});
 case 'single_choice': return A(id,type,'Single choice',{content:{options:['A','B','C'],correct_answer:'B'},explanation:'B is correct.'});
 case 'multiple_choice': return A(id,type,'Multiple choice',{content:{options:['A','B','C'],correct_answers:['A','C']},explanation:'A and C are correct.'});
 case 'true_false': return A(id,type,'True or false',{content:{correct_answer:true},explanation:'The correct answer is True.'});
 case 'word_cloud': return A(id,type,'Word Cloud',{word_cloud:{max_entries:3,max_characters:32,allow_phrases:true,moderation:'off',identity_visibility:'trainer_only'}});
 case 'q_and_a': return A(id,type,'Q&A',{q_and_a:{max_questions:3,max_characters:280,moderation:'off',identity_visibility:'public',upvoting:true,allow_self_upvote:false,sort:'votes'}});
 case 'ideas_board': return A(id,type,'Ideas Board',{ideas_board:{max_ideas:4,max_characters:180,moderation:'off',identity_visibility:'public',upvoting:true,allow_self_upvote:false,sort:'votes',categories:['Ideas','Risks']}});
 case 'prioritization_100': return A(id,type,'Prioritize',{content:{options:['Impact','Speed','Cost']},prioritization:{budget:100,max_per_option:100,require_full_allocation:true}});
 case 'quick_interaction': return A(id,type,'Quick interaction',{content:{options:['Agree','Unsure','Disagree']},quick_interaction:{preset:'agree',anonymous:true}});
 case 'matching': return A(id,type,'Matching',{matching:{pairs:[{id:'p1',left:'CPU',right:'Processor'},{id:'p2',left:'RAM',right:'Memory'}],shuffle:true},explanation:'CPU is Processor; RAM is Memory.'});
 case 'fill_blanks': return A(id,type,'Fill blanks',{fill_blanks:{blanks:[{id:'b1',label:'AI means',answers:['Artificial Intelligence']},{id:'b2',label:'ML means',answers:['Machine Learning']}],case_sensitive:false},explanation:'AI and ML expansions.'});
 case 'sorting': return A(id,type,'Sorting',{sorting:{items:['Plan','Build','Test'],correct_order:['Plan','Build','Test']},explanation:'Plan, Build, Test.'});
 case 'image_interaction': return A(id,type,'Image interaction',{image_interaction:{mode:'label',asset:'assets/map.png',max_points:2,targets:[{id:'n',label:'North',x:20,y:20,tolerance:10},{id:'s',label:'South',x:80,y:80,tolerance:10}]},explanation:'North and South.'});
 case 'draw_annotate': return A(id,type,'Draw annotate',{draw_annotate:{asset:'assets/map.png',max_strokes:20,allow_text:true}});
 case 'collaborative_board': return A(id,type,'Collaborative Board',{collaborative_board:{max_notes:3,max_characters:160,categories:['Ideas','Risks'],identity_visibility:'public'}});
 case 'interactive_video': return A(id,type,'Interactive Video',{interactive_video:{asset:'assets/video.mp4',pause_at_checkpoint:true,checkpoints:[{id:'c1',time_seconds:1,prompt:'2+2?',type:'single_choice',options:['3','4'],correct_answer:'4'},{id:'c2',time_seconds:2,prompt:'Confidence?',type:'confidence'}]},explanation:'4 is correct.'});
 case 'short_answer': return A(id,type,'Short answer',{content:{placeholder:'Short answer'}});
 case 'long_answer': return A(id,type,'Long answer',{content:{placeholder:'Long answer'}});
 case 'numeric_answer': return A(id,type,'Numeric answer',{content:{correct_answer:42,tolerance:0.5,min:0,max:100,step:1},explanation:'42 is correct.'});
 case 'rating': return A(id,type,'Rating',{content:{min:1,max:5,step:1,min_label:'Low',max_label:'High'}});
 case 'reaction': return A(id,type,'Reaction',{content:{options:['👍','🤔','👎']}});
 case 'confidence': return A(id,type,'Confidence',{content:{min:1,max:5,step:1,min_label:'Low',max_label:'High'}});
 case 'ranking': return A(id,type,'Ranking',{content:{options:['First','Second','Third']}});
 case 'timer': return A(id,type,'Timer',{content:{seconds:30}});
 case 'reveal': return A(id,type,'Reveal',{content:{blocks:[{type:'hero',title:'Reveal',body_md:'Reveal content'}]}});
 case 'team_challenge': return A(id,type,'Team challenge',{response_scope:'team',content:{placeholder:'Team answer'}});
 case 'checklist': return A(id,type,'Checklist',{content:{items:['One','Two','Three']}});
 case 'url_submission': return A(id,type,'URL submission',{content:{body_md:'Submit a URL'}});
 case 'file_submission': return A(id,type,'File submission',{content:{body_md:'Submit a file'}});
 case 'image_submission': return A(id,type,'Image submission',{content:{body_md:'Submit an image'}});
 case 'reflection': return A(id,type,'Reflection',{content:{placeholder:'Reflect'}});
 case 'self_assessment': return A(id,type,'Self assessment',{content:{placeholder:'Assess yourself'}});
 case 'participant_choice': return A(id,type,'Participant choice',{content:{blocks:[{type:'callout',title:'Choose',body_md:'Choose your path.'}]}});
 case 'practice_gate': return A(id,type,'Practice gate',{content:{blocks:[{type:'callout',title:'Practice',body_md:'Practice checkpoint.'}]}});
 default: throw Error(`Missing activity fixture for ${type}`);
}}
