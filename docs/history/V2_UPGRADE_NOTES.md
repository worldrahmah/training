# Training Engine v2.0 FINAL Upgrade Notes

v2.0 is an in-place compatible evolution of the accepted v1.2 Core, not a clean rewrite. RC4 specifically repairs the operational and authoring gaps identified during RC1 owner review.

## FINAL scope

## Responsive/UI closure

The accepted FINAL release includes the RC4 cross-product responsive design pass rather than another single-screen patch. Admin and Trainer now use a dedicated mobile shell with complete navigation via a More sheet; forms, page actions, class setup, permission controls, progress/help boards, reports, analytics, Course Builder, participant learning surfaces and dialogs reflow through defined breakpoints. Tables and workflow canvases keep wide data inside local scroll regions instead of widening the page. Narrow-screen input sizing, modal sheets, long-label handling, landscape-phone behavior and Arabic/English parity are part of the acceptance contract.


### Course operations
- Course creation now creates an editable initial Draft.
- Course/version management exposes Preview, Draft-from-version and Builder entry points.
- Imported and in-engine courses share the same canonical Builder/runtime model.
- Normal authoring uses a visual UI rather than Advanced JSON editing.

### Class operations
- Class creation includes exact Course Version, Lead Trainer, additional Trainers/Assistants, existing Participant enrollment and optional CSV roster import.
- Class management includes trainer assignment, participant add/import/remove, sessions, teams, attendance, readiness and lifecycle.
- Participant removal withdraws enrollment and removes team membership without destroying historical delivery evidence.
- Authorized Trainers receive class administration only through their role/grants/lead assignment.

### Visual Course Builder
- Tree, Edit and Preview modes.
- Visual milestone/module, activity, mission, participant-path and workflow editing.
- Presentation blocks and guided steps.
- Workflow nodes/edges with class-level and participant-level branch scope.
- Trainer/Projector/Participant preview and participant-path simulation.

### Projector
- True presentation-scale stage.
- Large typography/media/charts/results.
- Minimal presentation chrome.
- Previous/Next plus keyboard/clicker-compatible navigation.

### Permissions
- Normal Super Admin permission management is visual by Course/Class/action and no longer exposes raw permission strings.

## Compatibility

Existing schema 1.0/1.1 course packages remain supported. Existing v1.2 databases migrate in place. Historical deliveries and published versions remain preserved and immutable.


## Projector presentation closure

The FINAL release preserves the accepted RC4 projector closure that replaces the residual webpage-like Projector composition with a true presentation canvas: clean live chrome, 16:9-safe composition, room-scale type, large result visualizations, presentation-scaled images/cards/statistics, professional default scenes for legacy heading/body content, and clean question/options composition. Live delivery hides Course/Class metadata and utility buttons from the audience.
