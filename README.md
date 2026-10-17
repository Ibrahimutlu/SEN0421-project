# SDS-09 Accessibility Audit and Remediation Platform

Course: SEN0421. Primary target: WCAG 2.1 Level AA, including Level A.

## Start

Open Start.cmd, then visit http://127.0.0.1:4210.

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd start
```

Requires Node.js 24.12 or newer. Chromium is downloaded during setup. No API key or cloud account is required. The server listens only on 127.0.0.1. PORT can override 4210. SDS09_DB_PATH can override data/scans.sqlite.

## Implemented through stage 5

- Public HTTP/HTTPS page audits with validated and pinned destination IPs, redirect checks and restricted resource loading.
- Three controlled fixtures: known issues, a corrected page and contrast boundary cases.
- Violation and needs-review findings; impact, rule/criterion and element filters; WCAG links and HTML evidence.
- SQLite history that persists across restarts, paginated listing and saved report retrieval.
- Contrast samples with colors, exact ratios, normal/large text thresholds and uncertain-background review states.
- English interface, documentation and reports; JSON audit download.

URL mode renders static HTML/CSS. Site scripts, frames, service workers and signed-in states are excluded. A blocked resource is recorded and the result is labeled partial. Complex color effects require manual review. Automated results do not establish full WCAG conformance.

## Verify

```powershell
npm.cmd run verify
npm.cmd run test:ui
npm.cmd run demo
npm.cmd run progress
node.exe --import tsx scripts/verify-public-url.ts
```

The last command performs an optional live scan of example.com. Core tests use controlled transport fixtures. UI checks cover filters, history, export, contrast, keyboard entry and desktop/mobile accessibility.

## API

| Method and path | Behavior |
| --- | --- |
| GET /api/health | Application and schema status |
| GET /api/progress | Stage tracking |
| POST /api/scans | Scan {"url":"https://example.com"}; returns 201 and a stored report |
| POST /api/scans/demo | Scan {"example":"issues"}, "accessible" or "contrast" |
| GET /api/scans?limit=20&offset=0 | Paginated history; limit 1 to 100 |
| GET /api/scans/:id | Saved report or 404 |

One scan runs at a time; concurrent requests return 429. Only ports 80/443 are supported. Limits: 4 redirects per resource, 40 total requests, 2 MiB per response, 10 MiB total, 6-second resource inactivity timeout, 30-second scan deadline. Local, private, reserved and mixed public/private DNS results are rejected. Requests connect to validated IPs while preserving the HTTP Host and TLS server name. No remote credentials or cookies are forwarded.

## Project records

- docs/ROADMAP.md: stages and acceptance criteria.
- docs/progress.json: machine-readable completion state.
- docs/DAILY_LOG.md: completed work and verification evidence.
- docs/SCOPE.md: scope and standards mapping.
- docs/team.json: team roster and proposed responsibility allocation.
- docs/assessment-ledger.json: simulated assessment history and balancing state.
- reports/: English course progress reports.
- artifacts/: generated scan evidence and screenshots, excluded from Git.
- data/: local SQLite history, excluded from Git.

Daily development continues at 10:00 Europe/Istanbul in this chat. The machine and desktop app must be running. On scheduled runs one stage is completed only after checks pass. Explicit user requests may accelerate the plan.

The original project brief is C:\Users\ibrah\Desktop\Yönerge.txt and was not changed. Its deliverables section is blank; the roadmap defines the implementation scope used here.
