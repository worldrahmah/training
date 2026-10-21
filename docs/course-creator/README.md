# RC1R14 personal workspace and delivery controls

The Trainer has a distinct Finish class action in the live header and class list, available without completing a blocked workflow. It closes the live class, preserves saved answers/partial progress and permits subsequent Trash; it does not fabricate completed learner tasks. Hold, Break and Finish section remain separate. Student delivery is one full-width selected class with a compact LIVE / مباشر indicator above the hero and top-menu workspace/profile access; no redundant learning rail remains.

UI language, light/dark/system and six panel colors plus workspace default belong to each account and persist independently. They never rewrite authored course language, Projector themes or another account's settings. All roles have own activity history with server-side 10/25/50 paging, inclusive local date/type/search filters, and scoped staff audit. These operational conveniences do not add course schemas or executable package content. The complete guided authoring/branching/evaluation/preview contract below remains supported.

# RC1R14 operational Creator and classroom update

Current Core 3.5.0-rc.1.14 / core schema 3.2 / course schema 2.0 / additive workspace schema 6. The complete guided contract below is retained. Course Builder now offers Add lesson: teaching content, practical task and reflection produce ordinary canonical presentation/practice/convergence/closing nodes. Direct editing autosaves; optional settings are under Advanced settings; an outline keeps navigation visible. The pure app/public/creator-start.js helper is included in the portable kit and uses the same graph model. It is an authoring convenience, not a new course type. Preview, validator, export and runtime share the canonical model; no per-course Core change is needed.

Participant delivery opens /student/class?class_id=... with one selected class at full width with workspace/profile access in the top menu; /student?workspace=1 returns to the ordinary learning workspace. Course/class Delete uses distinct Trash. Intentional Archive remains separate. Trash restoration retains state/history; permanent deletion is a separate administrator-confirmed action with dependency guards. Old ambiguous archives remain Archive with Move to Trash.

# Current RC1R14 guided authoring

Read GUIDED_EXPERIENCE.md and CREATOR_GAP_MATRIX.md. These current contracts supersede historical guided limitations. The same canonical validator runs in Core, export/import/publication and this self-contained kit. Use complete shared-step M1 samples and the capability fixture, then independently rehearse the actual authored course.

# Training Engine ONE RC1R14 — AI Course Creator / منشئ الدورات بالذكاء الاصطناعي

This portable kit is generated from the current canonical registry, RC1R14 runtime validator and schemas. It supersedes historical v1.3 guidance for new work. No Internet connection, npm installation, AI service subscription or application database is needed to author/validate/package locally. Node 22.5+ is required. Classroom delivery still uses the full Training Engine application.

1. Read AUTHORING_CONTRACT.md and CURRENT_CAPABILITIES.json. The registry is the exact catalog; ACTIVITY_CATALOG.md and activities/*.json cover all 36 types.
2. Run `node tools/intake-wizard.mjs my-course-intake`, or answer GUIDED_INTAKE.md with the course owner. Never enter secrets.
3. Use STARTING_PROMPT.md. Agree the outline, then authorize and build **one milestone at a time**. Freeze accepted IDs. Record any CORE CAPABILITY GAP before inventing a component.
4. Work in a new course directory using course.json plus assets/. Read WORKFLOW_AND_ASSETS.md, ROLE_AND_REVEAL_RULES.md and SCORING_AND_VALIDATION.md. Keep private guidance under trainer.
5. Validate: `node tools/validate-course.mjs my-course/course.json`. JSON-only asset warnings are unresolved until packaging.
6. Package: `node tools/package-course.mjs my-course my-course-v1.course.zip`. The tool validates the actual ZIP, writes a checked manifest and companion SHA-256, and refuses existing output files.
7. Validate the ZIP again, import through Courses → Import, inspect the course, create a Draft if editing, resolve all diagnostics, publish a new version with authorized staff, create a disposable class and rehearse Trainer/Participant/Projector. See MILESTONE_REVIEW.md and FINAL_REVIEW_PROMPT.md.
8. Accept this milestone before building the next. Repeat, then do a complete course-level workflow/restart/asset/reveal review. Published versions are immutable.

Importable samples: examples/catalog-en.course.zip and catalog-ar.course.zip each contain six demonstration milestones covering all 36 types and local PNG/video assets. examples/workflow-paths.course.zip demonstrates supported explicit paths and missions. These are a laboratory, not a pedagogically complete ready-to-deliver subject curriculum. All samples must pass runtime import and Draft validation/publication gates in the release tests. SHA256SUMS.txt covers the kit; each ZIP has its own checksum.

الحزمة محلية مستقلة ومولدة من الكتالوج والمخططات والمدقق الحالي. ابدأ بالاستبيان ثم اتفق مع صاحب الدورة على الأهداف والأدلة. اكتب **محطة واحدة فقط في كل مرة**، وثبّت المعرّفات المقبولة. استخدم المكونات المدعومة وحدها، وبلّغ عن الاحتياج غير المدعوم بعبارة CORE CAPABILITY GAP. ضع إرشادات المدرب الخاصة داخل trainer، وافصلها عن تعليمات المشارك وشاشة العرض. تحقق من JSON ثم الحزمة الفعلية، واستوردها وانشر مسودة مخولة وجرّبها في صف تجريبي قبل قبول المحطة. لا تدخل كلمات مرور أو مفاتيح في المحتوى أو الاستبيان. النجاح الآلي لا يغني عن مراجعة بشرية مستقلة.
