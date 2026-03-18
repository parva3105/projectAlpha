A new feature has been requested. Follow this sequence:

1. Read `.claude/memory/roadmap.md` to confirm this feature belongs to the active milestone. If it doesn't, add it to `.claude/memory/requests.md` as a backlog item and stop.

2. Read `.claude/memory/decisions.md` to surface any prior decisions that affect this feature.

3. Break the feature into tasks, assign each to the correct specialist agent:
   - Schema change? → database agent first
   - API route? → backend agent
   - UI / page? → frontend agent
   - Infra / env var? → devops agent

4. Confirm the task order accounts for dependencies (schema before API, API before UI).

5. Output a task list with assigned agent for each item before beginning any work.

6. After all tasks are complete, run `/ship` to open a PR.