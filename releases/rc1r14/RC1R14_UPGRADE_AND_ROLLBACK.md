# RC1R14 upgrade and rollback

Back up and stop the existing registered installation. Verify the new ZIP SHA-256, extract fully and replace application files while retaining configured data/storage/backups/exports and local configuration. Use Node 22.5+ and the existing launcher. Never enable TRAINING_ENGINE_TEST_ACCOUNTS on real data.

Additive journaled workspace migration one-workspace-0006 advances schema 5 to 6. It adds user_ui_preferences with user foreign-key ownership, validated appearance/color fields and activity-history query indexes. Existing users.preferred_language remains the language field. The verified pre-upgrade SQLite/storage backup, migration digest and transactional journal are retained and tested from populated legacy state. Core 3.2/course 2.0 and published courses stay compatible. No reset or published-version rewrite occurs.

Existing personal preference records are populated only by user actions; legacy anonymous browser defaults may initialize an unset choice, but authenticated changes never rewrite another account or the shared guest default. Account cache/pending values use per-account namespaces, tab-local identity and no persistent credential. Pending changes replay only under that account's authenticated session.

Finish ends the class for all participants without deleting history. It preserves partial learner/workflow data and drawings, closes open instances, cancels pending admissions with notification, stops further live writes and permits subsequent Trash. Hold/Break/Finish section remain separate. A deliberate authorized activation can reopen the class. Old Archive/Trash remain separate; permanent purge is still an administrator-confirmed destructive action.

Rollback application bytes with a verified prior package while retaining newer state. The additive table/indexes may remain; do not edit migration history or routinely replace new learner data with an old database. Older RC1R13 UI lacks these personal/finish/history controls. A full pre-upgrade backup recovery is a deliberate operation that can replace subsequent data; retain both sealed versions and backups and avoid simultaneous writers.
