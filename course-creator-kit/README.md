# Training Engine ONE RC1R10 — AI Course Creator / منشئ الدورات بالذكاء الاصطناعي

This portable kit is generated from the current canonical registry, RC1R10 runtime validator and schemas. It supersedes historical v1.3 guidance for new work. No Internet connection, npm installation, AI service subscription or application database is needed to author/validate/package locally. Node 22.5+ is required. Classroom delivery still uses the full Training Engine application.

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
