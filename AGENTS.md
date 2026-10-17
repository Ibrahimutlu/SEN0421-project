# SDS-09 development rules

- All project content must be in English: interface, code identifiers, comments, logs, tests, documentation and reports. Preserve people's actual names and read-only source paths. The conversation with the user may remain in Turkish. Avoid slogans, filler and unnecessary code comments.
- Work in this folder. The parent sources/ folder and C:\Users\ibrah\Desktop\Yönerge.txt are read-only references.
- Read docs/progress.json, docs/ROADMAP.md and docs/DAILY_LOG.md before continuing. Preserve user changes.
- On scheduled runs, complete at most one new stage per local day. Explicit user requests may authorize several stages in one session. The user authorized stages 1 through 5 inclusive on 17 October 2026.
- Complete a stage only after its acceptance criteria and relevant tests pass. Record evidence and the next task. Repair failed checks before proceeding.
- Run npm.cmd run verify. For interface changes also run npm.cmd run test:ui and inspect its screenshots. Do not mark an unperformed human test as passed.
- This is a local application. Do not publish it, create paid services or modify external websites. Remediation produces local copies or patches with diffs and rescans.
- Target WCAG 2.1 A/AA. Preserve incomplete findings and manual checks. Zero automated findings is not a conformance certificate. Keep ISO versions distinct as described in docs/SCOPE.md.
- URL scanning must use the pinned transport for every request and redirect. Never route.continue an untrusted browser request. Keep static mode, CSP, service worker blocking, IP/DNS checks, response/request/deadline limits and negative tests.
- SQLite lives in data/ and must survive restarts. Never overwrite a newer schema or reset user history to pass tests. Tests use temporary or in-memory stores.
- Use the locked dependencies. Node.js 24.12+ is required for the tested built-in SQLite API.
- Team leader: İbrahim Mutlu, 2200005270. Member details and proposed responsibilities are in docs/team.json. Do not claim that a named member authored a change without evidence.
- When the user requests another progress report, preserve the report sequence and record its confirmed stage coverage. Include SDLC progress, standards traceability, test evidence, division of responsibilities, limitations and next work.
- The peer score ledger is illustrative, not measured performance. Always label simulated scores. Do not generate an assessment on a scheduled run unless the user requests a report. Use scripts/evaluate-team.ts; never invent observed contributions to justify scores. Maintain scores 5 through 9 and cumulative deviations within -2 through 2 from 7 per report. The final report settles all deviations so every member's final average is exactly 7. Do not silently alter earlier reports.
- Notify the user only on meaningful completion, failure, new blockers or required input. Keep updates concise.
