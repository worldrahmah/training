# Training Engine ONE RC1R7 — experience and operational upgrade

RC1R7 replaces the crowded Builder actions, account toolbars and inconsistent entry surfaces with a shared workspace system. It fixes the reported light-theme controls and Arabic sentence direction, provides a clear staff-administration area, and repairs operational paths discovered during the wider review. It is an owner-acceptance candidate; automated verification does not confer a world ranking or certify the completed enterprise/school product.

## What changed

- Shared native disclosures for Builder menus, milestone additions, item operations, classroom tools and account preferences. Menus support keyboard opening/navigation, Escape, light dismissal, focus return, named controls, RTL positioning and mobile containment. Essential delivery/submission actions remain visible.
- Rebuilt two-part entry screens, calm role workspaces, hierarchy in the Builder and learner dashboard, and semantic light/dark/system colors. Local Montserrat/Cairo remain canonical; changing locale updates actual computed typography. Translated paragraphs determine their own direction even inside a course of the other language.
- Admin accepts authorized administrators as well as super administrators. **Trainers & staff** is a dedicated navigation area; **Participants** manages learners. The bootstrap username `TRAINER` has super-administrator authority; the account's displayed role now makes this clear. Ordinary trainers cannot provision staff.
- Staff creation and updates are transactional. Authorization/validation runs before account changes, protected super-administrator accounts require a super administrator, at least one active super administrator must remain, and role changes retire old sessions. Required-password onboarding has a usable flow; reusing the current/temporary password is rejected.
- Scoped courses, source content, search, prerequisites, templates, answer banks and course-improvement reports use ownership checks. Quiz banks must belong to the class course. View-only class access cannot control delivery. Creation/publishing controls reflect server-derived capabilities.
- New class setup commits its class, roster, teams and sessions together. It rejects malformed setup, multiple lead trainers, over-capacity initial rosters and unpublished versions. Supported existing records are retained.
- Preview opens the actual authorized course version in a shared-session frame. Trainer notes stay out of Participant content preview. Projector preview uses the shared presentation renderer and its actual themes. Participant response rehearsal remains a separate real-class test, clearly labeled.
- Search is a live, scoped dialog with real result drill-down. Calendar links authenticate correctly. Learner cards show actual participation counts rather than an invented completion percentage.
- Unsent response fields and drawing vectors survive redraws. Automatic offline replay now runs on reconnect/focus/startup, verifies acknowledgement, retains rejected answers for review, preserves account ownership and avoids false synchronization success. Unowned older queue entries remain reviewable and are not automatically attributed to a different learner.
- Windows Stop uses an authenticated local-instance command instead of killing a port listener. It confirms shutdown, preserves an unrelated service and keeps database state.
- Restore stages replacement files and records a filesystem journal. Failed swaps recover the previous database/assets; startup recovers interrupted swaps before opening/seeding SQLite. Accepted restore cleanup can resume after restart.

## Test on Windows

1. Download the sealed RC1R7 ZIP and extract it into a separate writable folder. Install Node.js 24 LTS if needed.
2. Double-click `START_TRAINING_ENGINE.bat`. Keep the server window running. Trainer and Projector open automatically. Use `STOP_TRAINING_ENGINE.bat` to stop this registered ONE instance.
3. Fresh-install login: `TRAINER` / `TRAIN1234`. This is the existing bootstrap super-administrator account. Participant demo: `DEMO01` / `D1001`.
4. Open `http://localhost:3000/admin` on that PC for administration. Create an ordinary trainer and verify that its workspace stays scoped.
5. Read the known limitations and run the owner checks below. Secure bootstrap/demo accounts before organizational use.

The application has no npm runtime dependencies. Browser QA uses Python Playwright and Chromium; those are not required to run the app on the PC.

## Upgrade and rollback

Create and verify a backup, stop the old server, preserve the configured database/storage/backups/exports, and start RC1R7 against those same paths from a separate application directory. Do not replace owner state with a fresh demo installation. Core schema remains 3.1; course schema remains 2.0; no database-schema migration is introduced. Existing startup migrations and populated historical-data regression remain required.

Keep the previous application and an external verified backup. Before rollback, stop cleanly and confirm no `restore-journal.json` is pending. If a restore was interrupted, start RC1R7 to recover it before starting an older release. The previous release does not understand the recovery journal. See `RC1R7_DATA_AND_RECOVERY_IMPACT.md` for boundaries.

## Owner visual/operational acceptance

- Open Admin, Trainer, Builder and Participant entry pages in light, dark and system appearance. All text and controls must be readable on your PC.
- In Builder, switch course; open Menu and Tools; add/edit/save an activity; rename a long milestone; use item actions; inspect an explicit workflow; verify an incomplete draft cannot publish. Use desktop and a phone-size window in EN/AR.
- Confirm Admin can create a trainer; an ordinary trainer cannot. Test a scoped trainer's assigned classes/courses and view-only delivery access. Verify the final active super administrator cannot be removed.
- Open a course's actual Preview, switch role views and Projector themes, then rehearse the same activity in a real class.
- On Participant, open the account menu, change language/theme, join an authorized class, submit/update, and download a calendar. Check Arabic sentence-ending punctuation inside an English course.
- Enter an answer, trigger a classroom update and confirm it remains. Disconnect/reconnect and verify the saved answer reaches the server once. Review a rejected saved answer without losing it.
- Exercise live pacing, Hide → Reveal → Explain, notes, help/moderation, results history and all three Projector themes on classroom hardware. Private notes/solutions must remain private before disclosure is allowed.
- Compare reports/exports with actual sample responses. Verify backup/restore and a supported old course/class/history using copies before production adoption.

Record the exact ZIP SHA-256, browser/OS, screen/projector hardware, scenario and result. Report any defect with its role, locale, theme and reproducible steps. Owner acceptance remains pending until these checks are completed.
