# Training Engine ONE v3.5.0 RC1R5 — Admin/Trainer Discovery & Configurable Reports Closure

Status: **OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL**

## Owner requirement
The owner approved the Participants management visual direction and required the same professional discovery treatment anywhere Admin or Trainer manages a meaningful collection. Reports must also become chart-rich and configurable from proposed, permission-safe data rather than remaining fixed tables.

## RC1R5 closure
RC1R5 extends the accepted RC1R4 full-activity-certified baseline without changing Participant or Projector into management surfaces.

### Admin / Trainer collection discovery
Reusable local discovery controls now provide context-appropriate search, filter, sort, reset, result-count and no-result states across the principal Admin and Trainer management collections. Covered surfaces include courses, classes, participants/users, trainers/team, live classes, messages, reports/history, backups and relevant class/live participant lists. Builder course-tree, reusable-template and revision-history discovery are also improved.

The controls are role-local and client-side over data already returned by authorized endpoints; they do not bypass server authorization or widen data access.

### Responsive action-bar / Builder polish
Collection toolbars and action regions wrap responsively. The Builder module/tree actions are repaired so narrow layouts do not overlap the module title or adjacent controls.

### Configurable Reports workspace
Admin and Trainer Reports now include a constrained Chart Builder. Users select only from proposed datasets and valid metrics available to their role, then choose Bar, Line, Pie or Table. Charts render locally with SVG/HTML and make no cloud/chart-service request.

Admin proposed datasets include course performance, class completion, attendance, participant paths, learning objectives and course/version performance. Trainer datasets include course performance, class performance, participant performance and trainer activity.

This is intentionally a professional reporting workspace, not an arbitrary BI/query builder.

## Dedicated gates
- `COLLECTION_DISCOVERY_PASS`
- `REPORT_CHART_WORKSPACE_PASS`
- `CONTRACT_SYNC_PASS`
- all inherited RC1R4 activity certification and ONE regression gates

## Manual acceptance focus
The owner only needs to visually inspect representative Admin/Trainer collection pages, confirm search/filter/sort usefulness and responsive layout, and exercise both Admin and Trainer Chart Builder with a few dataset/metric/chart combinations. Participant and Projector should remain free of management-search chrome.

RC1R5 remains **NOT FINAL** until this consolidated visual/browser acceptance passes.
