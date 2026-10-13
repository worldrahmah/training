# Training Engine ONE — Stage 1A Word Cloud Engineering Checkpoint

Release candidate: `TRAINING_ENGINE_ONE_STAGE1A_WORD_CLOUD_v3.4.0_RC1R5`
Status: **ENGINEERING CHECKPOINT — NOT FINAL**

## Accepted foundation
Stage 0 (`v3.4.0 RC0`) is the owner-accepted foundation. Its canonical activity/component registry and shared Projector renderer/theme model are preserved.

## Stage 1A scope implemented
Word Cloud is implemented as the first complete new interaction through the canonical registry rather than as a standalone UI feature.

- Canonical registry contract: `word_cloud` activity, `word_list` response model, `word_cloud` aggregation/result.
- Synchronized schemas, machine capability contract and Builder menus.
- Builder controls: question, maximum entries, entry length, phrase policy, pre-moderation and trainer/anonymous identity mode.
- Strict package validation for Word Cloud configuration.
- Participant response surface with bounded multi-entry input and safe retry submission identifier.
- Unicode/Arabic-aware local normalization, punctuation trimming and duplicate normalization.
- Server-authoritative moderation with pending/approved/rejected states.
- Retry replacement preserves moderation state for unchanged normalized terms.
- Audience privacy: unrevealed words and moderation metadata never enter participant/projector live payloads.
- Anonymous-to-trainer mode removes identity from live moderation and redacts word content from participant-level trainer reports/CSV while preserving aggregate results and submission fact/count.
- Shared result renderer provides responsive Word Cloud output for Trainer, Participant results and Projector.
- Persistence uses the existing response envelope, so no destructive D1/SQLite migration is introduced.
- Restart and backup/restore preserve responses, moderation and aggregate result state.
- English/Arabic labels and responsive/mobile styles are included.

## Facilitation boundary
Stage 1A retains the existing ONE activity lifecycle: **open/collect → close → reveal**. Trainers can see the live aggregate and moderation queue while collection is open, while participants/projector remain hidden until reveal. The broader flexible result-view and explicit Hide → Reveal → Explain facilitation expansion remains the approved later facilitation stage and is not falsely claimed here.

## Automated acceptance
Required dedicated tokens:

- `CONTRACT_SYNC_PASS`
- `CANONICAL_CONTRACT_REGISTRY_PASS`
- `WORD_CLOUD_STAGE1A_PASS`
- `WORD_CLOUD_RUNTIME_PASS`

The full inherited ONE regression suite must also pass on both the working tree and the exact sealed release bytes.

## Remaining release gate
Manual owner/browser acceptance of the Word Cloud Builder, Participant, Trainer moderation and Projector/result presentation remains required. This checkpoint must not be called FINAL until that gate passes.

## Next authorized stage after acceptance
Moderated/upvoted Q&A is the next Interaction Pack vertical slice.
