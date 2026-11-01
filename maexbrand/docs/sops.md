# Standard Operating Procedures

## Publish a post
1. Draft in `content-calendar.md`.
2. Add UTM link: `node scripts/utm.mjs <url> <channel> <campaign>`.
3. Check voice against brand-guide section 3.
4. Schedule; mark status `queued`.

## Deploy the site
1. `node scripts/check-site.mjs ./site`
2. Netlify: new site, base directory `maexbrand`, publish `site` (see `maexbrand/netlify.toml`).

## Weekly review (30 min, same time each week)
- Metrics: visitors, signups, top post
- Shipped vs planned (tasks.json)
- One thing to stop, one to double down on
- Next week's 3 priorities

## Sync the plan to GitHub issues
```
node scripts/build-plan.mjs
GITHUB_TOKEN=... node scripts/create-github-issues.mjs            # dry run
GITHUB_TOKEN=... node scripts/create-github-issues.mjs --apply    # create
```
