# Staff experience and administration repair — RC1R17

Training Engine ONE 3.5.0-rc.1.17 preserves Core schema3.2, course schema2.0 and workspace schema8. This phase changes no SQLite migration or published course content. RC1R16 and previous packages remain immutable rollback references. Rollback always uses a matched application/database/storage backup.

## Course creation root cause

The Admin action dispatcher called `newCourse()` and `importCourse()` without defining or importing them. The class detail buttons also referenced missing `addClassSession()` and `adminImportRoster()` handlers. Clicking Create course therefore threw ReferenceError, caught by the workspace and displayed as a toast; API-only checks and uncaught-page-error monitoring could not catch this UI dispatch failure. A clean RC1R16 browser session reproduced exactly `newCourse is not defined` before edits.

The repaired handlers use real course/session/roster endpoints, keep server permission checks and validation, wait for confirmed writes and refresh the relevant view. New browser acceptance explicitly clicks all four actions, checks required input, imports an actual package/CSV and inspects persisted records. Inherited Builder/course/class/permissions/Guided suites remain mandatory. A separate static no-undefined-identifier audit covers top-level application browser modules; it is supplementary, not a substitute for browser execution.

## Messaging and calling

Message/file retry references use cryptographic getRandomValues, which is available on ordinary LAN pages, rather than assuming the secure-context-only randomUUID method. Browser suites explicitly remove randomUUID and still send text/files/voice. Media capture itself continues to require HTTPS or loopback.

All authorized staff surfaces show a distinct Messages icon beside Notifications, with the count of received, unread, non-removed messages. Participant/Projector surfaces do not initialize private staff tools. Personal read receipts, sound, accept-calls and desktop-notification preferences still apply; Admin policy and granular staff permissions remain server-enforced.

A private authenticated streaming channel sends only invalidation topics, never message text, attachments, record identities, SDP or credentials. Every event and heartbeat revalidates session and permissions. Bodies, counts and signals still come from authenticated, membership-scoped endpoints. Slow output is disconnected at64KiB; at most12 stream connections per account are accepted. The client reconnects with bounded backoff and fetches current state; fallback polling remains available. Header authentication avoids putting tokens in stream URLs. No chat event broadcasts a classroom refresh.

Where Web Locks and BroadcastChannel are available, staff tabs share one stream per account. This avoids exhausting HTTP/1 per-origin connections while several workspaces are open. The multi-page regression checks the single held stream lock and that dashboard APIs continue returning data. Unsupported browsers use separate authenticated streams and bounded fallback; close unused tabs if the browser's connection budget is reached.

Previously incoming calls were checked only on the Staff page every2.5s, and offers/answers/candidates waited for subsequent polling rounds. The shared controller now receives updates from all staff pages, fetches signaling immediately and polls active calls as a fallback. User media permission, device capture, HTTPS and ICE connectivity remain prerequisites; an invitation starts after the caller grants capture. No browser policy is bypassed. Real LAN/remote networks may require configured STUN/TURN; a server update cannot remove physical network delay.

Message cues span approximately2seconds. Incoming and outgoing ringing repeats until answer/decline/hangup/expiry. Only one tab rings for the same account/call where Web Locks are supported. Audio respects the personal sound preference and browser activation policy. Enable sound appears when an incoming call cannot yet sound; a staff interaction also activates audio. Unread indicators still update without audio permission. Full-page navigation ends a call; keep the call page open while navigating in a separate tab.

The chat layout has distinct conversation and reading panes, mobile Back to conversations, bounded searchable/paged conversation lists, readable received/sent bubbles, full attachment filenames/type/size, deliberate own-message removal and a stable voice player across refreshes. A distinct private removal hint refreshes bounded visible message identities, including older history beyond the most recent50; scrolling rechecks the messages now in view. This keeps confirmed removals current without downloading whole conversations. Video uses a large remote stage with local picture-in-picture, mute/camera controls and explicit call status; audio calls do not show empty video panels. Calls remain two-person WebRTC; no group conference, E2EE-at-rest or malware-scanning claim is added.

## Separate planning pages

Tasks (`/tasks`) and Calendar (`/calendar`) are separate pages, outside Chat. Historical Staff task/calendar bookmarks redirect. Both use the same authorized task records and details: title/description, assignee/creator, status, priority, local starts/due dates, recurrence, private notes and checklist. Ownership, priority, status and due-date filters run on the server; pages of10/25/50 rows and filtered calendar totals agree. Completion/reopen waits for a revision-checked write. Only the creator may reassign/remove; supervisor assignment still needs its grant. An administrator does not gain automatic access to unrelated private tasks.

Calendar provides day/week, weekday-aligned month and12-month year views with date navigation, Today, local-day counts, month/day drilldown and a matching paginated agenda. Browser timezone boundaries preserve the tested Beirut midnight case. The existing UTC recurrence rules are unchanged; fixed local wall-clock recurrence across daylight-saving changes is not newly promised. Export respects the current filters and calendar range and remains a VTODO ICS download.

## Appearance and design references

The operations hero uses the selected rich accent in light mode with white foreground, and its light counterpart in dark mode with dark foreground. Acceptance measures at least4.5:1 title contrast at both gradient endpoints for all six chosen colors; inherited theme/RTL/responsive checks remain required.

Professional design research used the official Vikunja frontend sources over verified HTTPS:

- https://raw.githubusercontent.com/go-vikunja/frontend/main/src/views/project/ProjectList.vue — searchable filters, visible task actions and list/empty states.
- https://raw.githubusercontent.com/go-vikunja/frontend/main/src/views/project/ProjectTable.vue — structured task properties and stable list controls.
- https://raw.githubusercontent.com/go-vikunja/frontend/main/src/views/project/ProjectGantt.vue — date-range navigation and reuse of task details across scheduling views.

Transferred interaction principles only; no third-party source or dependency is included. Asana/Microsoft/Google help hosts were denied by the environment's existing network policy. No TLS/signature check or egress restriction was bypassed, and unavailable sources are not represented as reviewed.

## Verification boundary

Run the full source suite and repeat it from the freshly extracted immutable application ZIP; inspect actual receipts under docs/verification/rc1r17 and releases/rc1r17. New checks cover the four repaired administration actions, private stream authorization/targeting/revocation/bounds, unread/read/removal semantics, global incoming calls, sound duration and ring cleanup, actual audio/video peers, concurrent tabs, filtered planning, all six colors, EN/AR and390/768/1440 widths. Retain the complete inherited Guided official Arabic/English route/evidence/offline suite, migrations/backups,36activities/68result cases, permissions, reports/PDF readers and170-account/five-class load test.

Automation can establish only the recorded test results. Owner Windows/LAN, real device media, classroom, visual and assistive-technology acceptance remain manual gates; no universal100%security or absence-of-errors guarantee is possible. Release status remains OWNER_ACCEPTANCE_CANDIDATE_NOT_FINAL until those gates are accepted.
