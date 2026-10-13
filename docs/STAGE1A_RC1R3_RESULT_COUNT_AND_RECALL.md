# Stage 1A RC1R3 — Projector Result Counts and Non-Destructive Recall

## Owner-reproduced acceptance gaps

During manual Stage 1A acceptance, the owner confirmed the Word Cloud and paired Projector were working, then identified two professional facilitation gaps:

1. Word Cloud results on the Projector did not show how many visible entries or participants produced the cloud.
2. Once a revealed activity/section was finished, its results could not be shown again later if the class wanted to revisit them.

These are treated as Stage 1A acceptance gaps rather than deferred cosmetic requests.

## Repair

RC1R3 adds:

- Projector result metadata for Word Cloud: **visible approved entries + responding participants**.
- A Trainer Live Classroom **Results history** control listing previously revealed activity instances.
- **Show on Projector** for a historical result.
- **Return to current class** to leave historical-result display.
- Result recall is projector-only: it does not reopen the activity, accept new responses, rewind Course Flow, change workflow completion, or replace the current participant activity.
- A historical result can be recalled even while a newer activity is active; participant devices remain on the current activity.
- Only results that were previously revealed are eligible for recall.
- Recalled Projector payloads use audience-sanitized result data and do not expose trainer-only response identity/moderation data.
- `Return to course` from Projector Screen Modes also clears a recalled result and returns to the current live class state.

## Automated regression gate

`tests/result-recall.mjs` proves:

- a Word Cloud with two participants and four approved entries is reported as 4 entries / 2 participants;
- finished/revealed results remain queryable after the live section is cleared;
- recall does not change `waiting` or current activity phase;
- participant payloads do not receive historical recall data;
- recalled Projector results are audience-sanitized;
- recall can coexist with a newer current activity without rewinding it;
- Return to current/Return to course clears recall;
- Projector and Live Classroom source contain the required count/recall UI bindings.

The full inherited ONE `npm test` suite must also pass on exact sealed bytes.

## Manual acceptance still required

Owner/browser acceptance must confirm:

1. Revealed Word Cloud Projector view visibly shows **N entries · N participants**.
2. Finish that section and advance to another section.
3. Open **Results history** in Live Classroom.
4. Select the finished Word Cloud and choose **Show on Projector**.
5. Confirm the Projector shows the previous result while Course Flow/current participant activity remains unchanged.
6. Choose **Return to current class** and confirm the Projector resumes the current live state.
7. Repeat once in Arabic and in Dark / Light / High Contrast Projector themes.

RC1R3 remains **NOT FINAL** until this manual gate and the remaining Stage 1A visual acceptance pass.
