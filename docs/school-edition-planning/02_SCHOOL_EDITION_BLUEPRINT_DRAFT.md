# Proposed school edition — discussion blueprint

Status: **PROPOSED, NOT IMPLEMENTED OR OWNER-APPROVED**. Based on the RC1R10 snapshot in document 01. Working label: “School Edition”; no final name/version is selected.

## 1. Product goal and unresolved audience

Evolve the existing learning and classroom engine into a coherent school teaching and academic operations system. Reuse proven learning functionality while adding the academic structure and role journeys that a training delivery model does not represent.

Resolve whether the owner means primary/secondary pupils before university, university undergraduates, or both. That decision affects academic structures, guardians, safeguarding, enrollment, credits, assessment and reporting. The following uses a **provisional single-school, school-age learner model** for discussion, not an approved decision. If tertiary education is intended, replace school grade/homeroom assumptions with programs, departments, course credits, semester registration and prerequisite policies after discovery.

## 2. Product layers

| Layer | Recommended responsibility | Current foundation |
|---|---|---|
| Academic organization | Years, terms, grade levels, sections/homerooms, subjects, offerings and staff assignments | New domain; retain existing users and resource permissions |
| Teaching and learning | Subject curriculum, units/lessons, interactive activities, assignments and support | Reuse canonical course authoring and classroom engine |
| School operations | Rosters, timetables, school/session attendance, term rollover and communication | Extend classes, groups, sessions and messaging with explicit academic relationships |
| Assessment and reporting | Marking policies, moderated grades, report cards, revisions and approval | Extend response/submission/rubric/report mechanisms; no automatic equivalence to academic grades |
| Identity and governance | Role/resource scopes, optional guardians, privacy, retention, audit and recovery | Extend existing account/session controls; child-safety requirements are new |
| Deployment | Local school/LAN first; optional secure remote access | Preserve offline classroom foundation; public Internet needs separate verification |

Avoid a full ERP in the first release. Fees, payroll, transport, medical records, library, hostel, native mobile apps, multi-school tenancy and built-in video conferencing are separate optional domains unless the owner explicitly prioritizes them.

## 3. Suggested academic model

```text
School organization (initially one installation; no implied tenant isolation)
  Academic year
    Terms / grading periods
    Grade levels / year groups
      Sections / homerooms
        Student placements, with effective dates and retained history
    Subject offerings (subject + academic year + section/cohort + teaching staff)
      Curriculum/unit links to existing immutable course versions
      Scheduled lesson occurrences
        Existing delivery classes / class sessions, explicitly linked
      Assignments and assessment records
      Gradebook and approved reporting periods
```

Additional explicit relationships: a student can study several subject offerings; teachers can hold several scoped assignments; a section has many subjects; a subject can serve several sections. Where applicable, an authorized guardian can have several children and a student several guardians, with verified relationship/status/restrictions. Timetable occurrences use school timezone and explicit calendar/exception handling.

**Critical modeling boundary:** an existing engine class delivers one course version. A school section persists across subjects and a school subject may use several curriculum units/versions. Do not rename `classes` to “sections” or bulk rewrite historical enrollments. Propose separate academic entities and delivery-link tables, then validate cardinality and lifecycle against real scenarios before selecting DDL.

Conceptual names above are design vocabulary, not final tables or a promise that schema migration is trivial. Separate scheduled lessons from actual delivered occurrences, attendance facts from connectivity, learning evidence from approved grades, and current placement from historical placement.

## 4. Role journeys to design

| Role | Proposed home experience | Authorization questions |
|---|---|---|
| School administrator / registrar | Set up year/terms, students, placements, staff and offerings; review operational status | Which records can each administrative role create, correct, archive or approve? |
| Principal / academic lead | School summaries, assessment approval, exceptions and reports | Aggregate visibility versus individual records; no automatic access to every private field |
| Teacher / subject teacher | Today's lessons, assigned rosters, attendance, tasks to mark, messages and classroom launch | Scope by offering/section/term; separate marks entry, approval, publication and corrections |
| Homeroom teacher | Section roster, day attendance and permitted pastoral overview | Access across subjects and sensitive notes must be explicit |
| Student | Today's timetable, subjects, next tasks, feedback and permitted progress | Age-appropriate account, private feedback, release policies and accessible help |
| Guardian, if applicable | Verified child's timetable, permitted attendance, announcements and published reports | Relationship verification, custody restrictions, multiple children, revocation, privacy and contact rules |
| Curriculum editor | Subject/unit authoring and review | Retain existing authoring isolation; no automatic student record access |
| IT/system operator | Installation, backup/recovery and account support | Distinguish host powers from educational data permissions |

