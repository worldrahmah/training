# Training Engine ONE — Stage 1C Brainstorm / Ideas Board Engineering Checkpoint

Release candidate: `TRAINING_ENGINE_ONE_STAGE1C_IDEAS_BOARD_v3.4.0_RC3`

Status: **ENGINEERING CHECKPOINT — NOT FINAL**. Stage 0, Stage 1A Word Cloud and Stage 1B Moderated / Upvoted Q&A are owner-accepted foundations. Stage 1C remains subject to focused owner/browser Ideas Board acceptance on the exact sealed RC3 build.

## Authority / rollback
- Immediate rollback baseline: accepted Stage 1B RC2 ZIP, SHA-256 `85bc4db2bcf78a80f1f0a3d16c796bf12538175553158e1d3d2f582970da87e8`.
- Published external authoring handoff v1.3 remains byte-preserved and is not silently overwritten by the development authoring contract.
- The canonical registry remains the source for synchronized activity/result/schema/capability surfaces.

## Stage 1C scope implemented
Ideas Board is implemented as the third complete Interaction Pack vertical slice rather than a standalone screen.

- Canonical activity: `ideas_board`.
- Canonical response/aggregation model: `idea_board` / `ideas_board`.
- Canonical result renderer: `ideas_board`.
- Builder configuration for prompt, maximum ideas, maximum characters, authored categories/columns, moderation, identity policy, upvoting/self-upvote and votes/newest ordering.
- Strict package validation, including fail-closed rejection of team response scope until team-voting semantics are intentionally designed.
- Participant idea submission using the existing persisted response envelope; no destructive database migration is required.
- Stable idea IDs and normalized retry de-duplication so reconnect/resubmit does not duplicate the same idea.
- Optional pre-moderation with Trainer approve/reject.
- Identity modes: `public`, `trainer_only`, `anonymous` with audience/report privacy behavior consistent with Q&A.
- Participant upvoting with configurable self-upvote policy.
- Live ordering by Most Upvoted or Newest.
- Trainer Highlight/Remove highlight.
- Trainer Merge Similar Ideas with an auditable, non-destructive merge model: the source idea remains stored, disappears as a separate public card, and its votes roll into the merge target. Unmerge restores the source independently.
- Audience hide-before-reveal: Participant/Projector do not receive the full result board before reveal. Approved ideas are exposed to enrolled participants during collection only through the bounded voting board needed for upvoting.
- Shared professional categorized board rendering for Participant results, Trainer and Projector.
- Projector participation metadata shows visible ideas + responding participants.
- Results History can recall an already-revealed Ideas Board without reopening it, accepting responses, changing the participant current activity, or rewinding Course Flow.
- Restart persistence, backup→mutate→restore continuity, report/export privacy and EN/AR UI coverage.

## Privacy / audience rules
Pending/rejected ideas, merge administration metadata not needed for audience rendering, and private learner identity are not exposed in recalled/public Projector payloads. Anonymous mode prevents Trainer live moderation and participant-level reports/CSV from mapping idea text back to a learner while preserving truthful aggregate participation facts.

## Automated acceptance
Dedicated gates:
- `IDEAS_BOARD_STAGE1C_PASS`
- `IDEAS_BOARD_RUNTIME_PASS`

The complete inherited ONE regression suite also passed on the final source tree and on a fresh extraction of the sealed RC3 candidate, including Word Cloud, Q&A, Projector result recall/presence/health/theme gates, EN/AR, responsive/role UI contracts, workflow validation, restart persistence, backup/restore, v2 compatibility, populated v2.1.1 migration, professional-completeness gates and the 20-participant rehearsal. Final-package exact-byte verification is recorded by the external seal report.

## Manual owner/browser gate still required
Before Stage 1C is accepted, verify on the exact sealed RC3 build:
1. Builder exposes Ideas Board settings, categories and canonical results.
2. Participant can submit multiple bounded ideas into authored categories/columns.
3. Pre-moderation approve/reject works and rejected/pending ideas never reach the public result.
4. Upvoting and self-upvote policy work correctly.
5. Votes/Newest ordering and Highlight work live.
6. Merge Similar Ideas combines the public cards and vote totals without losing auditability; Unmerge restores the source.
7. `public`, `trainer_only` and `anonymous` identity modes behave truthfully on Trainer, Participant, Projector and reports.
8. Projector remains hidden before reveal, then shows a readable professional categorized board plus idea/participant counts in Dark, Light and High Contrast.
9. A previously revealed board can be recalled later from Results History and returned to the current class without workflow rewind.
10. Arabic RTL and English LTR remain usable on phone/tablet/desktop; restart/reconnect does not duplicate ideas or lose moderation/vote/merge state.

## Next authorized stage after acceptance
Stage 1D — 100 Points / Prioritization, using the same canonical registry/privacy/result-recall foundations.
