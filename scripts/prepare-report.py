from pathlib import Path
import json
root=Path('.')
team=json.loads((root/'docs/team.json').read_text(encoding='utf-8-sig'))
ledger=json.loads((root/'docs/assessment-ledger.json').read_text(encoding='utf-8-sig'))
entry=ledger['reports'][0]
roles='\n'.join(f"| {m['name']} | {m['studentId']} | {m['role']} |" for m in team['members'])
scores='\n'.join(f"| {m['name']} | {m['studentId']} | {m['score']} | {m['score']:.2f} |" for m in entry['scores'])
text='''# Accessibility Platform Progress Report

SEN0421 | Project SDS-09 | Report R01 | Stages 1 through 5

17 October 2026 | Release 0.2.0

Team leader: İbrahim Mutlu | Student ID 2200005270

## 1 Progress and stage achievement

Implementation through stage 5 is complete. The application now scans a public web page, displays and filters accessibility findings, preserves audit history in SQLite and reports contrast evidence. The interface, current documentation and report are in English. Verification passed 14 application tests and one assessment-ledger test, plus the browser interface checks described in Section 3.

The report records SDLC achievement, standards alignment and team responsibility allocation as required by the instructor.[[FN]] Five of the fourteen planned milestones are complete; milestone counts do not represent an effort-weighted project completion percentage.

| Stage | Delivered capability | Acceptance evidence |
| --- | --- | --- |
| 1 | Local development environment and fixture audit | Known fixture yields 5 violations; corrected fixture yields 0 automatic violations. |
| 2 | Public URL scan in restricted static mode | Validated IP pinning, checked redirects/resources and negative network tests pass; live example.com scan succeeds. |
| 3 | Findings interface | Rule/criterion, impact and element filters, WCAG links, HTML/selectors and needs-review separation pass browser checks. |
| 4 | Persistent scan history | SQLite migration and list/detail API work; a report survives database and API restart. |
| 5 | Contrast analysis | Ratios, colors and normal/large text thresholds are shown; uncertain backgrounds require review; boundary tests pass. |

### Current scope

The scanner audits one page of static HTML and CSS. Site scripts, frames, service workers and authenticated states are excluded. Blocked resources are disclosed as partial rendering. Automated results and contrast samples do not establish full WCAG conformance. Keyboard behavior analysis, human screen reader verification and automatic remediation remain in later stages.

<!-- pagebreak -->
## 2 SDLC progress and standards alignment

Requirements are recorded in docs/SCOPE.md and stage acceptance criteria in docs/ROADMAP.md. The first implementation uses an iterative sequence: define a bounded requirement, implement it, add relevant checks, then record evidence. The current release is a verified local prototype.

| SDLC activity | Achievement in this reporting period | Evidence |
| --- | --- | --- |
| Planning and requirements | Scope, limitations, fourteen milestones and acceptance criteria recorded. | SCOPE.md and ROADMAP.md |
| Design | Browser/API/scanner/store responsibilities separated; network policy and data schema defined. | src/app.ts, network.ts and store.ts |
| Implementation | Stages 1 to 5 delivered with English interface and documentation. | Release 0.2.0 source files |
| Verification | 15 tests, browser workflows and a live URL smoke test passed. | Section 3 and reports/evidence/ |
| Deployment and maintenance | Local startup and scheduled continuation configured; production deployment remains outside this release. | Start.cmd and AUTOMATION.md |

### Architecture and traceability

The browser sends a scan request to the Express API. The URL loader validates the target and supplies intercepted responses to Chromium. Axe-core produces rule findings; a separate sampler records contrast evidence. The API stores the resulting JSON and summary in SQLite. The interface retrieves reports through list and detail endpoints.

| Requirement or standard | Implementation and verification | Qualification |
| --- | --- | --- |
| WCAG 2.1 A and AA | axe-core uses wcag2a, wcag2aa, wcag21a and wcag21aa tags. | Only applicable automatic rules are evaluated. |
| WCAG 1.4.3 Contrast Minimum | Luminance ratios, 4.5:1 and 3:1 thresholds, exact size-boundary tests. | Complex backgrounds and semantic exceptions require review. |
| WCAG 1.1.1, 3.1.1 and 4.1.2 | Fixtures exercise missing image alternatives, page language and form/button names. | Correct meaning and screen reader experience are not inferred. |
| ISO IEC 40500 editions | 2012 maps to WCAG 2.0; 2025 maps to WCAG 2.2. | Neither edition is identical to WCAG 2.1; no ISO certification is claimed. |
| Secure URL retrieval | Public-address validation, direct IP connections and per-hop checks. | Application safeguards follow OWASP guidance; no security certification is claimed. |

<!-- pagebreak -->
## 3 Verification results

All checks below were executed on 17 October 2026 with Node.js 24.12.0, TypeScript, Playwright Chromium and axe-core. Dependency versions are fixed in package-lock.json. The built-in SQLite API is experimental in this Node version and is tracked as an operational limitation.

| Check | Result | Evidence location |
| --- | --- | --- |
| TypeScript and application tests | Passed 14 application tests with 0 failures. | npm run verify; tests/ |
| Assessment ledger invariant | Passed; scores stay 5 to 9 and final averages equalize. | tests/assessment.test.ts |
| Known and corrected fixtures | 5 known rule violations; 0 on the corrected fixture. | artifacts/demo-report.json |
| Network restrictions | Private/reserved/mixed DNS, rebinding, redirects, budgets, cancellation and deadlines checked. | tests/network.test.ts and scanner.test.ts |
| Persistence and API | Restart, pagination, detail retrieval, invalid input, Host/origin and concurrency checks pass. | tests/api.test.ts |
| Browser workflows | Filters, incomplete results, history reload and JSON download pass. | reports/evidence/ui-verification.txt |
| Interface accessibility | No automatic A/AA violations in tested desktop/mobile states; keyboard entry and 390 px overflow check pass. | scripts/verify-ui.ts and screenshots |
| Live public page | example.com returns 0 violations, 6 passed rules and 0 incomplete rules; 1 request, 577 bytes, no blocked resources. | artifacts/public-url-report.json |

The live page result is a smoke test of the public URL path. It does not validate other websites or prove that example.com fully conforms to WCAG. Browser workflow checks do not replace a full keyboard or screen reader audit.

### Contrast evidence

| Controlled case | Calculated ratio | Required ratio | Result |
| --- | --- | --- | --- |
| Black on white | 21.00 to 1 | 4.5 to 1 | Pass |
| White on white | 1.00 to 1 | 4.5 to 1 | Fail by formula |
| RGB 119 119 119 on white at 16 px | 4.48 to 1 | 4.5 to 1 | Fail |
| Same colors at 24 px | 4.48 to 1 | 3 to 1 | Pass |
| Same colors at 18.667 px bold | 4.48 to 1 | 3 to 1 | Pass |
| Gradient or translucent background | Not resolved | Context dependent | Manual review |

Decisions use the unrounded ratio. A maximum of 500 visible HTML text samples is examined per page; reaching the cap is disclosed. Disabled controls are recorded as not applicable. SVG/canvas text and complex visual composition are not automatically certified.

<!-- pagebreak -->
## 4 Team responsibilities and next work

İbrahim Mutlu is the confirmed team leader. The allocation below is proposed for team confirmation and gives each member a distinct area to maintain or review. It is not a claim that a particular member authored the implemented changes. Individual contribution records should be supported by commits, review notes or task records before submission as measured team performance.

| Member | Student ID | Proposed responsibility |
| --- | --- | --- |
__ROLES__

### Operational limits and risks

The server listens on localhost. One audit may run at a time. The loader permits public HTTP/HTTPS on ports 80/443, at most four redirects per resource, forty requests, 2 MiB per response and 10 MiB per scan. A resource has a six-second inactivity timeout and the scan has a thirty-second deadline. Cross-origin and unexpected Host requests to the local application are rejected.

Dynamic pages may be incomplete because site scripts and frames are disabled. Image/gradient/transparency cases can need human contrast review. SQLite schema version 1 is migrated transactionally, and a newer schema is refused. The next release should retain these restrictions while expanding accessibility explanations.

### Remaining milestones

Stage 6 adds accessible-name and ARIA explanations. Stage 7 adds keyboard behavior evidence. Stage 8 adds persistent human-verification records. Stages 9 and 10 add suggestions and local remediation with diffs, undo and rescans. Stage 11 adds bounded site crawling. Stage 12 expands report exports. Stages 13 and 14 cover regression packaging and the course delivery package.

Daily development remains scheduled for 10:00 Europe/Istanbul, starting from stage 6. Future progress reports and peer-assessment entries will be generated when the team leader requests them. Real screen reader verification remains not tested.

<!-- pagebreak -->
## 5 Illustrative peer assessment


| Member | Student ID | R01 score out of 9 | Current mean |
| --- | --- | --- | --- |
__SCORES__





### References

1. W3C. Web Content Accessibility Guidelines 2.1. https://www.w3.org/TR/WCAG21/
2. W3C WAI. Understanding Contrast Minimum 1.4.3. https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
3. ISO. ISO IEC 40500 2012. https://www.iso.org/standard/58625.html
4. W3C. WCAG 2.2 approved as ISO IEC 40500 2025. https://www.w3.org/news/2025/web-content-accessibility-guidelines-wcag-2-2-approved-as-iso-iec-international-standard/
5. OWASP. Server Side Request Forgery Prevention Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
6. Deque Systems. axe-core accessibility engine. https://github.com/dequelabs/axe-core
'''.replace('__ROLES__',roles).replace('__SCORES__',scores)
(root/'reports').mkdir(exist_ok=True)
(root/'reports/SDS-09_Progress_Report_R01.md').write_text(text,encoding='utf-8')
