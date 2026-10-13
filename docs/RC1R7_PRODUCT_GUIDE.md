# Training Engine ONE RC1R7 product guide

For installation/testing/upgrades and the owner checklist, start with `RC1R7_EXPERIENCE_AND_ACCEPTANCE.md`. Historical guides remain reference material; this document describes the changed current controls.

## Admin

Open `/admin` with an administrator or super administrator. **Trainers & staff** creates/manages teaching accounts and permissions; **Participants** manages learners. **Courses** manages versions/imports and opens the canonical Builder or actual Preview. **Classes** configures published course deliveries, roster, trainers and sessions. Analytics preserves constrained charts/tables/exports. Search and the Menu are available from the workspace header; on small screens use More/Menu. System-wide settings remain restricted by role.

The initial username `TRAINER` is the existing bootstrap **super administrator**, despite its name. An ordinary trainer account has a separate, scoped workspace. A super-administrator account cannot be changed by an ordinary administrator. The last active super administrator is protected. Role changes retire sessions; sign in again when your own authority changes.

## Trainer

Open `/trainer` to prepare assigned/authorized courses and classes, inspect participants and reports, and enter Live Classroom for delivery. Creation/import/publishing are separate permissions, not implied by the “trainer” username. The Menu holds language/appearance and available workspace switching. Search opens authorized records directly. Staff administration is shown only to administrative roles.

## Builder

The course selector switches the working course; Menu holds preferences/back navigation. Course flow, Edit and Preview remain primary views. Tools holds revisions, assets, templates, simulation and validation. Add on a milestone creates an activity/mission/path and opens its editor. Item options holds move/duplicate/delete. Save persists a draft; publishing requires an authorized administrator and valid content/workflow. Stable IDs and immutable published versions remain the runtime contract.

## Live Classroom and Projector

Keep current activity, progression, participant/help/review state and disclosure actions in view. Classroom tools groups screen modes/themes, results history, pointer, delivery, replay, insights and preferences. Pair Projector from the visible Projector control; the presentation surface remains audience-safe and display-oriented. Read-only observers cannot operate delivery. Private trainer notes do not become public explanations. Hide → Reveal → Explain still follows the authored/server policy.

## Participant

The class context sits above the current task. Join class and notifications remain visible; the account menu holds profile, password, language, appearance, saved-response recovery and sign-out. Submit/update state reflects saved server data. A saved offline answer is different from a server-confirmed answer. Reconnect triggers replay; rejected answers remain in Saved responses for review/retry/discard. Entries belonging to another account are never replayed for the current learner; unowned old entries require review.

Your language and the course's language are independent. Arabic UI paragraphs and English course titles can coexist. Calendar downloads include the session authority. Learning cards show response/mission/score evidence; they do not invent a completion percentage.

## Preview, reports and recovery

Preview opens a selected authorized course version. Trainer view may include private notes; Participant content view excludes them and clearly explains that actual responses require a rehearsal class. Projector view uses the same renderer/themes as the live display.

Reports offer only compatible dataset/metric/chart combinations, visible filtering, complete returned rows and table equivalents. Exported values should be compared with actual course/class evidence. Review zero/empty states before drawing conclusions.

Create and verify backups before significant upgrades. Restore stages and verifies replacements, retires restored sessions, and recovers interrupted uncommitted swaps on startup. A pending recovery is a failure state that requires resolving storage/access faults and restarting the current release; it is not a successful restore. See the data/recovery impact document and keep independent backups for important deployments.
