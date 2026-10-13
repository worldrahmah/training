# Training Engine ONE — User Guide

## 1. First start
1. Extract ONE into a writable folder.
2. Install Node.js 22.5+ (Node.js 24 LTS recommended).
3. Start with `START_TRAINING_ENGINE.bat` on Windows or `./START_TRAINING_ENGINE.sh` on Linux/WSL.
4. Sign in to `/admin` using the initial Super Admin account.
5. Change the default password before using real participant data.
6. Review System Settings, security/session policy, backup policy and branding.

## 2. Administration
Use **Super Admin** for global platform work:
- create/manage staff;
- assign staff roles and scoped permissions;
- create/manage participants;
- search across supported records;
- save frequently used views;
- manage courses and immutable versions;
- create/manage classes;
- review platform/class/course analytics;
- verify backups and restore when needed;
- inspect audit/operations history.

Use bulk operations only after reviewing the selected records. Bulk actions are deliberately bounded and audited.

## 3. Creating a course
There are two supported paths:

### Visual Builder
1. Open Course Builder.
2. Create/open a Draft.
3. Build milestones/modules, activities, missions, participant paths and workflow.
4. Use reusable templates for common patterns.
5. Add assets using the Asset Library rather than inventing unsafe paths.
6. Use Undo/Redo while editing.
7. Review automatic readiness state.
8. Run Workflow Simulator.
9. Preview as Trainer, Projector and Participant.
10. Resolve every validation blocker.
11. Publish only when ready.

### External ChatGPT authoring
Use the included `course-authoring-handoff` package. That package contains the exact ONE capability contract, schema/validation rules, templates, examples and prompts. It is designed so a separate ChatGPT conversation can build one milestone/module at a time without guessing what the Core supports.

## 4. Creating a class
From Trainer/Admin class setup:
1. Select the exact Course Version.
2. Name the class.
3. Configure dates/times/location/timezone/capacity.
4. Select the lead Trainer and assistants.
5. Choose join policy.
6. Enroll existing participants and/or prepare self-enrollment by class code.
7. Create initial sessions.
8. Configure teams if needed.
9. Save.
10. Run Classroom Readiness before delivery.

A class may be active at the same time as other classes. Live state is class-scoped.

## 5. Participant enrollment
Participants can be enrolled by staff or, where a class permits it, self-enroll using its short class code.

Before delivery verify:
- roster;
- participant accounts;
- team membership;
- attendance session;
- required assets;
- course validation;
- projector pairing;
- classroom network URL.

## 6. Running a live class
From the Trainer workspace choose **Enter Live Classroom** for the desired class.

The Live Classroom is intentionally separate from the main dashboard.

### Course Flow
Course Flow is grouped hierarchically by milestone/module. Completed groups may collapse. The current and next actionable groups expand automatically. Use **Jump to Current** or **Jump to Next** instead of scrolling through the whole course.

Status meanings:
- **Done** — completed;
- **Current** — active now;
- **Next** — next permitted action;
- **Upcoming** — later;
- **Blocked** — cannot be entered yet;
- **Skipped** — deliberately skipped and audited.

### Live controls
Depending on activity/state, the Trainer can:
- open/start the next node;
- Previous / Next presenter content;
- Hold;
- start a Break screen;
- close response collection;
- reveal results;
- finish practice/section;
- pair/open Projector;
- review Help Queue;
- review submissions;
- use a random participant/team picker.

### Timing
The Live console shows elapsed live time and planned remaining time. Treat timing as operational guidance; the authoritative workflow remains the course graph.

## 7. Projector
Use the **Projector** action from the class's Live Classroom. ONE creates a class-scoped expiring pairing token and opens a presentation-only window.

Do not distribute the Projector pairing URL as a participant link.

## 8. Participant experience
Participants use `/student` to:
- join an eligible class by code;
- see upcoming sessions;
- follow the current live activity;
- complete personal paths and resume after refresh/restart;
- request help;
- upload/submit supported work;
- view reviewed feedback;
- manage profile/consents;
- read notifications.

## 9. Submission review
Trainer review supports review status, feedback, optional score/max score and rubric JSON data where used. Participants see reviewed feedback in their learning area.

## 10. Attendance
Attendance supports:
- Present;
- Late;
- Absent;
- Excused;
- Left Early.

Notes can be stored with attendance.

## 11. Reports and course improvement
Use reports not only for completion but to improve the course. ONE exposes surfaces for:
- participation/completion;
- activity timing;
- abandonment points;
- Help Queue waiting;
- path funnels;
- course-health hotspots;
- version impact.

## 12. Backups
Create a backup before major upgrades or restoration work. Use **Verify Backup** before trusting a backup. ONE records database checksum/integrity information and can make a safety backup before restore according to policy.

## 13. Sessions and security
Administrators can configure password length, login failure limits, login block duration, session idle expiry and maximum concurrent sessions. Temporary-password accounts must change password before normal application access.

## 14. Arabic and English
Interface language is per browser/user experience. Arabic switches the UI to RTL. Course content language is defined by the course and may differ from the interface language.

## 15. Operational rule
Never edit SQLite directly during normal use. Use the application, supported imports, backups and documented upgrade process.
