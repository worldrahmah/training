# Stage 1A RC1R4 — Trainer Live Projector Health Auto-Refresh

## Owner-reproduced defect
On RC1R3 the paired Projector heartbeat was valid and the server health endpoint correctly reported the connected Projector, but the Trainer Live header could remain at `0 PROJECTOR` until the Trainer page was manually refreshed.

## Root cause
The Trainer console refreshed classroom health only when the full Live context refreshed or an SSE event arrived. Projector heartbeat reads update `projector_pairs.last_seen` but intentionally do not broadcast a classroom-state event, so the Trainer DOM could retain the old count.

## Repair
- Poll the lightweight class health endpoint every 3 seconds while the Trainer Live tab is visible.
- Update the Projector count in-place without reloading or rewinding Live Classroom state.
- Refresh immediately when the Trainer window regains focus or becomes visible.
- After opening a paired Projector, perform quick health refreshes after 0.8s and 2.2s to cover normal Projector startup latency.
- Preserve the server-authoritative Projector heartbeat and expiration model from RC1R2.

## Regression gate
`tests/live-health-refresh.mjs` verifies the live health polling, in-place Projector metric target/update, focus/visibility refreshes, and pairing startup refreshes. The existing ONE core runtime test remains responsible for verifying the server-side class-scoped pairing + heartbeat count.

## Manual acceptance
Open Trainer Live, note `0 PROJECTOR`, then click Projector. Without reloading Trainer, the count must become `1 PROJECTOR` within a few seconds after the Projector loads. Closing/staling the Projector must eventually return the health count to zero according to the server heartbeat timeout, again without a Trainer page reload.

RC1R4 remains **NOT FINAL** until the owner confirms this behavior and the remaining Stage 1A visual/browser acceptance is complete.
