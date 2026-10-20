import { APP_NAME, APP_VERSION, CORE_SCHEMA_VERSION, COURSE_AUTHORING_SCHEMA_VERSION } from './version.mjs';
import { CAPABILITY_REGISTRY, ACTIVITY_TYPES, CONTENT_BLOCK_TYPES, RESULT_TYPES, CHART_TYPES, WORKFLOW_NODE_TYPES, SUBMISSION_TYPES, COMPLETION_TYPES, ATTENDANCE_STATES, ENGINE_SURFACES, PROJECTOR_THEMES } from './registry.mjs';

export { ACTIVITY_TYPES, CONTENT_BLOCK_TYPES, RESULT_TYPES, CHART_TYPES, WORKFLOW_NODE_TYPES, SUBMISSION_TYPES, COMPLETION_TYPES, ATTENDANCE_STATES, ENGINE_SURFACES, PROJECTOR_THEMES };

export function capabilityContract(){
  return {
    format:'training-engine-core-capabilities',
    app_name:APP_NAME,
    app_version:APP_VERSION,
    core_schema_version:CORE_SCHEMA_VERSION,
    latest_authoring_schema:COURSE_AUTHORING_SCHEMA_VERSION,
    registry_format:CAPABILITY_REGISTRY.format,
    registry_version:CAPABILITY_REGISTRY.registry_version,
    compatible_course_schemas:['1.0','1.1','2.0'],
    surfaces:ENGINE_SURFACES,
    course_model:{canonical:true,declarative_only:true,published_immutable:true,drafts:true,external_package_import:true,visual_builder:true},
    activities:ACTIVITY_TYPES,
    activity_contracts:Object.fromEntries(CAPABILITY_REGISTRY.activities.map(x=>[x.id,{response_model:x.response_model,aggregation:x.aggregation,scoring:x.scoring,results:x.results,participant_input:x.participant_input,...(x.defaults?{defaults:x.defaults}:{}),...(x.features?{features:x.features}:{})}])),
    components:CAPABILITY_REGISTRY.components,
    content_blocks:CONTENT_BLOCK_TYPES,
    results:RESULT_TYPES,
    charts:CHART_TYPES,
    workflow_nodes:WORKFLOW_NODE_TYPES,
    submissions:SUBMISSION_TYPES,
    completion_types:COMPLETION_TYPES,
    attendance:ATTENDANCE_STATES,
    guided_experience:CAPABILITY_REGISTRY.guided_experience,
    workflow:{explicit_graph_validation:true,transition_simulation:true,class_branching:true,participant_branching:true,convergence:true,terminal_nodes:true,persisted_progress:true,resume:true,skip_override_audited:true},
    live:{multiple_simultaneous_classes:true,dedicated_trainer_console:true,help_queue:true,participant_progress:true,class_timeline:true,projector_pairing:true,short_join_codes:true,classroom_health:true,private_presenter_notes:true,projector_modes:['welcome','focus','break','countdown','celebration','blackout','course'],projector_themes:PROJECTOR_THEMES,projector_theme_precedence:CAPABILITY_REGISTRY.projector.precedence},
    interaction_policy:CAPABILITY_REGISTRY.interaction_policy,
    authoring_policy:CAPABILITY_REGISTRY.authoring_policy,
    delivery:CAPABILITY_REGISTRY.delivery,
    workspace:CAPABILITY_REGISTRY.workspace,
    facilitation:CAPABILITY_REGISTRY.facilitation,
    presentation:CAPABILITY_REGISTRY.presentation,
    authoring:{autosave:true,undo_redo:true,revision_history:true,publish_readiness:true,asset_library:true,asset_search:true,asset_replace:true,asset_used_by_paths:true,dependency_checks:true,reusable_templates:true,workflow_simulation:true,version_compare:true,private_trainer_notes:true,canonical_registry:true,contract_drift_gate:true},
    operations:{rbac:true,global_search:true,saved_views:true,bulk_actions:true,submission_review:true,consent_history:true,session_management:true,session_token_rotation:true,failed_login_throttling:true,concurrent_device_limits:true,backup_verification:true,pre_restore_safety_backup:true,encrypted_portable_backups:true},
    analytics:{platform:true,course:true,version:true,class:true,trainer:true,participant:true,path_funnels:true,time_on_step:true,abandonment:true,help_wait_time:true,course_health:true,version_impact:true,version_to_version_comparison:true,course_improvement_findings:true,advanced:CAPABILITY_REGISTRY.analytics_expansion},
    learning_lifecycle:{transcript:true,transcript_csv:true,certificates:true,public_certificate_verification:true,printable_certificates:true,surveys:true,prerequisites:true,waitlists:true,question_banks:true,randomized_quizzes:true},
    localization:{engine_locales:['en','ar'],rtl:true,course_language_independent:true,themes:['light','dark','system'],projector_themes:PROJECTOR_THEMES,canonical_typography:{en:'Montserrat',ar:'Cairo'},local_font_cache:true},
    local_first:true
  };
}
