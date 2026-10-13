# Backward compatibility and migration contract

## Non-negotiable preservation
Existing v2.1.1 courses/classes/users/history must continue to work after modernization. Preserve:
- course packages for supported schemas 1.0, 1.1, 2.0/current
- imported and UI-created courses
- immutable historical course versions
- classes/sessions/enrollments/teams
- participants/trainers/profiles/consents
- attendance
- answers/submissions/scores/achievements
- notifications/messages
- private trainer notes
- audit/history
- reports
- backups/restores

## Migration rules
- Never use database deletion/recreation as upgrade migration.
- Back up before migration.
- Maintain a schema/migration version.
- Migrations must be deterministic and idempotent where appropriate.
- Test upgrade from a populated v2.1.1 database.
- Verify record counts and representative relationships before/after.
- Test restart after migration.
- Provide rollback/recovery notes.

## Course schemas
Continue loading legacy packages unchanged. Internally adapt them into the canonical runtime model. Do not require old packages to be rewritten merely to run.
If a legacy course is edited, create a new Draft in the latest authoring schema while preserving the old immutable version.

## Regression fixtures
The exact baseline source, demo/working packages in the repository, and any owner-supplied real `.course.zip`/sanitized backups become mandatory regression fixtures. Never modify a fixture to make the new engine pass.
