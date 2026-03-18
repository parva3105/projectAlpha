Read the following files and produce a standup summary:
- `.claude/memory/memory.md`
- `.claude/memory/roadmap.md` (last milestone entry)
- `.claude/memory/iterations.md` (last 5 entries)
- `.claude/memory/requests.md` (top 3 open items)

Output exactly this format:

**Last session**: [1 sentence — what was last completed]
**Active milestone**: [milestone name and number]
**Milestone progress**: [X of Y tasks complete]
**Up next**: [next 2 tasks from roadmap]
**Blockers**: [any blockers noted in logs, or "None"]
**Top requests**: [top 3 open items from requests.md]

Do not output anything else. Keep it scannable.