# RC1R7 feature/tool review and enterprise direction

The owner requested a deep review of product behavior as well as design. This release reviews the principal role workflows, scans the current API/tool inventory, fixes reproduced operational defects and adds real interaction/data checks. It does **not** label every legacy handler fully inspected. `FEATURE_REVIEW_LEDGER.json` and `API_ROUTE_INDEX.json` distinguish review scope from indexing and verification.

## Findings and implemented behavior

| Area | Finding | RC1R7 result | Evidence |
|---|---|---|---|
| Entry/appearance | Fixed white controls and light cards could disagree with effective system appearance | Theme-driven entry surfaces and shared preferences menu; actual locale typography refresh | Browser entry matrix and solid-background contrast checks |
| Builder | Actions competed with milestone titles; item operations dominated rows | Add/options disclosures, contextual tools, visible save/publish, immediate editor after Add | Browser menu/edit/save/reload, all-type Builder/settings tests |
| Learner navigation | Account/language/theme controls crowded the task; task titles repeated | Compact account menu, class context above one task, preserved submit/update states | Participant browser checks and saved-response tests |
| Arabic | Translated paragraphs inherited an LTR course direction | Paragraph base direction, logical spacing and isolated account names | Glyph-position check for the final Arabic full stop inside an English course |
| Typography/settings | Font controls claimed changes despite canonical font enforcement | Display the actual Montserrat/Cairo contract; administrative settings/allowed bulk actions align with administrative roles | Settings/browser review and valid/invalid bulk tests |
| Staff | Administrator blocked from Admin while the bootstrap “Trainer” had super privileges | Authorized Admin entry, explicit role identity, dedicated staff directory | Actual browser-created trainer and role-specific API checks |
| Staff writes | Rejected elevation could change fields first; protected accounts and last active super admin were insufficiently protected | Validate/authorize before transaction; protect root accounts; preserve an active super admin; revoke role-change sessions | Negative tests inspect unchanged records and retired sessions |
| Access/course tools | Catalog/content/search and answer-bank/template paths had inconsistent course ownership | Scoped list/content/tool/search access and class-scoped course-improvement data | Authorized/unauthorized object tests and original privacy regression |
| Permissions | View grants could operate delivery; malformed replacement grants could erase valid ones | Separate view/control checks; validate supported grants before replacing them | Read-allowed/write-denied and retained-grant tests |
| Class setup | Multi-record setup could partially persist; drafts/malformed/over-capacity setup were accepted | Transactional setup, clear input checks and published-version requirement for new classes | API rejected-write tests and existing setup/migration suites |
| Quiz tooling | A class could use a bank from another course | Enforce bank/course relationship | Cross-course negative test and existing assessment suites |
| Preview | “Preview” opened a placeholder without the selected course | Actual authorized version with Trainer/content/Projector views in a shared-session frame | Browser role-view/theme test and source authorization |
| Search | Native prompt and non-actionable course results | Live scoped search dialog with genuine course/class/participant drill-down | Browser search selects and opens the real record |
| Calendar/progress | Calendar omitted authentication; card percentage was synthesized from arbitrary weights | Authorized calendar download and explicit actual participation counts | Browser calendar file validation; learner/report regression |
| Required password | Forced change could strand the user at a generic API error | Dedicated password flow; current password cannot be reused | Real browser onboarding and negative password test |
| Offline/input | Replay was never invoked; rejection could delete answers; asynchronous submit could lose its form reference; redraws discarded unsent values | Reconnect/startup/focus replay, ownership, acknowledged removal, retained rejection review, stable form/drawing drafts | Actual disconnect/reconnect, rejection/other-owner retention, redraw and saved-answer checks |
| Startup/shutdown | Stop matched port listeners and always reported success | Instance-bound authenticated local stop, graceful exit and truthful failure; unrelated service preserved | Actual server/CLI and foreign-listener test |
| Restore | Copying database/assets could leave a partial accepted replacement | Staged swaps, rollback and recover-before-open journal | Nine interruption scenarios plus real API backup/restore/restart |

## Research basis

Official W3C source material on HTML direction, disclosure controls and WCAG contrast, and OWASP API guidance on object/function authorization were retrieved and inspected for the relevant guidance. Source URLs, retrieval results and snapshot hashes are recorded in `RESEARCH_REFERENCES.json`; reference snapshots are in `verification/research`. Direct website requests were blocked by the environment's network policy; official repository sources were used without weakening TLS verification.

Applied rules include paragraph `dir=auto` when content language differs from its parent, correctly named disclosure buttons with expanded/control state, keyboard behavior, actual 4.5:1/3:1 relative-luminance thresholds, role/function checks and per-record authorization. These references are design/engineering evidence, not endorsements or certifications.

## Verification interpretation

The complete inherited test suite still exercises the canonical contract, all 36 activities/68 result-view cases, response/scoring/reveal, historical populated migration, restart, backup/restore and the 20-participant API rehearsal. New operational tests inspect meaningful data outcomes; browser tests perform actual writes, downloads, saved edits and recovery. An HTTP 200 alone is not recorded as functional proof.

The browser matrix reads every current Admin and ordinary-Trainer navigation view in EN/AR and light/dark, plus entry/system variants and Builder/Participant/Live/Preview workflows. Screenshots and solid-background checks are review aids. Not every dialog, every activity variant, every screen reader or hardware configuration has been visually certified.

## Further enterprise work, without inventing school scope

1. Resolve deployment/organization scope, then establish explicit tenancy or a single-organization capability profile. Do not bolt tenant fields onto the current database without migration analysis.
2. Define organizational identity/provisioning, SSO/MFA/session/device expectations, retention and privacy controls. For schools, obtain age/jurisdiction/safeguarding and guardian-access decisions first.
3. Introduce a deterministic schema-migration journal and supported upgrade preflight/rollback tooling. Keep populated historical-data rehearsal and verified backup safety.
4. Set measured load/concurrency/reconnect targets and test realistic classroom networks/storage, then optimize proven hot paths. The current 20-person rehearsal is a starting point, not a large-scale claim.
5. Complete activity-specific visual editors/previews, media accessibility, all-state design consolidation and contextual tours. Use classroom/learner evidence to prioritize, rather than adding decorative dashboards.
6. Close the independent authorization/transaction/accessibility/visual audit, freeze the Core, regenerate the final AI Course Creator kit and complete owner acceptance before calling the full product FINAL.

These are concrete release gates. RC1R7 improves the existing platform rather than disguising missing features with renamed roles or fake-success tools.