Existing Trainer/Participant identifiers need not change when school-facing labels become Teacher/Student. Role mappings and migrations must be explicit; do not grant all teachers administrator rights. Guardian permissions must never be inferred from a matching email, surname or child-entered code.

## 5. Feature disposition and gaps

| Existing capability | School direction | Disposition |
|---|---|---|
| Canonical course/module/activity model | Reusable subject units and lessons, linked to curriculum objectives | Reuse + extend mapping |
| Immutable versions and Draft publishing | Retain content history across terms and deliveries | Preserve |
| Live console/Student/Projector | Teacher-led lessons and independent practice | Reuse; adapt navigation/terminology |
| Training classes/enrollments | Keep delivery context; add academic placement/offerings | Extend; do not conflate |
| Registered class-code admission | Optional supervised joining of an approved delivery | Preserve policy; not school admission |
| Class sessions | Connect to planned timetable/actual lesson occurrences | Extend |
| Per-session attendance | Add explicitly defined daily/period registers and correction workflow | Extend; decide policies first |
| Teams and reusable groups | Learning collaboration and scoped communication | Preserve; review student-visible membership privacy |
| Scores/rubrics/question banks | Formative assessment and assignments | Reuse; add academic grade policy separately |
| Transcript/certificates/PDF templates | Preserve training evidence; design school report cards and publication | New academic reporting layer |
| In-app messaging | School/section/subject/role audiences with safeguarding rules | Extend; no unrestricted minor-adult private messaging by default |
| Generic consent history | Retain evidence; add jurisdiction/age/guardian-specific governance | Gap; not legal certification |
| Local accounts/sessions | School provisioning and lifecycle; optional SSO later | Extend only after deployment/identity decision |
| Offline response queue | Keep supported learning continuity | Preserve; no promise of offline gradebook/conflict-free school synchronization |
| Owner logo/EN/AR/themes/fonts | Coherent school identity and complete bilingual experience | Preserve and extend |
| No video meetings | Use external meeting tools first if needed | Optional integration, not first-release assumption |

## 6. Minimum coherent school release, proposed

Recommended first pilot: one school, one academic year, a small number of sections/subjects, local/LAN deployment, existing staff/student accounts and full EN/AR. The exact size, age range and priority must come from the owner.

1. Academic setup: year/terms, grades/sections, subjects, teacher assignments, roster placements and import validation.
2. Teacher and Student school workspaces: current year/term, today/next work, subject navigation, clear pending/empty/error states.
3. Teaching flow: attach versioned units to offerings, schedule/launch lessons, assignments/submissions and private feedback, using all existing supported activities.
4. Attendance: define day versus period scope, explicit statuses, permitted corrections, audit and authorized summaries.
5. Basic gradebook/reporting: define scales, weights, missing/exempt work, moderation, publication and revisions before implementation. Show recorded evidence honestly; never treat an unsubmitted task as zero unless approved policy requires it.
6. Safe communication: approved audience rules, contacts and in-app notices; a minimal verified guardian surface only if minors/owner policy make it necessary for the pilot.
7. Operational readiness: migration, complete backup/restore, permission tests, bilingual guides and actual school-day rehearsal.

If this exceeds a credible first release, split deployment into a teaching pilot and an assessed-records release. Never present an unfinished gradebook as an official reporting system.

## 7. Data and compatibility strategy

- Preserve the delivered RC1R10 package and exact hash as a recoverable reference. Use the existing checkout; do not reset it or create an additional worktree unless requested.
- Inspect actual current data/schema before implementation. Prepare a migration-impact document before schema changes.
- Prefer additive, versioned, deterministic migrations and explicit relationships to existing IDs. Do not infer grade/term/guardian relationships from free text or usernames.
- Preserve historical users/passwords, course IDs, immutable versions, classes, enrollments, attendance, responses, submissions, teams, reports, assets and backups. An academic year rollover creates new placements/offerings without rewriting past evidence.
- Keep old training deliveries valid and accessible through an explicit historical/legacy context. Do not turn every existing account into an active school student without a reviewed placement.
- Start with a pilot copy of populated state, reviewed mapping/import preview, stale-state detection, row-count/evidence checks, migration restart tests and verified backup/restore.
- Do not move to another database or framework solely for branding. Profile actual load before choosing a change. SQLite suitability for the intended online concurrency is a measured question, not a promise.
- Define downgrade compatibility before delivery. Application rollback and data restore are distinct; destructive restore needs an explicit recovery decision and recognition of newer work.

