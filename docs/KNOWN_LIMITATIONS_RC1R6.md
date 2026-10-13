# RC1R6 known limitations and scope boundaries

This is a baseline repair and owner-acceptance candidate, not the completed platform FINAL.

- Real-browser automated repair checks cover six role surfaces, two locales, three viewport sizes and representative interactions. They do not certify every activity, every setting variant, every dialog, screen reader, operating system or classroom hardware configuration. The inherited 36/68 certification remains defined automated evidence, not exhaustive visual proof.
- Windows launch/firewall/shutdown and room-scale Projector readability require owner hardware acceptance. This cloud verification uses Linux, Node v24.19.0 and Chromium.
- Existing bootstrap/demo-account provisioning remains. Secure or disable built-in accounts before organizational deployment. MFA/SSO and production first-run provisioning are separate upcoming work.
- Existing database migrations remain startup routines without a full ordered execution journal, and restore does not yet provide crash-safe atomic rollback. RC1R6 introduces no schema migration. Follow verified backup and separate-release-directory upgrade instructions.
- The app remains synchronous Node/SQLite; the existing 20-participant API rehearsal passes. Larger sustained classroom/network-fault/load targets are not certified here.
- This stage improves affected UI and interaction states. Whole-platform design-system consolidation, deeper activity-specific previews, comprehensive accessibility and first-run guidance remain on the roadmap. No external world-ranking or education certification is claimed.
- Historical authoring v1.3 is retained only as historical evidence. The current in-tree contract is synchronized; the required final external AI Course Creator package is generated after final Core freeze.
- School age/jurisdiction, academic scope, guardian privacy and multi-organization architecture remain owner decisions. No school-domain schema was invented in this candidate.
- Live Participant input preservation covers common selections/text and matching/fill/sorting inputs; complex drawing/media/offline-reconnect recovery still requires broader browser acceptance. Existing offline queue and idempotency gates remain regression requirements.
- ZIP64/encrypted/multidisk imports are deliberately unsupported; published entry/expanded limits reject unusually large archives. Valid supported legacy sample packages remain tested.
- Source commits were created locally; no GitHub push, cloud publication or fresh-task restoration is claimed. The sealed ZIP is the portable owner-review artifact.
