# Codex Findings — Panchang App

**Review date:** August 16, 2026  
**Repository:** `AbhiGullz/panchang-app`  
**Reviewed ref:** `main` at `f5aae876a19bafd3dabfc8a47754c77af138cfc1` (`feat: install static Panchang logo`)  
**Review type:** Latest-code, security, reliability, testability, and release-readiness review. No application source files were changed.

## Closure update — August 16, 2026

This document is now a historical review plus closure record. The following repository findings have been resolved and verified locally: frontend lockfile; exact direct backend dependency pins and a Python 3.12 lock snapshot; frontend test/build/lint; backend test suite and HTTP smoke test; explicit timezone validation; bounded and cached geocoding with in-process per-client protection; offline-cache versioning; physically correct moon illumination; decorative accessible logo; and removal of the incomplete local-only push subscription control.

The remaining items are **external release gates**, not unresolved source-code defects: successful fetch/deployment evidence on H Kamgar, HTTPS/edge rate limiting/monitoring/backup evidence, Swiss Ephemeris Professional License purchase and data-file inventory, and future ad/push privacy implementations. Their required evidence is maintained in `docs/release-gates.md`. Public beta is not cleared until that evidence exists.

## Repository/update status

The clone is now a root Git repository with `origin` configured and a clean working tree. `HEAD` and the local `origin/main` ref are identical at the reviewed commit. A fast-forward `git pull` was attempted, but macOS denied writes to `.git/FETCH_HEAD`; therefore, the ref already present in the freshly cloned repository was used as the review baseline. Before the next review, repair repository metadata permissions and run a successful fetch/pull.

The repository contains a coherent backend/frontend layout, current frontend branding changes, transition-aware panchang data, expanded tests, and deployment artifacts.

## Executive release assessment

**Status: not ready for public beta or production deployment from this environment.**

The product has meaningful implementation progress, but release evidence is incomplete. The most urgent issues are reproducible dependency installation, executable test/build verification, public geocoder abuse controls, timezone input validation, push-subscription completion, and deployment verification.

## Findings by severity

### P0 — Pull/repository verification is not operationally complete

The repository is clean and the branch tracks `origin/main`, but `.git/FETCH_HEAD` cannot be written. This prevents a normal freshness check and may indicate ownership/ACL problems in the new checkout.

**Required action:** fix the checkout’s `.git` permissions on the machine that owns the repository, then run:

```text
git fetch origin
git status --branch --short
git log --oneline --decorate -5
```

Record the fetched commit and review it again if it differs from `f5aae87`.

### P0 — Frontend dependency reproducibility is broken

`frontend/package.json` exists, but `frontend/package-lock.json` is absent and `node_modules` is not present in this environment. Dependencies use caret ranges, so two installs can resolve different packages over time. This prevents a deterministic build and weakens supply-chain review.

**Required action:** generate and commit a lockfile using the supported Node/npm version; run `npm ci`, `npm run build`, `npm test`, and `npm run lint` from a clean checkout. Generate a license/SBOM report from the lockfile and review transitive dependencies.

### P0 — Backend dependency versions are unpinned

`backend/requirements.txt` lists packages without versions (`fastapi`, `httpx`, `pydantic`, `pyswisseph`, `redis`, `timezonefinder`, `uvicorn`). This makes production behavior and security patching non-reproducible and undermines the licensing register’s version claims.

**Required action:** pin exact versions or use a generated constraints/lock file with hashes. Record the Python version, platform architecture, Swiss Ephemeris package/data versions, and a repeatable install command. Do not treat the current package list as a production dependency manifest.

### P1 — Tests could not be executed in this environment

The system Python has no pytest or required backend packages, and the checked-in virtual environment does not expose a runnable `python` executable for this host architecture. Frontend dependencies are also not installed. The repository includes useful tests, but their current pass status cannot be independently verified here.

**Required action:** execute the full verification on H Kamgar/hermes-worker from a clean environment and attach the output:

- backend `pytest -q`;
- backend end-to-end smoke test;
- frontend `npm ci && npm test`;
- frontend `npm run build`;
- frontend `npm run lint`;
- a deployed health/API smoke test.

### P1 — Public geocoder dependency needs rate limiting and operational controls

`/api/v1/geocode` and `/api/v1/reverse-geocode` call public Nominatim directly. The implementation has a one-second process-local lock and search caching, but reverse geocoding is not cached, and there is no visible per-client/API rate limit at the FastAPI layer. Multiple workers can each issue requests, and an attacker can use the endpoint as an outbound request proxy or exhaust the upstream service allowance.

The service also depends on Nominatim availability and policy compliance, while the earlier architecture aimed to avoid external geocoding dependency.

**Required action:** add per-IP/user rate limiting at the edge and application layers, cache reverse-geocode results with bounded size/TTL, cap query length and result payloads, define timeout/retry/circuit-breaker behavior, document Nominatim attribution and usage policy, and decide whether a maintained/bundled city dataset is required for beta reliability.

### P1 — Timezone input is not validated before cache/computation

The API accepts an arbitrary `tz` string. `ZoneInfo` failures are caught by a broad exception in the panchang/muhurta handlers and returned as generic 400 responses, but the value enters the cache-key path before computation and there is no explicit IANA timezone validation or coordinate/timezone consistency check.