## 8. Privacy, safety and assessment integrity

Resolve jurisdiction, ages and institution policy before claiming readiness for children. Define data minimization, guardian authority, retention/deletion exceptions, student transfer/export, incident handling and restricted staff access. Medical/safeguarding/custody documents should stay out of the initial product unless there is an explicit protected-data design and need.

Teacher access follows current assignments and effective dates. Transfers, guardian changes and staff departures must revoke future access without erasing historical evidence. Student marks/feedback remain private to authorized people; Projector scenes and peer-facing lists must not expose grades, absence reasons, private notes or answers early.

Grading needs deterministic, inspectable rules, rounding, exemptions, missing/late policies, overrides with reasons, approval, publication, correction and report reissue. Use bounded declarative policies, never executable formula/code uploads. Do not make high-stakes decisions solely from time-online or activity counts.

Remote access needs HTTPS, authentication/session/proxy hardening, rate/abuse/resource controls, backup/recovery, updates and capacity evidence. Do not expose the current host or loosen camera/microphone/security policies as a shortcut. Third-party meetings, AI, email or SMS introduce data-sharing and operational dependencies requiring explicit decisions; keep core classroom delivery local-first.

## 9. Staged engineering roadmap and exit evidence

| Stage | Concrete result | Exit evidence |
|---|---|---|
| 0 — Discovery and approved blueprint | Audience, workflows, scope, terminology, domain boundaries, permissions and pilot criteria | Owner decisions plus unresolved register; actual RC1R10 source mapping |
| 1 — Academic foundation | Years/terms, sections/subjects/offerings, placements and teacher scopes | Populated migration/backup tests; cross-class/role denials; year isolation |
| 2 — Teaching workspace | Teacher/Student navigation, curriculum links, lessons and assignments | End-to-end teacher preparation → student work → feedback; 36/68 regression |
| 3 — Attendance and assessment | Approved registers, grading rules and basic school reports | Deterministic calculations, corrections/audit, publication privacy, real report content |
| 4 — Communication and guardians as required | Verified relationships and safe audiences | Wrong-child/wrong-role denial, revocation and incident/retention scenarios |
| 5 — Pilot/release | Guides, upgrade/rollback, support procedures and complete package | Full suite, real school-day pilot, exact-ZIP extraction/retest, owner acceptance |

Stages may be reordered after discovery. Implement one small accepted milestone at a time. No dates, cost, production capacity or staffing promise is implied.

## 10. Acceptance scenarios to bring back to engineering

- Administrator sets up a year, two sections and two subjects; teachers see only assigned scope and Students see their own subjects.
- Teacher prepares a versioned lesson, runs an activity, keeps cues/answers private, receives queued/reconnected work once and reviews actual saved evidence.
- Student transfers section mid-term; future access changes while earlier attendance/submissions/grades remain attached to their original context.
- Attendance starts unrecorded, saves explicit statuses, handles late corrections with actor/reason, and does not infer presence from login.
- Gradebook distinguishes not submitted, ungraded, zero and exempt; calculations and rounding are independently reproducible; unpublished marks never leak into Student/guardian/Projector APIs.
- If guardians are included, one guardian sees two verified children; an unrelated adult and a revoked guardian see neither child's restricted records.
- School year closes and next year opens without rewriting historical courses, delivery versions, rosters or reports; corrections follow an explicit permissioned policy.
- Browser/API denials are tested directly, including archived/legacy routes, not only hidden buttons. EN/AR RTL, light/dark, keyboard, narrow screens and Projector remain usable.
- Restart/reconnect, populated migration, verified database+assets restore and rollback limitations are exercised. Exact release bytes are sealed, freshly extracted and tested again.

## 11. Material decisions for the planning chat

1. Learner ages/stages: primary, secondary, university undergraduate, or a defined combination?
2. Country/jurisdiction, curriculum, academic calendar, assessment/report-card requirements and languages?
3. Initial institution count, students/staff, simultaneous users, local/LAN versus hosted/online operation?
4. Required first-release workflows and ordering: teaching, timetable, attendance, official grades, guardian portal, remote classes?
5. Identity/onboarding: school-provisioned accounts, existing imports, verified guardians, optional SSO; who approves enrollment and transfers?
6. Product relationship: separate school edition using a shared engine, or an explicit selectable mode? How should existing training installations continue to upgrade?
7. What existing RC1R10 data must become active academic records versus remain historical training evidence?

Document unanswered decisions and offer bounded alternatives with tradeoffs. Do not invent a country's regulations, grading scale, legal compliance or approval on behalf of the owner.
