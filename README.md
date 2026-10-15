# Training Engine ONE v3.5.0 RC1R10

Status: **OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL**. Continues the delivered RC1R9 candidate and accepted RC1R8 (`db640e1047f210856a7b23d6ff5e469ffd10b89e`) with synchronized profile photos, responsive Student return, Trainer notifications, scoped messaging, manageable teams, granular permissions, truthful attendance, mouse/touch handwriting and default analytics/export choices. Retains shared owner branding, bilingual activity labels, six updated role guides, the generated Course Creator kit and security repairs. Preserves local-first delivery, core schema 3.2, historical data and the 36-activity/68-result certification contract.

Run with Node 22.5+: Windows `START_TRAINING_ENGINE.bat`, Linux/macOS `bash START_TRAINING_ENGINE.sh`, or `npm start`. Application dependencies/fonts/PDF runtime are bundled. No npm install or cloud service is required. On a new production install read the private local `data/INITIAL_ADMIN_PASSWORD.txt`, sign in as the initial administrator, change the random password, then securely delete that file. No demo accounts are created in normal production startup. Existing users/data are retained; follow the upgrade guide for legacy default passwords. Do not enable QA fixture mode on production state.

- [Current English and Arabic role guides](docs/guides/README.md)
- [Current generated AI Course Creator kit](course-creator-kit/README.md), [guided intake](course-creator-kit/GUIDED_INTAKE.md), [36-activity catalog](course-creator-kit/ACTIVITY_CATALOG.md)
- [Owner logo replacement](docs/RC1R9_BRANDING.md)
- [Upgrade and rollback](docs/RC1R10_UPGRADE_AND_ROLLBACK.md)
- [Security review and honest limits](docs/RC1R10_SECURITY_REVIEW.md)
- [Separate disposable QA accounts](docs/RC1R9_TEST_ACCOUNTS.md)
- [Owner acceptance checklist](docs/RC1R10_ACCEPTANCE.md), [release limitations](docs/KNOWN_LIMITATIONS_RC1R10.md)
- [Project operating rules](docs/PROJECT_OPERATING_RULES.md), [living ExecPlan](docs/CODEX_EXEC_PLAN.md)

Verify with `npm test` and `npm run test:browser` (Python Playwright 1.62.0 and Chromium are QA tools, not classroom dependencies). `node tools/build-course-creator-kit.mjs --check` verifies generated contract consistency. See docs/verification/rc1r9 for working-tree evidence and the companion seal report for immutable exact-ZIP fresh-extraction results/SHA-256. Historical v1.3 external authoring archives are retained as evidence; new courses use the current kit. Published course versions are immutable; build one milestone at a time and independently review generated courses.

الإصدار مرشح لقبول صاحب النظام، وليس نهائيًا. يتضمن أدلة عربية وإنجليزية للمسؤول والمدرب والمشارك وحزمة تأليف حالية وشعارًا موحدًا وإصلاحات أمان مختبرة، مع حفظ البيانات والتوافق. التشغيل محلي دون خدمات سحابية. اقرأ كلمة المسؤول الأولية من الملف الخاص على المضيف وغيّرها، ولا تفعّل وضع الاختبار على بيانات المؤسسة. راجع دليل الترقية والحدود وقائمة القبول قبل التقديم الحقيقي.
