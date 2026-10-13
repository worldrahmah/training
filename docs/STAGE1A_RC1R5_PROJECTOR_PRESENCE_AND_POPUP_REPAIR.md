# Stage 1A RC1R5 — Projector Presence Lifecycle + Popup Repair

## Owner-reproduced defects

During Stage 1A manual acceptance on RC1R4:

1. Closing the Projector could leave Trainer Live showing `1 PROJECTOR` because the server considered a heartbeat fresh for 120 seconds.
2. Clicking Projector could show a red clipboard-permission error even though the Projector window opened. The cause was `window.open(..., 'noopener')` returning a null handle in the browser; Live incorrectly treated that as a blocked popup and attempted `navigator.clipboard.writeText(...)`.

## Repair

- Projector opening now reserves the presentation window directly from the trainer click using `about:blank`, then pairs asynchronously, severs `opener`, and navigates the reserved window to the paired URL.
- No clipboard write is attempted by the Projector-open path. If the popup is actually blocked, Trainer receives a truthful instruction to allow pop-ups and retry.
- A paired Projector sends a best-effort `pagehide` disconnect signal on normal close/navigation. The disconnect clears `last_seen` without revoking the pair, so refreshing the same Projector URL reconnects normally.
- Server-side stale-heartbeat fallback is reduced from 120 seconds to 40 seconds. Since a live Projector refreshes every 15 seconds, this still tolerates transient missed refreshes while making crashes/network loss visibly clear much sooner.
- Trainer Live continues polling health every 3 seconds, so a normal close should move `1 PROJECTOR` to `0 PROJECTOR` within a few seconds without a Trainer reload.

## Regression gate

`tests/projector-presence.mjs` requires:

- no clipboard fallback in the Projector open flow;
- truthful blocked-popup handling;
- normal close/disconnect immediately removes Projector presence;
- the same paired URL can reconnect after reload;
- the 40-second abrupt-loss fallback remains bounded.

Expected marker: `PROJECTOR_PRESENCE_LIFECYCLE_PASS`.

## Manual acceptance

1. Trainer starts at `0 PROJECTOR`.
2. Click Projector: a presentation window opens with no clipboard permission alert.
3. Trainer automatically becomes `1 PROJECTOR`.
4. Close the Projector window. Do not reload Trainer. Within a few seconds Trainer must return to `0 PROJECTOR`.
5. Reopen Projector and confirm the count returns to `1`.

RC1R5 remains **NOT FINAL** until the owner confirms these behaviors and the remaining Stage 1A browser/visual acceptance is complete.
