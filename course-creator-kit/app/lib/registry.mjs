import fs from 'node:fs';

const url=new URL('../../registry/activity-component-registry.json',import.meta.url);
export const CAPABILITY_REGISTRY=Object.freeze(JSON.parse(fs.readFileSync(url,'utf8')));
const ids=list=>Object.freeze((list||[]).map(x=>typeof x==='string'?x:x.id));
export const ACTIVITY_TYPES=ids(CAPABILITY_REGISTRY.activities);
export const CONTENT_BLOCK_TYPES=ids(CAPABILITY_REGISTRY.content_blocks);
export const RESULT_TYPES=ids(CAPABILITY_REGISTRY.results);
export const CHART_TYPES=ids(CAPABILITY_REGISTRY.charts);
export const WORKFLOW_NODE_TYPES=ids(CAPABILITY_REGISTRY.workflow_nodes);
export const SUBMISSION_TYPES=ids(CAPABILITY_REGISTRY.submissions);
export const COMPLETION_TYPES=ids(CAPABILITY_REGISTRY.completion_types);
export const ATTENDANCE_STATES=ids(CAPABILITY_REGISTRY.attendance_states);
export const ENGINE_SURFACES=ids(CAPABILITY_REGISTRY.surfaces);
export const PROJECTOR_THEMES=ids(CAPABILITY_REGISTRY.projector?.themes);
export const activitySpec=type=>CAPABILITY_REGISTRY.activities.find(x=>x.id===String(type||''))||null;
export const normalizeProjectorTheme=value=>PROJECTOR_THEMES.includes(String(value||''))?String(value):null;
export function resolveProjectorTheme({course_default=null,class_override=null,live_override=null}={}){
  return normalizeProjectorTheme(live_override)||normalizeProjectorTheme(class_override)||normalizeProjectorTheme(course_default)||String(CAPABILITY_REGISTRY.projector?.default_theme||'dark');
}
