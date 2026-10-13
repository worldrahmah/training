# Training Engine ONE — Stage 0 Engineering Checkpoint — v3.4.0 RC0

Status: **ENGINEERING_CHECKPOINT_STAGE0_NOT_FINAL**

## Authority and exact inputs
- Current runtime baseline: `TRAINING_ENGINE_ONE_DEEP_UI_v3.3.0_RC4.zip`
  - SHA-256: `ebd3814be13d6ce8fabaeb3ff7ff27fb16cfb09ce452cffac86822c915c16a43`
- Current RC4-era external authoring contract: `TRAINING_ENGINE_ONE_COURSE_AUTHORING_HANDOFF_v1.3.zip`
  - SHA-256: `541fc93f8cc6408e2255ccf9a61215167696519e4047dfda8c7b046cf1e2f79c`
- Continuation handoff: `TRAINING_ENGINE_ONE_FULL_HANDOFF_RELEASE_2026-10-12_v2.0.zip`
  - SHA-256: `920b7a345aa628c360226fbaeb8c149ba4b5f67caa9ab0c419cc9d1b3272a34e`
- Historical compatibility authorities retained:
  - Core v2.1.1: `82a8f0dd04f658429eec7d153319da5953e2bf0f308a43c2293f5947b7c755f5`
  - Codex Master Handoff v1.0: `c0221a2b842215e06bd0c864a912a71922d833880a103c015913c723e2be4c52`

The exact RC4 source was preserved separately as the rollback/before-state. Engineering changes were made only in a separate Stage-0 working copy.

## Untouched RC4 baseline result
Before Stage-0 edits, the complete RC4 `npm test` suite passed on Node v22.16.0 through `TRAINING_ENGINE_20_PARTICIPANT_REHEARSAL_PASS`.

## Contract drift reproduced and closed at the foundation
Direct source inspection reproduced the RC4 capability/schema/Builder/runtime disagreement. Stage 0 establishes `registry/activity-component-registry.json` as the canonical machine registry and `tools/sync-contracts.mjs` as the mechanical synchronization/drift gate.

The canonical ordinary-activity model now follows actual executable runtime behavior:
- `mission` remains a separate mission/workflow component rather than being falsely advertised as an ordinary activity.
- `leaderboard` remains a content/result capability rather than an ordinary participant-response activity.
- `anonymous_spotlight` is not advertised as an ordinary activity because RC4 did not provide a complete ordinary-activity execution path for it.
- `url_submission`, `file_submission`, and `image_submission` are synchronized into the ordinary activity authoring surface because the participant/runtime path actually supports them.
- `timeline`, `leaderboard`, `divider`, and `spacer` content blocks are synchronized across registry/schema/Builder/runtime where supported.

The drift regression gate fails if canonical activity/block/result/workflow declarations diverge across generated schemas, capability catalogs, browser Builder registry, or the in-tree development authoring contract.

## Projector foundation repair
Projector presentation appearance is now intentionally separate from the application Light/Dark/System theme.

Canonical Projector themes:
- Dark
- Light
- High Contrast

Canonical precedence:
1. Course default
2. Class override
3. Temporary Live Class override

The real Projector and Course Builder Projector Preview now use the same shared Projector renderer and the same Projector theme tokens. The Builder preview is a 16:9 stage and includes activity selection, Projector-theme selection, safe-area guide, room/contrast check, and full-screen preview. The class and temporary Live overrides are persisted/exposed independently, and unsupported Projector theme values fail closed instead of silently degrading to inheritance.

## Runtime/authoring synchronization
Stage 0 also binds ordinary activity response models, aggregation, scoring, and allowed result displays to canonical activity metadata where those paths previously depended on duplicated type lists. The in-tree `course-authoring-handoff` is explicitly a **development-only Stage-0 contract**. The packaged standalone v1.3 handoff remains preserved as the RC4-era published authoring contract and is not misrepresented as the final post-expansion authoring release.

## Version/release identity
Current engineering identity is sourced from `release/version.json` and used by runtime/package/release synchronization:
- app version: `3.4.0-rc.0`
- release: `TRAINING_ENGINE_ONE_STAGE0_v3.4.0_RC0`
- status: `ENGINEERING_CHECKPOINT_STAGE0_NOT_FINAL`

Current release-facing documents were repaired so that stale RC3/RC4 labels do not masquerade as the Stage-0 release identity. Historical/compatibility references remain historical.

## Automated verification
The exact Stage-0 working tree passes the complete `npm test` suite, including:
- `CONTRACT_SYNC_PASS`
- `CANONICAL_CONTRACT_REGISTRY_PASS`
- `PROJECTOR_THEME_PRECEDENCE_PASS`
- localization/responsive/deep UI/role/Course Flow/workflow gates
- smoke, restart, backup/restore, v1.2/v2.0 compatibility suites
- `TRAINING_ENGINE_ONE_CORE_PASS`
- `V211_TO_ONE_POPULATED_MIGRATION_PASS`
- `TRAINING_ENGINE_COMPLETE_PROFESSIONAL_PASS`
- `TRAINING_ENGINE_20_PARTICIPANT_REHEARSAL_PASS`

The final captured output is stored in `docs/ONE_COMPLETE_AUTOMATED_TEST_OUTPUT.txt`.

## Remaining release gates
This checkpoint is **not FINAL**. Automated PASS does not replace the required manual visual/browser acceptance. The exact Stage-0 package still requires the full visual matrix in `docs/ONE_VISUAL_ACCEPTANCE.md`, including English LTR / Arabic RTL and Projector room/contrast behavior on a real display.

The approved Interaction Pack and later expansion stages intentionally remain after this Stage-0 closure. Word Cloud and the other new interaction types are not claimed as implemented here.
