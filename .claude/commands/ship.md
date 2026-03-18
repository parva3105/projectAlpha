Prepare and open a pull request for the current branch.

Steps:
1. Run `npm run typecheck` — fix any type errors before continuing.
2. Run `npm run lint` — fix any lint errors.
3. Run `npm run test` — confirm tests pass. If they don't, fix them first.
4. Run `npm run build` — confirm no build errors.
5. Stage all changes: `git add -A`
6. Write a commit message following Conventional Commits: `feat(M#): short description`
   - Include the milestone number (M1–M8) in the scope
7. Push the branch: `git push origin HEAD`
8. Open a PR on GitHub with:
   - **Title**: same as commit message
   - **Body**:
     - What changed (bulleted list)
     - Why (reference to roadmap milestone or requests.md item)
     - How to test (exact steps)
     - Any env vars added or changed
   - **Labels**: milestone label (m1 through m8), and type label (feat / fix / chore)
9. Append the PR URL and a one-line summary to `.claude/memory/iterations.md`.
10. If any new decisions were made during implementation, append them to `.claude/memory/decisions.md`.