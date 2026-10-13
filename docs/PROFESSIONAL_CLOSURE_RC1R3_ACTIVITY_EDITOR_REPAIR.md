# Training Engine ONE v3.5.0 RC1R3 — Activity Editor Transition Repair

## Owner-reproduced defect
In RC1R2 the Activity Type select could change while the type-specific settings panel stayed on the prior activity model.

## Root cause
`changeActivityType()` called `remember()` and Undo/Redo called `snapshot()`, but those helpers were absent from `builder.js`. The browser event could therefore stop before `render()` replaced the editor. Automated tests previously verified API draft persistence, not this browser-side transition execution.

## RC1R3 repair
- Restore bounded `snapshot()` / `remember()` undo helpers.
- Exercise the real Activity Type change handler in a browser-model regression harness.
- Initialize the target type immediately on selection and remove stale type-specific configuration from the previous type.
- Render a type-appropriate settings panel for all 36 canonical Activity Types.
- Add explicit Builder fields for the core response families (choice, multiple choice, true/false, text, numeric, scale, ranking, checklist, timer, and submission activities) instead of relying on hidden JSON fields.
- Keep dedicated advanced settings for Word Cloud, Q&A, Ideas Board, 100 Points, Quick Interaction, Matching, Fill Blanks, Sorting, Image Interaction, Draw/Annotate, Collaborative Board, and Interactive Video.
- Reset response scope safely on a type transition (`team_challenge` → team; other participant-input types → individual; non-response types → unset).
- Remove stale result-display state for activity types with no result surface.
- Preserve RC1R1 draft-vs-publish validation separation and RC1R2 navigation persistence.

## New gate
`BUILDER_ACTIVITY_EDITOR_PASS` verifies 36/36 canonical Activity Types render a type-appropriate settings panel and directly executes the type-change handler through multiple transitions, proving stale settings are replaced immediately.

## Release rule
RC1R3 remains an owner-acceptance candidate until the consolidated manual browser/visual gate passes.
