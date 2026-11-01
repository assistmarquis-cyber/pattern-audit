# Phone-Only Talking-Head Workflow

Goal: make branded talking-head videos entirely from your phone, mostly automated.
Pick **Path A (you on camera)** or **Path B (AI avatar)**. Both share the same script step.

## Step 1 - Script (2 min)
1. Add a topic to `plan/video-topics.json` (or just use the prompt below in the Claude app).
2. `node scripts/make-scripts.mjs` writes teleprompter-ready text to `docs/video-scripts/`.
3. Or paste this into Claude on your phone:
   > Write a 35-second talking-head script for MAExbrand about: [topic]. Voice: plain, direct, warm, short sentences. Structure: hook (1 line), 3 points, call to action. Add blank lines where I should pause.

## Step 2A - Record yourself (5 min)
- Open `site/teleprompter.html` on the deployed site in your phone browser (once published). If you only have one phone, record on it using Voice Memos or screen-free read-through, or use a second device for the prompter.
- Camera: rear camera, 1080p/30, window light in front of you, phone at eye level, mic as close as is comfortable.
- Do 2 takes. Don't aim for perfect; captions cover small slips.

## Step 2B - AI avatar (10 min)
- HeyGen (named in the course ad) offers avatar videos; confirm its current mobile app/web support and pricing before relying on it.
- Use only your own likeness/voice (or one you have written rights to). Check commercial-use terms. Label AI-generated content where platforms require it.

## Step 3 - Edit (5 min)
- CapCut mobile: auto-captions, trim silences, brand colors from `docs/brand-guide.md`, 9:16.
- Optional: Opus Clip to cut one long recording into several short clips.

## Step 4 - Schedule (3 min)
- Add the UTM link: `node scripts/utm.mjs <url> <channel> <campaign>` (or build it at any computer and save it in your notes).
- Queue the post in your scheduler and mark it `queued` in `docs/content-calendar.md`.

## Weekly batch (best use of 15 min/day)
Mon: scripts for the week. Tue: record 3-5 clips in one sitting. Wed: edit. Thu: schedule. Fri: review metrics.

## Phone checklist
- [ ] Storage > 5 GB free
- [ ] Lens wiped, Do Not Disturb on
- [ ] Teleprompter page bookmarked on home screen (Share > Add to Home Screen)
- [ ] Captions on, safe margins checked
