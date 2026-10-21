# RC1R15 — staff collaboration and scalable workspace

Notifications remain the existing notification inbox and Send notification. Staff chat is a separate private staff workspace, linked from Admin/Trainer sidebars and all staff account menus, including Course Editor. Participants cannot use staff chat/tasks. Direct/group text, bounded authenticated attachments, browser-recorded voice notes, read receipts and two-person WebRTC audio/video calls are available according to administrator policy and per-user permissions. Group creators manage membership. Only members can read messages/files; administrator status does not grant access to private conversations. Removed members lose access. Calls need HTTPS or loopback for devices and working ICE connectivity; optional administrator STUN/TURN is supported, including TCP relays. This is not WhatsApp feature parity or end-to-end encrypted message storage.

Staff Tasks & calendar supplies own tasks, supervisor assignments with assign_tasks permission, statuses, priority, start/due dates, notes, checklists, daily/weekly/monthly/yearly recurrence and day/week/month/year views. Calendar counts cover the complete authorized range; the agenda is paged. Completing a recurring task creates its next scheduled task. Both creator and assignee can update shared task progress; only creator can reassign/remove. Administrator does not gain access to unrelated private tasks. Export the authorized calendar as ICS.

Participants use My class notes inside the running class, save/edit their own text notes and export them. Workspace/profile notes remain accessible after class finish. No Trainer/Admin/other participant can read personal notes. Permanently deleting the class also removes its personal notes; export first.

Visible Admin/Trainer overview panels now have the same complete 10/25/50 activity paging, search/type/time/date filters as the Student panel. Click an event for an accessible detail dialog. Details use a human-readable allowlist, never raw event JSON, answers, tokens, private cues or message/note content. The live replay uses the same safe dialog. The live-operations hero now follows the account panel color and light/dark theme.

Selection forms use searchable, scrollable paginated tables, page select/remove, clear and selected-only actions. Form selections and assignment roles remain stable across pages. Group, audience, team, class participant/staff/course and other large native selection controls share this behavior. Existing people lists are paged locally after authorized retrieval; staff chat directory is SQL paged. Class creation fetches authorized published course-version options once instead of one request per course. Bulk roster selection adds/removes up to 500 participants atomically and preserves historical progress.

These workspace tools do not add executable course content or change course schemas. All previous guided authoring contracts remain.

# RC1R15 personal workspace and delivery controls

The Trainer has a distinct Finish class action in the live header and class list, available without completing a blocked workflow. It closes the live class, preserves saved answers/partial progress and permits subsequent Trash; it does not fabricate completed learner tasks. Hold, Break and Finish section remain separate. Student delivery is one full-width selected class with a compact LIVE / مباشر indicator above the hero and top-menu workspace/profile access; no redundant learning rail remains.

UI language, light/dark/system and six panel colors plus workspace default belong to each account and persist independently. They never rewrite authored course language, Projector themes or another account's settings. All roles have own activity history with server-side 10/25/50 paging, inclusive local date/type/search filters, and scoped staff audit. These operational conveniences do not add course schemas or executable package content. The complete guided authoring/branching/evaluation/preview contract below remains supported.

# RC1R15 operational Creator and classroom update

Current Core 3.5.0-rc.1.15 / core schema 3.2 / course schema 2.0 / additive workspace schema 6. The complete guided contract below is retained. Course Builder now offers Add lesson: teaching content, practical task and reflection produce ordinary canonical presentation/practice/convergence/closing nodes. Direct editing autosaves; optional settings are under Advanced settings; an outline keeps navigation visible. The pure app/public/creator-start.js helper is included in the portable kit and uses the same graph model. It is an authoring convenience, not a new course type. Preview, validator, export and runtime share the canonical model; no per-course Core change is needed.

Participant delivery opens /student/class?class_id=... with one selected class at full width with workspace/profile access in the top menu; /student?workspace=1 returns to the ordinary learning workspace. Course/class Delete uses distinct Trash. Intentional Archive remains separate. Trash restoration retains state/history; permanent deletion is a separate administrator-confirmed action with dependency guards. Old ambiguous archives remain Archive with Move to Trash.

# Current RC1R15 authoring boundary

Training Engine ONE 3.5.0-rc.1.15. Read GUIDED_EXPERIENCE.md and CREATOR_GAP_MATRIX.md first; they supersede older guided limitations below. Current canonical schemas, registry and portable validator are authoritative. The standalone handoff includes the entire current course-creator-kit; use its validator and six samples without npm installation. No mandatory master-prompt engineering feature is deferred. Owner classroom/Windows/assistive acceptance is a separate unrun gate.

# Training Engine ONE RC1R15 — current AI Course Creator contract

This in-tree kit is synchronized to the RC1R15 canonical registry, runtime capabilities and course schemas. Read CORE_CAPABILITIES.json completely before authoring. The kit is current for this owner-acceptance candidate; FINAL requires owner acceptance. The separate v1.3 package is historical RC4 evidence. Course schema remains 2.0; core/data schema is 3.2 with journaled workspace extensions.

## Authority order
1. `CORE_CAPABILITIES.json`
2. `WORKFLOW_AND_AUTHORING_RULES.md`
3. `COMPONENT_CATALOG_ONE.md`
4. `ONE_PLATFORM_CAPABILITIES.md`
5. `schemas/*` and `templates/*`
6. `examples/*` (reference only)
7. `CHATGPT_MASTER_COURSE_AUTHORING_PROMPT.md`

## Authoring rule
Use only capability IDs exposed by `CORE_CAPABILITIES.json`. Courses remain declarative; do not embed arbitrary executable code. Explicit workflows must be complete executable graphs. Preserve stable activity/objective IDs for analytics.

## Required course output
Return an importable course package, exact SHA-256, validation report, workflow simulation report when applicable, asset/reference coverage and known limitations.

## RC1R8 operation boundaries
Course Editors can author their own or assigned drafts and publish only with the per-course publishing grant. New class-code admission requires a registered account and assigned-manager approval. Historic guest learners and sessions are preserved; do not author instructions that promise new anonymous joining. Fonts are centrally chosen from 20 English and 20 Arabic bundled families; current global choices override old per-course font overrides. Course content language remains independent of the interface language.
