# Daily development instruction

Work daily at 10:00 Europe/Istanbul in the current chat.

Working directory: C:\Users\ibrah\.codex\.chatgpt-projects\g-p-6ad3b8b9dbbc81918962cf31d51b1c72\SDS-09

1. Read AGENTS.md, docs/progress.json, docs/ROADMAP.md and docs/DAILY_LOG.md. Review existing changes and preserve user work.
2. Use the Europe/Istanbul date. On scheduled runs complete at most one new stage per local day. If lastCompletedOn is today, repair unfinished work only. Explicit user instructions may accelerate several stages.
3. Implement the first incomplete stage. This is development work, not a reminder. Repair prior failing checks before moving forward.
4. Run npm.cmd run verify. If the interface changed, run npm.cmd run test:ui and inspect its screenshots. Add acceptance-specific negative tests where needed.
5. Mark completed only after acceptance criteria pass. Update lastCompletedOn and nextStage. Record files, results, limitations, blockers and next work in the log.
6. All project text and reports must be English. Brief user-facing conversation may remain Turkish. Avoid filler and unnecessary comments.
7. Do not create progress reports or peer assessments automatically. The user requests each report explicitly; then use docs/team.json and the existing simulated assessment ledger. Scores must be labeled illustrative, stay between 5 and 9 and settle to equal final averages using scripts/evaluate-team.ts with --final on the last report.
8. Notify only on meaningful completion, a new failure/blocker or required user input. Stay quiet when nothing actionable changes.
9. After all stages pass, review the delivery package and stop this daily automation.

The user accelerated stages 1 through 5 on 17 October 2026. Resume from progress.json rather than assuming a stage number. The original Yönerge.txt and sources/ are read-only. External website modification, publishing and paid services are outside scope. Real human screen reader tests must remain not-tested until performed.

The machine and desktop app must be running and the project folder available. Account usage limits apply. Missed runs are not completed work.

Product documentation: https://learn.chatgpt.com/docs/automations?surface=app
