# Final acceptance for Codex modernization

The modernization is not complete until all applicable conditions below are demonstrated on the exact release candidate/final bytes.

## Baseline and lineage
- Exact v2.1.1 hash verified before changes.
- Existing tests reproduced before edits.
- Source tracked in Git with baseline commit/tag and upgrade branch/worktree.
- Architecture decisions and migration lineage documented.

## Functional product
- Super Admin CRUD, monitoring, settings, users, courses, classes, reports, permissions, backup/restore work end-to-end.
- Trainer permissions and live workflow work end-to-end.
- Participant profile/account/messages/dashboard/activity paths/help/submission/progress work end-to-end.
- Projector behaves as professional big-screen presentation runtime.
- Visual Course Builder creates/imports/edits/versions/validates/previews/publishes the same canonical model.
- Course/Class creation flows include trainers, participants/import, sessions/teams and version assignment.
- Collapsible Course Flow correctly progresses Done/Current/Next/Upcoming/Blocked/Skipped and Jump-to-Next behavior.
- Explicit workflows complete and branch correctly; participant paths are independent; convergence works.
- Help Queue and live progress operate under concurrent participants.

## Responsive/UI quality
Manual/automated checks at phone/tablet/laptop/desktop/projector breakpoints in Arabic and English, light and dark. No global horizontal overflow, inaccessible controls, tiny projector text, broken modals, inaccessible hidden navigation, or debug labels.

## Reliability
- refresh preserves auth and live state as intended
- temporary reconnect restores state
- server restart restores class/workflow/path/help state
- duplicate/concurrent device behavior is deterministic
- backup/restore passes
- database integrity passes
- no partial transactional course import

## Compatibility
- all legacy tests pass
- schemas 1.0/1.1/2.0 fixtures validate/run unchanged
- populated v2.1.1 DB migrates without record loss
- historical classes remain pinned to original course versions

## Security/safety
- password hashing/session authorization/RBAC verified
- uploads constrained and sanitized
- no arbitrary executable course content
- destructive actions protected
- audit trail present for meaningful mutations
- consent data separated from operational profile fields

## Authoring readiness
- final Component Catalog, schemas, templates, validator rules and example packages are generated from actual final runtime behavior
- no documented component is unsupported
- no supported runtime feature required by course authors is missing from the authoring contract
- validator simulates explicit workflow transition completeness

## Release evidence
- full test commands and results
- manual acceptance matrix
- migration report
- compatibility report
- UI/UX review report
- release manifest/checksums
- exact release SHA-256
- no known blocking defect

Recommended final token: `TRAINING_ENGINE_PROFESSIONAL_CORE_READY_FOR_COURSE_AUTHORING`.
