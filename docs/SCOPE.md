# Kapsam ve kararlar

## Kaynak

Yönerge konusu SDS-09: erişilebilirlik denetim ve otomatik iyileştirme platformu. Kontrast, ekran okuyucu uyumluluğu ve klavye navigasyonu eksiklerini raporlama amaçlanıyor. Çıktılar başlığının altı boş bırakılmış; aşağıdaki kapsam bu proje için oluşturulmuştur.

## Hedef

Tek sayfalık web denetimiyle başlayıp sınırlı site taramasına ilerlemek. WCAG 2.1 A/AA kural eşlemesi, önem derecesi, seçici, HTML kanıtı, elle kontrol listesi, rapor geçmişi, dışa aktarım ve doğrulanmış yerel düzeltme örnekleri.

Otomatik tarama tam uygunluk veya hukuki sertifika üretmez. Gerçek NVDA/VoiceOver testleri insan doğrulaması gerektirir; araç yalnızca kontrol listesi ve kanıt kaydı sağlar.

## Standart ayrımı

- Ana kapsam WCAG 2.1 AA: https://www.w3.org/TR/WCAG21/
- ISO/IEC 40500:2012, WCAG 2.0'ı esas alır: https://www.iso.org/standard/58625.html
- ISO/IEC 40500:2025, WCAG 2.2'yi esas alır: https://www.w3.org/news/2025/web-content-accessibility-guidelines-wcag-2-2-approved-as-iso-iec-international-standard/
- Yönergede yan yana yazılan WCAG 2.1 ve ISO/IEC 40500 tek sürüm gibi raporlanmayacak. ISO 2025/WCAG 2.2 genişletmesi çekirdek kapsam tamamlandıktan sonra ayrı karardır.

## Teknoloji

Node.js 22+, TypeScript, Express, Playwright Chromium, axe-core. İlk arayüz semantik HTML/CSS/JavaScript; ihtiyaç doğmadan ek çatı yok. Sürümler kilit dosyasında. İlk aşama verileri JSON dosyalarında; tarama geçmişi 4. aşamada SQLite'a geçer. Bir Node süreci, bir yerel HTTP adresi. Docker ve bulut hesabı gerektirmez.

axe-core otomatik kontrolleri ve incomplete ayrımı: https://github.com/dequelabs/axe-core
Tarayıcı kurulumu: https://playwright.dev/docs/browsers

## İlk aşamanın sınırı

API yalnızca iki sabit örneği tarar. Kullanıcı HTML'i veya URL'si almaz. Test örneklerinde ağ istekleri engellenir. Uygulama yalnızca 127.0.0.1 üzerinde dinler. URL taraması, güvenlik sınırlarıyla birlikte ikinci aşamanın işidir.

## Teslim ölçütü

Kurulabilir proje, doğrulanmış URL taraması, kalıcı raporlar, kontrast/ARIA/klavye kanıtları, önce-sonra yerel düzeltme örnekleri, dışa aktarma, test sonuçları, kullanım kılavuzu ve ders raporu taslağı. Tamamlanmamış insan testleri açıkça işaretlenir.
