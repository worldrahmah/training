# RC1R11 change log

Incremental development build derived from the verified RC1R10 source and sealed package. No SQLite schema migration or destructive database operation.

- Reuse the canonical content renderer in Participant guided steps and Creator's executable preview.
- Add accessible prompt cards, exact-text copy with fallback/localized feedback, long-text scrolling, editable prompts, reset and resume.
- Add checked guided progress, stable IDs, branch lock, completion evidence, optional/conditional content and safe context/shared-step definitions.
- Store 12 types of individual embedded question through existing normalization/scoring/response tables, including grouped evaluations.
- Add scoped guided evaluation/path/timing reports and CSV export.
- Focus running-class Participant dashboards on the hero and current task. Put learning, tools, records and recent activity into four native arrow disclosures, preserving state during updates. An explicit admission request opens its outcome in learning.
- Expose confirmed, recoverable course/class deletion; preserve historical deliveries and make class deletion retries retain the original restoration status.
- Update schemas/capability contract, portable Creator kit, handoff, M1 EN/AR fixtures, all-activity/block playground, focused tests and release documentation.

Advanced master-prompt gaps and manual acceptance limits are listed in RC1R11_GAP_MATRIX.md. This version does not claim completion of the whole Creator closure or FINAL status.
