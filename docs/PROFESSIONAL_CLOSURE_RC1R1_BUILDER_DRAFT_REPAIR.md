# Training Engine ONE v3.5.0 RC1R1 — Builder Draft / Activity-Type 422 Repair

Status: **ENGINEERING REPAIR COMPLETE — OWNER ACCEPTANCE CANDIDATE, NOT FINAL**

## Owner-reproduced defect
In Professional Closure RC1, changing an activity type in Course Builder could surface a red `Request failed (422)` shortly after the selection changed. This made the consolidated owner acceptance flow unreliable and blocked practical authoring of several new activity families.

## Root cause
The visual Builder intentionally autosaves authoring changes. RC1 reused publish-level semantic validation inside `PUT /api/course-versions/:id/draft`. Several activity types are naturally incomplete immediately after the author selects them (for example Matching before pairs are entered, 100 Points before options are entered, Image Interaction before an image is chosen). The autosave therefore attempted to persist a legitimate but incomplete draft and the server rejected it as if it were a publish attempt.

There was a second UX risk in the same path: the old Activity Type change handler started the 1.2-second autosave timer immediately and then rendered the new type-specific editor. That could race with a trainer beginning to type the new settings.

## Repair
- Draft persistence and publish readiness are now separate concerns.
- A structurally valid Training Engine course draft is persisted even when semantic validation reports blockers.
- Draft save returns full readiness errors/warnings and `ready:false` when incomplete.
- Publish remains strict and still returns 422 while blockers exist.
- Malformed/non-course draft payloads still fail closed with `DRAFT_STRUCTURE_INVALID` and are not persisted.
- Activity Type changes use a dedicated transition handler. The type changes immediately and the correct editor is rendered, but the old 1.2-second autosave is not started while the trainer is filling the newly displayed settings.
- The Builder marks the draft as unsaved/not-ready until the author applies or explicitly saves the settings.
- Once a draft save runs, known blocker count is visible in the Builder status instead of presenting a generic request failure.

## Regression gate
New gate: `BUILDER_DRAFT_TRANSITIONS_PASS`.

It verifies:
1. All 36 canonical activity types can be selected/persisted as an incomplete draft without HTTP 422.
2. Draft readiness still reports semantic blockers.
3. Publishing an incomplete Matching activity still returns 422.
4. A malformed/non-course draft still returns 422 and does not advance the draft revision.
5. The Builder Activity Type event uses the dedicated non-racing transition handler.

## Compatibility
- No database migration.
- Published versions remain immutable.
- Import and Publish remain strict.
- Existing accepted Word Cloud, Q&A, Ideas Board, Projector, workflow, reports, backup/restore and Professional Closure runtime behavior are unchanged.
- Rollback baseline remains the exact Professional Closure RC1 ZIP SHA-256 `b576ed6c4894305c26f570f1e12f3417a75479bdc2199e7cf3cedbbb7ef388a3`.

## Manual owner check required
Use RC1R1, create/open one draft activity, change Activity Type through several new types, pause for more than two seconds, then fill settings and Apply/Save. No red 422 should appear merely because the new activity is incomplete. Validation may truthfully show blockers until required fields are filled. After this repair check, continue the single consolidated owner acceptance pass.
