const form = document.querySelector('#scan-form');
const button = document.querySelector('#scan-button');
const status = document.querySelector('#status');
const error = document.querySelector('#error');
const results = document.querySelector('#results');
let latestReport;
const labels = { critical: 'Kritik', serious: 'Ciddi', moderate: 'Orta', minor: 'Düşük' };
const titles = { 'html-has-lang': 'Sayfa dili tanımlanmamış', 'image-alt': 'Görselin alternatif metni eksik', label: 'Form alanının etiketi eksik', 'button-name': 'Düğmenin erişilebilir adı eksik', 'color-contrast': 'Metin kontrastı yetersiz' };

function element(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  button.disabled = true;
  error.hidden = true;
  results.hidden = true;
  latestReport = undefined;
  status.textContent = 'Sayfa Chromium ile denetleniyor…';
  try {
    const response = await fetch('/api/scans/demo', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ example: document.querySelector('#example').value })
    });
    const report = await response.json();
    if (!response.ok) throw new Error(report.error ?? 'Tarama isteği başarısız.');
    latestReport = report;
    const summary = report.summary;
    document.querySelector('#summary').textContent = `${summary.violationRules} kural ihlali · ${summary.affectedNodes} etkilenen öğe · ${summary.needsReview} inceleme gerektiren kural`;
    const findings = document.querySelector('#findings');
    findings.replaceChildren();
    for (const finding of report.violations) {
      const article = document.createElement('article');
      article.className = 'finding';
      article.append(element('h4', titles[finding.id] ?? finding.help));
      article.append(element('p', `${labels[finding.impact] ?? 'Belirsiz'} · ${finding.id} · ${finding.nodes.length} öğe`));
      for (const node of finding.nodes) article.append(element('code', node.html));
      const link = element('a', 'Kuralın açıklaması (İngilizce)');
      link.href = finding.helpUrl;
      article.append(link);
      findings.append(article);
    }
    const manual = document.querySelector('#manual');
    manual.replaceChildren(...report.manualChecks.map(check => element('li', check)));
    status.textContent = 'Denetim tamamlandı.';
    results.hidden = false;
  } catch (failure) {
    status.textContent = 'Denetim tamamlanamadı.';
    error.textContent = failure.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
  }
});

document.querySelector('#download').addEventListener('click', () => {
  if (!latestReport) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(latestReport, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `sds09-${latestReport.id}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

fetch('/api/progress').then(response => {
  if (!response.ok) throw new Error('İlerleme bilgisi alınamadı.');
  return response.json();
}).then(progress => {
  const done = progress.stages.filter(stage => stage.status === 'completed').length;
  document.querySelector('#progress-count').textContent = `${done} / ${progress.stages.length} aşama tamamlandı`;
  document.querySelector('#progress').max = progress.stages.length;
  document.querySelector('#progress').value = done;
  document.querySelector('#stages').replaceChildren(...progress.stages.map(stage => {
    const item = element('li', `${stage.title}${stage.status === 'completed' ? ' · Tamamlandı' : ''}`);
    item.dataset.done = String(stage.status === 'completed');
    return item;
  }));
}).catch(() => { document.querySelector('#progress-count').textContent = 'İlerleme bilgisi yüklenemedi.'; });
