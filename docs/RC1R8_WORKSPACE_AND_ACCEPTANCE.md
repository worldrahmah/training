# RC1R8 Professional Workspace owner-acceptance candidate

This release implements the owner's approved training-center milestone. It evolves RC1R7; it does not introduce a school model, tenancy or a replacement core. Application 3.5.0-rc.1.8; core/data 3.2; canonical course schema 2.0; 36 activities and 68 result-view cases remain the certification boundary.

The complete unchanged RC1R7 Node baseline passed before edits. Exact original RC1R5 authority remains SHA-256 `0262559de4464712888734e1addfbcd3de2b178822d1a188641e22daf8f24016`; RC1R7 package is `06440367a2fca0ff2808134523ff8df415117d8f896be320a0a3a8b6e195773a`. Historical v1.3 authoring ZIPs are unchanged. Current authoring capabilities/menus/schemas synchronize mechanically to the canonical registry; the in-tree RC1R8 kit is current for this candidate.

## Resulting behavior

- Withdrawn participants leave the current roster, return to the add picker, and resume retained responses/objective/mission history when re-enrolled. No learning reset or deletion.
- Builder milestone options include reviewed deletion. Cross-milestone references block deletion and identify the affected content. Published versions remain immutable. New milestones use supported linear behavior unless an explicit workflow is authored. Validation details show cause, repair guidance and an affected-item action; an empty explicit workflow can be replaced by linear flow.
- Count summaries open searchable authorized tables with record drill-downs; learner evidence is restricted to the signed-in learner. Reports retain existing chart workspaces/CSV exports and add seven branded PDF templates.
- Reusable participant and staff groups include names, descriptions, tags and multiple membership. Class application previews exact eligible/skipped people, snapshots membership and does not grant access automatically. Preview expiry, ownership and changed-data checks prevent stale or repeated writes.
- Registered class-code requests stay pending without enrollment/content access. Leads or explicitly authorized class managers approve; Admin can intervene. Capacity and prerequisites are rechecked at decision time. The inbox, navigation badge and personal notifications expose requests. Class closure cancels pending requests.
- Course Editors have an authoring-only workspace: own/assigned drafts and explicit per-course publication rights. Operational, people, live, report and backup APIs fail closed, even when called directly. Editor accounts cannot be assigned to classroom delivery.
- Full profiles for every role include optional bilingual names/contact/bio/photo and authorized learning/teaching history. Full-profile contact fields are restricted to the owner/Admin/authorized manager; other assigned trainers receive a limited learner profile. Existing class-roster access follows the authorized teaching-team class-view permissions.
- Admin selects from 20 English and 20 Arabic locally licensed fonts. Montserrat/Cairo remain initial defaults. Selections apply to management, Builder, learner and Projector surfaces. Global selection takes precedence over old course font overrides.
- Seven PDF defaults: Class, Learner, Course, Attendance, Assessment, Participant Group, Trainer Activity. Reviewed snapshots freeze evidence, date range, branding and font bytes; repeated downloads return the same saved PDF. Access revocation is rechecked on export. Worker threads keep PDF generation away from live request processing. All fonts, PDF runtime and licenses are bundled for offline operation.
- Navigation stays in its own viewport area while page content scrolls; compact backup tools wrap. Disclosure menus remain attached to the trigger and fit within viewport margins. Profile/logo raster uploads enforce format, dimensions, size and PNG integrity.

## Verification and owner gate

Current machine/human evidence is under `docs/verification/rc1r8`; historical evidence remains labeled by version. Use `npm test` (54 commands / 53 test programs plus contract synchronization), `npm run test:browser`, and the release verifier. The immutable ZIP's companion seal report records fresh-extraction CRC/path/collision/checksum tests and complete tests from those bytes. A source-tree pass is not an exact-ZIP pass.

Owner acceptance remains open: install on Windows, migrate a copied real installation, inspect each role in EN/AR and selected fonts, rehearse a classroom with participant devices and a physical Projector, and review the PDF reports. Automated evidence cannot certify a world ranking or prove every layout combination. This candidate is not FINAL until those acceptance checks are completed.

## Independent review prompt

Inspect the exact RC1R8 ZIP and companion SHA/seal report. Verify CRC, safe unique paths, all current checksum manifests and release identity. Run the complete Node and four browser suites on freshly extracted bytes. Review Editor isolation, pending admission/reveal privacy, capacity/stale-decision rejection, re-enrollment history, group snapshot semantics, contact/photo authorization, global offline fonts, EN/AR shaped multipage branded PDFs, backup/restore and populated v2.1.1/RC1R7 migration. Compare the source coverage ledger and known limitations with actual evidence. Report reproducible defects; do not infer manual owner acceptance or whole-platform FINAL from automated PASS.
