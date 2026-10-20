# Upgrade and rollback — RC1R12

Use the verified complete RC1R12 application ZIP and SHA-256 manifest. Back up current database/storage through the existing application backup tool before upgrading. Stop the intended application instance, extract application bytes, preserve existing local configuration and all configured data/storage/backup/export directories, then use the supplied Windows or shell launcher (Node 22.5+; automation verified with 24.19.0). Normal startup uses existing secure bootstrap/account-upgrade policy; never enable disposable test accounts on owner state.

No new SQLite schema or destructive migration is introduced: Core schema 3.2 remains. New runtime state uses additive JSON fields and canonical submissions/responses. Published course versions remain immutable. To roll back, restore verified prior application bytes while preserving newly collected data. Restoring an older database over new responses is a separate deliberate recovery decision, not a routine rollback step. Keep the pre-upgrade backup and prior sealed package.

Check existing accounts/history, class start/end focus, admission, permissions, each paced mode, guided A/B resume, uploads, outbox reconnect/conflict, report/CSV, Projector, and recoverable deletion/restoration using a disposable class first. Read RC1R12_ACCEPTANCE.md for owner manual gates.
