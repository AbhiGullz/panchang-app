# Current advertising integration

Adsterra replaces the automatic AdSense loader. The public 300×250 iframe banner
tag was supplied by Abhishek; he confirmed adult ads are disabled in the provider
dashboard. Dating and gambling exclusions remain unverified and must be checked
with Adsterra support. The application cannot classify or filter provider creatives.

One banner appears below loaded Home, Muhurta, or Festivals content. US and India
visits default to advertising, determined from first-party Cloudflare /cdn-cgi/trace.
Other or unknown network countries retain an affirmative consent prompt. A saved
refusal or Global Privacy Control always blocks ads. Selected Panchang location is
never used as the visitor's privacy jurisdiction. Development builds never load ads.
Ads are absent on onboarding, loading-only screens, Sankalpa, Settings, Guide and
Feedback. Settings has no advertising controls; the Privacy page provides them.

The banner runs at https://ads.gajaapanchang.org/advertising/banner.html. Tunnel
ingress exposes only that exact path on the ad hostname. The frame permits scripts,
its own origin and advertiser popups, but not parent-page navigation, downloads or
forms. Cross-origin separation prevents ad scripts reading application localStorage,
DOM and Sankalpa inputs. Do not move the banner back to the application hostname
while allow-same-origin is enabled. The earlier opaque-origin wrapper prevented
the provider's credentialed request/nested-frame rendering flow from completing.
Canonical tunnel configuration: backend/deploy/cloudflared-gajaa.yml.

Explicit choices are stored in gajaa-adsterra-consent-v1 and can be withdrawn on
the Privacy page. Existing refusals remain honored. If browser storage is blocked,
an inline consent choice applies in memory until the page closes or reloads.
No provider request is created while the privacy decision is unknown or blocked.
Existing Google consent is not reused for Adsterra. Withdrawal unmounts the frame;
it cannot erase provider data.
The old Google ads.txt authorization remains as historical account configuration;
no Adsterra ads.txt entries should be invented. Add only entries supplied by Adsterra.

Validate with npm test, npm run lint and npm run build in frontend. Preview the
production build to test live ads. Do not click your own ads. Banner fill and content
depend on the provider, user browser restrictions and network connectivity.
