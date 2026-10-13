# Training Engine ONE — Stage 1B Moderated / Upvoted Q&A Engineering Checkpoint

Release candidate: `TRAINING_ENGINE_ONE_STAGE1B_QA_v3.4.0_RC2`

Status: **ENGINEERING CHECKPOINT — NOT FINAL**. Stage 0 and Stage 1A Word Cloud are owner-accepted foundations. Stage 1B remains subject to focused owner/browser Q&A acceptance on the exact sealed RC2 build.

## Authority / rollback
- Immediate rollback baseline: accepted Stage 1A RC1R5 ZIP, SHA-256 `f83a938d8626d3b8318504d37c79125ec97e618e1ae00a0a5bd8f9c0e6055b55`.
- Published external authoring handoff v1.3 remains byte-preserved and is not silently overwritten by the development authoring contract.
- The canonical registry remains the source for synchronized activity/result/schema/capability surfaces.

## Stage 1B scope implemented
Q&A is implemented as the second complete interaction vertical slice rather than a standalone screen.

- Canonical activity: `q_and_a`.
- Canonical response/aggregation model: `qa_board`.
- Canonical result renderer: `qa_board`.
- Builder configuration for question/prompt, maximum questions, maximum characters, moderation, identity policy, upvoting/self-upvote, and votes/newest ordering.
- Strict package validation, including fail-closed rejection of team response scope until team-voting semantics are intentionally designed.
- Participant question submission using the existing persisted response envelope; no destructive database migration is required.
- Stable question IDs and normalized retry de-duplication so reconnect/resubmit does not duplicate the same question.
- Optional pre-moderation with Trainer approve/reject.
- Identity modes:
  - `public`: participant name may be shown on Participant/Projector results;
  - `trainer_only`: identity is available to Trainer but not public audience results;
  - `anonymous`: Trainer live moderation and participant-level report/CSV cannot map question text back to the learner.
- Participant upvoting with configurable self-upvote policy; self-upvote fails closed when disabled.
- Live ordering by Most Upvoted or Newest. The Trainer control reflects the actual live-instance override rather than only the immutable course default.
- Trainer Pin/Unpin and Mark Answered/Unanswered state.
- Audience hide-before-reveal: Participant/Projector do not receive the full result board before reveal. Approved questions are exposed to enrolled participants during collection only through the bounded Q&A upvote board needed for voting.
- Shared Q&A rendering for Trainer, Participant results and Projector.
- Projector participation metadata shows approved questions + responding participants.
- Results History can recall an already-revealed Q&A result without reopening the activity, accepting responses, changing the participant current activity, or rewinding Course Flow.
- Restart persistence, backup→mutate→restore continuity, report/export behavior and EN/AR UI coverage.

## Privacy / audience rules
Moderation metadata, rejected/pending questions and private learner identity are not included in recalled/public Projector result payloads. Anonymous mode redacts question content from participant-level Trainer reports/CSV while preserving aggregate Q&A output and truthful submission/vote participation facts.

## Automated acceptance
Dedicated gates:
- `Q_AND_A_STAGE1B_PASS`
- `Q_AND_A_RUNTIME_PASS`

The complete inherited ONE regression suite must also pass, including Word Cloud, Projector result recall, Projector presence lifecycle, Live health refresh, Projector theme precedence, EN/AR, responsive/role UI contracts, workflow validation, restart persistence, backup/restore, v2 compatibility, populated v2.1.1 migration, professional-completeness gates and the 20-participant rehearsal.

## Manual owner/browser gate still required
Before Stage 1B is accepted, verify on the exact sealed RC2 build:
1. Builder exposes Q&A settings and saves a valid activity.
2. Participant can submit multiple bounded questions and approved questions appear for upvoting.
3. Pre-moderation approve/reject works and rejected/pending questions never reach the public result.
4. Self-upvote policy is enforced.
5. Votes/Newest ordering, Pin and Answered state work live.
6. `public`, `trainer_only` and `anonymous` identity modes behave truthfully on Trainer, Participant, Projector and reports.
7. Projector remains hidden before reveal, then shows the Q&A board + question/participant counts after reveal in Dark / Light / High Contrast.
8. A previously revealed Q&A can be recalled later from Results History and returned to the current class without workflow rewind.
9. Arabic RTL and English LTR remain usable on phone/tablet/desktop.
10. Restart/reconnect behavior does not duplicate the same question or lose moderation/vote state.

## Next authorized stage after acceptance
Stage 1C — Brainstorm / Ideas Board, using the same canonical registry/privacy/moderation/result-recall foundations.
