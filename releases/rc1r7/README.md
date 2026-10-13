# Training Engine ONE RC1R7 testing package

A substantial interface and operational upgrade, offered for owner acceptance. This is not the completed whole-platform enterprise/School FINAL.

[See the actual new screens](VISUAL_REVIEW.md). Source commit: `6c998bb187fa24492daecaee6229649ba621aff3`.

## Download and run on your PC

1. Open [the full application ZIP](TRAINING_ENGINE_ONE_PROFESSIONAL_EXPERIENCE_v3.5.0_RC1R7.zip), then click GitHub **Download raw file**. Download this sealed ZIP rather than the repository source-code ZIP.
2. Extract All into a separate writable folder such as `C:\TrainingEngineONE-RC1R7`. Keep your current installation and data.
3. Install Node.js 24 LTS from https://nodejs.org/ if needed. The app has no npm runtime dependencies.
4. Stop the previous ONE instance, then double-click `START_TRAINING_ENGINE.bat`. Keep its server window running. Trainer and Projector open automatically.
5. On that PC, administration is at `http://localhost:3000/admin`. Fresh-install account: `TRAINER` / `TRAIN1234`; it is the bootstrap **super administrator**. An ordinary trainer has a separate restricted role. Secure default/demo accounts before organizational use.
6. Use `STOP_TRAINING_ENGINE.bat` to gracefully stop this registered ONE instance.

For an existing installation, verify a backup first. Preserve your configured database, storage, backups and exports. Follow `docs/RC1R7_DATA_AND_RECOVERY_IMPACT.md` inside the ZIP; do not replace your data with a demo database. No new database schema is introduced.

## Verify the download

Exact SHA-256: `06440367a2fca0ff2808134523ff8df415117d8f896be320a0a3a8b6e195773a`

```powershell
Get-FileHash .\TRAINING_ENGINE_ONE_PROFESSIONAL_EXPERIENCE_v3.5.0_RC1R7.zip -Algorithm SHA256
```

The companion seal report records working-tree and fresh exact-ZIP verification. The package includes the feature-review ledger, current guide, data/recovery impact, known limitations and owner acceptance checklist. Windows/browser, room projector and real-classroom manual acceptance remain pending.
