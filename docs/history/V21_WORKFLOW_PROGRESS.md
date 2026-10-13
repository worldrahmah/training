# Training Engine v2.1 — Workflow Progress Tracker

- Persisted per class/module/node in `class_workflow_progress`.
- Trainer states: Done, Current, Next, Upcoming, Blocked, Skipped; participant path nodes can also show Working.
- Color is never the only cue; every state has an icon and text label.
- The next permitted section is the only normal start action in schema 2.0 workflows.
- Deliberate Skip is confirmed, persisted and audited.
- Class-level branch selection can lock non-selected immediate branches.
- Personal practice paths are aggregated from participant runtime state and recorded when practice closes.
- Refresh and server restart reconstruct the same workflow position from SQLite.
- Super Admin read-only live monitoring receives current/next workflow position.
- Legacy courses without a workflow retain their existing live activity controls.
