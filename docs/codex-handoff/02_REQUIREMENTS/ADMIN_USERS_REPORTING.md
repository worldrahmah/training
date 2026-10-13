# Administration, users, permissions, reporting and operations

## Super Admin
Distinct role/dashboard from Trainer. Global CRUD/view authority subject to safety controls over:
- courses and versions
- classes/sessions
- trainers/assistants
- participants/profiles
- enrollments/teams/attendance
- course content/assets
- permissions
- notifications/messages
- reports/analytics
- settings/typography/themes
- backups/restores
- audit/history
- live class observation

## Live operations
Dashboard lists all running classes. One click opens read-only live detail showing course/class/version, trainer(s), start time/duration, current milestone/node, next node, connected participants, confirmed attendance, absent/late, path/progress counts, need-help count, current participation/result state, and relevant health/readiness information.

## RBAC
Use role + action + scoped resource. Avoid technical permission strings in the UI. Super Admin grants readable permissions via professional controls. Trainers can CRUD only what they are authorized for. Class and participant management require explicit class/resource permissions. Course authoring may be granted per course/version.

## Participant profile
Immutable user ID/username. Required owner-approved fields: Arabic full name, English full name, mobile, email. Optional professional fields as described in master spec. Track profile completeness. Store communication/marketing/testimonial/media consents separately and audibly.

## Account operations
- sign out
- change password
- admin reset/generate password
- activate/deactivate
- printable or exportable login cards for classes if useful
- define policy for concurrent login/multiple devices to avoid duplicate state corruption

## Search/filter/bulk
Global search across people/courses/classes; filters by status/date/course/class/trainer; saved views where useful. Bulk enroll/deactivate/team/message/export/attendance operations with safe confirmation.

## Audit
Record meaningful administrative and course-authoring changes. Do not log every UI click.

## Reports
Professional Analytics Center with drill-down and export. Include at least:
- platform overview
- course and version performance
- class/cohort comparison
- trainer delivery analytics
- individual participant report/timeline
- attendance
- module/objective mastery
- activities/quizzes/missions
- participant branch/path selection
- completion/abandonment/time-on-step
- Help Queue hotspots and wait time
- engagement and submissions
- version impact comparison
- course health signals (steps with high help requests, slow completion, drop-off)

Reports use clear KPIs, charts, tables, filters, and detail views. Export CSV/Excel-friendly data and print/PDF-ready views where practical.
