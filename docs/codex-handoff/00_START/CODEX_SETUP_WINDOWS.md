# Recommended Windows/Codex setup

1. Extract this handoff to a short local path, e.g. `C:\TrainingEngineCodex`.
2. The code to open in Codex is `workspace\training-engine`.
3. Keep the handoff docs available one level above; copy `AGENTS.md` and `.agent` into the repository root if they are not already there before the Codex run.
4. If Git is available, from the repository root:
   - `git init`
   - `git add .`
   - `git commit -m "baseline: Training Engine v2.1.1 FINAL"`
   - `git tag training-engine-v2.1.1-final`
   - `git switch -c codex-professional-core`
5. Run the existing self-tests before coding.
6. Open the local repository in the Codex desktop app, IDE integration, or run Codex CLI from the repository directory.
7. Paste `QUICK_START_PROMPT.txt` as the initial task.
8. Let Codex modify only the upgrade branch/worktree. Keep the baseline tag untouched.
9. Review the generated ExecPlan and implementation progress; prioritize workshop-blocking functionality over optional polish.
10. After a release candidate passes, test it yourself on Windows, mobile over LAN, and a projector before promoting FINAL.
