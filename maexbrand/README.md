# MAExbrand Execution Kit

| Folder | What |
|---|---|
| `docs/` | Brand guide, launch plan, content calendar, SOPs, generated execution plan |
| `site/` | Static landing site (deploys to Netlify via `netlify.toml` here) |
| `plan/tasks.json` | Single source of truth for the plan |
| `scripts/` | `build-plan`, `create-github-issues`, `check-site`, `utm` (Node 18+, no dependencies) |

```bash
node scripts/build-plan.mjs          # plan doc + .ics calendar + issues.json
node scripts/check-site.mjs site     # validate the site
node scripts/create-github-issues.mjs   # dry run; add --apply to create
```

Start with `docs/brand-guide.md`: every **TODO** is a decision only you can make.
