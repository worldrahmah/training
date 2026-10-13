# Exact baseline binding

Authoritative baseline artifact:
- `TRAINING_ENGINE_CORE_v2.1.1_FINAL.zip`
- SHA-256: `82a8f0dd04f658429eec7d153319da5953e2bf0f308a43c2293f5947b7c755f5`

The extracted working source is in:
- `workspace/training-engine/`

Historical/reference artifacts:
- `TRAINING_ENGINE_COURSE_AUTHORING_HANDOFF_v2.0.zip`
  SHA-256: `1180a44d3c2e08d52d5be0cda2921808755dac8ba7e5e99d6d6876ea395e99cf`
- `TRAINING_ENGINE_CORE_UPGRADE_HANDOFF_v1.0.zip`
  SHA-256: `a057ddb8839b7a7e32c3e4075ceceee67e3b447bf3f9784fbd5c9691a299304a`

Current baseline history:
- v2.0 introduced professional admin/trainer/student/projector surfaces, multilingual UI, course/class management, visual course builder, workflow branching, progress/help, reports, and backward compatibility.
- v2.1 added a persisted Trainer Workflow Progress Tracker.
- v2.1.1 repaired legacy/workflow-less modules by creating an implicit linear runtime flow without mutating old course packages.

Treat v2.1.1 as the rollback and compatibility baseline. Do not overwrite it in place.
