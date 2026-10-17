const form = document.querySelector('#scan-form');
const button = document.querySelector('#scan-button');
const status = document.querySelector('#status');
const error = document.querySelector('#error');
const results = document.querySelector('#results');
let latestReport;
let historyOffset = 0;
const labels = { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' };
const byId = id => document.getElementById(id);
function element(tag, text) { const node = document.createElement(tag); node.textContent = text; return node; }
function showError(message) { error.textContent = message; error.hidden = false; }

byId('example').addEventListener('change', () => {
  const url = byId('example').value === 'url';
  byId('url-field').hidden = !url;
  byId('url').required = url;
  byId('url').disabled = !url;
});

function renderFindings() {
  if (!latestReport) return;
  const kind = byId('kind').value, impact = byId('impact').value;
  const rule = byId('rule').value.trim().toLowerCase(), query = byId('element').value.trim().toLowerCase();
  const findings = byId('findings'); findings.replaceChildren();
  const all = [...latestReport.violations.map(item => ({ ...item, kind: 'violation' })), ...latestReport.incomplete.map(item => ({ ...item, kind: 'incomplete' }))];
  let count = 0;
  for (const finding of all) {
    if (kind !== 'all' && finding.kind !== kind) continue;
    if (impact !== 'all' && (finding.impact ?? 'unknown') !== impact) continue;
    if (rule && !`${finding.id} ${finding.help} ${finding.criteria.map(item => item.code).join(' ')}`.toLowerCase().includes(rule)) continue;
    const nodes = finding.nodes.filter(node => !query || `${node.html} ${JSON.stringify(node.target)}`.toLowerCase().includes(query));
    if (!nodes.length) continue;
    count++;
    const article = element('article', ''); article.className = 'finding';
    article.append(element('h4', finding.help));
    article.append(element('p', `${finding.kind === 'incomplete' ? 'Needs review' : 'Violation'} · ${labels[finding.impact] ?? 'Unspecified impact'} · ${finding.id} · ${nodes.length} matching elements`));
    for (const node of nodes) {
      article.append(element('code', node.html), element('p', `Selector: ${JSON.stringify(node.target)}`));
      if (node.failureSummary) article.append(element('p', node.failureSummary));
    }
    const links = element('p', '');
    const help = element('a', 'Rule guidance'); help.href = finding.helpUrl; links.append(help);
    for (const criterion of finding.criteria) { const link = element('a', `WCAG ${criterion.code}`); link.href = criterion.url; links.append(document.createTextNode(' · '), link); }
    article.append(links); findings.append(article);
  }
  byId('filtered-count').textContent = `${count} of ${all.length} finding groups shown.`;
  if (!count) findings.append(element('p', 'No findings match these filters.'));
}

function showReport(report) {
  latestReport = report;
  const summary = report.summary;
  byId('target').textContent = `${report.target} · ${new Date(report.createdAt).toLocaleString('en-GB')}`;
  byId('summary').textContent = `${summary.violationRules} rule ${summary.violationRules === 1 ? 'violation' : 'violations'} · ${summary.affectedNodes} affected ${summary.affectedNodes === 1 ? 'element' : 'elements'} · ${summary.needsReview} ${summary.needsReview === 1 ? 'rule' : 'rules'} needing review`;
  byId('coverage').textContent = `${report.scope} ${report.renderingMode ?? 'Controlled local fixture.'}${report.network?.partial ? ` Partial rendering: ${report.network.blocked.length} requests were blocked. See the JSON report for reasons.` : ''}`;
  byId('manual').replaceChildren(...report.manualChecks.map(check => element('li', check)));
  byId('kind').value = 'all'; byId('impact').value = 'all'; byId('rule').value = ''; byId('element').value = '';
  const rows = report.contrast.items.map(sample => {
    const row = document.createElement('tr');
    const description = element('td', sample.text); description.append(element('code', sample.selector));
    const colors = element('td', sample.foreground ? `rgb(${sample.foreground.join(', ')}) on rgb(${sample.background.join(', ')})` : 'Unresolved');
    const ratio = element('td', `${sample.ratio === null ? 'Unresolved' : sample.ratio.toFixed(2) + ':1'} / ${sample.requiredRatio}:1`);
    const result = element('td', sample.status.replaceAll('-', ' '));
    if (sample.reason) result.append(element('p', sample.reason));
    row.append(description, colors, ratio, result); return row;
  });
  byId('contrast-body').replaceChildren(...rows);
  byId('contrast-limit').textContent = `${report.contrast.items.length} samples. ${report.contrast.truncated ? 'The 500-sample limit was reached; remaining text needs review.' : 'Sample limit not reached.'}`;
  renderFindings(); results.hidden = false;
}

for (const id of ['kind', 'impact', 'rule', 'element']) byId(id).addEventListener('input', renderFindings);

form.addEventListener('submit', async event => {
  event.preventDefault(); button.disabled = true; error.hidden = true; results.hidden = true; latestReport = undefined;
  status.textContent = 'Auditing the page in Chromium...';
  try {
    const example = byId('example').value;
    const response = await fetch(example === 'url' ? '/api/scans' : '/api/scans/demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(example === 'url' ? { url: byId('url').value } : { example })
    });
    const report = await response.json();
    if (!response.ok) throw new Error(report.error ?? 'The scan request failed.');
    showReport(report); status.textContent = 'Audit completed and saved.'; await loadHistory(true);
  } catch (failure) { status.textContent = 'The audit could not be completed.'; showError(failure.message); }
  finally { button.disabled = false; }
});

