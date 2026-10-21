# RC1R14 operational review

Owner corrections supersede RC1R13's side rail and shared-browser UI preferences. Baseline 8f773a64300ec516860fa537051fb484997dd3e9; unchanged 65-command baseline passed before edits. Full earlier master-prompt scope remains included.

| Issue | Result | Verification |
|---|---|---|
| Delete says Finish, but no clear exit | Finish class in the live header and class list, distinct from Hold/Break/Finish section, works without completing workflow | four API live phases; real unfinished practice and break UI -> Finish -> Trash |
| Personal language changed for others | Each account owns server preferences and namespaced local pending/cache; guest defaults remain separate | two accounts/tabs on one origin, another device, actual account switching |
| Panel colors | Six accessible accent choices plus role default, independent of Light/Dark/System, never altering Projector/course branding | actual UI save/reload and 12 numeric palette contrast checks |
| Repeated sidebar destinations | Dedicated class page is full width, top workspace/profile access, no learning rail | EN/AR 390/768/1440 screenshots and actual navigation |
| Live label inside hero | Green compact glowing LIVE / مباشر above the hero, reduced-motion support | DOM position/locale/browser checks |
| Activity list limited and unfiltered | Complete SQL collection with 10/25/50 pages, counts, local inclusive dates, type and search filters | 135 own plus 87 other-user events, page disjointness, range/role/error checks; all-role browser visits |

Finish closes open/suspended activity instances, clears the live selection and marks the class completed, while preserving saved responses, partial runtime state, workflow progress and annotations. It does not manufacture completed learner tasks/certificates. Repeated finish is idempotent; stale revisions and late writes fail; legacy Projector controls cannot resume a finished/trashed class. Another running class is unaffected. Explicit activation remains the authorized reopen route.

My activity is caller-only for every role, including Course Editor. Staff audit remains separately scoped and retains Open class. Rows omit answer/profile payloads. Date/type/search filters operate before SQL COUNT/LIMIT/OFFSET. Older capped API response contracts remain compatible; current UI uses the full paged endpoints.
