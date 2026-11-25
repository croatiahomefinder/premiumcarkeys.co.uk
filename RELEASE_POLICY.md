# Premium Car Keys | Owner-approved autonomous release policy (pilot)

Owner delegated authority 2026-11-25: low-risk, traceable improvements may go live automatically if safety/QA conditions are satisfied and monitored. **This is not blanket permission for risky changes.**

## Automated release candidate requirements
1. Target exclusively `croatiahomefinder/premiumcarkeys.co.uk`; changes proposed on a feature branch and through a PR, preserving GitHub diff and immutable commit SHA.
2. CI must be successful for the **exact head commit**. Changed site verified with relevant preview checks; separate, non-authoring QA pass logged on the PR. A previously green run for an earlier commit does not count.
3. Release changes limited to reversible metadata, accessibility, broken links, minor content clarity and responsive UI refinements that preserve existing phone/WhatsApp/quote-builder pathways.
4. Prohibit auto-release when modifying: CNAME, robots.txt, redirects, security controls, deployment configuration, hosting/DNS, analytics credentials, contact details, forms/lead endpoints, payment or booking systems, core site scripts, legal/privacy notices, prices, service/coverage geography, make/model/year eligibility, warranty terms, vehicle security/key programming instructions, or extensive redesign/navigation changes.
5. Reviewer must confirm exact before/after user value and check product claims. A speculative SEO improvement qualifies as a testable hypothesis, NOT proven growth.
6. Use one release at a time, keep the prior main SHA for reversal; no force pushes; merge via GitHub PR only.
7. Smoke-check all essential routes and customer enquiry paths after release. On confirmed broken routes, missing contact methods or other high-severity regressions, prepare an immediate revert to the last known good commit. Do not automatically roll back solely due to normal Google ranking volatility.
8. Log time, PR, commit, CI link, QA verdict, change description, baseline, post-deploy observations and rollback details.
9. Evaluate organic results over a suitable window (generally 28 days or more for this low-volume site); compare GSC impressions/clicks, qualified enquiries, booked jobs when measurable, and do not claim conversion lift when GA4 is absent.
10. If independent QA or production connectivity cannot be verified, mark BLOCKED and **do not deploy**. A separate scheduling prompt does not replace CI or manual technical validation.

## Current baseline
Google Search Console 2026-08-22 to 2026-11-22: homepage 7 clicks, 720 impressions, 0.97% CTR, average position 23.3. Page table 9 clicks. GA4 OpenSEO integration not connected; booking conversion unknown.

## Release pipeline
Coordinator creates private development PR -> GitHub Actions CI -> separate QA reviewer checks source, user experience and commit SHA -> if **all safe gates pass**, a scheduled supervisor may merge without asking owner for each safe change -> post-release monitor -> record outcome or revert on verified serious regression.

This document alone does not deploy code or prove that an automatic release has occurred. Schedule-based reviewer and required Github rights must be operational. No use of unapproved paid AI APIs or unattended local computer bots is implied.
