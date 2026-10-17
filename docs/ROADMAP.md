# Development stages

Started 17 October 2026. Scheduled work runs daily at 10:00 Europe/Istanbul. A stage is complete only when its acceptance criteria pass. Dates do not imply completion. On 17 October the user explicitly accelerated work through stage 5 inclusive.

| Stage | Work | Acceptance criteria |
| --- | --- | --- |
| 1 | Environment and sample audit | Setup runs; five known defects are detected; corrected fixture has no automatic violations; API and interface checks pass. |
| 2 | Public URL scanning | HTTP/HTTPS single-page scan; private/reserved/mixed DNS rejection, pinned connections, checked redirects and subresources; limits, cancellation and single-scan concurrency verified. |
| 3 | Findings interface | Rule/criterion, impact and element filters; WCAG links; HTML/selectors; incomplete findings shown separately using real audit data. |
| 4 | Scan history | SQLite schema version and migration; reports survive application/store restart; pagination, detail retrieval and invalid requests tested. |
| 5 | Contrast analysis | Exact normal/large-text thresholds; colors and ratios displayed; known pairs/boundaries tested; uncertain backgrounds sent to manual review. |
| 6 | Accessible names and ARIA | English explanations for name, label, role and state problems; contextual image-alternative decisions remain manual. |
| 7 | Keyboard behavior | Focus order, visibility and possible traps reported with evidence; controlled fixtures and automation limitations documented. |
| 8 | Human verification | Keyboard/screen reader checklist, notes, evidence and not-tested/pass/fail states persist. No invented NVDA/VoiceOver passes. |
| 9 | Remediation suggestions | At least five context-specific English recommendations and code diffs; separate deterministic fixes from semantic decisions. |
| 10 | Local automatic remediation | User-selected deterministic fixes produce a local copy, diff, undo and rescan; never modify an external website. |
| 11 | Limited site crawling | Same-origin, depth/page limits, deduplication, cancellation and failure handling; retain network protection on each page. |
| 12 | Report export | JSON and printable HTML containing target, time, engine version, scope, findings, manual checks and before/after results. |
| 13 | Regression and packaging | Clean installation, failure scenarios, mobile layout, keyboard use and application's own accessibility verified. |
| 14 | Course delivery package | User guide, architecture, standards mapping, test evidence, limitations, demo and course report; acceptance review. |

Scheduled workflow: read current state -> implement the next incomplete stage -> run relevant checks -> record evidence -> update progress. A failed stage continues on the next run.
