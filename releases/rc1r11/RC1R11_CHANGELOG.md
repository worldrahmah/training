# RC1R11 change log

Incremental development build derived from the verified RC1R10 source and sealed package. No SQLite schema migration or destructive database operation.

- Reuse the canonical content renderer in Participant guided steps and Creator's executable preview.
- Add accessible prompt cards, exact-text copy with fallback/localized feedback, long-text scrolling, editable prompts, reset and resume.
- Preserve mission-only practice, legacy upload-completion declarations and simple missions without steps. Use LAN-compatible cryptographic ID generation.
- Add checked guided progress, stable IDs, branch lock, completion evidence, optional/conditional content and safe context/shared-step definitions.
- Store 12 types of individual embedded question through existing normalization/scoring/response tables, including grouped evaluations.
- Add validated course-package export in Builder Tools, checksummed asset integrity checks, and a verified second-server import/runtime round trip.
- Add scoped guided evaluation/path/timing reports and CSV export.
- Focus running-class Participant dashboards on the hero and current task. Put learning, tools, records and recent activity into four native arrow disclosures, preserving state during updates. An explicit admission request opens its outcome in learning.
- Preserve legacy active-context API fields while exposing running-class metadata for the focused UI. Return to the normal dashboard after delivery ends; enforce read-only personal responses in Front-of-Room mode.
- Expose confirmed, recoverable course/class deletion; preserve historical deliveries and make class deletion retries retain the original restoration status.
- Update schemas/capability contract, portable Creator kit, handoff, M1 EN/AR fixtures, all-activity/block playground, focused tests and release documentation.

Advanced master-prompt gaps and manual acceptance limits are listed in RC1R11_GAP_MATRIX.md. This version does not claim completion of the whole Creator closure or FINAL status.
