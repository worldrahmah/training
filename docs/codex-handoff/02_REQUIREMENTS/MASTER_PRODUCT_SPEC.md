# Training Engine master product specification

## Product identity
Training Engine is a reusable local-first classroom training platform, not an AI-workshop-specific app. It must support many unrelated courses and many classes per course while keeping each delivery's students, trainers, teams, answers, submissions, scores, progress, attendance, messages, notes, reports, and history separate.

## Core surfaces
1. Super Admin: global management and read-only live observation across the platform.
2. Trainer: authorized course/class management plus live classroom control.
3. Participant: professional learner dashboard, profile, messages, live activities, missions, submissions, achievements, progress, and account controls.
4. Projector: presentation-only big-screen runtime for the shared classroom experience.
5. Visual Course Builder: authorized authoring UI for courses, versions, modules, workflow nodes, scenes, activities, missions, paths, prompts, questions, assets, conditions, scoring, and achievements.

## Local-first delivery
- Must run on a trainer/admin Windows laptop and serve participants over local Wi-Fi/LAN.
- Local platform capabilities continue when Internet is unavailable: login, profiles, course content, polls/quizzes, workflow state, missions, submissions that do not need the Internet, scoring, reports, history, backups.
- External services such as ChatGPT/Canva/Replit may require Internet and must be declared as Internet-dependent with an offline fallback where required.
- Launcher must prefer real LAN/Wi-Fi interfaces and avoid misleading WSL/Hyper-V/Docker addresses.

## Course/domain model
- Course = reusable program.
- Course Version = immutable published/delivered content snapshot.
- Draft = editable version derived from blank course or previous version.
- Class = one delivery of one exact course version, with own dates/times/location/capacity/trainers/participants/teams/sessions/results.
- Session = one actual live meeting within a class.
- Module/Milestone = high-level learning/workflow unit.
- Workflow node = executable classroom/participant step.
- Activity/Mission/Scene/Path/Asset = canonical reusable content entities.

## Version rules
- Published or delivered versions are immutable.
- Editing a published/imported version creates a new Draft.
- Drafts may be edited, reordered, duplicated, or deleted until published.
- Existing classes remain pinned to the exact version originally assigned.

## Canonical content model
- Imported `.course.zip` packages and in-app visual authoring MUST map to one canonical internal course model.
- New authored courses target the latest supported schema while old schemas remain runnable.
- Declarative content only; no arbitrary executable HTML/JS/CSS/SQL in course packages.
- Markdown-capable text fields are allowed with safe rendering.

## Course package lifecycle
Upload -> validate -> show blocking errors/warnings -> preview/simulate -> transactional import -> Draft/Publish.
A malformed package must never partially modify the database.

## User-facing language
Never show internal IDs, JSON keys, enum names, route names, debug labels, schema terminology, or developer-looking states. Translate internal state into professional human language.

## Roles
- Super Admin: global authority, configuration, monitoring, and administration.
- Trainer/Lead Trainer: scoped authority over assigned resources.
- Assistant Trainer: optional limited scope.
- Participant: learner-only scope.

## Account/profile requirements
Participant account includes immutable username/ID, required Arabic full name, English full name, mobile number and email. Optional fields may include WhatsApp, Telegram, organization/university, specialization, study level/job title, interests, AI/skill experience, preferred language, profile photo, LinkedIn/portfolio, city/country, and learning goals. The participant may update permitted fields, change password, language/theme, and sign out.

Any marketing, testimonial, or photo/video use must be explicit consent, auditable, optional, and separate from required training data.

## Messaging/notifications
Support internal admin/trainer announcements and participant notifications with sender, timestamp, read/unread state, target course/class/participant, and deep link where appropriate. Participant-to-participant chat is not required for the core.

## Course/class operations
Super Admin can create/view/edit/archive/manage courses, versions, classes, trainers, participants, teams, enrollments, sessions, assets, reports, permissions, and settings.
Class creation should support, in one coherent wizard/flow: course version, title, dates/times, timezone, location, capacity, lead trainer, assistants, existing participants, CSV participant import, initial sessions, and team configuration.

Trainer capabilities are permission-scoped. Course-content editing may be granted per course/version; class/participant administration requires explicit authority.

## Student roster
Manual add/edit plus CSV import with template, preview, validation, duplicate detection, and transactional confirmation. Deactivation/withdrawal preserves historical learning records.

## Attendance
Professional attendance states: Present, Late, Excused, Absent, Left Early. Connection telemetry may assist but does not silently replace trainer-confirmed attendance.

## Reports and analytics
Provide rich filterable dashboards and exports at Platform, Course, Course Version, Class, Trainer, Participant, Module/Objective, Activity/Mission, Path/Branch, Help Queue, Attendance, Completion, Performance, Engagement, and Version-comparison levels.
Use KPIs, tables, appropriate charts, drill-downs, date/course/class filters, and CSV/Excel-friendly exports. Historical reports stay bound to the exact delivered version.

## Audit and safety
Audit meaningful mutations: actor, action, resource, timestamp, relevant old/new summary. Prefer archive/deactivate over destructive deletion. Permanent deletion requires explicit authority/confirmation and dependency checks.
