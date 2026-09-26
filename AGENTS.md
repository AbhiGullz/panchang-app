# Home Lab deployment policy

For Panchang and future Home Lab applications, use this release flow:

`M5 Pro development → tests/build → GitHub canonical source → Worker deployment → live verification`

- M5 Pro is the development sandbox and release-validation environment.
- GitHub is the canonical source of truth.
- H Worker is the always-on production and hosting environment.
- Do not make application-code edits directly on Worker; deploy an approved Git commit.
- Before deployment, run tests and build verification on M5 Pro.
- After deployment, verify the Worker service and live endpoint.
