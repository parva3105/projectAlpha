---
name: pr-writer
description: ALWAYS use this skill when creating or updating pull requests. Never create or edit a PR without reading this first. Covers title format, description structure, milestone labels, env var requirements, and the pre-PR checklist.
---

# PR writer — Brand Deal Manager

**Requires**: GitHub CLI (`gh`) authenticated and available.

---

## Step 1 — Pre-PR checklist (run every time, in order)

```bash
# 1. Check for uncommitted changes
git status --porcelain

# 2. Type check — must pass with zero errors
npm run typecheck

# 3. Lint — must pass clean
npm run lint

# 4. Tests — must pass
npm run test

# 5. Build — must succeed
npm run build
```

Do not proceed to Step 2 if any of the above fail. Fix the issue first.

---

## Step 2 — Understand what's in the PR

```bash
# Detect default branch
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'

# See all commits that will be in the PR
git log main..HEAD --oneline

# See the full diff
git diff main...HEAD
```

Read the diff. Understand the full scope before writing anything.

---

## Step 3 — Write the PR description

Use this exact structure:

```markdown
## What
<What changed — bulleted list of the concrete things that were added, modified, or removed>

## Why
<Why these changes were made — link to the milestone task or requests.md item this addresses>

## How to test
<Exact steps a reviewer can follow to verify the change works>
1. Sign in as [role]
2. Navigate to [route]
3. Do [action]
4. Expect [outcome]

## Env vars
<List any new or changed environment variables. Write "None" if nothing changed.>
| Variable | Where to get it | Required in |
|---|---|---|
| VAR_NAME | Service dashboard → section | Production + Preview |

## Notes
<Anything that needs careful review, known limitations, or follow-up items. Omit section if nothing to add.>
```

**Do not include:**
- Checkbox test plans
- Summaries that just restate the diff
- Filler like "This PR implements..."

---

## Step 4 — Create the PR

```bash
gh pr create \
  --draft \
  --title "<type>(<milestone>): <short description>" \
  --label "<milestone-label>" \
  --label "<type-label>" \
  --body "$(cat <<'EOF'
<paste description body here>
EOF
)"
```

---

## Title format (non-negotiable)

Pattern: `type(scope): short description in sentence case`

**Type prefixes:**
| Prefix | When to use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `chore` | Setup, config, deps, scaffolding |
| `refactor` | Code change with no behavior change |
| `test` | Adding or fixing tests only |
| `docs` | Documentation only |

**Scope** is always the milestone number: `M1` through `M8`.

**Examples:**
```
feat(M1): add Clerk role-based redirects in proxy.ts
feat(M2): implement dnd-kit Kanban drag-and-drop
fix(M2): correct overdue indicator logic for closed deals
chore(M1): scaffold Next.js 16 with shadcn/ui and Geist fonts
feat(M3): add content submission form with round tracking
fix(M4): handle TUS upload resumption on mobile connection drop
feat(M5): add creator discovery directory with trigram search
refactor(M2): extract deal stage validation into shared util
```

---

## Label rules

Apply exactly two labels to every PR:

**Milestone label** (pick one):
`m1` `m2` `m3` `m4` `m5` `m6` `m7` `m8`

**Type label** (pick one):
`feat` `fix` `chore` `refactor` `test` `docs`

Create these labels in GitHub if they don't exist yet:
```bash
# Milestone labels
gh label create m1 --color 0075ca
gh label create m2 --color 0075ca
gh label create m3 --color 0075ca
gh label create m4 --color 0075ca
gh label create m5 --color 0075ca
gh label create m6 --color 0075ca
gh label create m7 --color 0075ca
gh label create m8 --color 0075ca

# Type labels
gh label create feat --color 2ea44f
gh label create fix --color d73a4a
gh label create chore --color e4e669
gh label create refactor --color f9d0c4
gh label create test --color 0e8a16
gh label create docs --color 1d76db
```

---

## After the PR is created

1. Copy the PR URL from the `gh` output
2. Append to `.claude/memory/iterations.md`:
```
## YYYY-MM-DD — <PR title>
**PR**: <url>
**Milestone**: M#
**What**: <one line summary>
```
3. If any architectural decision was made during the work, append to `.claude/memory/decisions.md`
4. If any new requirement or edge case was discovered, append to `.claude/memory/requests.md`

---

## Editing an existing PR

Use `gh api` — `gh pr edit` is unreliable:

```bash
# Update description only
gh api -X PATCH repos/{owner}/{repo}/pulls/PR_NUMBER \
  -f body='Updated description here'

# Update title only
gh api -X PATCH repos/{owner}/{repo}/pulls/PR_NUMBER \
  -f title='feat(M2): updated title'

# Update both
gh api -X PATCH repos/{owner}/{repo}/pulls/PR_NUMBER \
  -f title='feat(M2): updated title' \
  -f body='Updated description here'
```

Replace `{owner}` and `{repo}` with your actual GitHub org/username and repo name.

---

## PR size guidelines

- **One task = one PR.** Never bundle work from different milestone tasks.
- If a PR touches more than 400 lines, consider splitting it.
- Schema changes (database agent) should always be a separate PR from the API or UI work that depends on them — merge schema first, then unblock the dependent PR.
- The DevOps agent's infra/workflow PRs are always separate from product code PRs.