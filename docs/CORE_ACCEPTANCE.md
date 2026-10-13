# Training Engine Core v2.1 FINAL — Acceptance Record

## Baseline protection

- Exact v2.0 FINAL baseline SHA-256 verified: `449387c10b5b87e67b8c1c8f6bfd331b77dd0757af4ade9a532b3dd860914055`.
- v2.0 FINAL is preserved unchanged as rollback/reference authority.
- v2.1 is derived as a separate release.

## Workflow Tracker acceptance

A schema 2.0 live workflow must:

1. show each workflow section/node in Trainer Live Control;
2. visibly distinguish Done, Current, Next, Upcoming, Blocked and Skipped;
3. use text/icon labels in addition to color;
4. make the intended Next section immediately obvious;
5. persist completed/current/skipped state in SQLite;
6. restore the same position after browser refresh/server restart;
7. prevent normal v2.1 workflow controls from jumping ahead;
8. require an explicit confirmed Skip action to bypass a highlighted section;
9. record workflow start/completion/skip events in history;
10. calculate branch state without changing unrelated participant paths;
11. expose current/next workflow position to Super Admin live monitoring;
12. retain legacy course/runtime compatibility.

## Full product regression

All automated suites in `docs/TEST_REPORT.md` pass on the exact release source.

Release status: **FINAL_FOR_COURSE_AUTHORING_AND_CONTROLLED_DELIVERY**.
