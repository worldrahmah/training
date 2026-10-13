# Training Engine ONE Stage 1C Brainstorm / Ideas Board v3.4.0 RC3 — Complete Professional Feature Matrix

## Product surfaces

ONE deliberately separates work by role. Super Admin is an operations/admin surface. Trainer workspace is for preparation and management. `/live` is a dedicated class-bound delivery console and intentionally excludes system administration and broad reporting. Participant is the learner surface. Projector is presentation-only. Builder is authoring-only.

## Course and authoring

- Canonical machine activity/component registry mechanically synchronizes schemas, capability catalogs, Builder menus and the development authoring contract; drift fails the release gate.
- One canonical declarative course model; schemas 1.0, 1.1 and 2.0 remain compatible.
- Draft/publish model with immutable published versions.
- Autosave, Undo/Redo, revision history, compare and restore.
- Strict workflow graph validation and simulation including class and participant branching, convergence, terminal reachability and reference validation.
- Searchable asset library with preview, replacement, exact Used-by paths and dependency-safe deletion.
- Reusable authoring templates.
- Private trainer presenter notes: cue/explanation, talking points, expected answer, common mistakes and transition guidance.
- Machine-readable runtime capability contract at `/api/capabilities` and in the external authoring handoff.

## Classes and live delivery

- Intentional Projector themes are Dark / Light / High Contrast with Course default → Class override → temporary Live Class override. Builder preview and real Projector share one renderer/theme-token path.
- Professional class setup including version, sessions, timezone, trainers/assistants, participants and teams.
- Multiple simultaneous live classes.
- Short class join codes and prerequisite-aware self enrollment.
- Capacity-aware waitlist.
- Dedicated Live Classroom console with hierarchical Course Flow, persisted Done/Current/Next/Upcoming/Blocked/Skipped state, Jump to Current/Next and audited skip.
- Private presenter notes, classroom health/readiness, Help Queue, participant progress, timing, random participant/team picker.
- Projector pairing scoped to one class and expiring.
- Projector presentation modes: welcome, focus, break, countdown, celebration, blackout and return to course.
- 20-participant automated classroom rehearsal.

## Participant learning lifecycle

- Participant learning dashboard, schedules, calendar export and reviewed work feedback.
- Personal paths, help requests, missions, submissions and achievements.
- Attendance including Left Early and notes.
- Transcript plus CSV download.
- Verifiable printable certificates.
- Course evaluations/surveys.
- Question banks and deterministic randomized quizzes.
- Course prerequisites and waitlists.

## Administration, security and data safety

- RBAC, scoped course/class grants, global search, saved views and audited bulk operations.
- Append-only consent history.
- Submission review with approve/revise, rubric/score and feedback.
- Temporary-password enforcement, failed-login throttling, session expiry and concurrent-device limits.
- Session-token rotation.
- SQLite/WAL local-first operation.
- Automatic/manual backups, retention, SHA-256 verification, SQLite integrity checking, pre-restore safety backup.
- AES-256-GCM encrypted portable backup export/import with scrypt key derivation.

## Analytics and improvement

- Platform, course, version, class, trainer and participant reports.
- Time-on-step, abandonment, help wait, path funnels and course-health data.
- Version-to-version completion/help/time comparison.
- Generated course-improvement findings and activity help hotspots.

## Localization and UX release gates

- English LTR and Arabic RTL are hard requirements.
- Responsive automated checks cover phone/tablet/laptop layouts and Projector composition.
- Light/dark/system themes.
- A real-browser manual matrix remains a separate acceptance gate because the engineering environment used for this RC is organization-policy blocked from navigating to localhost/private addresses.

## Premium visual product system (RC3)

- Separate premium visual layer (`app/public/one-ui.css`) sits above the stable functional/layout compatibility CSS.
- Role-specific product identities for Super Admin, Trainer, Participant, Course Builder, Live Classroom and Projector.
- Desktop Admin/Trainer navigation uses local inline vector icons and a high-contrast professional navigation shell.
- Super Admin uses an operations-oriented visual hierarchy and live-operations hero treatment.
- Trainer uses a teaching-first visual hierarchy with the current teaching day emphasized.
- Participant uses a calmer, brighter, learning-first environment with an immersive current-learning area.
- Course Builder is styled as a creative workstation rather than an administration page.
- Live Classroom is a dark distraction-free class command center.
- Projector is a cinematic room-scale presentation surface.
- Modernized controls, forms, tables, dialogs, empty states, focus states, responsive mobile navigation and reduced-motion support.
- No remote fonts, icon CDNs or visual assets are required; the visual system remains fully local-first.
- Manual visual quality acceptance is governed by `docs/ONE_VISUAL_ACCEPTANCE.md`.

## Stage 1A Word Cloud feature slice
| Capability | Status | Evidence |
|---|---|---|
| Canonical Word Cloud authoring/validation | Implemented | Registry + synchronized schemas + Builder + package validator |
| Participant Word Cloud response | Implemented | Bounded multi-entry UI + normalized persisted envelope |
| Moderation/privacy | Implemented | Pending/approved/rejected + anonymous-to-trainer live/report redaction |
| Results/Projector | Implemented | Shared responsive Word Cloud renderer; audience hidden until reveal |
| Restart/backup/report continuity | Implemented | Dedicated runtime acceptance test |

## Stage 1B Moderated / Upvoted Q&A feature slice
| Capability | Status | Evidence |
|---|---|---|
| Canonical Q&A authoring/validation | Implemented | Registry + synchronized schemas + Builder + validator; team scope fails closed |
| Participant question submission | Implemented | Bounded persisted question envelope + stable IDs + retry de-duplication |
| Moderation/privacy | Implemented | Pre-moderation + public/trainer-only/anonymous + report redaction |
| Upvoting | Implemented | Approved-question voting + optional self-vote + idempotent voter state |
| Trainer facilitation | Implemented | Votes/Newest ordering + Pin + Answered state |
| Results/Projector | Implemented | Shared Q&A board; hidden before reveal; questions/participants metadata |
| Historical result recall | Implemented | Previously revealed Q&A can be recalled without workflow rewind |
| Restart/backup/report continuity | Implemented | Dedicated runtime acceptance test |


## Stage 1C Brainstorm / Ideas Board feature slice
| Capability | Status | Evidence |
|---|---|---|
| Canonical Ideas Board authoring/validation | Implemented | Registry + synchronized schemas + Builder + validator; team scope fails closed |
| Categorized participant idea submission | Implemented | Bounded persisted idea envelope + stable IDs + retry de-duplication |
| Moderation/privacy | Implemented | Pre-moderation + public/trainer-only/anonymous + report redaction |
| Upvoting | Implemented | Approved-idea voting + optional self-vote + idempotent voter state |
| Trainer facilitation | Implemented | Votes/Newest ordering + Highlight + non-destructive Merge/Unmerge |
| Results/Projector | Implemented | Professional categorized board; hidden before reveal; ideas/participants metadata |
| Historical result recall | Implemented | Previously revealed board can be recalled without workflow rewind |
| Restart/backup/report continuity | Implemented | Dedicated runtime acceptance test |
