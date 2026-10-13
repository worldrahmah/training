# Training Engine ONE — Role and UI/UX Contract

## Product rule
A role sees the environment needed to do that role well. The interface must never feel like one giant administration dashboard with different buttons hidden.

## Super Admin
Purpose: govern the platform.

Primary workspaces:
- overview / operational health;
- staff and permissions;
- participants;
- courses and versions;
- class administration;
- global search and saved views;
- reports and analytics;
- backups, audit and settings.

The Admin surface may monitor live classes but should not become the Trainer's delivery console.

## Trainer
Purpose: prepare and deliver assigned training.

Normal Trainer workspace includes:
- assigned/upcoming/active/completed classes;
- rosters and teams where authorized;
- sessions and attendance;
- classroom readiness;
- course/version information;
- class-scoped reporting;
- entry into Live Classroom.

The Trainer dashboard is preparation/management, not the live-delivery UI.

## Live Classroom
Purpose: run exactly one live class.

A Trainer entering Live Classroom receives a dedicated class-bound window with:
- class identity + join code;
- Course Flow hierarchy;
- Done / Current / Next / Upcoming / Blocked / Skipped state;
- Jump to Current / Jump to Next;
- current scene/activity/practice controls;
- live class timer + planned time remaining;
- connected / working / finished / needs-help metrics;
- Participants panel;
- Help Queue;
- submission Review queue;
- random participant/team picker;
- class-scoped Projector pairing;
- Previous / Next / Hold / Break / Close / Reveal / Finish controls when applicable.

It must not show platform administration, system backups, global reports or unrelated classes.

## Participant
Purpose: learn and participate.

Participant UX prioritizes:
- clear current class and next action;
- class joining via short code;
- schedule/upcoming sessions;
- current live task;
- independent path and resume state;
- Need Help;
- submissions and trainer feedback;
- notifications;
- completed learning/progress;
- profile and consent controls.

## Projector
Purpose: present to the room.

The Projector is a stage, not a dashboard:
- class-specific pairing;
- minimal chrome;
- presentation-scale type/layout;
- results and media only when authorized by Trainer state;
- no administrative controls;
- no participant identities unless a supported live interaction deliberately permits it;
- keyboard/clicker navigation where paired control is allowed.

## Course Builder
Purpose: safely produce executable course versions.

Builder UX requires:
- tree / edit / preview structure;
- autosave state and visible save/readiness state;
- Undo/Redo;
- revision history + compare + restore;
- reusable templates;
- asset library + usage/dependency safety;
- strict workflow graph editor + simulator;
- preview as Trainer, Participant and Projector;
- validation blockers vs warnings;
- immutable publish flow.

## Presentation quality
Every surface must remain:
- modern and uncluttered;
- responsive from narrow phones through large projector displays;
- touch friendly;
- keyboard navigable where normal browser controls permit;
- English LTR / Arabic RTL mirrored appropriately;
- consistent in spacing, typography, status language and action hierarchy;
- explicit about dangerous/destructive actions;
- truthful about loading, success, failure and conflict states.

## ONE premium visual architecture

The role contract is implemented through a dedicated premium visual layer loaded after the stable compatibility stylesheet. This is intentional: business logic and historical course compatibility must not depend on a particular visual theme, while the user experience can continue to improve.

The six principal surfaces must be immediately distinguishable visually as well as functionally. Shared controls remain consistent, but each role has its own hierarchy, density and presentation language.
