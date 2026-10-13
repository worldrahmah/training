# v1.2 -> v2.0 Migration Evidence

The v2 upgrade path was established against the exact accepted v1.2 Core using a populated local database rather than only a fresh empty database.

Baseline fixture before upgrade:
- courses: 1
- classes: 1
- students: 8

After the v2 migration path:
- courses: 1
- classes: 1
- students: 8

The legacy administrator is promoted to the Super Admin authority and the historical Course/Class/Participant records remain readable. RC2 preserves the same additive migration model and reruns the complete v1.2 compatibility, restart and backup/restore regression suites against the upgraded code.

Result: `V12_TO_V20_MIGRATION_PASS`.
