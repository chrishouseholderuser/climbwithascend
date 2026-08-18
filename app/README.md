# Ascend — unofficial Digital SAT® exam practice

Studying as a climb: pick a summit goal, and every skill you master lifts your climber. Adaptive practice, an unofficial full-length adaptive test, streaks / XP / levels, and Quiz Lab — in a static website.

The hosted app uses real Supabase Auth (email/password and optional Google) and syncs climb progress across devices. Row Level Security keeps each student's row private.

Product name: **Ascend**. Live site: https://chrishouseholderuser.github.io/climbwithascend/

Ascend is unofficial practice. Climb progress is not an official SAT® exam score. For students 13 and older. No ads.

## Run it

**Locally:** double-click `index.html` (or `Open Ascend.command`).

**As an installable app:** double-click `Install Ascend (local server).command` and install from the browser, or open the hosted site and add it to your home screen.

## Accounts

Sign in with email/password or Google. Progress syncs with your account. Passwords are handled by Supabase — this app does not store them.

## Files

| File | What it is |
|------|-----------|
| `index.html` | Design system, screens, and app engine |
| `data.js` | Unofficial question bank + taxonomy + lessons (`window.ASCEND_DATA`) |
| `generators.js` | Quiz Lab procedural generators |
| `config.js` | Public Supabase URL and publishable/anon key |
| `privacy.html`, `terms.html`, `pledge.html` | Legal pages |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | PWA |

## Questions & credits

Unofficial items include [OpenSAT](https://github.com/Anas099X/OpenSAT). Not official College Board items.

SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product/site.
