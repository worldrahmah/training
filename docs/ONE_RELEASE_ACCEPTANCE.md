# Training Engine ONE — Release Acceptance Contract

## Automated release gate
The exact release bytes must pass `npm test` with no skipped mandatory test.

Expected named gates include:
- I18N_AR_EN_PASS
- RESPONSIVE_UI_PASS
- ROLE_SURFACES_PASS
- COURSE_FLOW_UI_PASS
- WORKFLOW_VALIDATION_PASS
- SMOKE_TEST_PASS
- CORE_V12_PASS
- RESTART_PERSISTENCE_PASS
- BACKUP_RESTORE_PASS
- CORE_V20_PASS
- WORKFLOW_PROGRESS_PASS
- WORKFLOW_RESTART_PASS
- LEGACY_WORKFLOW_TRACKER_PASS
- TRAINING_ENGINE_ONE_CORE_PASS
- V211_TO_ONE_POPULATED_MIGRATION_PASS

## Browser/manual release gate
On a normal local machine, verify at minimum:

### Viewports
- 320x568
- 375x667
- 430x932
- 768x1024
- 1024x768
- 1366x768
- 1600x900 or larger
- 1920x1080 Projector

### Languages/direction
- English LTR
- Arabic RTL

### Required surfaces
- Super Admin
- Trainer
- dedicated Live Classroom
- Participant
- Course Builder
- Projector

### Manual scenarios
1. Admin sign-in and navigation.
2. Create Trainer and Participant.
3. Create/import a course Draft.
4. Builder edit → autosave → undo/redo → validate → simulate → preview → publish.
5. Create class through full wizard with staff, participants, sessions and teams.
6. Self-enroll a participant by class code.
7. Activate two classes simultaneously and verify isolation.
8. Enter dedicated Live Classroom and verify unrelated dashboard workspaces are absent.
9. Drive Course Flow through Done/Current/Next states.
10. Exercise participant response and personal path/resume.
11. Request/resolve Help.
12. Submit/review trainer feedback.
13. Pair Projector and verify class isolation + presentation-only UI.
14. Attendance including Left Early + note.
15. Reports/analytics.
16. Backup create → verify → restore rehearsal on a disposable copy.
17. Session/device limit and temporary-password flow.
18. Arabic RTL on Admin, Trainer, Live, Student, Builder and Projector.
19. Confirm no page-level horizontal overflow at required widths.
20. Restart application and verify live/progress/history persistence.

## Promotion rule
Do not call a release FINAL if any mandatory automated or manual/browser gate is incomplete. A release candidate may be sealed with the outstanding gate documented exactly.
