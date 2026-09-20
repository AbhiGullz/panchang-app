# Gajaa Panchang — Next Actions and Go-Live Working Plan

**Status:** working document  
**Updated:** September 20, 2026
**Owners:** Abhishek (product/approvals/accounts) and Codex (repository review, implementation, verification)  
**Target:** public installable web app hosted on the Home Lab Worker node

## Current decision record

- The public product is an installable PWA, not a native app in this release.
- The repository remains public and the deployment follows the selected AGPL route for Swiss Ephemeris. Source and licence notices must remain reachable from the product.
- The pre-redesign UI is preserved on branch `ux-baseline-before-desktop-dashboard-2026-09-12` for rollback.
- Mobile remains a focused single-column interface. Desktop uses available width for an ad rail, a daily summary column, and a Panchang-details column.
- Advertising stays disabled until the publisher account, public domain, privacy disclosures, certified consent flow, and brand-safety controls are complete.

## Recommended public identity and domain

- Primary domain: `gajaapanchang.com` — exact match for the “Gajaa Panchang” product name and the clearest spelling for users.
- Defensive redirect: `gajapanchang.com` — buy it as well if the annual cost is acceptable, then redirect it permanently to the primary domain.
- A registry lookup on September 19, 2026 returned no registration record for either `.com`; availability is not guaranteed until checkout completes.
- Register through Cloudflare Registrar or another reputable ICANN-accredited registrar with WHOIS privacy, auto-renewal, MFA, and registry lock where available.
- Do not use a Tailscale address as the public URL. Keep Tailscale for administration and private testing.

## Concrete launch sequence

1. Abhishek buys the primary domain (and optional defensive domain), enables MFA/auto-renewal, and adds it to Cloudflare DNS.
2. Codex produces the frontend production build and runs FastAPI as a supervised service on H Kamgar/Worker; Vite port `5173` is not used in production.
3. Publish `gajaapanchang.com` through a named Cloudflare Tunnel to the local FastAPI service. This provides public HTTPS without router port-forwarding or exposing the Worker IP.
4. Add and verify Privacy, Cookies/Advertising, Terms, Contact/Feedback, and AGPL/source-code pages before requesting AdSense review.
5. Confirm that the homepage and policy pages are public to Google crawlers, have no login wall, and work on mobile and desktop.
6. Add the root domain to AdSense, place the AdSense verification meta tag, publish `ads.txt`, and request site review. Approval can take days and sometimes several weeks.
7. Configure Google’s certified CMP or another Google-certified TCF CMP. The current local consent flag is a development gate and must be replaced before ads go live.
8. In AdSense Brand safety, block Reference to sex, Sexual and reproductive health, Dating, Gambling, Social casino, Alcohol, Sensationalism, Significant skin exposure (where available), and other categories Abhishek considers incompatible.
9. Create one responsive content unit and one vertical desktop unit. Provide Codex the public publisher ID and slot IDs; Codex configures `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_CONTENT_SLOT`, and `VITE_ADSENSE_VERTICAL_SLOT` in the production build.
10. Codex verifies consent rejection/acceptance/withdrawal, no-ad and ad-blocker behavior, layout stability, HTTPS, Worker reboot recovery, monitoring, and rollback before Abhishek approves public launch.

## UX design implemented in this iteration

### Mobile

- Retain the existing single-column reading order and touch-friendly bottom navigation.
- Show one responsive ad position before the selected tab content; avoid ads inside sacred/timing cards.
- Keep detailed Panchang elements below the daily summary because side-by-side content is not readable on narrow screens.

### Desktop and tablet

- Expand the application shell from a narrow phone-width column to a responsive dashboard.
- Use the otherwise-empty left rail for one sticky vertical ad position.
- Place the daily summary, sunrise/sunset, Rahu Kaal, and tradition cards in the main column.
- Move Panchang Details to a sticky right column so current and next Tithi, Nakshatra, Yoga, Karana, and Chandra Rashi remain visible without a long page scroll.
- Keep the primary navigation sticky near the bottom of the viewport.

### UX acceptance checks

- At 390px width: no horizontal scroll; all controls remain at least 44px high.
- At 768px width: summary cards use available width without clipped labels.
- At 1280px and above: details are on the right and the ad rail is on the left.
- Keyboard focus order follows header → content → navigation.
- No ad overlaps, shifts, or visually imitates an application control.
- Core Panchang information remains usable when ads are blocked or unavailable.

## Advertising plan

### Recommended launch approach

Use manually placed Google AdSense display units rather than Auto ads for the first release. Manual positions keep ads away from religious content, date controls, navigation, and Panchang timing cards. The repository now supports a responsive content unit on mobile/tablet and a vertical rail unit on wide desktop screens.

The ad component is fail-closed. It displays the existing placeholder unless:

1. the application is a production build;
2. `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_CONTENT_SLOT`, and/or `VITE_ADSENSE_VERTICAL_SLOT` are configured; and
3. a certified consent implementation records consent before the ad request.

`VITE_*` values are public browser configuration, not secrets. Never place private API keys or Home Lab credentials in frontend environment variables.

### Brand-safety configuration owned by Abhishek

In AdSense, configure site-level **Brand safety → Blocking controls** before enabling ads:

- Block “Reference to sex” and “Sexual and reproductive health”.
- Keep all restricted sensitive categories blocked.
- Strongly consider blocking dating, gambling/social casino, alcohol, sensationalism, significant skin exposure where available, cosmetic/body modification, and weight-loss categories.
- Review general categories and advertiser URLs; block incompatible advertisers.
- Use the Ad Review Center regularly and record questionable ads reported through Feedback.
- Decide whether to block the “Religion” category. Blocking it prevents third-party religious advocacy ads, but may also remove contextually relevant devotional inventory.