byId('download').addEventListener('click', () => {
  if (!latestReport) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(latestReport, null, 2)], { type: 'application/json' }));
  const link = element('a', ''); link.href = url; link.download = `sds09-${latestReport.id}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

async function loadHistory(reset = false) {
  if (reset) { historyOffset = 0; byId('history').replaceChildren(); }
  try {
    const response = await fetch(`/api/scans?limit=10&offset=${historyOffset}`);
    if (!response.ok) throw new Error('History is unavailable.');
    const history = await response.json();
    for (const item of history.items) {
      const row = document.createElement('li'); const open = element('button', `${item.target} · ${item.violations} ${item.violations === 1 ? 'violation' : 'violations'}`); open.className = 'history-link';
      open.addEventListener('click', async () => {
        try {
          const response = await fetch(`/api/scans/${encodeURIComponent(item.id)}`);
          if (!response.ok) throw new Error('The saved audit could not be opened.');
          showReport(await response.json()); error.hidden = true; status.textContent = 'Saved audit loaded.';
        } catch (failure) { showError(failure.message); }
      });
      row.append(open, element('span', new Date(item.createdAt).toLocaleString('en-GB'))); byId('history').append(row);
    }
    historyOffset += history.items.length;
    byId('history-status').textContent = `${history.total} saved ${history.total === 1 ? 'audit' : 'audits'}.`;
    byId('load-history').hidden = historyOffset >= history.total;
  } catch { byId('history-status').textContent = 'History could not be loaded.'; }
}
byId('load-history').addEventListener('click', () => loadHistory());
loadHistory(true);

fetch('/api/progress').then(response => {
  if (!response.ok) throw new Error('Progress is unavailable.');
  return response.json();
}).then(progress => {
  const done = progress.stages.filter(stage => stage.status === 'completed').length;
  byId('progress-count').textContent = `${done} / ${progress.stages.length} stages completed`;
  byId('progress').max = progress.stages.length; byId('progress').value = done;
  byId('stages').replaceChildren(...progress.stages.map(stage => {
    const item = element('li', `${stage.title}${stage.status === 'completed' ? ' · Completed' : ''}`);
    item.dataset.done = String(stage.status === 'completed'); return item;
  }));
}).catch(() => { byId('progress-count').textContent = 'Progress could not be loaded.'; });
