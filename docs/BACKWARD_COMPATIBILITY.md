# Backward Compatibility Contract

Training Engine v2.0 must preserve existing v1.2 capabilities and historical data.

## Required guarantees

- Existing v1.2 SQLite data migrates in place.
- Existing users, courses, classes, enrollments, responses, submissions, scores, achievements, notes and history are retained.
- Schema 1.0/1.1 course packages continue to validate/import/run unchanged.
- Delivered/published historical course versions remain immutable.
- New v2 features are additive wherever possible.
- An old package must not be edited merely to make a Core regression test pass.
- Backup/restore remains valid across the supported upgrade path.

## Editing old content

An old published version can continue to deliver as-is. If editing is required, create a new Draft derived from it and publish a new version after validation and Preview.


## v2.1
The Workflow Progress Tracker is additive. Existing schema 1.0/1.1 courses and existing schema 2.0 courses remain loadable and deliverable. Legacy direct activity controls are preserved; the stricter Next-only behavior applies to the new explicit v2.1 workflow-tracker controls.
