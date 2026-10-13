# Master Codex prompt

You are upgrading an existing owner-tested Training Engine, not creating a greenfield prototype.

FIRST:
1. Read repository `AGENTS.md` and this handoff's required documents.
2. Verify the exact baseline artifact hash from `01_BASELINE/BASELINE_BINDING.md`.
3. Inspect `workspace/training-engine` and reproduce every existing baseline test before making runtime changes.
4. Initialize/use Git if the working folder is not already versioned. Create a baseline commit/tag and perform the upgrade on a separate branch/worktree.
5. For this long-horizon task, create and maintain `docs/CODEX_EXEC_PLAN.md` according to `.agent/PLANS.md`.

GOAL:
Transform Training Engine v2.1.1 into a genuinely professional, maintainable, high-quality reusable Training Management + Course Authoring + Live Classroom platform while preserving all owner-approved behavior, course/data compatibility and local-first delivery.

Do not merely patch the screenshots or add isolated UI components. Audit the entire system architecture, data model, runtime, frontend, accessibility, responsiveness, permissions, course authoring, workflow execution, reporting and reliability against `02_REQUIREMENTS/*` and `03_ACCEPTANCE/*`.

You may refactor architecture substantially when justified, but you must preserve observable compatibility and provide deterministic database migrations. Prefer maintainable typed/module boundaries, reusable design-system components, explicit state machines/workflow services, testable APIs, and one canonical course model over large monolithic files or duplicated logic.

The owner is time-constrained. Optimize for a stable workshop-ready system, not speculative enterprise features. Implement the explicitly required professional behavior first. Do not introduce cloud dependencies for core classroom operation.

Important known requirements/defects to close include:
- true full-screen, room-readable Projector presentation runtime
- complete responsive/UI/UX pass across every surface
- full Arabic/English typography and themes
- real Super Admin global administration and read-only live operations monitoring
- professional granular Trainer permissions
- rich Participant profile/account/notifications/sign-out/consent
- Course/Class creation and management with trainers, participants/import, teams, sessions and lifecycle
- rich analytics/reports
- visual Course Builder using one canonical model for imported and in-app courses
- visual executable workflow graph with class-level and participant-level branching/convergence
- strict workflow validation and runtime transitions
- Trainer Workflow Progress Tracker with Done/Current/Next/Upcoming/Blocked/Skipped
- collapsible hierarchical Course Flow with progress counts, auto-collapse/auto-expand, Jump to Current/Next
- participant guided multi-step paths, independent concurrency, resume, submissions, scoring, achievements and offline fallback
- NEED HELP, Trainer Help Queue and live per-participant progress
- asset library/dependency safety, draft autosave, validation while editing, preview/simulation, immutable published versions
- backward compatibility with old course packages and populated v2.1.1 databases

WORK STYLE:
- Work milestone by milestone according to the ExecPlan.
- Run relevant tests after every milestone; repair failures immediately.
- Add regression tests for each repaired owner-reported defect so it cannot recur.
- Use browser/runtime testing for actual UI behavior; source-level assertions alone are insufficient for responsive and presentation requirements.
- Test important workflows with realistic fixture data, including 20 participants and independent branching.
- Keep documentation, schemas, templates and validator synchronized with implementation.

RELEASE:
Do not overwrite v2.1.1. Produce a new release candidate first. Only produce a FINAL artifact when every applicable condition in `03_ACCEPTANCE/FINAL_ACCEPTANCE.md` passes on the exact bytes.

After the Core is finalized, generate the authoritative machine-readable authoring contract and materials needed to create the new Course Creator Wizard described in `04_FUTURE_COURSE_CREATOR/WIZARD_REQUIREMENTS.md`. Do not guess the wizard contract before final runtime/schema behavior is known.

Return:
- upgraded source repository
- migration(s)
- tests and fixtures
- UI/UX acceptance evidence
- compatibility/migration evidence
- final authoring schemas/catalog/templates/validator
- release notes
- exact release ZIP + SHA-256
- a concise list of any non-blocking limitations still remaining

Only claim `TRAINING_ENGINE_PROFESSIONAL_CORE_READY_FOR_COURSE_AUTHORING` when the exact release satisfies the full acceptance contract.
