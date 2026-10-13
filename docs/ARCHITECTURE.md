# Training Engine v2.0 Architecture

## Core separation

Training Engine maintains a strict separation between:

1. **Course definition** — declarative, versioned course content and workflow.
2. **Delivery state** — class/session/projector/live classroom state.
3. **Participant state** — independent path, step, responses, submissions, help and completion.
4. **Historical data** — immutable delivered-version lineage, events, reports and audit evidence.

## Primary surfaces

- `/admin` — Super Admin global operations and administration.
- `/trainer` — scoped trainer delivery and class/course work.
- `/builder` — visual course authoring for authorized users.
- `/student` — participant dashboard and guided personal practice.
- `/present` — clean projector scene runtime.

## Canonical course model

Imported `.course.zip` packages and visually authored courses resolve to one canonical internal model. Published versions are immutable. Editing a published version creates a Draft derived from that version. Drafts are validated before publish.

## Workflow model

A module may include a workflow graph with nodes and edges. The model distinguishes:

- `class` scope — one branch controls the trainer/classroom path;
- `participant` scope — each participant independently selects/evaluates a path.

Participant paths contain ordered steps with instructions, content blocks, prompts, resources, completion rules, offline metadata, scoring and optional achievement.

## Persistence and migration

SQLite remains the local system of record. v2 migrations are additive and run in place. Historical IDs and delivered course versions are retained. New tables cover permissions, notifications, consents, participant runtime state, help requests and course-draft snapshots.

## Compatibility

Schema 1.0/1.1 packages continue to validate and run. Schema 2.0 adds workflows, participant paths and richer branding/typography. Existing historical deliveries are not rewritten merely because the Core was upgraded.
