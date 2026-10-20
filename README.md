# Training Engine ONE v3.5.0 RC1R13

Operational upgrade of the complete guided Creator engine: separate Trash with restore/explicit permanent deletion, fast workspace entry/return, a dedicated single-class Student page, beginner lesson creation, direct edit autosave and content-first Builder. All 36 activities and the complete RC1R12 master-prompt closure remain. Full source gates pass; exact-archive receipts are in the release companion. Owner real Windows/classroom/assistive acceptance is separate.

Run Windows START_TRAINING_ENGINE.bat, shell START_TRAINING_ENGINE.sh, or npm start with supported Node (minimum 22.5; verified 24.19). No npm installation/build or external service is required. Preserve existing configured data/storage/backups/exports. Normal startup uses secure existing account policies; never enable disposable QA accounts on owner data.

- [Operational review](docs/RC1R13_OPERATIONAL_REVIEW.md), [changes](docs/RC1R13_CHANGELOG.md)
- [EN/AR role guides](docs/guides/README.md), [current portable Creator kit](course-creator-kit/README.md)
- [Upgrade/data/rollback](docs/RC1R13_UPGRADE_AND_ROLLBACK.md), [security](docs/RC1R13_SECURITY_REVIEW.md)
- [Validation](docs/RC1R13_VALIDATION_REPORT.md), [owner acceptance](docs/RC1R13_ACCEPTANCE.md), [acceptance boundaries](docs/KNOWN_LIMITATIONS_RC1R13.md)

Core schema 3.2 and course schema 2.0 remain. Additive workspace migration 0005 creates Trash metadata/indexes under the existing verified pre-upgrade backup/journal process. No upgrade deletes owner data. Explicit permanent deletion is destructive and separate from ordinary Delete/Restore.

npm test runs 65 sequential Node commands. npm run test:browser runs 10 isolated browser programs; ONE_BROWSER_TEST_CONCURRENCY=3 optionally runs those independent programs concurrently. Tests must use disposable copies/data because certification checks regenerate four tracked reports. Full source and exact-archive results, hashes and download links are recorded only after their actual gates finish.
