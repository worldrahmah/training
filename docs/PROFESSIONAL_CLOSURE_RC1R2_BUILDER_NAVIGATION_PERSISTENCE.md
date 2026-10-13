# Training Engine ONE v3.5.0 RC1R2 — Builder Navigation Persistence Repair

Status: **OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL**

## Owner-reproduced behavior
After the RC1R1 draft/422 repair, changing an Activity Type correctly updated the in-memory draft and no longer failed with HTTP 422. However, that transition intentionally did not schedule the old 1.2-second autosave. If the trainer clicked the Builder top **Back** control before an explicit Save, leaving and re-entering Builder reloaded the last server revision and the selected Activity Type appeared to revert.

## Root cause
The type-transition handler correctly used a non-disruptive dirty state, but navigation out of Builder did not flush that dirty draft before leaving. The draft API itself was already safe for semantically incomplete activities after RC1R1.

## RC1R2 repair
- The Builder top **Back** action is now persistence-aware: if the draft is dirty it performs a quiet draft save before navigating to Trainer.
- Switching to another course also flushes a dirty draft before opening the next course.
- Browser/tab navigation with dirty Builder state triggers the browser's unsaved-change warning instead of silently discarding changes.
- The Activity Type transition still avoids the disruptive 1.2-second autosave while the trainer is filling newly rendered settings.
- Publish remains strict and incomplete activities remain validation blockers until configured.

## Regression gate
`BUILDER_DRAFT_TRANSITIONS_PASS` now additionally asserts that Builder Back and course switching use persistence-aware navigation and that unsaved browser navigation is guarded. The server-side loop still verifies all 36 canonical Activity Types persist as incomplete drafts without HTTP 422, while malformed draft structure and incomplete Publish remain blocked.

## Owner recheck
Change an Activity Type, click the Builder top **Back** without pressing Save, re-enter the same course/draft, and confirm the selected type remains. Then continue the consolidated acceptance pass.
