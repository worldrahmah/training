# RC1R8 role and operations guide

## Install, start and shut down

Extract the complete ZIP to a new folder. Node 22.5+ is required; Node 24 is the tested toolchain. Run START_TRAINING_ENGINE.bat on Windows or npm start. No npm install, cloud AI, CDN, PDF browser or Internet connection is required for classroom runtime. The PDF runtime and 40 local licensed fonts are included. Secure the existing bootstrap/demo accounts before organizational use. Use STOP_TRAINING_ENGINE.bat or the supported local stop tool for a clean shutdown.

For an update: finish live delivery, stop the old process, keep its application folder, and preserve the exact configured DATA/STORAGE/BACKUP/EXPORT paths. Take and verify a full backup. Point the new release at the existing paths; do not copy a demo database over them. Startup checks an existing listener before recovery/migration and creates a verified database-plus-storage pre-upgrade snapshot before journaled migrations. If startup fails, inspect its message; do not delete the database. An older app cannot understand Editor/admission semantics. Roll back using the retained old app and verified pre-upgrade backup; restoring that snapshot excludes subsequent changes. See the migration document before proceeding.

## Admin

Use Staff accounts to create Trainers, Assistants or Course Editors. Choose the account role, then grant exact course editing/publication rights in Permissions. Admin manages staff; ordinary trainers cannot create staff accounts. Class delivery assignments exclude Editors. Reassign open class duties before converting an assigned trainer into an Editor; completed teaching history is preserved. Select participants and preview bulk activation/deactivation before applying; the current account/last active super administrator remain protected.

Settings → Typography has 20 choices for each language, live samples and Apply fonts to system. Fonts are bundled and initially Montserrat/Cairo. Settings → Company branding stores name, logo, contact details and report footer; it applies centrally to PDF reports and the company identity. Upload a valid PNG/JPEG up to 2 MB and 4096 × 4096 pixels. Save before preparing a new report; an existing report snapshot keeps its reviewed identity.

Dashboard summaries open searchable tables. Select a row/name or Open to reach that record. Page content scrolls independently from navigation. Backup search/sort/reset and per-backup verify/export/restore controls wrap on narrow screens. A restore retains the original supported recovery behavior and signs users out; sign in again afterward.

## Trainer / live classroom

Class management shows the six-character class code and Copy code. Share it with registered participants. Admission requests appears in the navigation and class panel; a badge counts pending requests. Open a request, review its learner profile, approve or decline with an optional note. Only lead/explicit class management permission permits this action; a live-control-only co-trainer does not administer admissions. Admin can intervene. Pending users receive no classroom access. Capacity or unmet prerequisites must be resolved before approval.

Removing a learner withdraws enrollment without deleting evidence. Add existing participant includes withdrawn learners; re-adding resumes their history. Completed enrollment remains distinguishable. Archiving a live class requires finishing it first. Pending requests are cancelled when a class closes.

Groups organize people separately from classroom teams. Create a participant group with a name, description, tags and members already within your management scope. Admin manages staff groups. A person may belong to several groups. Apply a group to a class, review exact ready/skipped members, then apply. Changes to the group afterward do not update an existing class. Archive & restore preserves group membership/history; groups do not grant permissions.

Keep Live Classroom focused on the current task, participant state, help, moderation, Hide → Reveal → Explain and Projector. New anonymous guest joining is unavailable; existing historical guest sessions/data are preserved. Delivery modes and accepted activities continue to operate.

## Course Editor / Builder

An Editor signs in to /editor with only its course workspace and own full profile. Create an owned course or receive an explicit course assignment. Own course creation grants editing/publication; assigned course publication requires an explicit publish grant as well as edit. Operational menus and APIs are unavailable.

Builder uses one declarative course model. Drafts can remain incomplete; publishing stays strict. Milestone options → Delete milestone explains contained items and protects external references. Validation/Blockers opens detailed causes and repair steps, with Open affected item. Workflow → Use linear course flow removes an explicit graph only after confirmation; never silently infer transitions for an incomplete explicit graph. Undo/revision history retain the accepted recovery behavior. Editing delivered content creates a new draft; published versions remain immutable.

The current AI Course Creator kit is course-authoring-handoff/. Read README_FIRST.md, CORE_CAPABILITIES.json completely, rules/catalog and the relevant templates/schemas. Use the included master prompt, validation tooling and importable sample packages. Historical v1.3 is evidence, not current capability authority. Unsupported learning designs must produce CORE CAPABILITY GAP.

## Participant / full profiles

Join class requires sign-in and the trainer's code. Send request produces a persistent pending state. Wait for trainer approval; repeated sends do not create duplicate requests. Approval/decline/cancellation appears in personal notifications and request status. Current work remains one obvious task; submission/reconnect and allowed reveal feedback remain intact. Learning summary counts open your own evidence only.

Menu → My profile opens a full page for every role. Edit optional English/Arabic names, contact details, organization/job, biography and goals, change photo/password and view authorized history. Private contact details remain visible only to authorized people. A learner can prepare its own Learner PDF report from the profile page. Course Editors have course access without class history.

## Reports / Projector

Reports → Professional PDF reports: choose one of seven templates, search/select a permitted subject, choose report language and optional dates, then Preview report. Inspect tables/charts/notes before Download PDF. A reviewed snapshot preserves the evidence and branding; prepare a new report for newer data. Repeated downloads preserve exact exported bytes. Missing attendance is not counted as absence. Points are recorded points after reveal, not invented normalized percentages; quiz maximum points are shown only when recorded/allowed. Correct answers, raw responses and private trainer cues are excluded from the defaults.

Date filters apply to responses, completed missions, attendance and events; enrollment/history remains visible. Reports are limited to 10,000 records per dataset; narrow dates or class scope when prompted. At most two PDFs are prepared concurrently, with a 45-second per-export limit. Report files, photos and logos live inside backed-up storage. Download requires current authorization.

Projector remains a paired presentation stage without trainer controls or private learner details. Dark/Light/High Contrast and Course default → Class override → temporary Live override remain intact. Global font selection is independent of Projector theme. Verify real 16:9 display and projector contrast during the owner rehearsal.

## Audit, recovery and troubleshooting

Audit & history shows recorded operations within your authorized scope; filters/search never grant wider access. Reviewed bulk writes are actor-bound, expire after five minutes and refuse changed data; preview again when told to refresh. Archive & restore retains records and history rather than deleting learning evidence. Restoring an account does not resurrect its old sessions.

If a PDF fails: inspect the error, narrow the report, verify its saved logo/font bytes, or restore the verified application/storage backup. Missing/tampered saved exports fail honestly; generate a new report rather than claiming a successful download. A revoked course/class permission denies old exports. If a font renders unusual spacing, use Settings previews and the acceptance matrix before organization-wide adoption.
