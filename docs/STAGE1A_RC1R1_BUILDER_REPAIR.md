# Stage 1A RC1R1 — Builder Activity Editor Repair

Status: `ENGINEERING_CHECKPOINT_STAGE1A_WORD_CLOUD_NOT_FINAL`

## Owner-reproduced defect

On the sealed Stage 1A RC1 build, selecting an activity in Course Builder failed with the browser error `blockEditor is not defined`. Because the exception occurred while rendering the activity editor, the Activity type control and all activity-specific controls were inaccessible.

## Root cause

The Stage 1A edit of `app/public/builder.js` replaced `editActivity()` but accidentally omitted two pre-existing helper functions used by that editor: `blockEditor()` and `activityOptions()`. Static Word Cloud tests checked for Word Cloud tokens but did not assert the complete activity-editor dependency surface, so automated RC1 tests did not catch the browser-time reference error.

## Repair

- Restored `activityOptions()` from the accepted Stage 0 Builder behavior.
- Restored `blockEditor()` from the accepted Stage 0 Builder behavior.
- Preserved the Stage 1A Word Cloud-specific `editActivity()` implementation.
- Added regression assertions requiring both helpers and the `Activity type` control to exist in the Builder source.
- Bumped the repair checkpoint identity to `TRAINING_ENGINE_ONE_STAGE1A_WORD_CLOUD_v3.4.0_RC1R1` / `3.4.0-rc.1.1`.

## Acceptance status

Automated regression must pass again on the exact sealed RC1R1 bytes. Owner/browser manual verification remains required. This repair checkpoint is not FINAL until the owner confirms the activity editor opens and the Stage 1A Word Cloud manual gate passes.
