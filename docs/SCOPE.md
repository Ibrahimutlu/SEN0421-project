# Scope and technical decisions

## Project brief

SDS-09 is an accessibility audit and automatic remediation platform for course SEN0421. The brief names contrast, screen reader compatibility and keyboard navigation. Its deliverables section is empty, so the roadmap defines the implementation scope.

## Target and standards

The primary target is WCAG 2.1 Level AA, including Level A. Automated checks include WCAG 2.0 A/AA and WCAG 2.1 A/AA tags. Each finding preserves the rule, impact, HTML evidence, selectors and applicable WCAG criteria. Incomplete checks remain separate.

- WCAG 2.1: https://www.w3.org/TR/WCAG21/
- Contrast minimum 1.4.3: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- ISO/IEC 40500:2012 adopts WCAG 2.0: https://www.iso.org/standard/58625.html
- ISO/IEC 40500:2025 adopts WCAG 2.2: https://www.w3.org/news/2025/web-content-accessibility-guidelines-wcag-2-2-approved-as-iso-iec-international-standard/

The brief places WCAG 2.1 and ISO/IEC 40500 together, but they are not identical editions. The application does not claim ISO certification or legal compliance. SDLC records organize requirements, design, implementation and verification; they do not claim certified compliance with an SDLC process standard.

## Architecture

English HTML/CSS/JavaScript interface -> Express API -> Playwright/axe-core and contrast sampler -> SQLite report store. Node.js 24.12+, TypeScript and pinned dependencies. The built-in SQLite module is experimental in the tested Node version; data migrations are versioned and newer schemas are refused.

The URL loader resolves each destination, rejects non-public or mixed DNS answers and connects directly to an approved IP. It preserves Host and TLS server name and validates each redirect. The browser receives intercepted responses, never an unchecked network continuation. A restrictive content security policy disables site scripts, frames, workers, connections and form actions. Service workers and downloads are disabled. Only static HTML/CSS/image/font GET requests are allowed.

Limits: four redirects per resource, 40 requests, 2 MiB per response, 10 MiB total, six-second resource inactivity timeout and 30-second scan deadline. Every blocked resource is recorded. Ports are restricted to 80 and 443. The local application rejects cross-origin and unexpected Host requests. These are application-level safeguards; deployment outside localhost would require network isolation and further review.

## Contrast interpretation

Relative luminance follows WCAG: sRGB linearization with the 0.04045 boundary, then the ratio (lighter + 0.05)/(darker + 0.05). Normal text requires 4.5:1; text at least 24 CSS px or bold text at least 18.6667 CSS px requires 3:1. Decisions use unrounded ratios.

The sampler examines up to 500 visible HTML elements containing direct text. It records foreground/background colors, size, weight, ratio and threshold. Gradients, background images, transparency, blending, generated content, unsupported colors and detected overlaps are referred for review. Disabled controls are not applicable. Logo/incidental-text exceptions and actual visual composition require human judgment. SVG text and canvas text are not automatically certified. Axe findings remain authoritative automated rule results; sample statuses provide additional evidence.

## Remaining scope

Stages 6 through 14 cover accessible-name/ARIA explanations, keyboard behavior, human verification records, remediation suggestions, local patches with before/after rescans, limited crawling, report export improvements, regression packaging and course delivery. Real NVDA/VoiceOver testing is still pending. The current JSON download is a baseline, not completion of stage 12.

## References

- axe-core engine and incomplete checks: https://github.com/dequelabs/axe-core
- Browser installation: https://playwright.dev/docs/browsers
- SSRF prevention and destination binding: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- Node SQLite API: https://nodejs.org/download/release/v24.12.0/docs/api/sqlite.html
