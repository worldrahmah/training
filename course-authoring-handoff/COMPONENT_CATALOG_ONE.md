# Training Engine ONE — Professional Closure Component Catalog

`CORE_CAPABILITIES.json` is authoritative. This is the human-readable map for the v3.5.0 RC1R5 development contract.

## Interaction and assessment activities
- Presentation/facilitation: `presentation`, `announcement`, `timer`, `reveal`.
- Professional interaction: `word_cloud`, `q_and_a`, `ideas_board`, `prioritization_100`, `quick_interaction`, `collaborative_board`.
- Advanced assessment: `poll`, `single_choice`, `multiple_choice`, `true_false`, `matching`, `fill_blanks`, `sorting`, `image_interaction`, `interactive_video`, `short_answer`, `long_answer`, `numeric_answer`, `rating`, `reaction`, `confidence`, `ranking`, `checklist`, `reflection`, `self_assessment`.
- Visual/practice: `draw_annotate`, `url_submission`, `file_submission`, `image_submission`, `practice_gate`.
- Group/branching: `team_challenge`, `participant_choice`.

## Professional interaction details
- `word_cloud`: bounded words/phrases, moderation/privacy, audience reveal and recall.
- `q_and_a`: moderation, public/trainer-only/anonymous identity, upvotes, pin/answered, sorting and recall.
- `ideas_board`: categories, moderation/privacy, voting, highlight, merge/unmerge and recall.
- `prioritization_100`: configurable point budget, exact-allocation validation, per-option caps and aggregate prioritization.
- `quick_interaction`: lightweight professional pulse/choice interactions with aggregate result views.
- `collaborative_board`: categorized shared notes/cards with bounded contribution and privacy rules.

## Advanced assessment details
- `matching`: authored left/right pairs and exact scoring.
- `fill_blanks`: blanks with accepted alternatives and optional case sensitivity.
- `sorting`: authored correct order and exact scoring.
- `image_interaction`: `pin`, `find`, `label`, or `drag` modes against local image assets and target coordinates.
- `draw_annotate`: strokes plus optional text annotations over an optional local background.
- `interactive_video`: local video with timed checkpoints, optional pause, assessment/confidence checkpoint types.

## Presentation content blocks
`hero`, `text`, `image`, `image_text`, `cards`, `steps`, `comparison`, `table`, `timeline`, `callout`, `statistic`, `quote`, `checklist`, `asset`, `chart`, `video`, `audio`, `divider`, `spacer`, `gallery`, `prompt`, `editable_prompt`, `resource_list`, `leaderboard`, `document`, `slide_deck`, `formula`, `interactive_video`.

PDF/PPTX import stays local-first: PDFs remain local document assets; PPTX imports preserve the original local asset and extract local slide text into `slide_deck` data when available. Formula rendering is local and dependency-free.

## Result displays
`bar`, `horizontal_bar`, `stacked_bar`, `donut`, `pie`, `line`, `ranking`, `progress`, `leaderboard`, `cards`, `word_cloud`, `qa_board`, `ideas_board`, `prioritization`, `quick_interaction`, `assessment`, `image_heatmap`, `drawing_gallery`, `collaborative_board`, `video_checkpoints`.

## Runtime facilities course authors may rely on
- Dark / Light / High Contrast Projector themes with shared Builder preview renderer.
- Hide → Reveal → Explain facilitation, temporary result-view override, pointer/annotation and professional Challenge mode.
- Trainer-Paced / Participant-Paced / Front-of-Room delivery.
- Offline response queue with idempotent submission IDs, Session Replay and optional guest joining.
- Co-Trainer/moderator class access through existing class-trainer assignments.
- Results History recall without workflow rewind.
- Advanced analytics: difficulty, discrimination, distractors, confidence, timing, skips, cohort comparison and improvement findings.
- English LTR / Arabic RTL, Montserrat/Cairo product typography.

Team response scope for Q&A/Ideas Board/Collaborative Board remains fail-closed unless a capability explicitly defines team-voting/contribution semantics.
