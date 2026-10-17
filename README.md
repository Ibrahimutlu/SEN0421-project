# SDS-09 — Erişilebilirlik Denetim ve İyileştirme Platformu

WCAG 2.1 A/AA denetimi. Ders: SEN0421.

## Çalıştırma

`Baslat.cmd` dosyasını açın. Uygulama: http://127.0.0.1:4210

Terminalden:

```powershell
npm.cmd ci
npm.cmd run setup
npm.cmd start
```

Gereken: Node.js 22 veya üzeri. Bu bilgisayarda Node.js 24.12.0 kullanıldı.
Tarayıcı ilk kurulumda indirilir. API anahtarı gerekmez.

## Bugün çalışan bölüm

- Chromium ve axe-core ile iki yerel örnek sayfanın gerçek taraması.
- Kural, önem derecesi, öğe ve WCAG etiketleri içeren sonuçlar.
- Elle incelenecek bulguların ayrı kaydı ve JSON raporu indirme.
- Günlük aşama takibi.

İnternet adresiyle tarama 2. aşamada; kalıcı kayıt, klavye analizi ve otomatik düzeltme sonraki aşamalarda.

## Kontroller

```powershell
npm.cmd run verify
npm.cmd run test:ui
npm.cmd run demo
npm.cmd run progress
```

`artifacts/demo-report.json` örnek rapordur. `test:ui` masaüstü ve telefon boyutlarında ekran görüntüleri üretir.

## Günlük çalışma

Bu sohbete bağlı otomasyon her gün Türkiye saatiyle 10.00'da sıradaki aşamayı gerçekleştirir. Çalışma dizini bu klasördür. Takvim günü geçmesi bir aşamayı tamamlanmış yapmaz; kabul koşulu ve testler geçmelidir. Bilgisayar ve masaüstü uygulaması açık olmalıdır.

- [Aşamalar ve kabul koşulları](docs/ROADMAP.md)
- [Makine tarafından okunan ilerleme](docs/progress.json)
- [Çalışma günlüğü](docs/DAILY_LOG.md)
- [Kapsam ve teknik kararlar](docs/SCOPE.md)

## Klasörler

`src/`: denetim ve sunucu. `public/`: Türkçe arayüz. `fixtures/`: kontrollü test sayfaları. `tests/`: regresyon kontrolleri. `docs/`: plan ve ilerleme. `artifacts/`: üretilen raporlar.

Kaynak yönerge: `C:\Users\ibrah\Desktop\Yönerge.txt`. Referans dosyası değiştirilmedi. Dosyanın “Elde Edilecek Kazanımlar ve Çıktılar” bölümü boş; bu plandaki aşamalar kurulum sırasında önerilen uygulama kapsamıdır.
