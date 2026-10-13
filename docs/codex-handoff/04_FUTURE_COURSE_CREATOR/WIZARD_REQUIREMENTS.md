# Future Course Creator Wizard requirements

Do NOT freeze the final external course-creator package until the professional Core is finalized, because the package must be generated from the exact final schemas, component catalog, validator and workflow runtime.

After Core finalization, produce a reusable `TRAINING_ENGINE_COURSE_CREATOR_WIZARD_HANDOFF` that can be used in a fresh AI chat for any new course.

## Wizard behavior
The AI conversation acts as a guided wizard, not a giant one-shot prompt.

### Stage 1 — Intake
Ask only the questions needed to establish:
- course idea/title/topic
- audience and level
- language(s)
- duration/sessions/class size
- delivery context
- practical/theory preference
- resources already available
- desired outcomes

If source files/resources are provided, inventory and analyze them before proposing the curriculum.

### Stage 2 — Course Freeze
Collaboratively define and obtain explicit owner approval for:
- promise/transformation
- objectives
- module/milestone map
- exact timings
- cross-course skills/safety/judgment
- assessment/completion
- achievements/badges
- tool policy and Internet/offline expectations

Do not treat the course as frozen until explicit approval.

### Stage 3 — Module-by-module authoring
Default for complex courses: build one module/milestone at a time.
For each module wizard asks/decides:
- objective/evidence
- Trainer flow and cues
- Projector scene deck
- interactions and class branching
- participant paths/choices
- guided steps/pages
- prompts/resources/assets
- missions/submissions/scoring
- AI/safety/judgment if relevant
- achievement/completion
- offline fallback
- reportable data
Then show a concise review for approval before generating files.

### Stage 4 — Validation/Preview
Generate exact schema files/assets. Run validator. Simulate every trainer path and participant branch, including Start -> Current -> Finish -> Done -> Next and convergence. Repair all blocking issues.

### Stage 5 — Integration ledger
Add approved module to the current editable course Draft/version without mutating previously approved module definitions unless explicitly requested.

### Stage 6 — Full-course closure
Run whole-course timing, navigation, assets, localization, branching, reports, offline readiness and import validation. Seal `.course.zip` with exact hash and final acceptance evidence.

## UX of the AI wizard
- one decision cluster at a time
- simple language during brainstorming
- do not expose JSON/schema details unless needed
- preserve decision log
- never re-ask approved decisions
- clearly separate suggestions from frozen authority
- stop for owner approval at Course Freeze and each module freeze

## Outputs
The wizard package must include:
- exact final Core binding
- Component Catalog
- schemas/templates
- validator rules
- course/module templates
- resource-intake template
- Course Freeze template
- Module Specification template
- professional prompts for discovery, module builder, reviewer, package builder, repair
- Quick Start prompt
- acceptance checklist

Recommended module token: `MODULE_READY_FOR_COURSE_INTEGRATION`.
Recommended full-course token: `COURSE_READY_FOR_CLASS_SETUP`.
