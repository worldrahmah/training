# RC1R17 administration and staff experience update

Current app/Core3.5.0-rc.1.17; Core schema3.2, course schema2.0, workspace schema8. This update preserves the complete RC1R16 Guided persistence contract and immutable RC1R14 fixtures. No course schema or migration change. Administration creation/import actions are repaired; staff have global unread/call handling, redesigned chat, separate Tasks and Calendar pages and selected-color light/dark overview contrast. See the current release verification receipts; source and immutable extraction checks must pass before distribution. Owner hardware/classroom/visual/assistive acceptance remains separate.

# RC1R16 Guided persistence and complete staff workspace update

Current Core/app 3.5.0-rc.1.16; core schema 3.2, course schema 2.0, additive workspace schema 8. RC1R14 is preserved as the rollback baseline. All RC1R15 staff chat/calls/tasks/calendar, participant notes, activity dialogs, theme and scalable selection features are included. This section supersedes earlier persistence certification statements. Engineering certification is recorded in the release reports; owner Windows/LAN/hardware/visual/assistive acceptance remains separate.

The Core preserves HTTP status even when a server/intermediary returns HTML. API rejection, authentication, validation, conflict, server errors and JavaScript defects are not labeled offline. A confirmed save requires an explicit successful acknowledgement, exact mutation identity and positive server revision. Required Next/Finish stays blocked during saving or unresolved changes. No course or evidence requirement is weakened. A failed presentation refresh cannot requeue an already confirmed mutation.

Evidence/edited prompts/embedded answers are durable on this device before sending. Each mutation has a stable identifier, account/class/module/path/concrete-step context, timestamp, attempts and classified last error. Actual offline writes queue; network reachability failures/timeouts say that confirmation is pending without claiming a rejected HTTP request was offline. Ordered reconnect replay removes confirmed changes. Rejected changes stay visible for explicit Review/Retry/Discard. Retry never silently rebases an attempted stale mutation onto newer progress. Successful own writes may advance only the unsent chain from the same document origin. Different tabs/documents retain independent origins; their stale queued edits conflict instead of being rebased. Legacy pending rows without origin/revision metadata remain available for review. Multi-tab duplicate transmissions are safe through transactional server receipts. Binary uploads and fresh page loading require a server connection; already saved file references and text edits can be reconciled. Offline page refresh retains pending local storage and resumes synchronization after the page can load again.

Server receipts for both progress and embedded answers are retained in the additive guided_mutation_receipts table, scoped to caller/class/mutation with a payload hash and confirmed response. They commit atomically with the canonical progress/answer write and survive path changes and more than 64 later edits. Every embedded answer now requires the current expected_revision and advances that revision. Omitting the mutation identifier cannot bypass revision protection. Existing ordinary activity APIs and historical records remain unchanged. An old Guided tab must reload; old queued answers without revision are retained for review instead of silently overwriting current answers. Course packages/schemas and stable IDs do not change.

The canonical technical sample GUIDED_PERSISTENCE_ACCEPTANCE.course.zip includes both paths, ChatGPT resource data, acknowledge, prompts, path variables, stable shared templates, all eight evidence modes, all twelve individual embedded interactions, convergence and closing. It is a Core technical acceptance pattern, not special runtime behavior for one tool or course. The exact original RC1R14 Arabic/English M1 ZIPs are retained under tests/fixtures/guided-rc14 with origin hashes. The official fixture routes include both confidence/remediation outcomes for each path/language.

Development diagnostics: start the local server with ONE_GUIDED_DIAGNOSTICS=1 and listen in browser developer tools for guided-persistence-diagnostic events. Events contain route/status/category, synthetic or current record identifiers, mutation/outbox identity, revision and attempts; no session tokens, answer/evidence text or arbitrary server exception bodies. Normal participants see concise localized messages only. Review saved guided changes lists actual unresolved items, not confirmed ghost entries. Never clear browser storage as a repair; preserve and review pending work.

Upgrade uses the existing verified pre-upgrade database/storage snapshot and immutable migration journal. Do not replace/reset owner data. Roll back with the matched pre-upgrade app/database/storage backup rather than downgrading a migrated database in place. No universal security or hardware performance guarantee is asserted.

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
