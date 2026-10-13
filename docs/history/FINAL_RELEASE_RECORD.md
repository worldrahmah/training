# Training Engine Core v2.1.1 FINAL — Release Record

- Final version: `2.1.0`
- Release date: `2026-10-08`
- Baseline: owner-accepted `Training Engine Core v2.0 FINAL`
- Exact v2.0 baseline SHA-256: `449387c10b5b87e67b8c1c8f6bfd331b77dd0757af4ade9a532b3dd860914055`
- Upgrade model: additive, in-place, backward-compatible maintenance/minor release.
- Existing course schemas 1.0, 1.1 and 2.0 remain supported.
- No existing published course, class, participant history or delivery result is rewritten by the upgrade.

## v2.1 addition

Trainer Workflow Progress Tracker for schema 2.0 workflows:

- Done / Current / Next / Upcoming / Blocked / Skipped states.
- Participant-path nodes can also show Working based on live participant runtime state.
- Visual state uses both color and text/icon labels.
- Only the highlighted Next section is the normal actionable next step in the v2.1 Trainer UI.
- Deliberate Skip is confirmed, persisted and audited.
- Live position survives refresh and server restart.
- Branch selection can block non-selected immediate branches.
- Super Admin live observation exposes current/next workflow position.
- Legacy workflows remain usable through their previous activity controls for backward compatibility.

## Release status

`FINAL_FOR_COURSE_AUTHORING_AND_CONTROLLED_DELIVERY`


## v2.1.1 bounded repair
Legacy modules without explicit workflow trees now participate in the persisted Done / Current / Next / Upcoming tracker through an implicit linear workflow. Course source packages remain unchanged.
