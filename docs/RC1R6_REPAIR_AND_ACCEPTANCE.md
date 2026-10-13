# RC1R6 — baseline repair and consolidated acceptance

Status: OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL. Source authority is exact RC1R5 SHA-256 0262559de4464712888734e1addfbcd3de2b178822d1a188641e22daf8f24016. This is a compatibility-preserving repair candidate; no schema migration or school expansion is introduced.

## Repairs
- Explicit audience projections strip all Trainer guidance in every phase and hide solution/score definitions until permitted Reveal. Matching retains independent choices, image activities retain labels without coordinates, and video retains questions without keys. Recalled results retain only audience-safe definitions.
- Public Explain and personal feedback use only activity.explanation. A private trainer.explanation cannot be published as fallback; add public explanation through a derived draft/version when needed.
- Response acknowledgement is submitted status, not pre-Reveal score/correctness. Scores remain persisted and Trainer-accessible. Learner totals/transcript scores count revealed live activity results; historical challenge details are redacted from learner event payloads without altering stored records.
- Assigned-class cohort analytics exclude classes outside the caller's scope. Admin retains global authorized comparisons. Daily report trends use the existing report authorization boundary.
- Course/PPTX imports use one bounded ZIP reader checking CRC, names, duplicate/case-colliding paths, local/central agreement, traversal, overlap, entry/expanded limits and unsupported archive formats. Corrupt/ambiguous input fails truthfully. Non-ZIP64, unencrypted stored/deflate archives are supported; maximum 4,096 entries, 32 MiB per entry and 100 MiB expanded total. Existing upload limits still apply.
- Restored Admin role display and authenticated CSV export. Added keyboard-safe named dialogs, local official Montserrat/Cairo with pinned source/license/hash provenance, responsive complete analytical comparisons, filtering/table equivalents and valid chart combinations.
- Participant displays persisted submission/update state and restores common answer inputs. Closed unsubmitted activities show the truthful closed state. Internal Live state/type labels are replaced with learning-facing labels. Empty assessments show no-data instead of false zero accuracy; result labels have explicit layout spacing.
- Both activity schema copies document the same supported private Trainer fields; current machine authoring policy records the reveal/privacy boundary. Canonical activity/result counts are unchanged.

## Verification commands
`npm test`: complete inherited suite plus ZIP integrity, full-payload privacy/authorization and chart semantics. Scoring tests inspect stored/post-Reveal evidence instead of relying on a pre-Reveal scoring oracle.

`npm run test:browser`: Python Playwright 1.62.0 plus Chromium. QA dependencies are separate from the dependency-free application. Runs with disposable external data and blocked external browser requests; verifies real font loading and representative role interactions. ONE_BROWSER_EXECUTABLE and ONE_BROWSER_EVIDENCE_DIR support custom browser/evidence paths.

Evidence, seal status and exact outcomes belong in docs/verification and the delivered seal report. A command is verified only when its completed outcome is recorded. Generated certification evidence may change timestamps in a test extraction; application source must remain unchanged there.

## Upgrade and rollback
1. Retain the exact RC1R5 source ZIP and create/verify database+storage backup using the running Engine. Keep an external copy.
2. Stop the old Engine cleanly. Extract RC1R6 into a separate writable release folder.
3. Preserve the existing data/storage/backup/export directories. Use TRAINING_ENGINE_DATA_DIR, TRAINING_ENGINE_STORAGE_DIR, TRAINING_ENGINE_BACKUP_DIR and TRAINING_ENGINE_EXPORT_DIR, or copy verified data/storage while stopped. Never replace an owner database with a demo database.
4. Start the new Engine. No schema migration is introduced by RC1R6; existing additive startup logic remains. Check version, sign-in, old course/class/history/assets and one representative delivery/response/reveal/report.
5. If rolling back, stop RC1R6, restore the original source and retained configured state. For any unrelated later data mutation, use the verified safety backup rather than guessing database edits. An in-place update helper and crash-safe atomic restore remain future work.

Distribution omits database/WAL/SHM, live sessions, owner storage, backups and exports. New installations retain the existing bootstrap/demo behavior; identity/provisioning hardening is a later scope. Existing accepted content/IDs remain unchanged.

## Owner consolidated acceptance
- Admin Participants loads with populated staff/learner rows in EN/AR; search/filter/sort/reset/counts and CSV export work.
- Matching on a learner device shows usable choices, submits, confirms saved state and retains choices for update. Check hidden-before-Reveal and personal feedback after Reveal; private Trainer notes stay off Participant/Projector.
- Reports show all returned rows, filter/count accurately and provide a table. Bar labels remain readable on mobile; Line is restricted to ordered data and Pie to declared additive groups; zero totals remain zero.
- Keyboard users can enter, operate and dismiss dialogs with focus returned; narrow/RTL layouts remain usable and local fonts load offline.
- Projector remains readable at room scale in Dark/Light/High Contrast; pairing/presence/result recall and workflow progress behave as before.
- One existing course/class/database/assets/report survives supported upgrade/rollback rehearsal.

The stage's design and technical evidence do not certify global "number one" status or complete all later product work. FINAL still requires the broader roadmap and owner acceptance of exact sealed bytes.
