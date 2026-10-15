# Scoring, validation and packaging / التقييم والتحقق والتغليف

Inspect each activity's scoring contract and executable example. Participation points, exact-answer scoring, numeric tolerance, matching pairs, blanks, sorting and configured image/video checks are different models. Do not represent participation points as mastery. Define objectives, correct values and tolerances deliberately; multiple-choice sets, booleans and numeric responses must use the runtime's supported value types. Manual review/rubrics for submissions are separate from live automatic scoring. Challenge timing and points are optional supported settings, not an arbitrary game engine. Use only result views listed for that activity. The registry's result bindings and the 68 defined certification cases are related inventories, not a promise to certify every imaginable combination.

Scoring happens on the server. Learners receive a saved acknowledgement before reveal; do not show them stored points or personal correctness early. Authorized Trainer views retain scoring evidence. Reveal/explain allows public feedback as supported by that activity. Check both correct and incorrect responses and inspect after restart. Never put a solution in public prose as a workaround.

Validation ladder:

1. Intake and milestone objective/evidence review; no unsupported component names.
2. Runtime JSON validation. Warnings about unverified assets remain unresolved at this stage.
3. Actual ZIP packaging and validation; all local references and per-file SHA-256 must match. No traversal, colliding paths, corrupted ZIP entries or executable package assets.
4. Supported Courses import with the authorized account. A new imported version is immutable; edit by creating a Draft. Resolve every publishing blocker, simulate, validate, publish as a new version and bind a disposable class to it.
5. Role rehearsal: Trainer launch/close/reveal/explain/transition; two Participants, correct/incorrect/saved responses; real paired Projector; path completion/convergence; EN/AR application UI independent from course content; offline assets; desktop/tablet/mobile; restart/reconnect; scoring/report evidence and privacy negatives.
6. Independent review using FINAL_REVIEW_PROMPT.md. Keep real outputs, exact package hash, failed/skipped/unrun checks and owner acceptance. Passing the parser alone does not certify educational quality or every security property.

Use the full RC1R9 runtime for final rehearsal. The portable kit contains the same parser dependencies, not a second alternative validator. The generator's drift check proves it matches the current source. If a generated output differs, regenerate from current canonical source and review changes; do not edit packaged validator copies by hand.

قيّم كل نشاط بنموذجه الحقيقي: المشاركة ليست إتقانًا، والمراجعة اليدوية ليست تصحيحًا آليًا. اختبر إجابات صحيحة وخاطئة وإخفاء النتيجة قبل الكشف ثم ظهور التغذية الراجعة المناسبة بعده. التحقق متدرج من الأهداف وJSON إلى ZIP ثم الاستيراد والمسودة والنشر والتجريب بالأدوار وإعادة التشغيل والمراجعة المستقلة. احتفظ بالدليل والبصمة والاختبارات الفاشلة والمتجاوزة وغير المنفذة؛ قبول المدقق وحده لا يكفي لقبول الدورة.
