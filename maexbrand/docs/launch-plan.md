# Launch Plan

Source of truth: `plan/tasks.json`. Run `node scripts/build-plan.mjs` to regenerate
`docs/execution-plan.md`, `plan/maexbrand.ics` (import into any calendar), and `plan/issues.json`.

## Phases
1. **Foundation** - name, positioning, identity, domain/email.
2. **Build** - site, content bank, email capture.
3. **Launch** - queue posts, launch day.
4. **Operate** - weekly review loop.

## Launch-day checklist
- [ ] Site live, `node scripts/check-site.mjs ./site` passes
- [ ] Email capture tested end to end
- [ ] Posts queued for all channels
- [ ] Welcome email sends
- [ ] Analytics/UTM links in every post (`node scripts/utm.mjs`)

## Risks
| Risk | Mitigation |
|---|---|
| Positioning unclear | Finish T01 before any build work |
| Content runs out | Bank 10 posts before launch (T05) |
| Email not delivered | Send test to 3 providers before launch |

## AI video track
Phase 0 (7 days, 15 min/day) produces the launch video and social cuts. See `docs/ai-video-track.md`.
Phone-only production: `docs/phone-talking-head-workflow.md`, `site/teleprompter.html`, `scripts/make-scripts.mjs`.
