# ExecPlan — Admin/Trainer Collection Discovery + Configurable Reporting Closure

## Baseline facts
- Source baseline is `TRAINING_ENGINE_ONE_PROFESSIONAL_CLOSURE_v3.5.0_RC1R4.zip`.
- Baseline `npm test` reproduced PASS on Node v22.16.0 before edits.
- Existing global search exists, but collection pages do not consistently expose local search/filter/sort controls.
- Participants already present the preferred polished table visual treatment; Courses/Classes/People/Reports and trainer management surfaces are inconsistent.
- Reports currently expose fixed cards/tables/bars; users cannot select metric/dimension/chart combinations.

## Target architecture
- Add a reusable client-side collection discovery pattern shared by Admin and Trainer: search + context-specific filters + sort + result count, with no server schema change.
- Apply it to every nontrivial Admin/Trainer management collection (courses, classes, staff/participants, notifications/history, backups, class-detail participant/trainer/team/session lists where practical).
- Keep Participant and Projector free of management-discovery chrome.
- Add a constrained configurable Report Chart Workspace using existing report APIs. It only allows proposed metric/dimension combinations that exist in returned report data; no arbitrary SQL/field entry.
- Use a lightweight in-product SVG chart renderer (bar/line/pie) with table fallback; no cloud/external chart dependency.

## Milestones
1. Shared collection-discovery utilities/CSS and Admin coverage.
   - Validation: `node tests/collection-discovery.mjs`.
2. Trainer coverage including class/detail/report collections.
   - Validation: `node tests/collection-discovery.mjs`.
3. Configurable Admin/Trainer report chart workspace with valid preset catalog, EN/AR and permission-safe data.
   - Validation: `node tests/report-chart-workspace.mjs`.
4. Full regression and sealed-byte verification.
   - Validation: `npm test` plus new tests.

## Database migration / rollback
- No database/schema migration is required. All discovery controls are client-side views over existing authorized API data.
- Report chart configuration is transient UI state; no persistence change is required for this closure.
- Rollback is exact RC1R4 artifact.

## Backward compatibility
- No course schema changes.
- No API response shape removals.
- No historical data mutation.
- Existing permissions continue to constrain report/API rows before local filtering/charting.

## UI/UX matrix
- Admin + Trainer: English LTR / Arabic RTL; light/dark/system; desktop/tablet/mobile.
- Search toolbars must wrap without overlap at narrow widths.
- Empty query/filter states must be explicit and resettable.
- Charts must have accessible labels/legend and a table fallback.
- Projector/Participant unaffected by management UI changes.

## Risks / non-goals
- Non-goal: full arbitrary BI/query builder.
- Non-goal: external charting/cloud dependencies.
- Risk: large client-side lists; current product data sizes are appropriate, but controls should be structured so server pagination can be added later.
- Risk: hiding rows client-side must never be confused with authorization; server authorization remains authoritative.

## Decision log
- Use constrained proposed datasets/metrics rather than arbitrary user-entered fields.
- Add chart-type compatibility rules (pie only for a single additive series; line for ordered datasets; bar otherwise).
- Keep the current visual system and improve consistency instead of redesigning role surfaces.

## Final release checklist
- Baseline PASS recorded.
- Admin/Trainer collection search/filter/sort coverage gate PASS.
- Report chart workspace gate PASS.
- I18N/Responsive/Role surface tests PASS.
- Complete inherited `npm test` PASS.
- Regenerate authoring/root checksum manifests.
- Seal new artifact and rerun full suite from fresh extraction.
- Owner manual browser acceptance remains required before FINAL.
