Act as a senior school product architect, education workflow specialist, bilingual UX designer and software migration reviewer. Help me define a school edition of my existing system before anyone writes implementation code.

## My objective

I own Training Engine ONE. We have reached RC1R10, a local-first English/Arabic interactive learning and training management platform. I now want a coherent product for schools rather than a training-course management product. I previously used the word “undergraduate”; first establish whether I mean school-age pupils before university or university undergraduates. Do not silently choose an age range or educational model.

I will bring your completed planning package back to the engineering chat for review and implementation planning. Your task here is discovery, a professionally structured upgraded blueprint and a precise handoff. Do not start coding, prescribe a rebuild or pretend proposed features already exist.

## Attached material and authority

Read the entire attachments before drafting:

1. `01_RC1R10_CURRENT_SYSTEM_BLUEPRINT.md` — documented current architecture, capabilities, boundaries, evidence and source map.
2. `02_SCHOOL_EDITION_BLUEPRINT_DRAFT.md` — initial proposals, gaps, roadmap and open decisions; these are not yet approved requirements.
3. When provided, `reference/` — frozen current registry, capability contract, schemas and release seal result. These are existing engine contracts, not school contracts.

The owner requirements I state in this conversation take precedence over proposals and historical documents. Distinguish supplied facts, source-verified facts, assumptions, recommendations and accepted owner decisions. Report conflicts. If a file is inaccessible, identify it and continue from the available material with a clear limitation; do not claim to have inspected source you cannot access.

## Existing foundation that must be respected

- Baseline application: 3.5.0-rc.1.10, core schema 3.2, current course schema 2.0 with retained historical compatibility, 36 canonical activities and 68 certified activity/result-view cases.
- RC1R10 remains an owner-acceptance candidate; its recorded automated passes do not mean final school or physical classroom acceptance.
- Preserve existing users, stable IDs, published course versions, classes, enrollments, responses, submissions, attendance, history, reports, assets, backups and supported upgrade paths.
- Preserve local-first Windows/classroom LAN operation. Cloud services can be optional; core teaching cannot require them. Remote/online deployment is a separate verified operating mode, not established by local test results.
- Reuse the canonical declarative learning model and activity registry. Do not introduce executable course JavaScript, HTML, CSS, SQL, credentials, arbitrary grading code or custom server plugins in learning packages.
- Keep private teacher/Trainer guidance, student instructions and audience-safe Projector content separate. Enforce answer/mark release policies on the server.
- Preserve Course Editor isolation, explicit resource permissions and truthful/auditable writes. Do not grant all teachers global access.
- Preserve complete English LTR and Arabic RTL, independent authored-content language, accessible responsive light/dark interfaces and accepted typography.
- Do not equate a delivery class with a school section, training scores with official term marks, generic consent with child-safety compliance, or a guardian contact field with verified guardian authorization.
- Schema changes require documented impact, deterministic versioned migration, populated historical database tests, complete backup/restore and honest downgrade limits. No SQLite reset, manual database editing, repository reset or destructive conversion.

## How to work with me

Start with a short account of what the current system already offers and the most consequential school gaps. Then ask one manageable batch of at most seven material questions about learner age/stage, country/curriculum, institution scale/deployment, first-release priorities, assessment, guardians and the relationship between school and training editions. Explain only decisions that affect the architecture or user behavior. Avoid a long questionnaire about cosmetic details.

After my answers, produce the blueprint. If I ask you to proceed without all answers, label assumptions explicitly and keep unresolved architecture/permission decisions open. Do not treat silence as approval. Offer practical alternatives and recommend one with reasons. Do not include finance, payroll, transport, medical records, full ERP, native apps, multi-tenant hosting or built-in video unless I explicitly prioritize them.

## Required planning package

Produce these sections as one coherent, reviewable document:

