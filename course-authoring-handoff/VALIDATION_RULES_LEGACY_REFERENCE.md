# Training Engine v2.0 — Validation Rules

## Package safety
- ZIP paths must be relative and path-safe.
- `manifest.json` must exist and identify a Training Engine course package.
- `course.json` (or the declared course file) must exist and parse as JSON.
- Manifest checksums, when supplied, must match exactly.
- Executable/active package assets are rejected.
- Referenced assets must exist in ZIP imports.

## Course
- `format` must be `training-engine-course`.
- `schema_version` must be `1.0` or `1.1`; new packages should use `1.1`.
- course ID/title are required.
- direction is `ltr` or `rtl`.
- module IDs are unique.
- activity IDs are unique across the course.
- mission IDs are unique across the course.

## Activities
- type must exist in `COMPONENT_CATALOG.md`.
- title should be human-facing and not expose internal IDs.
- poll/single/multiple-choice require at least two options.
- true/false correct answers must be valid.
- numeric/rating ranges must be coherent.
- response scope is `individual` or `team`.
- result display must be supported or will trigger a warning/fallback.
- content blocks must use supported types.
- image/media/resource blocks require a safe asset or HTTPS source.
- chart blocks require supported chart type and a data array.
- flow/branch targets must exist within the same module.
- completion rates must be > 0 and <= 1; minimum response count >= 1.

## Missions
- ID and title required.
- guided steps strongly recommended.
- submission type must be `none`, `text`, `url`, `file`, or `image`.
- referenced objective IDs must exist when objectives are defined.

## Objectives
When course objectives are defined, every referenced objective ID must exist.

## Human-facing quality checks
The engine validator focuses on structural safety. An independent reviewer should additionally verify:
- timing realism
- clear learning objectives
- no dead-end flow
- no hidden prerequisite
- understandable Arabic/English copy
- appropriate privacy and safety language
- valid prompt/tool instructions
- meaningful completion evidence
- accessibility of images via alt text

## Import behavior
Errors block import. Warnings require review but may not block import. Course import is transactional; validation failure must leave installed course data unchanged.

---

# v2.0 additions

- Schema `2.0` is supported in addition to legacy `1.0` and `1.1` packages.
- Legacy v1.1 packages remain importable without modification.
- Participant paths require an id, title, and at least one guided step.
- Workflow node ids must be unique within the module.
- Workflow edges must point to existing nodes.
- Workflow `path_id` references must resolve to a participant path in the same module.
- Edge scope must be `class` or `participant`.
- Unsafe course typography strings are rejected.
- SVG assets are accepted only when they pass the Core safety checks; executable/scripted SVG content is rejected.
- Published versions are immutable; changes must be made through a Draft.

## Explicit workflow graph closure (professional Core)

For every schema 2.0 module that declares `workflow`, validation is blocking unless the graph is executable:
- `start_node_id` is present and resolves to exactly one node.
- Every edge source/destination exists and edge scope is `class` or `participant`.
- Activity, mission and participant-path references resolve in the same module.
- Every non-terminal node has an outgoing transition. `closing` is terminal by type; `terminal: true` may mark another explicit terminal. A final `convergence` node remains accepted for v2.0 compatibility.
- Participant-path nodes must converge into a `convergence`/`closing` node or declare `terminal: true`.
- Branch destinations are explicit. Multi-destination participant branches use unique path destinations; other branches require edge conditions or a matching activity-flow destination.
- No node may be orphaned/unreachable from the start node.
- Every reachable node must have a route to a terminal node; closed cycles/dead-end subgraphs are rejected.
- Duplicate transitions are rejected.

The visual Builder stores conditions as structured objects and its **Build from course items** action generates a complete graph with practice branching, convergence, and closing rather than a visual-only ordered list.
