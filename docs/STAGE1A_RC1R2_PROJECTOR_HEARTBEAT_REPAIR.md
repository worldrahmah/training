# Stage 1A RC1R2 — Projector Connection Heartbeat Repair

Status: `ENGINEERING_CHECKPOINT_STAGE1A_WORD_CLOUD_NOT_FINAL`

## Owner-reproduced defect

During Stage 1A manual acceptance, the owner had an open Projector window while the Live Classroom health strip continued to show `0 PROJECTOR`.

## Root cause

`POST /api/live/:class_id/projector-pair` correctly created an expiring class-scoped projector pair and the paired `/present?class_id=...&pair=...` URL could read the live class. However, successful pair validation never updated `projector_pairs.last_seen`. The Live Classroom health endpoint intentionally counts only active pairs with a recent `last_seen`, so a legitimately connected Projector was always omitted from the connected-projector count.

## Repair

- Successful `validProjectorPair()` validation now updates that pair's `last_seen` timestamp.
- Every normal paired Projector refresh therefore acts as the connection heartbeat.
- The health endpoint's existing 120-second freshness rule remains unchanged.
- Unpaired/legacy `/present` views are not falsely counted as paired Projectors.
- Added an automated regression assertion that creates a class-scoped Projector pair, performs a paired live read, then requires `/api/live/:class_id/health` to report `projectors_connected === 1`.

## Result-display behavior

There is intentionally no separate “send results to Projector” control. The Projector follows the current Live Classroom state. For Word Cloud, the audience stays hidden before reveal; after the Trainer closes the activity and selects **Show results**, the Projector renderer receives the revealed Word Cloud automatically.

## Gate

RC1R2 must pass the complete automated suite on the exact sealed bytes. Owner/manual acceptance must then confirm that an opened paired Projector changes the Live Classroom metric to `1 PROJECTOR` and that Word Cloud results appear automatically after **Close activity → Show results**.
