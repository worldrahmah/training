# RC1R7 data and recovery impact

## Schema and existing data

No database table, column, index or course-schema version is added or removed. Existing courses, versions, classes, users, participant responses, history, assets, reports and backups remain supported. Published definitions/IDs are not rewritten. Runtime permission/capability fields are derived, not a new stored role model. New validation applies to new writes; it does not delete historical records.

The pre-change ER/entity/index review is retained as `DATABASE_ARCHITECTURE_REVIEW_BASELINE.md`. That document's row counts and findings describe RC1R5, not a newly invented production database. Current changes address staff/course authorization and restore recovery; the SQLite synchronous/local-first architecture and unjournaled historical schema-migration routines remain.

## Write impact

Staff provisioning/updates and multi-record class creation use SQLite transactions. Rejected authorization, invalid roles/grants and invalid class setup make no partial accepted changes. Protected role changes revoke sessions; users/history remain. Bulk and other existing workflows retain their regression gates. This does not claim every legacy mutation has undergone a full independent transaction audit.

## Restore protocol

`app/lib/restore.mjs` records version-1 `restore-journal.json` in the configured data directory. Database replacement/previous files live beside the database; staged/previous asset directories live beside storage. Sibling placement avoids cross-volume renames. Paths are computed from configured roots and a validated random identifier; the journal cannot supply arbitrary filesystem paths.

1. Verify the backup manifest/integrity and create the configured safety backup.
2. Copy replacement database/assets to staging; persist **prepared**.
3. Close the current SQLite connection; persist **swapping** before renames.
4. Retain the previous database/storage while installing replacements.
5. Open the replacement with the current runtime, run SQLite integrity verification, retire restored sessions and record the restore event.
6. Persist **committed**, then clean previous/staged files and the journal. A cleanup failure retains the committed journal for startup cleanup; it must not roll back only one already accepted resource.

On a failed uncommitted swap, restore both previous resources. On startup, recover a pending uncommitted journal **before** opening/seeding SQLite. A committed journal only finishes cleanup. Unsupported/malformed journals stop startup to preserve data. Do not delete a pending journal or manually edit the database as an upgrade method.

## Verification and practical boundaries

`tests/restore-recovery.mjs` exercises nine filesystem-state scenarios, including interrupted rename boundaries, rollback, accepted cleanup and malformed-journal rejection. Existing API backup/restore, restart and populated historical-data migration suites exercise real databases. These checks demonstrate process-interruption recovery and semantic restore behavior; they do not prove every OS/storage/power-loss behavior or provide multi-file transactional hardware durability. Windows/firewall/storage-device acceptance remains required.

Staging and rollback temporarily require space for another database and storage copy, in addition to any safety backup. Backups should also be retained outside the working installation for important deployments. If recovery itself cannot complete, the server reports pending recovery rather than successful restore; resolve disk/access faults and restart the current release. Use the supplied backup workflow and support evidence, not ad hoc database edits.

Rollback to RC1R6 is schema-compatible after a clean stop and completed recovery. Older code lacks this journal protocol and the corrected authorization, queue and preview behavior. Browser queue metadata is additive to the existing local queue key; legacy unowned entries are retained for explicit review.

## Local lifecycle control
The running process registers an ephemeral `server-control.json` in its configured data directory. It is excluded from the release/backup package; its nonce is never part of a course or displayed in health/log output. The Stop CLI reads that local record and calls the loopback-only instance endpoint; it never issues a port/PID kill. Graceful shutdown closes the database and retires its own record. An unrelated listener or stale/missing record produces failure rather than a false stop message. OS access to the data directory remains part of deployment hardening.
