# Ascend

Free unofficial practice for the Digital SAT® exam. Climb 15 minutes a day.

Live site: https://chrishouseholderuser.github.io/climbwithascend/

MIT licensed. Free unofficial practice. Built by a student. [Source on GitHub](https://github.com/chrishouseholderuser/climbwithascend).

Ascend turns practice into a climb. Every skill you master lifts you toward your summit. Climb progress is unofficial practice — not an official SAT® exam score. Use [Bluebook™](https://satsuite.collegeboard.org/practice/practice-tests/bluebook) for official practice tests.

This product is called **Ascend**. It is not affiliated with the College Board.

## Who it is for

Ascend is for students 13 and older. Creating an account requires confirming that age. We do not collect a birthdate. No ads. We do not sell student data.

## What is here

- Daily climb, lessons, and skill practice
- Unofficial full-length adaptive practice
- Quiz Lab (procedural questions generated on your device — no AI key)
- Real email/password accounts and optional Google sign-in through Supabase Auth
- Cross-device progress sync in Supabase
- Row Level Security so an authenticated user can read or change only their own progress row
- Installable PWA with an offline content cache

## Deploy

1. Create a Supabase project. In **Authentication → Providers**, enable Email and (optionally) Google. Turn on email confirmation and add the production URL under Authentication → URL Configuration.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
3. Set the project URL and **publishable/anon** key in `app/config.js`. Do not use a `service_role` key. The browser key is designed to be public; data protection comes from the RLS policies.
4. In this repository, set GitHub Pages to **GitHub Actions**. The workflow deploys the `app/` folder. The live URL is `https://chrishouseholderuser.github.io/climbwithascend/`.
5. Use HTTPS. It is required for PWA installation and protects logins in transit.

Edit this repository (`climbwithascend`) when you change the hosted site.

## Legal pages

- [Privacy](app/privacy.html)
- [Terms](app/terms.html)
- [Students never pay](app/pledge.html) — students never pay for practice. Schools or donors may fund it later. No student paywall.

SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product/site.

Unofficial items include [OpenSAT](https://github.com/Anas099X/OpenSAT). Not official College Board items.

## License

[MIT](LICENSE). Use it, copy it, fork it. Students never pay.
