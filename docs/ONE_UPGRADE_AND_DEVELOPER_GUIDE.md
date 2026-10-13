# Training Engine ONE — Upgrade and Developer Guide

## 1. Upgrade philosophy
ONE is designed for additive, deterministic upgrades. The permanent rules are:
- never reset a real database to upgrade;
- preserve existing users, courses, immutable published versions, classes, enrollments, attendance, submissions, workflow state, reports, audit and backups;
- migrations must be idempotent or guarded;
- new behavior must be covered by regression tests;
- old package compatibility is retained unless a future major release explicitly removes it;
- capability changes must update the machine-readable capability contract and authoring handoff.

## 2. Before any upgrade
1. Stop live delivery.
2. Create a verified backup.
3. Copy the full application folder to a safe location.
4. Record the current application version and `SHA256SUMS.txt` if using a sealed release.
5. Run `npm test` on the existing release if practical.
6. Upgrade a copy first, never the only production folder.

## 3. Database changes
Database initialization/migration lives in `app/lib/db.mjs`.

Requirements for future schema work:
- use additive tables/columns/indexes whenever possible;
- preserve foreign keys and historical rows;
- use explicit migration logic when a constrained table must be rebuilt;
- test against a populated previous-version database;
- run SQLite integrity/FK checks after migration;
- verify backup/restore after schema changes.

The current release includes a populated v2.1.1 → ONE migration regression test.

## 4. Canonical version identity
Application identity is centralized in `app/lib/version.mjs`.

Do not hard-code a different version in `/api/health`, backups, capability files or documentation. Update the canonical module, regenerate capability/release metadata, rerun tests, then seal.

## 5. Course model compatibility
The canonical course model is declarative and supports schemas 1.0, 1.1 and 2.0. New course features should normally extend schema 2.x rather than creating an unrelated format.

Any new activity/content/workflow capability requires:
1. runtime support;
2. validator support;
3. Builder support;
4. Trainer rendering/control;
5. Participant rendering/behavior where applicable;
6. Projector behavior where applicable;
7. Arabic/English labels;
8. responsive behavior;
9. tests;
10. capability catalog update;
11. external course-authoring handoff update.

## 6. Workflow changes
Never infer missing transitions inside an explicit workflow. Explicit graphs fail closed.

A valid live workflow must maintain:
- exactly one valid start;
- reachable nodes;
- valid references;
- outgoing transition for non-terminal nodes;
- explicit terminal recognition;
- complete branch destinations/conditions;
- participant convergence or terminal behavior;
- completion mechanism for Trainer-controlled nodes;
- deterministic persisted progress/resume.

Legacy/workflow-less modules may continue using the deterministic implicit linear compatibility graph.

## 7. Concurrency
Mutable Draft and participant/live runtime writes use revision checking where implemented. New multi-tab/multi-device mutation paths should use the same optimistic-concurrency pattern: client supplies expected revision; server rejects stale state with HTTP 409; UI reloads current state instead of silently overwriting.

## 8. Permissions
Do not infer authorization from UI visibility. Every privileged server endpoint must perform role/resource permission checks.

Projector pairing is class-scoped and expiring. The historical global projector control key exists only as a legacy compatibility path and should not be used for new UX.

## 9. Frontend architecture
The app intentionally uses separate role surfaces rather than one universal dashboard:
- `admin.js`
- `trainer.js`
- `live.js`
- `student.js`
- `present.js`
- `builder.js`

Shared primitives live in `core.js`, shared translations in `i18n.js`, and the visual system in `styles.css`.

Do not merge Live Classroom back into the Trainer dashboard. It must remain focused on one class.

## 10. UI/UX release rules
Every feature must be evaluated on:
- English LTR;
- Arabic RTL;
- phone, tablet, desktop;
- presentation/projector sizing where applicable;
- light/dark/system themes where relevant;
- no page-level horizontal overflow;
- action hierarchy and dangerous-action confirmation;
- keyboard/touch usability;
- truthful loading/error/conflict states.

## 11. Testing
Main gate:

```bash
npm test
```

It currently includes:
- i18n contract;
- responsive-source contract;
- role-surface contract;
- Course Flow UI contract;
- strict workflow validation;
- smoke/end-to-end API flow;
- legacy v1.2 compatibility;
- restart persistence;
- backup/restore;
- v2.0 feature compatibility;
- workflow progress/restart/legacy behavior;
- ONE professional feature acceptance;
- populated v2.1.1 migration.

Future changes must add tests for every owner-reported defect before repair.

## 12. Release process
1. Branch/copy from accepted baseline.
2. Maintain implementation plan.
3. Implement + add regression tests.
4. Run targeted tests.
5. Run full `npm test` on exact candidate bytes.
6. Run browser/manual matrix on a machine where local browser navigation is permitted.
7. Verify backup/restore and populated migration.
8. Generate `CORE_CAPABILITIES.json`.
9. Regenerate external authoring handoff.
10. Build `RELEASE_MANIFEST.json` + `SHA256SUMS.txt`.
11. Verify ZIP CRC/path safety and every checksum row.
12. Promote RC to FINAL only after every mandatory gate passes.

## 13. Future extension points
ONE is prepared for future versioned modules such as certificates, formal question banks, waitlists, prerequisites, PWA/offline caching beyond current local runtime, and university interoperability (SCORM/xAPI/LTI). Add them only through the normal capability/version/test process; do not bolt executable behavior into course packages.
