# Training Engine ONE RC1R6 test package

This is the verified owner-acceptance candidate, not the final whole-platform release.
The ZIP is unchanged from the sealed artifact. Source commit: `dfa03217d8f917225564f1d03eef8ca17ee685df`.
GitHub distribution was added after sealing; the seal report records verification at that earlier point.

## Download and test on Windows

1. Open `TRAINING_ENGINE_ONE_PROFESSIONAL_REPAIR_v3.5.0_RC1R6.zip` above and click GitHub's **Download raw file** button. Download this ZIP, rather than the repository's source-code ZIP, for the sealed package and its complete evidence.
2. Right-click the downloaded ZIP and select **Extract All** into a separate writable folder, such as `C:\TrainingEngineONE-RC1R6`. Preserve your existing installation and data.
3. Install Node.js 24 LTS from https://nodejs.org/ if needed.
4. Double-click `START_TRAINING_ENGINE.bat` in the extracted application folder. Keep the Training Engine Server window running. Stop another Training Engine instance using port 3000 before starting this one.
5. Trainer and Projector open automatically. Admin is at `http://localhost:3000/admin` on your PC.
6. Fresh-install account: username `TRAINER`, password `TRAIN1234`. Change the default password before real use.

No npm dependency installation is required.

## Verify the exact download

SHA-256: `e47bf484a51a56ceb40299ec626547e994077e2469777943cf3d9100a3b3abc2`

In PowerShell, run from the download folder:

```powershell
Get-FileHash .\TRAINING_ENGINE_ONE_PROFESSIONAL_REPAIR_v3.5.0_RC1R6.zip -Algorithm SHA256
```

The companion seal report records the working-tree and freshly extracted exact-ZIP tests. Owner manual visual acceptance is pending. The application package includes the acceptance checklist and known limitations.
