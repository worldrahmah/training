# Current activity catalog / كتالوج الأنشطة الحالي

Generated from the RC1R9 canonical registry and executable examples; IDs are fixed. UI labels are separate from authored course content. These are runtime capabilities, not promises of every learning design. Treat unmet needs as CORE CAPABILITY GAP. The complete regression certifies 36 activities and 68 defined result-view cases; the bound registry lists all allowed result bindings.

## Presentation / عرض تقديمي

Canonical ID: `presentation`. Response: `none`; aggregation: `none`; scoring: `none`. Participant input: none. Allowed result views: none.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: follow the scene or workflow; this component does not create a normal response form. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [presentation.json](activities/presentation.json). Defaults: `{}`.

## Announcement / إعلان

Canonical ID: `announcement`. Response: `none`; aggregation: `none`; scoring: `none`. Participant input: none. Allowed result views: none.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: follow the scene or workflow; this component does not create a normal response form. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [announcement.json](activities/announcement.json). Defaults: `{}`.

## Poll / استطلاع رأي

Canonical ID: `poll`. Response: `single_choice`; aggregation: `counts`; scoring: `participation`. Participant input: yes. Allowed result views: bar, horizontal_bar, stacked_bar, donut, pie, ranking, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [poll.json](activities/poll.json). Defaults: `{}`.

## Single Choice / اختيار واحد

Canonical ID: `single_choice`. Response: `single_choice`; aggregation: `counts`; scoring: `exact_or_participation`. Participant input: yes. Allowed result views: bar, horizontal_bar, stacked_bar, donut, pie, ranking, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [single_choice.json](activities/single_choice.json). Defaults: `{}`.

## Multiple Choice / اختيارات متعددة

Canonical ID: `multiple_choice`. Response: `multiple_choice`; aggregation: `counts`; scoring: `exact_or_participation`. Participant input: yes. Allowed result views: bar, horizontal_bar, stacked_bar, donut, pie, ranking, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [multiple_choice.json](activities/multiple_choice.json). Defaults: `{}`.

## True / False / صح أو خطأ

Canonical ID: `true_false`. Response: `true_false`; aggregation: `counts`; scoring: `exact_or_participation`. Participant input: yes. Allowed result views: bar, horizontal_bar, donut, pie, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [true_false.json](activities/true_false.json). Defaults: `{}`.

## Word Cloud / سحابة كلمات

Canonical ID: `word_cloud`. Response: `word_list`; aggregation: `word_cloud`; scoring: `participation`. Participant input: yes. Allowed result views: word_cloud.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [word_cloud.json](activities/word_cloud.json). Defaults: `{"max_entries":3,"max_characters":32,"allow_phrases":true,"moderation":"off","identity_visibility":"trainer_only"}`.

## Q&A / أسئلة وأجوبة

Canonical ID: `q_and_a`. Response: `qa_board`; aggregation: `qa_board`; scoring: `participation`. Participant input: yes. Allowed result views: qa_board.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [q_and_a.json](activities/q_and_a.json). Defaults: `{"max_questions":3,"max_characters":280,"moderation":"pre","identity_visibility":"trainer_only","upvoting":true,"allow_self_upvote":false,"sort":"votes"}`.

## Ideas Board / لوحة الأفكار

Canonical ID: `ideas_board`. Response: `idea_board`; aggregation: `ideas_board`; scoring: `participation`. Participant input: yes. Allowed result views: ideas_board.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [ideas_board.json](activities/ideas_board.json). Defaults: `{"max_ideas":5,"max_characters":240,"moderation":"pre","identity_visibility":"trainer_only","upvoting":true,"allow_self_upvote":false,"sort":"votes","categories":["Ideas"]}`.

## 100 Points / Prioritization / توزيع ١٠٠ نقطة وترتيب الأولويات

Canonical ID: `prioritization_100`. Response: `point_allocation`; aggregation: `point_allocation`; scoring: `participation`. Participant input: yes. Allowed result views: prioritization.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [prioritization_100.json](activities/prioritization_100.json). Defaults: `{"budget":100,"require_full_allocation":true,"max_per_option":100}`.

## Quick Interaction / تفاعل سريع

Canonical ID: `quick_interaction`. Response: `quick_choice`; aggregation: `counts`; scoring: `participation`. Participant input: yes. Allowed result views: quick_interaction, horizontal_bar, donut.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [quick_interaction.json](activities/quick_interaction.json). Defaults: `{"preset":"understand","anonymous":true}`.

## Matching / مطابقة

Canonical ID: `matching`. Response: `matching`; aggregation: `assessment`; scoring: `exact`. Participant input: yes. Allowed result views: assessment.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [matching.json](activities/matching.json). Defaults: `{}`.

## Fill in the Blanks / ملء الفراغات

Canonical ID: `fill_blanks`. Response: `fill_blanks`; aggregation: `assessment`; scoring: `exact`. Participant input: yes. Allowed result views: assessment.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [fill_blanks.json](activities/fill_blanks.json). Defaults: `{}`.

## Sorting / ترتيب العناصر

Canonical ID: `sorting`. Response: `sorting`; aggregation: `assessment`; scoring: `exact`. Participant input: yes. Allowed result views: assessment.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [sorting.json](activities/sorting.json). Defaults: `{}`.

## Image Interaction / تفاعل مع صورة

Canonical ID: `image_interaction`. Response: `image_interaction`; aggregation: `image_interaction`; scoring: `exact_or_participation`. Participant input: yes. Allowed result views: image_heatmap.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [image_interaction.json](activities/image_interaction.json). Defaults: `{"mode":"pin"}`.

