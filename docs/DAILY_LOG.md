# Development log

## 17 October 2026 Stage 1

Completed the initial local TypeScript/Express workspace, Playwright/axe-core scanner, known-issue and corrected fixtures, JSON export and initial interface. The first verification run passed two tests. The known-issue fixture produced five rule violations; the corrected fixture produced zero automated violations. The original interface was Turkish and was replaced with English during the accelerated stage 2 to 5 work below.

## 17 October 2026 Stages 2 through 5

The user explicitly requested implementation through stage 5 inclusive, overriding the one-stage-per-day schedule for this session. The project language changed to English. Team leader confirmed as İbrahim Mutlu, student ID 2200005270.

Implemented:

- Stage 2: public HTTP/HTTPS URL scan, direct connection to validated destination IPs, checked redirects and subresources, static rendering with site scripts/frames/workers disabled, bounded requests/bytes/deadlines, cancellation and one-scan concurrency.
- Stage 3: violation/needs-review categories, rule/criterion, impact and element filters, HTML and selector evidence, WCAG links, coverage limitations and JSON download.
- Stage 4: SQLite schema version 1, transactional initial migration, index, paginated scan listing, report detail retrieval and persistent production store. Reopening the database and API preserves stored reports.
- Stage 5: WCAG luminance ratios, exact normal/large/bold thresholds, visible text samples, foreground/background evidence and manual-review states for uncertain effects. Complex samples are never shown as verified passes.
- All current interface strings, tests, launch instructions, docs and project tracking are English. Proper names and the original source path are preserved.
- Team roster and proposed responsibility allocation recorded. A simulated peer-assessment ledger was added at the user's request; it is explicitly illustrative and is not an authorship or observed-performance record.

Verification:

- npm.cmd run verify: TypeScript passed; 15 tests passed, 0 failed.
- npm.cmd run test:ui: three fixture audits, rule/impact/element filters, incomplete findings, contrast evidence, history reload, JSON download, private URL rejection, keyboard entry, desktop/mobile automated accessibility and 390 px overflow checks passed. Screenshots inspected.
- Live audit of https://example.com/: 1 request, 577 bytes, 0 rule violations, 6 passed rules, 0 incomplete rules, no blocked resources. This is a limited live smoke test, not a conformance declaration.
- Negative tests cover private/reserved and unusual IPs, mixed DNS, redirects to metadata/private hosts, DNS rebinding across hops, pinned socket behavior, byte/request/redirect limits, cancellation, deadlines, invalid API input, cross-origin/Host rejection and concurrent scans.
- Persistence tests close and reopen SQLite and the API; newer schemas are rejected without overwriting data.
- Contrast tests cover 21:1 and 1:1 pairs, #777 on white below 4.5:1, large/bold size boundaries and gradient/transparency review states.
- Simulated assessment tests verify 5-to-9 bounds and equal final averages for series of 1, 2, 3, 6, 17 and 50 reports.

Main changes: src/network.ts, src/scanner.ts, src/standards.ts, src/contrast.ts, src/contrast-samples.js, src/store.ts, src/app.ts, public/, fixtures/, tests/, scripts/, docs/ and Start.cmd. Release 0.2.0; baseline commit 4294ef0.

Remaining: stages 6 through 14. Real screen reader testing and full keyboard behavior tests have not been performed. URL scans cover static pages only. Node's built-in SQLite API is experimental in the tested Node 24.12 runtime. No external website was modified or published.

Next scheduled work: stage 6, accessible names and ARIA, 18 October 2026 at 10:00 Europe/Istanbul. The automation has been updated to preserve English project content and resume from the progress file.

Report R01 completed: five-page English PDF and editable Word report covering stages 1 through 5, SDLC evidence, standards, proposed responsibilities and clearly labeled simulated scores. The instructor requirement is a true footnote. All pages were rendered and inspected. Final evidence snapshots are preserved in reports/evidence/. A live POST /api/scans call stored an example.com report in the production SQLite database and the history endpoint returned it. Next stage remains 6.
