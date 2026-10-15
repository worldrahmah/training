# Separate disposable QA accounts / حسابات الاختبار المنفصلة

These credentials are **only** for disposable test data created with explicit TRAINING_ENGINE_TEST_ACCOUNTS=1. Never enable this variable on an institution's installation or existing production database. Normal npm start and Windows/macOS/Linux launchers do not enable it. npm test and npm run test:browser use the portable test runner to inject it only into test subprocesses and disposable paths.

| Fixture account | Password | Purpose |
|---|---|---|
| TRAINER | TRAIN1234 | QA super administrator / Trainer |
| DEMO01 … DEMO08 | D1001 … D1008 respectively | QA Participants |

For manual QA, set all four TRAINING_ENGINE_DATA_DIR, TRAINING_ENGINE_STORAGE_DIR, TRAINING_ENGINE_BACKUP_DIR and TRAINING_ENGINE_EXPORT_DIR to a new disposable directory, enable the flag only for that process and start the server on an unused port. Stop the QA process after testing. Do not reuse that state as production state. New production installations instead create a random local initial administrator password and require changing it. Existing accounts/password hashes are retained; known historical defaults are locally gated and existing default sessions revoked. Owner-created accounts must use private passwords and permitted roles. Screens and browser artifacts must never show credentials/tokens.

هذه البيانات للاختبار المنفصل فقط. لا تفعّل المتغير على بيانات المؤسسة، ولا تنقل قاعدة اختبار إلى الإنتاج. تعزل أدوات الاختبار مساراتها وتفعّل الحسابات لعملياتها فقط. الإنتاج الجديد يستخدم كلمة عشوائية محلية ويلزم تغييرها؛ الحسابات التاريخية محفوظة مع حماية الكلمات الافتراضية. لا تشارك كلمات الحسابات الحقيقية أو الرموز في المحادثة أو الأدلة المصورة.