1. **Product charter:** audience, problem, goals, first-release boundary, non-goals and measurable pilot outcomes. Use a working product name/version until I approve them.
2. **Current-to-target matrix:** each capability marked Preserve, Adapt, Add, Defer or Exclude, with current source reference, proposed behavior, dependencies and acceptance evidence. Identify unsupported requirements as **CORE CAPABILITY GAP** rather than inventing registry features.
3. **Academic domain model:** institution, academic year, term, grade/year group, section/homeroom, subject, offering, teacher assignment, student placement, timetable/lesson occurrence, assessment, attendance and optional verified guardians. State cardinalities, stable identity and lifecycle; explain mappings to existing courses/versions/classes/sessions/enrollments without conflating them. Adapt the model if tertiary education is intended.
4. **Roles and permission matrix:** what each role sees, creates, edits, approves, publishes, archives and exports, scoped by student/section/subject/year. Cover administrator, registrar, principal/academic lead, teacher, homeroom teacher, student, curriculum editor, IT operator and guardian only where applicable. Include negative access examples and revocation.
5. **Information architecture and role workspaces:** navigation and readable textual wireframes for daily home pages, preparation, learning, feedback, operational tasks and reports. Cover phones/tablets/desktop, EN/AR RTL, keyboard/focus, loading/empty/error states and audience-safe Projector.
6. **End-to-end workflows:** school setup → rostering → subject assignment → lesson preparation/delivery → student work → marking/feedback → reporting; timetable exceptions/substitutions; attendance corrections; transfers; year rollover; permission changes; guardian verification/revocation if relevant. State actors, preconditions, real writes, failure/retry behavior and audit evidence.
7. **Assessment/reporting rules:** distinguish formative feedback from official grading; scales, weights, missing/late/exempt work, rounding, overrides, moderation, publication, corrections, report reissue and historical lock policy. Never assume activity completion equals mastery or login equals attendance.
8. **Architecture and data evolution:** recommended reuse boundaries, new academic entities, API/UI impact, compatibility strategy, migration previews/mapping, historical preservation, backup/restore and downgrade limitations. Compare separate edition versus shared selectable mode without silently deciding. Avoid unmeasured technology replacement.
9. **Safety, privacy and deployment:** child/guardian access where relevant, restricted communication, retention/export/deletion obligations to investigate, local/LAN versus secure hosted access, identity/session controls and poor-network behavior. Separate application protections, operational responsibilities and matters requiring institution/legal decisions; do not claim universal compliance or security.
10. **Milestone roadmap:** a minimum coherent pilot followed by small testable milestones, each with dependencies, exact behavior, migration impact, deliverables, acceptance scenarios and stop conditions. Do not invent schedules or capacity guarantees. Use the existing test framework where known; label proposed new tests clearly.
11. **Validation and release gates:** preserve 36/68 regression, populated migrations, role/API/data tests, grading/reveal privacy, restart/reconnect, backup/restore, EN/AR responsive/browser/accessibility/PDF checks, real school-day rehearsal, sealed ZIP/fresh extraction/checksums/retest, bilingual guides and owner acceptance. No FINAL label based solely on automation.
12. **Decision and risk register:** accepted decisions, proposals, assumptions, unanswered questions, conflicts, capability gaps and honest remaining limits, with priorities.

Use concrete examples such as two sections sharing a subject, a teacher assigned to only one section, a student changing section mid-term, a missing assignment versus a real zero, a revoked guardian, and a closed school year. Explain how the same student retains historical evidence through these changes. Do not manufacture country-specific regulations, formulas or file/schema details absent from the evidence.

## Mandatory final engineering handoff

End with a copy-ready section titled **RETURN TO ENGINEERING CHAT** containing:

- Baseline identity and compatibility invariants.
- Confirmed audience, institution model, deployment and edition strategy.
- Approved first-release scope and explicit deferred scope.
- Current-to-target mappings and proposed data changes.
- Permission, privacy, grading and release-policy decisions.
- First implementation milestone only, with acceptance scenarios and migration/rollback prerequisites.
- Remaining material questions and CORE CAPABILITY GAP items.
- A concise implementation prompt instructing the engineer to inspect actual checkout/changes/AGENTS/project policies/current registry/runtime/tests first, preserve local work and historical data, update the living plan, run the baseline and proceed one accepted milestone at a time.

If I have not explicitly accepted the blueprint, label that handoff **PROPOSED — REQUIRES OWNER DECISIONS**, not approved or implementation-authorized. A planning conversation must not be presented as an already delivered school system.
