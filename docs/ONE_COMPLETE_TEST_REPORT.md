# Training Engine ONE v3.5.0 RC1R6 — Professional Closure Test Report

## Automated scope
The consolidated suite runs canonical contract synchronization, the Professional Closure contract/runtime gates, complete 36/36 Activity Certification, scored-assessment feedback, declared setting/variant and invalid-input gates, all accepted Word Cloud/Q&A/Ideas Board and Projector gates, EN/AR and responsive contracts, role/Course Flow/workflow validation, restart, backup/restore, v2 compatibility, populated v2.1.1 migration, professional completeness and the 20-participant classroom rehearsal.

## Full Activity Certification gates
- `ASSESSMENT_FEEDBACK_RUNTIME_PASS`: wrong/partial and correct answers are scored for all scored assessment families; correctness is hidden while collecting and revealed with personal/aggregate correct-answer context only after Reveal.
- `ACTIVITY_SETTINGS_CERT_PASS 36/36`: every canonical Activity Type exposes its declared Builder settings and result choices; declared enums/bounds and publish blockers are exercised.
- `ACTIVITY_VARIANT_RUNTIME_PASS`: meaningful runtime setting branches (identity, moderation, ordering, image modes, presets, scoring variants, visibility) are executed.
- `ACTIVITY_SURFACE_CERT_PASS 36/36 activities · 68 result views`: every activity is renderable on its applicable role surfaces and every canonical result-view case is exercised through the shared renderer.
- `ACTIVITY_INPUT_VALIDATION_PASS`: invalid participant input is rejected and valid input is accepted across the response families.
- `ALL_ACTIVITY_RUNTIME_CERT_PASS 36/36`: Admin, Trainer, Participant and Projector are exercised for every activity; response/result/report/restart/backup behavior is verified when applicable.
- `FULL_ACTIVITY_CERTIFICATION_MATRIX_PASS 36/36 · 68 result-view cases`: machine-readable and human certification matrices are generated and fail if any defined row remains incomplete.

## Professional Closure dedicated gates
- `BUILDER_ACTIVITY_EDITOR_PASS`: the real browser-side Activity Type transition handler re-renders type-specific settings immediately and 36/36 canonical Activity Types expose an appropriate Builder settings panel; stale type-only configuration is removed on transitions.
- `BUILDER_DRAFT_TRANSITIONS_PASS`: all 36 canonical Activity Types can be selected/persisted as incomplete drafts without HTTP 422; Builder Back/course navigation is persistence-aware; invalid Publish remains blocked and malformed draft structure still fails closed.
- `PROFESSIONAL_EXPANSION_CONTRACT_PASS`: registry/schema/capability/Builder/source contract plus advanced interaction unit behavior and local presentation parsing.
- `PROFESSIONAL_EXPANSION_RUNTIME_PASS`: end-to-end 100 Points, Quick Interaction/result-view override, Matching + professional Challenge + Explain, Fill Blanks, Sorting, image label scoring, Draw/Annotate labels, Collaborative Board/privacy, Interactive Video/confidence, participant-paced/front-of-room/guest delivery, co-Trainer access, Session Replay, advanced analytics, local PDF/PPTX import and backup/restart preservation.

## RC1R5 Admin/Trainer discovery and configurable reporting gates
- `COLLECTION_DISCOVERY_PASS`: the principal Admin/Trainer management collections expose the shared professional search/filter/sort/reset/result-count pattern; Trainer global search and Builder tree/template/revision discovery are present; Participant/Projector remain management-chrome free.
- `REPORT_CHART_WORKSPACE_PASS`: Admin and Trainer Reports mount the constrained local Chart Builder with proposed role-authorized datasets/metrics and Bar / Line / Pie / Table views; the renderer makes no external chart-service request.

## Release rule
The final sealed ZIP is independently extracted and the complete `npm test` suite is rerun from those exact bytes. Manual/browser acceptance remains a separate owner gate before FINAL promotion.

RC1R6 repair scope and authoritative current evidence: `RC1R6_REPAIR_AND_ACCEPTANCE.md`. Earlier gate descriptions are preserved for continuity.
