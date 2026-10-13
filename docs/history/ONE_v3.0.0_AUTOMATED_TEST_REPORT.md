# Training Engine ONE v3.0.0 — Automated Test Report

## Result
**PASS** on the exact source bytes used to build the release candidate.

## Environment
- Node.js: `v22.16.0`
- Platform: Linux container
- Runtime: Node built-in SQLite (`node:sqlite` experimental warning is emitted by Node and does not indicate a test failure)

## Full gate
Command:

```bash
npm test
```

Named PASS gates observed:
- `I18N_AR_EN_PASS`
- `RESPONSIVE_UI_PASS`
- `ROLE_SURFACES_PASS`
- `COURSE_FLOW_UI_PASS`
- `WORKFLOW_VALIDATION_PASS`
- `SMOKE_TEST_PASS`
- `CORE_V12_PASS`
- `RESTART_PERSISTENCE_PASS`
- `BACKUP_RESTORE_PASS`
- `CORE_V20_PASS`
- `WORKFLOW_PROGRESS_PASS`
- `WORKFLOW_RESTART_PASS`
- `LEGACY_WORKFLOW_TRACKER_PASS`
- `TRAINING_ENGINE_ONE_CORE_PASS`
- `V211_TO_ONE_POPULATED_MIGRATION_PASS`

The complete raw output is retained in `ONE_AUTOMATED_TEST_OUTPUT.txt`.

## Professional ONE feature checks reproduced in the suite
- canonical app/schema version + security headers;
- machine-readable capability contract;
- temporary-password enforcement;
- failed-login throttling;
- multiple simultaneous live classes;
- short-code self enrollment;
- class-scoped expiring Projector pairing;
- Left Early attendance + note;
- append-only consent history;
- Trainer submission review lifecycle;
- Participant schedule/calendar/reviewed feedback;
- participant optimistic concurrency;
- Draft revisions + compare + strict workflow simulation + conflict protection;
- course asset library;
- reusable authoring templates;
- global search + saved views;
- audited bulk administration;
- configurable backup/live policy;
- course-improvement analytics surfaces;
- verified backup;
- concurrent-device session limit.

## Browser/manual gate
A Chromium CDP acceptance attempt was made in the engineering environment. The managed Chromium instance blocks navigation to localhost, 127.0.0.1 and the private LAN address with the policy message: **“Your organization doesn’t allow you to view this site.”**

Therefore the browser/manual matrix cannot truthfully be marked PASS here. The required matrix is documented in `ONE_RELEASE_ACCEPTANCE.md` and remains the only blocker to promoting the RC artifact to FINAL.
