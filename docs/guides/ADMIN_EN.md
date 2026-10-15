# Admin usage guide — RC1R9

## First launch and sign-in

The operator needs Node 22.5 or newer. Extract the candidate to a new application folder and run START_TRAINING_ENGINE.bat on Windows, bash START_TRAINING_ENGINE.sh on Linux/macOS, or npm start from that folder. Connect devices to the trusted classroom LAN. The host terminal prints addresses, never passwords. The default port is 3000; the operator can configure HOST/PORT and data/storage/backup/export paths. Keep persistent paths during upgrades and stop the old instance first.

A new production installation creates TRAINER with a random initial password in the private local data/INITIAL_ADMIN_PASSWORD.txt file. Read it locally, sign in at /admin and set a personal password before entering the workspace. Delete the file securely after changing it. No demo users/courses are seeded in production. Existing users remain; an unchanged historical default password is gated until locally replaced. Contact the installation operator or another authorized administrator if you cannot access the host. Do not enable QA accounts on production data. Sign-in screens display no demo credentials.

Use the account menu for language, light/dark/system appearance and sign-out. Arabic changes the full interface direction; authored course language stays unchanged. Tab navigates controls; Enter activates; Escape closes menus/dialogs. On phones, use More for navigation. Search/filter/reset affect visible records, not stored history. An empty result is not proof a record was deleted.

## People and permissions

Open Trainers & staff to create staff accounts with personal usernames and temporary passwords meeting policy. Choose Trainer, Assistant, Administrator or Course Editor deliberately. Super administrator controls protected privileges; the last active super administrator cannot be removed. Role changes/deactivation revoke affected sessions. A Course Editor works only on assigned authoring resources, with separate publishing permission; it does not grant classroom, report or administrative access. Give the least required grants and review course/class assignments. Ordinary Trainers cannot provision staff or use system backups.

Open Participants to create registered accounts or use the supported roster workflow. Check names, identifiers, email and temporary passwords before applying. Participant and staff usernames cannot be confused to bypass roles. Password reset is an administrative action; deliver temporary passwords privately and require replacement. Deactivate access when appropriate; preserve the account and learning history. Open a profile to review permitted details and classes. Contact information is private to the person and authorized staff. Profile photos accept validated PNG/JPEG within displayed size/dimension limits.

Groups organize reusable participant/staff membership without changing permissions or classroom teams. Create a group, select members, save, then preview the exact class enrollment or Trainer-assignment impact before applying. Future group membership changes do not silently rewrite an existing class. Archive & restore retains history. A removal or withdrawal is not erasure of responses or reports; restore/re-add as needed and verify prior progress.

## Courses and publishing

Open Courses to search current courses, create/import with authorized permission and inspect versions. Imports validate the package before use; a rejected package has not been accepted. Use the current Course Creator kit, not historical v1.3 prompts, for new authoring. Open Builder on an editable Draft. Select a milestone/activity/path, supply content, settings and private Trainer guidance, save, resolve diagnostics and simulate. Incomplete drafts can be saved, but publishing blockers must be resolved. A published/delivered version is immutable: create a Draft/new version rather than overwriting history. Accepted IDs must remain stable. Course Editors require explicit per-course publishing permission. Confirm the newly published version before creating a class.

## Classes and admission

Open Classes, select a published course version, enter the title/schedule/capacity and assign appropriate Trainers. Configure delivery and join policy intentionally. Sessions, attendance, participants and class teams are separate concerns. Registered participants request admission with the class code; requests remain pending until an assigned managing Trainer approves or Admin intervenes. Review capacity and duplicates; do not treat a copied code as enrollment. Admission requests provides approve/decline controls and real resulting status. Archived or capacity-limited classes can refuse operations; read the error rather than repeatedly applying.

Preview roster/group/bulk changes, inspect affected people and apply the reviewed operation. A stale/conflicting preview may require a new preview. Check the resulting roster/status. Withdrawal retains history; re-adding must resume existing learning evidence. Activate the intended class, then use Live classes to monitor delivery. Administration monitoring and Trainer classroom control have different purposes. Pair the actual Projector from the authorized live classroom; keep Trainer private notes off the audience screen.

## Reporting, communication and settings

Analytics provides authorized class/course/participant summaries and chart/table views. Filter deliberately; missing attendance does not mean absence. Recorded points are not a universal mastery percentage. Seven professional PDF templates cover Class, Learner, Course, Attendance, Assessment, Participant Group and Trainer Activity. Choose resource, language and date range, preview the actual evidence and download. The reviewed snapshot preserves branding/data; prepare a new report to include later changes. CSV exports contain authorized records; use their headers and date ranges correctly. Do not redistribute personal reports indiscriminately.

Messages/notifications and Audit & history support authorized communication and operational review. Use recorded outcome, actor and time to investigate; this is not a forensic tamper-proof audit service. Settings controls system typography using the accepted bundled font catalog. Preview English and Arabic before applying. Company branding accepts owner name/contact/footer and a validated logo. That logo appears across sign-in/workspaces/Projector and reports; see RC1R9_BRANDING.md. Do not upload an SVG/script as an owner logo.

Use backup tools to create and verify a complete backup of database plus storage. Encrypted portable export needs a strong private passphrase supplied outside course content. Restore is a privileged destructive state replacement: stop concurrent work, verify the intended backup and keep a safety copy. Restoring revokes sessions and requires sign-in. Keep recovery files if restore reports incomplete recovery. For upgrade/rollback follow RC1R9_UPGRADE_AND_ROLLBACK.md; never reset SQLite or copy sample data over real state.

## Troubleshooting and daily close

A permission denial means assignment/grants need review; do not edit the database. A stale-version conflict requires refresh/review, not forced overwrite. Check data is saved before retrying after a network interruption. An expired Projector pairing must be renewed. For missing files check the supported version/enrollment/pairing and asset packaging. For startup failures check Node version, log and occupied port; do not run two servers against one data directory. Sign out on shared devices, verify backup, and stop only the intended instance. Owner Windows/LAN/browser/Projector visual acceptance remains required; automation does not establish FINAL release acceptance.
