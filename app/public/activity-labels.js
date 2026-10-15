import {activitySpec} from '/capability-registry.js';
import {getLocale,t} from '/i18n.js';
// System display metadata only. Never pass authored titles through this function.
export function activityLabel(id){const spec=activitySpec(id);return spec?(getLocale()==='ar'?spec.label_ar:spec.label):t(({mission:'Mission',participant_path:'Participant path',activity:'Activity'})[id]||'Activity')}
