# Training Engine ONE v3.5.0 RC1R4 — Full Activity Certification & Assessment Feedback Closure

Status: **OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL**

## Owner-reproduced gap
During RC1R3 owner acceptance, a True / False item with authored correct answer `True` accepted a participant `False` response but did not visibly communicate incorrect/correct assessment feedback on the Participant or Projector result experience. Direct inspection confirmed scoring existed internally, but classic/scored assessment metadata was not consistently propagated through the revealed live result model.

## RC1R4 closure
RC1R4 introduces a full certification program for every canonical Activity Type rather than a one-off True / False patch.

### Scored assessment feedback
For scored assessment families, correctness is hidden while collecting. After Reveal:
- Participant receives personal correct/incorrect state plus a human-readable correct-answer display.
- Trainer receives aggregate correct/incorrect counts and the authored correct answer.
- Projector receives the sanitized aggregate assessment context and correct answer, without participant identity leakage.

The dedicated assessment runtime gate covers True / False, Single Choice, Multiple Choice, Numeric Answer, Matching, Fill Blanks, Sorting, Image Interaction and scored Interactive Video checkpoints with deliberately wrong/partial and correct responses.

### 36/36 activity certification
The release includes `docs/ACTIVITY_CERTIFICATION_MATRIX.md` and machine-readable JSON evidence. Every canonical Activity Type is checked for the behavior that applies to it across:
- Builder settings panel and declared setting controls
- draft persistence and publish validation
- Admin live/report visibility
- Trainer live execution
- Participant rendering/input or correct no-input behavior
- Projector rendering/results
- response validation and aggregation/scoring when applicable
- result rendering / reveal behavior
- report persistence
- personal assessment feedback where applicable
- restart persistence and backup/restore for response-bearing activities

Configuration-variant gates exercise declared enums, bounds and meaningful behavior branches (for example identity/moderation/sort modes, image modes, quick-interaction presets, scoring variants, input invalidity, public/private visibility). This is 100% of the defined certification matrix and declared setting branches represented by the release tests; it is not a claim that an undiscovered defect is mathematically impossible.

## Dedicated gates
- `ASSESSMENT_FEEDBACK_RUNTIME_PASS`
- `ACTIVITY_SETTINGS_CERT_PASS 36/36`
- `ACTIVITY_VARIANT_RUNTIME_PASS`
- `ACTIVITY_SURFACE_CERT_PASS 36/36 activities · 68 result views`
- `ACTIVITY_INPUT_VALIDATION_PASS`
- `ALL_ACTIVITY_RUNTIME_CERT_PASS 36/36`
- `FULL_ACTIVITY_CERTIFICATION_MATRIX_PASS 36/36 · 68 result-view cases`

## Evidence
- `docs/ACTIVITY_CERTIFICATION_EXECPLAN.md`
- `docs/ACTIVITY_SETTINGS_COVERAGE.json`
- `docs/ACTIVITY_SURFACE_COVERAGE.json`
- `docs/ACTIVITY_CERTIFICATION_RUNTIME_RESULT.json`
- `docs/ACTIVITY_CERTIFICATION_MATRIX.json`
- `docs/ACTIVITY_CERTIFICATION_MATRIX.md`

RC1R4 remains **NOT FINAL** until the owner completes the consolidated browser/visual acceptance gate on the sealed RC1R4 artifact.