## Draw / Annotate / رسم وتعليق

Canonical ID: `draw_annotate`. Response: `drawing`; aggregation: `drawing_gallery`; scoring: `participation`. Participant input: yes. Allowed result views: drawing_gallery.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [draw_annotate.json](activities/draw_annotate.json). Defaults: `{}`.

## Collaborative Board / لوحة تعاونية

Canonical ID: `collaborative_board`. Response: `collab_board`; aggregation: `collaborative_board`; scoring: `participation`. Participant input: yes. Allowed result views: collaborative_board.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [collaborative_board.json](activities/collaborative_board.json). Defaults: `{"max_notes":5,"max_characters":240,"categories":["Board"],"identity_visibility":"trainer_only"}`.

## Interactive Video / فيديو تفاعلي

Canonical ID: `interactive_video`. Response: `video_checkpoints`; aggregation: `assessment`; scoring: `exact_or_participation`. Participant input: yes. Allowed result views: video_checkpoints, assessment.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [interactive_video.json](activities/interactive_video.json). Defaults: `{"pause_at_checkpoint":true}`.

## Short Answer / إجابة قصيرة

Canonical ID: `short_answer`. Response: `text`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [short_answer.json](activities/short_answer.json). Defaults: `{}`.

## Long Answer / إجابة مطولة

Canonical ID: `long_answer`. Response: `long_text`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [long_answer.json](activities/long_answer.json). Defaults: `{}`.

## Numeric Answer / إجابة رقمية

Canonical ID: `numeric_answer`. Response: `number`; aggregation: `numeric`; scoring: `exact_or_participation`. Participant input: yes. Allowed result views: bar, line, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [numeric_answer.json](activities/numeric_answer.json). Defaults: `{}`.

## Rating / تقدير

Canonical ID: `rating`. Response: `scale`; aggregation: `numeric`; scoring: `participation`. Participant input: yes. Allowed result views: bar, line, progress, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [rating.json](activities/rating.json). Defaults: `{}`.

## Reaction / رد فعل

Canonical ID: `reaction`. Response: `single_choice`; aggregation: `counts`; scoring: `participation`. Participant input: yes. Allowed result views: bar, horizontal_bar, donut, pie, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [reaction.json](activities/reaction.json). Defaults: `{}`.

## Confidence / مستوى الثقة

Canonical ID: `confidence`. Response: `scale`; aggregation: `numeric`; scoring: `participation`. Participant input: yes. Allowed result views: bar, line, progress, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [confidence.json](activities/confidence.json). Defaults: `{}`.

## Ranking / ترتيب حسب الأفضلية

Canonical ID: `ranking`. Response: `ranking`; aggregation: `ranking`; scoring: `participation`. Participant input: yes. Allowed result views: ranking, cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [ranking.json](activities/ranking.json). Defaults: `{}`.

## Timer / مؤقت

Canonical ID: `timer`. Response: `none`; aggregation: `none`; scoring: `none`. Participant input: none. Allowed result views: none.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: follow the scene or workflow; this component does not create a normal response form. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [timer.json](activities/timer.json). Defaults: `{}`.

## Reveal / كشف المحتوى

Canonical ID: `reveal`. Response: `none`; aggregation: `none`; scoring: `none`. Participant input: none. Allowed result views: none.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: follow the scene or workflow; this component does not create a normal response form. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [reveal.json](activities/reveal.json). Defaults: `{}`.

## Team Challenge / تحدي الفرق

Canonical ID: `team_challenge`. Response: `long_text`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [team_challenge.json](activities/team_challenge.json). Defaults: `{}`.

## Checklist / قائمة تحقق

Canonical ID: `checklist`. Response: `checklist`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [checklist.json](activities/checklist.json). Defaults: `{}`.

## URL Submission / تسليم رابط

Canonical ID: `url_submission`. Response: `url`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [url_submission.json](activities/url_submission.json). Defaults: `{}`.

## File Submission / تسليم ملف

Canonical ID: `file_submission`. Response: `file`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [file_submission.json](activities/file_submission.json). Defaults: `{}`.

## Image Submission / تسليم صورة

Canonical ID: `image_submission`. Response: `image`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [image_submission.json](activities/image_submission.json). Defaults: `{}`.

## Reflection / تأمل

Canonical ID: `reflection`. Response: `long_text`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [reflection.json](activities/reflection.json). Defaults: `{}`.

## Self Assessment / تقييم ذاتي

Canonical ID: `self_assessment`. Response: `long_text`; aggregation: `answer_wall`; scoring: `participation`. Participant input: yes. Allowed result views: cards.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: submit through the matching runtime control; the acknowledgement does not expose score. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [self_assessment.json](activities/self_assessment.json). Defaults: `{}`.

## Participant Choice / اختيار المشارك

Canonical ID: `participant_choice`. Response: `none`; aggregation: `none`; scoring: `none`. Participant input: none. Allowed result views: none.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: follow the scene or workflow; this component does not create a normal response form. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [participant_choice.json](activities/participant_choice.json). Defaults: `{}`.

## Practice Gate / بوابة الممارسة

Canonical ID: `practice_gate`. Response: `none`; aggregation: `none`; scoring: `none`. Participant input: none. Allowed result views: none.

Trainer: prepare the prompt, instructions and private cues; launch and inspect participation. Participant: follow the scene or workflow; this component does not create a normal response form. Projector: public scene, prompt and revealed audience-safe results only. Configure options/targets/checkpoints and solutions exactly as the JSON example. A result-view binding does not imply an arbitrary chart is supported.

Example: [practice_gate.json](activities/practice_gate.json). Defaults: `{}`.

