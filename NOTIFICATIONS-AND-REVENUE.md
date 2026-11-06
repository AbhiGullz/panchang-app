# Notifications and advertising — evaluation

Reviewed November 1, 2026. Proposal only: no notification service, analytics, or new personal-data collection has been enabled.

## Current implementation

`notificationTime` is saved in browser preferences and rendered in Settings. `frontend/src/lib/push.ts` contains an unused subscription helper. The current backend has no push-subscription endpoint or reminder scheduler. Selecting a time does **not** currently schedule a notification. Do not market it as working delivery.

## Recommended product

- Explicit opt-in. Start with reminders Off and request browser permission only after an explanation and a user action.
- Offer daily Panchang, tomorrow's festivals, and My Tithis as separate topics. Prefer a single combined digest rather than multiple alerts on the same day.
- Let users choose a reminder time. Default to device time zone, visibly named, with an explicit option for the selected Panchang location's zone. Traveling and daylight-saving changes must not silently produce overnight alerts.
- Deep-link to the relevant date and location. A daily reminder should describe useful content such as today's tithi and upcoming observance, not ask people to view or click an ad.
- Personal observances should use generic lock-screen text by default; displaying a family name or memorial should require a separate choice. Never put full addresses, gotra or Sankalpa form contents in push payloads.
- Quiet hours, a clear Off switch and immediate unsubscribe. Start with at most one scheduled digest daily; extra custom reminders require explicit user selection.
- Offer an optional evening-before festival digest; do not send irrelevant regional festivals simply to increase opens. Use the chosen calendar school and selected observance region.

### Implementation if approved

Use a deterministic Worker scheduler and standard Web Push, not an AI model. Maintain VAPID credentials outside Git. Store the minimum subscription endpoint/key material plus selected topics/time zone, protect it, and do not log credentials or payloads. A server-side job is needed because a closed browser page is not a reliable alarm clock. Deduplicate per subscription/topic/local date; handle DST, stale subscriptions, failed delivery, retries and expiration. Notification clicks must open the requested day and never an advertiser redirect.

On iPhone/iPad, supported Web Push requires a Home Screen web app and permission. Test installed iOS, Android, and desktop independently; offer installation guidance rather than presenting an unsupported Subscribe button. Backend subscription storage changes require an updated privacy notice and retention/deletion rules before launch.

## Revenue model for 1,000 daily active users

Daily users are not billable impressions. A person may not scroll to a bottom banner, may decline advertising, use a blocker, or receive no fill. Mobile typically has only one configured bottom unit, while wide desktop has side placements as well. A mounted iframe is not proof of a payable impression. Use provider-reported impressions and revenue.

Formula: `monthly revenue = provider-counted monthly ad impressions / 1,000 × realized publisher eCPM`.

The following are **illustrative assumptions, not Adsterra rate quotes or a forecast**. They exclude hosting, fees and taxes and assume 30 days:

| Counted ad impressions per daily user | Monthly impressions at 1,000 DAU | $0.25 realized eCPM | $1.00 realized eCPM | $3.00 realized eCPM |
| --- | ---: | ---: | ---: | ---: |
| 0.5 | 15,000 | $3.75 | $15 | $45 |
| 2 | 60,000 | $15 | $60 | $180 |
| 4 | 120,000 | $30 | $120 | $360 |

For planning, the middle row is a scenario to validate, not a promise. Worldwide traffic is not enough information to predict earnings: country mix, device, consent, fill, viewability, advertiser demand and conversions matter. Adsterra describes many banner campaigns as performance-based; its displayed eCPM is a revenue normalization, not a guarantee that every view or click pays a fixed amount. Actual revenue can fall below these scenarios.

If a useful reminder produces 100 additional genuine daily visits with 1.5 additional counted impressions per visit, it adds 4,500 monthly impressions. At $1 realized eCPM that is only $4.50/month; at $3 it is $13.50. Increased opens should be evaluated against maintenance cost and notification opt-outs, not treated as automatically profitable. Do not assume causal uplift without a controlled comparison.

## Changes likely to matter most

1. Fix placement reporting first: both current desktop side frames share the same 160×600 unit code. Adsterra explicitly recommends separate codes for two same-size placements. Request a second side-unit code before judging placement performance.
2. Compare bottom-banner visibility with a non-obstructive placement after the daily summary. Test one layout change at a time; avoid multiple near-identical banners, overlays, accidental clicks, or forced refreshes.
3. Keep the app fast and useful, especially mobile. More ad slots do not automatically mean more revenue or retention.
4. Keep adult ads disabled and ask the provider to exclude dating, gambling and misleading creatives as well. Religious-app trust is worth more than a short-term rate increase; provider filtering is not an absolute guarantee.
5. Use a two-week provider report grouped by day, country, device and unit: counted impressions, realized eCPM and revenue. Get unique-user/session counts only from a privacy-reviewed analytics setup; no analytics has been introduced here. Do not infer 1,000 unique users from 1,000 requests or impressions.
6. If reminders are later implemented, measure opted-in subscriptions, delivery, click-through, genuine return visits and opt-outs. Run a consented holdout or staged comparison; never reward or solicit ad clicks.

## Owners

- Abhishek: provide the second 160×600 code and 14 days of aggregate Adsterra reports; approve reminder topics, budget and privacy terms before implementation.
- Codex: implement/test scheduling only after approval, including unsubscribe, timezone handling, payload privacy, deduplication and monitoring. Replace hypothetical rates with actual realized revenue when reports are available.

## Sources

- [Adsterra banner guide](https://adsterra.com/blog/how-banner-ads-make-money/) — banner monetization, placement caveats, duplicate-code warning and variable realized eCPM.
- [Apple Web Push documentation](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) — supported Safari and Home Screen web-app requirements.
