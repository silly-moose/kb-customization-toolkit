# Git Cheat Sheet

For Chad (template maintainer) — the commands for updating the template repo.

| What you want to do | Command | What it does |
|----------------------|---------|--------------|
| See what's changed | `git status` | Lists new, modified, and staged files |
| Stage specific files | `git add filename` | Marks files to include in the next commit |
| Stage everything | `git add -A` | Stages all new and changed files at once |
| Save a snapshot locally | `git commit -m "description"` | Bundles staged changes into a named commit on your machine |
| Send commits to GitHub | `git push` | Uploads your local commits so others can see them |

**The typical flow:** make changes → `git add` → `git commit` → `git push`.

You can also just ask Claude Code to "commit and push my changes" and it will handle the commands for you.
