# Training Engine ONE — Full Activity Certification Matrix

Generated: 2026-10-15T07:34:06.196Z

Status: **PASS on all defined certification gates**

This matrix certifies all 36 canonical Activity Types across Builder settings, Admin, Trainer, Participant, Projector, result rendering, reporting and persistence. “PASS” means the defined deterministic gates passed; it is not a claim that undiscovered defects are impossible.

| Activity | Builder settings | Admin | Trainer | Participant | Projector | Response | Results | Report | Assessment feedback | Backup/Restore | Restart |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| presentation | shared controls | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |
| announcement | shared controls | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |
| poll | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| single_choice | 3 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| multiple_choice | 3 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| true_false | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| word_cloud | 6 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| q_and_a | 8 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| ideas_board | 9 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| prioritization_100 | 5 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| quick_interaction | 4 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| matching | 3 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| fill_blanks | 3 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| sorting | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| image_interaction | 4 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| draw_annotate | 4 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| collaborative_board | 5 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| interactive_video | 3 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| short_answer | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| long_answer | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| numeric_answer | 6 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| rating | 6 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| reaction | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| confidence | 6 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| ranking | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| timer | 1 type-specific + shared | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |
| reveal | shared controls | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |
| team_challenge | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| checklist | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| url_submission | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| file_submission | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| image_submission | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| reflection | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| self_assessment | 2 type-specific + shared | PASS | PASS | PASS | PASS | PASS | PASS | PASS | N/A | PASS | PASS |
| participant_choice | shared controls | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |
| practice_gate | shared controls | PASS | PASS | PASS | PASS | N/A | N/A | N/A | N/A | N/A | N/A |

## Cross-activity setting / behavior variants

- Result renderer variants exercised: **68** canonical Activity/result-view cases.
- Q&A: public / trainer-only / anonymous identity; moderation off/pre; votes/newest sorting; upvoting and self-upvote settings.
- Ideas Board: public / trainer-only / anonymous identity; votes/newest sorting; moderation/voting/merge behavior.
- Word Cloud: moderation, identity, phrase policy and bounds.
- 100 Points: budget, per-option maximum, full-allocation requirement and invalid allocations.
- Quick Interaction: understand / agree / help / yes-no / custom presets and anonymity.
- Matching: shuffle on/off and incomplete/invalid mappings.
- Fill Blanks: case sensitivity, alternative answers and incomplete submissions.
- Sorting / Ranking: exact permutation and duplicate-rank rejection.
- Image Interaction: pin / find / label / drag modes, target tolerance and invalid labels.
- Draw/Annotate: stroke limits and text enabled/disabled.
- Collaborative Board: public / trainer-only / anonymous identity and audience privacy.
- Interactive Video: single-choice / short-answer / confidence checkpoints and pause setting.
- Classic assessments: correct/incorrect scoring, hidden-before-reveal feedback, participant correct-answer feedback after reveal, aggregate Trainer/Projector correctness.
- File/Image submissions: real upload ownership binding, result display and review/report persistence.
- Shared controls and all declared result views are checked through the common renderer/Builder gates.