Category filtering reduces risk but is not a guarantee; Google explicitly states classification may not catch every related ad. The product needs an ad-reporting process and a fast disable switch.

### Consent and privacy gate

- Configure a Google-certified CMP integrated with IAB TCF before serving personalized ads in the EEA, UK, or Switzerland.
- Add Privacy, Cookies, Advertising, Terms, AGPL/source, and Contact pages.
- Default to no ad request until the consent state is known.
- Provide reject, withdraw-consent, and privacy-preference controls.
- Obtain legal/privacy review for the jurisdictions served.

### Remaining implementation after account setup

- Abhishek supplies the approved public domain, AdSense publisher client ID, the two ad-slot IDs, support email, and chosen CMP.
- Codex integrates the chosen CMP, replaces the temporary local consent signal, adds policy-page routes, verifies no request is made before consent, and tests ad-blocker/no-fill behavior.
- Abhishek configures blocking controls and approves the visual placement on real ads.
- Codex adds a kill switch and monitors cumulative layout shift and page performance.

## Home Lab Worker go-live plan

### Deployment decision

H Worker (`hermes-worker`, Tailscale `100.123.216.69`) is the intended primary 24x7 host. M5 Pro remains the development/release-authority machine. The Worker deployment will be pulled from the canonical GitHub repository; this M5 checkout and the private Tailscale URL remain development/test environments.

Deployment will be promoted in phases:

1. **Prepare:** verify Worker disk, backups, Python/Node runtimes, service account, and a clean Git checkout.
2. **Stage:** build and test a specific commit on Worker; run FastAPI and the production frontend behind localhost-only listeners.
3. **Private acceptance:** test the Worker over Tailscale from phone and laptop, including language changes, location search, PWA install, and restart recovery.
4. **Public cutover:** after the domain is purchased, create a named Cloudflare Tunnel from the Worker to the production reverse proxy. Do not expose ports 5173 or 8000 directly.
5. **Operate:** enable supervised services, health checks, backups, log rotation, rollback instructions, and a documented maintenance procedure.

The first production deployment should be a manual, evidence-recorded release. Once stable, it can be converted to a pull-and-deploy script or CI workflow; no deployment automation should receive Home Lab credentials or secrets from the public repository.

### Abhishek responsibilities

- Confirm Worker host name, public domain, router/edge approach, and whether inbound public traffic is permitted.
- Control DNS, registrar, AdSense, CMP, email, and any reverse-proxy accounts.
- Approve public exposure and the final privacy/licensing text.
- Confirm physical uptime, UPS expectations, ISP terms, bandwidth, and recovery expectations.
- Approve a maintenance window and final production release.

### Codex responsibilities

- Produce reproducible production build and deployment configuration for the Worker.
- Bind the application behind a reverse proxy; do not expose the Vite development server publicly.
- Configure HTTPS, security headers, request-size limits, trusted proxy handling, log rotation, and endpoint rate limits.
- Run frontend tests/build/lint, backend tests, dependency audit, and HTTP smoke tests.
- Verify service restart, machine reboot recovery, rollback, backup, and restore.
- Add `/health` monitoring plus external availability checks and document evidence.
- Review the deployed Git commit and public source/licence link.

### Required production topology

`Public domain → HTTPS reverse proxy/edge → Worker FastAPI service → built frontend + API`

Do not deploy `npm run dev` or expose ports 5173/8000 directly to the public internet. Tailscale remains for administration and private testing, not public visitor access.

## Prioritized action register

| Priority | Action | Owner | Status / evidence |
|---|---|---|---|
| P0 | Confirm public domain and edge/reverse-proxy approach | Abhishek | Pending |
| P0 | Confirm AGPL notices/source link and ephemeris data provenance | Abhishek + Codex | Pending release evidence |
| P0 | Replace placeholder feedback email with a functioning mailbox | Abhishek supplies; Codex updates | Pending |
| P0 | Configure production service, HTTPS, rate limiting, and secrets | Codex after host details | Pending |
| P0 | Configure certified CMP and privacy pages before ads | Abhishek selects; Codex integrates | Pending |
| P1 | Create AdSense account/site and obtain manual slot IDs | Abhishek | Pending |
| P1 | Configure sensitive/general category blocks and Ad Review Center process | Abhishek | Pending |
| P1 | Validate redesigned layout on phone, tablet, laptop, and wide desktop | Codex + Abhishek | In progress |
| P1 | Add external health monitoring, backup/restore, and reboot evidence | Codex | Pending deployment |
| P1 | Run public-beta security/performance/accessibility checks | Codex | Pending deployment |
| P2 | Measure ad layout shift, fill rate, UX complaints, and retention | Abhishek + Codex | Post-launch |
| P2 | Reassess native mobile app after web/PWA usage evidence | Abhishek | Future |

## Release and rollback

Before release, record the deployed commit, test output, build checksum, configuration version, and database/cache backup. If the new UX is rejected, restore the UI from `ux-baseline-before-desktop-dashboard-2026-09-12` or revert the dashboard commit; do not overwrite user data or deployment secrets during rollback.

## Definition of public-beta ready

- All P0 actions are closed with evidence.
- Production survives a Worker reboot and service restart.
- HTTPS and independent external health checks pass.
- Privacy/CMP behavior is verified in consent, rejection, and withdrawal paths.
- Ad categories and review workflow are configured, or ads remain disabled.
- Mobile and desktop acceptance checks pass.
- Abhishek provides written final approval in this document.
