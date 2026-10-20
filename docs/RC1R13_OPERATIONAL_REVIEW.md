# RC1R13 operational review

Owner corrections supersede RC1R12's archive-backed Delete and dashboard-only focus. Baseline: b0568cbd850e3a67e43d8ec7f7db045da37c608c. Unchanged 64-command baseline rerun passed before edits. The complete master-prompt scope remains; RC1R12's 91-section trace is retained as its historical implementation receipt, with the operational changes below superseding deletion and classroom layout descriptions.

| Owner issue | Implemented behavior | Evidence |
|---|---|---|
| Delete was Archive | DELETE course/class persists a distinct Trash marker; Archive stays separate; Trash has Restore and administrator-only name-confirmed permanent deletion | operational-workspace.mjs; browser-operational.py |
| Existing archived items | Existing intent is ambiguous, so old Archive records are retained; each course/class has an explicit Move to Trash action | API/real browser and migration review |
| Slow return to workspace | Shell paints immediately; home loads its dashboard without catalogs/people; no duplicate startup fetch; optional settings load separately; refreshes coalesce and obsolete view responses are discarded; EventSource closes on page exit | held-catalog/people browser regression; local receipt records actual time |
| Hard course creation | Lesson starter connects presentation, guided practice/reflection and closing using ordinary canonical nodes; course outline, direct edit autosave and content-first editor; optional facilitation/results/flow are closed under Advanced settings | blank course -> real browser editing -> exact ZIP -> separate recipient -> complete runtime |
| Broken mission editor | Removed an undefined path reference and irrelevant path-library controls from mission editing | actual mission edit/save browser regression |
| Student running class clutter | /student/class?class_id=... shows only that selected class, hero/task and side/bottom navigation; no other-class banners/cards; /student?workspace=1 explicitly returns to all learning | two simultaneously active classes, EN/AR, phone/tablet/desktop |
| Ended class switched context | Dedicated classroom remains on its selected class and offers Return to workspace; it cannot silently show another running class | strict server projection and browser lifecycle checks |
| Connected deletion flows | Trash excluded from normal lists, search, counts and actionable surveys/quizzes; direct/slow writes blocked; original history retained on Trash/restore; purge removes dependent data via FK cascades and invalidates affected report snapshots | positive/negative API, delayed-body race, FK checks |

No existing owner records are permanently deleted by this upgrade. Only a future explicit administrator-confirmed purge does so. Published versions and schemas remain compatible. See upgrade/migration/security notes and full validation receipts. This is an engineering candidate; no universal bug-free or manual hardware acceptance claim is made.
