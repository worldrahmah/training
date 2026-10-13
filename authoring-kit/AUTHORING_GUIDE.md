# Training Engine — Course Authoring Guide v2.0

## Purpose
Training Engine separates **course definition** from **delivery data**. A course package describes what should happen. The local database records what actually happened in each class, including enrollment, attendance, live responses, missions, submissions, scores, achievements, notes and audit history.

A course package is declarative content. It must never contain executable JavaScript, HTML, CSS, server code, SQL, credentials, API keys or database instructions.

Read `COMPONENT_CATALOG.md` before authoring.

## Recommended production workflow
1. Design the learning architecture and timings.
2. Freeze the course-level objectives and evidence expected.
3. Build the package using the official templates and Component Catalog.
4. Run the independent reviewer prompt in a separate AI conversation when possible.
5. Run `VALIDATE_COURSE.bat` or use **Courses → Import course package → Validate**.
6. Repair every error. Review warnings deliberately.
7. Preview the course in the Training Engine.
8. Import/publish the version transactionally.
9. Create or import a class tied to that exact version.
10. Assign trainer(s), import/enroll participants, create teams if required, and run Classroom Readiness.
11. Rehearse before delivery.

## Package layout
Recommended:

```text
MY_COURSE_v1.0.course.zip
├── manifest.json
├── course.json
├── modules/
│   ├── module_01.json
│   └── ...
└── assets/
    ├── handout.pdf
    ├── dataset.csv
    └── image.webp
```

`manifest.json` and `course.json` are required for ZIP packages. Modules may be inline in `course.json` or referenced using `{ "file": "modules/module_01.json" }`.

## Stable internal IDs
Use lowercase readable IDs, such as `research-source-check`. IDs are internal; never put them into learner-facing titles. Keep an ID stable while repairing the same course version.

## Course-level structure
A course should normally define:
- `id`, `version`, `title`
- optional subtitle/description/branding
- `language` and `direction`
- total `duration_minutes`
- stable objectives
- ordered modules

Course content language and interface language are independent.

## Modules
A module/milestone defines its human title, timing, objectives/evidence, activities and missions. The engine does not require every course to follow the same pedagogy; it requires only supported components.

## Activities
See `COMPONENT_CATALOG.md`. Use `content.blocks` for professional presentation layouts and the appropriate activity type for responses or classroom control.

A typical live sequence can be represented declaratively:
1. presentation scene
2. poll
3. result display
4. trainer cue
5. follow-up question
6. mission

The trainer remains in control of when items are opened, closed, revealed and finished.

## Objectives and evidence
Define stable objective IDs at course level. Activities and missions can list `objective_ids`. Submission/completion then records evidence against those objectives.

## Scoring
Scoring is optional. Examples:

```json
"score": { "participation": 2, "correct": 5 }
```

or for missions:

```json
"score": { "completion": 10 }
```

Course completion should not depend only on points unless that is explicitly part of the learning design.

## Achievements
An activity or mission may award:

```json
"achievement": { "key": "verify", "title": "Verify" }
```

A learner receives the same key at most once per class.

## Assets
Put safe static assets under `assets/` and reference them using `asset://assets/file.ext` or `assets/file.ext`. Every referenced package asset must exist. Package assets must use the safe types listed in the Component Catalog.

## Missions
Use `MISSION_TEMPLATE.json`. Missions can include prompts, external tool links and packaged resources. Submission types are `none`, `text`, `url`, `file`, or `image`.

## Trainer vs projector vs participant
Do not duplicate a course into three copies. One activity definition is rendered differently by the Core:
- `trainer.cue` is private to the trainer.
- participant controls appear only when the activity accepts participant input.
- projector receives clean presentation/results without administrative controls.

## Course versions
Imported versions are immutable authority for classes created against them. If content changes after publication, issue a new version (`1.1`, `1.2`, etc.). Historical class results remain bound to the version actually delivered.

## Classes and rosters
A Class is one delivery of a Course Version. Use `CLASS_TEMPLATE.json` or the dashboard. A class owns dates/times, lifecycle, assigned trainer(s), sessions, roster, teams, notes and results.

Use `STUDENT_ROSTER_TEMPLATE.csv` for bulk enrollment. The dashboard previews and validates the roster before import.

## Validation and transactional import
Validation checks structure, IDs, references, supported components, activity rules, flow targets, objective references and packaged assets. A failed import must not partially alter course data.

## AI-assisted authoring
The `/prompts` directory contains four professional prompts:
1. Course Architect
2. Course Package Builder
3. Independent Course Reviewer
4. Class Builder

Give the AI this Authoring Kit. Require it to use only the Component Catalog and to return import-ready files rather than custom application code.

## Acceptance rule
A course is Course-Authoring-Ready only when a clean Training Engine Core can validate, preview, import and deliver it without editing Core source code.

---

# v2.0 visual workflow authoring

Training Engine v2.0 uses one canonical course model for both `.course.zip` imports and the Visual Course Builder. A course imported from JSON can be edited visually by creating a Draft from a published version. A course created visually can be exported using the same model.

For each milestone/module:
1. Define objectives and duration.
2. Define trainer-led scenes and class interactions.
3. Define any class-level branches such as a winning vote deciding the demonstration path.
4. Define the `practice_start` point.
5. Define participant choices and independent `paths`.
6. Define every path step, completion requirement, submission, score, achievement and offline fallback.
7. Add convergence/closing nodes.
8. Validate every edge and referenced path/activity/mission.
9. Preview trainer, projector and participant routes before publishing.

Published course versions are immutable. To edit a published or imported version, create a new Draft derived from it, validate and preview, then publish as a new version.

Typography can be overridden per course only through `course.branding.typography` using safe font-family strings in the `ui`, `presentation`, `title`, and `body` slots with `ar` and/or `en` values. The engine supplies system fallbacks.
