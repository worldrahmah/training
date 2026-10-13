# Training Engine ONE Stage 1C Brainstorm / Ideas Board v3.4.0 RC3 — Upgrade & Developer Guide

## Upgrade principles

1. Never edit an accepted production database in place without a verified backup.
2. Stop the old Engine cleanly.
3. Create and verify a backup; retain an external copy for important deployments.
4. Replace application source while preserving the configured data/storage paths.
5. Start ONE. Database migrations are additive/idempotent and are executed by the Engine.
6. Confirm `/api/health`, sign in, run classroom readiness and inspect a representative old course/class/report.
7. Run the packaged automated suite against a copy before production use when changing code.

The automated acceptance includes a populated v2.1.1 → ONE migration rehearsal. Published courses, classes, users, history, submissions, reports and supported package schemas are compatibility requirements.

## Architecture rules

- Local-first Node.js + SQLite/WAL remains canonical.
- One canonical course model drives Builder, imports, Live, Student and Projector.
- Published course versions are immutable.
- Role surfaces remain separated. Do not put Admin work into Live Classroom or Trainer controls onto the Projector.
- Any explicit workflow must be a complete executable graph, not an ordered node list.
- Every state-changing API must fail truthfully and must not visually fake success.
- Concurrency-sensitive course/live mutations use revision checks.
- New UI strings require Arabic translations and must pass `tests/i18n.mjs`.
- New responsive UI must pass existing structural responsive tests and the manual browser matrix before FINAL.

## Schema extension rules

Prefer additive migrations and preserve all old columns/tables unless a separately approved data migration proves removal safe. Update `CORE_SCHEMA_VERSION`, migration tests, backup/restore tests, capability contract and external authoring handoff together.

## Adding a runtime component

A new course activity/block/result/workflow type is incomplete until all of the following agree: validator, Builder/catalog, runtime renderer, Projector where relevant, Participant where relevant, tests, capability contract and external authoring handoff.

## Security rules

Do not expose Projector control authority in a reusable global URL. Use class-scoped pairing. Never store backup passphrases. Preserve failed-login throttling, token rotation, session expiry/device policies and audit events.

## Release process

- exact source commit
- syntax checks
- full `npm test`
- populated migration test
- backup create/verify/restore tests
- realistic 20-participant rehearsal
- regenerate capabilities/authoring handoff
- package from the exact tested commit
- verify package CRC/path safety and every checksum
- execute manual browser EN/AR viewport matrix
- only then promote RC to FINAL
