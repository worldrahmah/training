# ExecPlan requirements

For substantial work, create/update `docs/CODEX_EXEC_PLAN.md` as a living plan.

It must include:
1. Baseline facts reproduced from the current repository.
2. Target architecture and why it is safer or more maintainable.
3. Milestones small enough to test independently.
4. Acceptance criteria and exact validation commands per milestone.
5. Database migration strategy and rollback/backup handling when schema changes.
6. Backward-compatibility strategy for course schemas 1.0/1.1/2.x and existing classes/data.
7. UI/UX test matrix across Arabic/English, light/dark, phone/tablet/desktop/projector.
8. Known risks and explicit non-goals.
9. Decision log for material architecture changes.
10. Final release checklist.

Stop and repair when a milestone validation fails; do not defer known failures to the end.