**Required action:** validate `tz` explicitly with `ZoneInfo`, return a stable validation error, and verify or clearly define behavior when coordinates and timezone disagree. Add tests for invalid zones, DST gaps/folds, timezone-border locations, and polar locations.

### P1 — Push subscriptions are not delivered to a backend

The frontend saves the Web Push subscription only in local storage and explicitly reports that a backend VAPID registration endpoint is still needed. The UI therefore presents a subscription state without a functioning notification delivery path.

**Required action:** either remove/label the feature as experimental or implement the full flow: authenticated or abuse-resistant subscription registration, server-side storage, unsubscribe, VAPID key management, scheduled delivery, failure cleanup, consent/privacy documentation, and timezone-aware notification scheduling.

### P1 — Deployment is not independently verified

The repository contains deployment files, but there is no evidence in this checkout of a successful systemd/nginx installation, HTTPS certificate, backup/restore test, monitoring, rollback, or tailnet/live endpoint check.

**Required action:** run deployment on H Kamgar, verify it from an independent node, capture health/API responses, test restart/rollback and backup restore, and document secrets handling and a recovery objective. Treat local execution or localhost smoke tests as insufficient for a public-beta gate.

### P1 — Swiss Ephemeris licensing decision remains unresolved in the code baseline

The repository uses Swiss Ephemeris and includes the licensing question in prior project documents, but this clone does not contain the prior licensing register/findings history. The public-service release gate must not be considered clear until the selected AGPL or Professional License route, project scope, notices, and evidence are recorded in the repository.

**Recommendation:** for the planned closed-source/ad-supported/native/B2B direction, purchase and document the Professional License before public service activation. If choosing AGPL, complete the whole-project compliance, source-offer, contributor-rights, and permanent handling plan before public distribution.

### P1 — Backend dependency installation and data provenance need release evidence

The code imports Swiss Ephemeris data from `backend/data`, but the repository review needs a verified inventory of data files, versions, hashes, notices, and installation behavior. The dependency manifest does not itself establish that the required ephemeris files are present in every deployment artifact.

**Required action:** add a release check for required ephemeris files and checksums; fail startup or deployment clearly when files are missing; document source/license provenance and the exact data package used in the build.

### P2 — Cache/client freshness and version invalidation need explicit tests

The backend cache key includes date, coordinates, timezone, calendar, language, ayanamsa, and engine version, which is directionally correct. The client offline key does not include engine/names/rule versions, so an old IndexedDB result can survive a calculation-rule update.

**Required action:** include calculation/names/rules version in client cache keys or invalidate the cache on app version changes. Display date, location, timezone, tradition, calculation version, and offline freshness to users.

### P2 — Moon-phase illumination is labeled as illumination but is not physical illumination

`backend/engine/transitions.py` sets `illumination = phase / 360`. That is a normalized angular phase, not the illuminated fraction of the lunar disk. A user-facing illumination percentage should use an appropriate phase-to-fraction formula and be tested at new moon, quarter, and full moon. If the value is intentionally phase progress, rename the field to avoid misleading users.

### P2 — Frontend logo accessibility/localization is incomplete

`PanchangLogo` uses a fixed English alt text (`Panchang logo`) while the app supports ten languages. This is minor, but the logo component should either be decorative (`alt=""`) when adjacent to the app name or use a localized accessible label. The asset verification script checks file presence and config references, not rendered dimensions, SVG safety, or visual contrast.

### P2 — Ad placeholders are present before monetization/privacy readiness

`AdvertisementSlot` is currently a placeholder, which is acceptable for development. Before enabling a real ad SDK, add consent/region handling, vendor disclosure, tracking controls, layout/performance tests, and a clear non-ad experience. Do not infer that the placeholder means the monetization compliance work is complete.

## Positive changes in the latest history

- Root repository is now cloned from GitHub with a tracked `main` branch and remote.
- Transition-aware panchang metadata and tests were added.
- Location search/reverse geocoding and timezone derivation were added with input bounds.
- Frontend navigation, language labels, location editing, timing display, and branding received focused tests and visual updates.
- Static asset verification runs as a `prebuild` step.
- Backend cache keys include engine/ayanamsa parameters.
- The code communicates calculated-timing limitations for muhurta rather than claiming religious authority.

## Verification order for H Kamgar

1. Repair Git metadata permissions and confirm a successful fetch from `origin/main`.
2. Restore/create `frontend/package-lock.json` and pin backend dependencies.
3. Install from clean environments and run all backend/frontend tests, build, and lint commands.
4. Add/execute timezone, geocoder abuse, missing-ephemeris, cache-invalidation, and push-flow tests.
5. Complete Swiss Ephemeris licensing documentation and repository notices before public service activation.
6. Deploy on H Kamgar with HTTPS, secrets, backup/restore, monitoring, and rollback evidence.
7. Verify from an independent node using health, panchang, festival, muhurta, geocode, reverse-geocode, and invalid-input requests.
8. Run a private beta with one supported school and a verified language set; measure reliability, activation, retention, and correction reports.

## Current status

- Repository freshness: **baseline cloned; fetch/pull metadata write blocked**.
- Working tree: **clean at reviewed ref**.
- Backend tests: **not independently run in this environment**.
- Frontend tests/build: **not independently run; dependencies/lockfile unavailable**.
- Security posture: **no obvious hard-coded secrets found in the scan; public geocoder and dependency reproducibility require work**.
- Public beta: **not cleared**.
