# Training Engine ONE v3.5.0 RC1R6 — Professional Repair Candidate

Status: OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL. This release evolves verified RC1R5, preserving all 36 activities and 68 defined result-view cases, with audience privacy, role-scoped analytics, verified imports and affected UI/UX repairs.

Use Node 22.5+: `npm start`, Windows `START_TRAINING_ENGINE.bat`, or Linux/macOS `bash START_TRAINING_ENGINE.sh`. Official Montserrat/Cairo assets and licenses are included locally; classroom operation does not require Internet access.

Verify: `npm test`. Real-browser repair gates: `npm run test:browser` with Python Playwright 1.62.0 and Chromium (QA tools, not application runtime dependencies). Set ONE_BROWSER_EXECUTABLE if Chromium uses a custom path. Set ONE_BROWSER_EVIDENCE_DIR to keep generated QA evidence outside the source.

Read `docs/RC1R6_REPAIR_AND_ACCEPTANCE.md` for exact scope, upgrade/rollback and owner acceptance; `docs/DESIGN_STANDARD.md` for the design bar and remaining platform work. Public explanations belong in activity.explanation. trainer fields are always private. Live scores are withheld until Reveal; stored scoring and authorized Trainer analysis are retained.

Distribution includes application/source/tests/sample assets, not a database, live sessions or owner storage. Preserve configured data/storage/backup/export paths during upgrade; never overwrite owner state with demo files. First launch of a new installation creates the existing bootstrap/demo workspace. Secure those accounts before organizational use. This candidate does not complete identity/provisioning, school-domain or whole-platform design closure.

Source baseline SHA-256: 0262559de4464712888734e1addfbcd3de2b178822d1a188641e22daf8f24016. Historical external authoring v1.3 remains byte-identical historical evidence. Current in-tree contract is synchronized; the final external Course Creator kit is regenerated after Core freeze.
