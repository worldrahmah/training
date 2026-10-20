# Training Engine ONE v3.5.0 RC1R12

Full Core Creator and Participant Guided Experience implementation continuing preserved RC1R11. Full source checks pass; exact-archive results are attested in the release companion. This is an owner-acceptance candidate. All mandatory sections of the attached master prompt are traced in [requirements](docs/RC1R12_REQUIREMENTS.md); current capabilities/boundaries are in the [closure matrix](docs/RC1R12_GAP_MATRIX.md) and [guided contract](docs/RC1R12_GUIDED_EXPERIENCE.md). The RC1R11 incomplete matrix is historical.

Run with Node 22.5+: Windows `START_TRAINING_ENGINE.bat`, Linux/macOS `bash START_TRAINING_ENGINE.sh`, or `npm start`. Built-in runtime dependencies, PDF support and local fonts are bundled; no npm installation/build, cloud service or external credentials are required. Existing configured SQLite/storage/backups are preserved. On a fresh normal installation, use the private local bootstrap password file and complete the existing password-change flow; do not enable disposable QA accounts on production data.

- [Complete current English/Arabic role guides](docs/guides/README.md)
- [Current portable Creator kit](course-creator-kit/README.md), [authoring contract](course-creator-kit/AUTHORING_CONTRACT.md), [36-activity catalog](course-creator-kit/ACTIVITY_CATALOG.md)
- [Upgrade and rollback](docs/RC1R12_UPGRADE_AND_ROLLBACK.md), [security/data review](docs/RC1R12_SECURITY_REVIEW.md)
- [Owner acceptance](docs/RC1R12_ACCEPTANCE.md), [honest acceptance boundaries](docs/KNOWN_LIMITATIONS_RC1R12.md)
- [Validation report](docs/RC1R12_VALIDATION_REPORT.md), [living ExecPlan](docs/CODEX_EXEC_PLAN.md)

`npm test` runs 64 Node commands; `npm run test:browser` runs nine Playwright/Chromium programs. Generated test reports should be captured from a disposable source copy so owner/user files are never reset. `node tools/sync-contracts.mjs --check` and `node tools/build-course-creator-kit.mjs --check` check canonical drift. See the release companion seal report for exact ZIP SHA-256 and fresh-extraction results.

The running-class dashboard focuses on the class hero/current task and keeps learning/tools/transcript/recent activity in closed sections. Authorized course/class deletion preserves history and restoration. New Creator controls, shared templates/variables/conditions, complete route analysis, evidence/uploads, reliable retry, reporting and both guided delivery modes build on one canonical engine with no schema reset. Published course versions remain immutable.

هذا إصدار تنفيذ كامل لمتطلبات منشئ الدورات وتجربة المشارك الموجهة. تبقى المصادقة البصرية على أجهزة صاحب النظام خطوة مستقلة، ولا يُعلن الإصدار نهائيًا آليًا. التشغيل محلي مع حفظ البيانات، وتبقى لغة المحتوى مستقلة عن لغة الواجهة. راجع دليل التأليف والتحديث والقبول والأدلة الحالية.
