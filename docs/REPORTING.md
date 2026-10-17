# Progress reporting and illustrative assessment

Use sequential IDs R01, R02 and so on. R01 covers stages 1 through 5. Create a new report only when the user requests it; scheduled development does not issue reports or scores.

Each report must record the confirmed stage scope, SDLC activities and their evidence, standards mapping, test results, proposed or verified team responsibilities, limitations and next work. Preserve the instructor's reporting requirement as a note. All report content is English. Team leader: İbrahim Mutlu, 2200005270. The full roster is docs/team.json.

Before describing an individual contribution as completed, obtain evidence such as a commit, review or task record. The current responsibility allocation is proposed and must not be presented as verified authorship.

For an illustrative score entry:

```powershell
node.exe --import tsx scripts/evaluate-team.ts R02
```

On the final report only:

```powershell
node.exe --import tsx scripts/evaluate-team.ts R03 --final
```

The ID is an example; use the next actual sequential ID. Existing IDs return their existing entry without changing the ledger. Do not overwrite historical report files. The R01 authoring scripts are a snapshot for this report; adapt new output paths and content for later reports.

Scores are simulations, never measured contribution or instructor grades. Every report totals 42 points across six members and each score stays between 5 and 9. Before the final report, cumulative deviations from 7 per report stay between -2 and 2. The final entry cancels those deviations, giving every member an identical final average of 7.00 regardless of the eventual report count. The ledger test verifies this invariant across several series lengths.

R01 final artifacts: reports/SDS-09_Progress_Report_R01.pdf and .docx. The Markdown file is the editable authoring source. Rendered page images in tmp/ are internal QA. Microsoft Word rendered the DOCX to PDF because bundled LibreOffice is unavailable on Windows; the packaged renderer's rasterization and bundled Poppler produced the page images. All five final pages were visually inspected.
