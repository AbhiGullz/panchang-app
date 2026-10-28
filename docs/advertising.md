# Current advertising integration

Adsterra replaces the automatic AdSense loader. The public 300×250 iframe banner
tag was supplied by Abhishek; he confirmed adult ads are disabled in the provider
dashboard. Dating and gambling exclusions remain unverified and must be checked
with Adsterra support. The application cannot classify or filter provider creatives.

One banner appears below loaded Home, Muhurta, or Festivals content after the user
chooses Allow ads. It is absent on onboarding, loading-only screens, Sankalpa,
Settings, Guide and Feedback. Development builds never load the tag.

The banner has its own sandboxed opaque-origin frame, keeping synchronous
document.write and atOptions out of the application document. Scripts and opening
advertiser pages are allowed; parent-page navigation, same-origin access, downloads,
and forms are not. Do not add allow-same-origin to the srcdoc frame.

Consent is stored in gajaa-adsterra-consent-v1 and can be withdrawn in Settings.
No provider request is created before permission. Existing Google consent is not
reused for Adsterra. Withdrawal unmounts the frame; it cannot erase provider data.
The old Google ads.txt authorization remains as historical account configuration;
no Adsterra ads.txt entries should be invented. Add only entries supplied by Adsterra.

Validate with npm test, npm run lint and npm run build in frontend. Preview the
production build to test live ads. Do not click your own ads. Banner fill and content
depend on the provider, user browser restrictions and network connectivity.
