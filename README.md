# Training Engine ONE RC1R16

Current app/Core: 3.5.0-rc.1.16; core schema 3.2, course schema 2.0, workspace schema 8. Includes the complete RC1R15 staff workspace plus Guided persistence and durable outbox repairs. Preserve RC1R14 and matched database/storage backups for rollback. Engineering release gates are recorded in the current verification report; owner hardware/classroom acceptance remains separate. Read [Guided root cause](docs/RC1R16_ROOT_CAUSE.md), [operational changes](docs/RC1R16_OPERATIONAL_REVIEW.md), and the current Course Creator handoff.

# Training Engine ONE v3.5.0 RC1R15

Staff chat/files/voice and two-person audio/video calls, task calendar/checklists/assignment, private participant class notes, safe activity detail dialogs on fully paged staff dashboards, scalable selection tables and personal-theme operations hero. All RC1R14 Finish/Trash/personal preferences and the complete 36-activity/68-result guided Creator/runtime remain.

Run START_TRAINING_ENGINE.bat on Windows, START_TRAINING_ENGINE.sh, or npm start. Node22.5+ (verified24.19); no npm install/build/external service required. Preserve configured data/storage/backups/exports and configuration. Never enable disposable QA accounts on owner data. Workspace migration0007 uses the existing verified pre-upgrade backup/journal; core3.2/course2.0 are unchanged.

See [operational guide](docs/RC1R15_OPERATIONAL_REVIEW.md), [EN/AR guides](docs/guides/README.md), [upgrade/rollback](docs/RC1R15_UPGRADE_AND_ROLLBACK.md), [security review](docs/RC1R15_SECURITY_REVIEW.md), [validation](docs/RC1R15_VALIDATION_REPORT.md), [limits](docs/KNOWN_LIMITATIONS_RC1R15.md) and [owner acceptance](docs/RC1R15_ACCEPTANCE.md).

npm test runs69 Node commands; npm run test:browser runs12 browser programs. Use disposable copies because four certification programs regenerate tracked reports. WebRTC browser tests require actual media capability; managed networks may need an authenticated TCP TURN relay, configurable through ONE_TURN_SERVER_BIN for an isolated local QA relay. This test dependency is optional for application runtime. Detailed final receipts, immutable ZIP hashes and owner gates are recorded separately; no universal security/performance claim.
