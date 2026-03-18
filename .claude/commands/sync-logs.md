Sync all memory logs to reflect current project state.

1. Read the full git log since the last entry in `.claude/memory/iterations.md`:
   `git log --oneline --since="$(tail -5 .claude/memory/iterations.md | grep -oP '\d{4}-\d{2}-\d{2}' | tail -1)"`

2. For each commit not yet recorded in `iterations.md`, add an entry with:
   - Date
   - What changed (inferred from commit message and diff summary)
   - Which milestone it belongs to

3. Read `.claude/memory/roadmap.md` and mark any completed milestone tasks as done based on the git history.

4. If any open item in `requests.md` appears to have been addressed in recent commits, mark it as resolved with the PR reference.

5. Output a summary of what was synced.