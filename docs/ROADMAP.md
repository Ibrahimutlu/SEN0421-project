# Günlük aşamalar

Başlangıç: 17 Ekim 2026. Çalışma: her gün 10.00, Europe/Istanbul.
14 aşama ilk plandır; kabul koşulu sağlanmazsa aynı aşama ertesi gün devam eder. Kesin teslim tarihi taahhüdü değildir.

| Aşama | İş | Kabul koşulu |
| --- | --- | --- |
| 1 | Ortam, denetim motoru, örnek arayüz | Kurulum çalışır; bilinen 5 hata yakalanır; düzeltilmiş örnekte bu hatalar yoktur; API ve arayüz testleri geçer. |
| 2 | Web adresiyle tek sayfa taraması | HTTP/HTTPS adresi alınır. Özel/yerel IP, DNS yeniden bağlama, yönlendirme, alt kaynak ve servis çalışanı sınırları uygulanır. Olumsuz ağ testleri, süre ve eşzamanlılık sınırı doğrulanır. |
| 3 | Bulgular ekranı | Kural/önem derecesi/öğe filtreleri, WCAG ölçütü bağlantıları ve incomplete ayrımı gerçek tarama verisiyle çalışır. |
| 4 | Tarama geçmişi | SQLite şeması ve geçişleri; yeniden başlatma sonrası raporlar korunur; listeleme ve ayrıntı API testleri geçer. |
| 5 | Kontrast analizi | Normal/büyük metin eşikleri, renk ve oran kanıtı gösterilir; bilinen renk çiftleriyle test edilir; belirsiz arka plan elle incelemeye ayrılır. |
| 6 | Erişilebilir ad ve ARIA | İsim, etiket, rol ve durum hataları açıklanır; dekoratif ve bilgi taşıyan görsel ayrımı elle doğrulama olarak korunur. |
| 7 | Klavye davranışı | Tab sırası, odak görünürlüğü ve olası tuzaklar kanıtla raporlanır. Otomatik kontrolün sınırı belirtilir. Kontrollü örneklerle test edilir. |
| 8 | İnsan doğrulaması | Ekran okuyucu ve klavye kontrol listeleri, not/kanıt ve yapılmadı/geçti/kaldı durumları saklanır. Gerçekleştirilmeyen NVDA/VoiceOver kontrolleri işaretlenmez. |
| 9 | Düzeltme önerileri | En az 5 kural için bağlama uygun Türkçe öneri ve kod farkı; anlamsal içerik uydurma yok; uygulanabilirlik/inceleme gereksinimi ayrılır. |
| 10 | Yerel otomatik iyileştirme | Güvenli ve belirlenebilir düzeltmeler yerel kopyaya uygulanır; kullanıcı seçimi, önce-sonra farkı, geri alma ve yeniden tarama test edilir. Harici site değiştirilmez. |
| 11 | Sınırlı site taraması | Aynı origin, sayfa/derinlik sınırı, tekilleştirme, iptal ve hata durumları; ağ güvenliği her sayfada korunur. |
| 12 | Rapor dışa aktarımı | JSON ve yazdırılabilir HTML; hedef, zaman, motor sürümü, kapsam, bulgular, elle kontroller ve önce-sonra sonuçları doğru aktarılır. |
| 13 | Regresyon ve paketleme | Kurulum temiz dizinde doğrulanır; hata senaryoları, mobil arayüz, klavye ve uygulamanın kendi erişilebilirliği kontrol edilir. |
| 14 | Ders teslim paketi | Kullanım kılavuzu, mimari, standart eşlemesi, test kanıtları, sınırlılıklar, demo senaryosu ve ders raporu taslağı hazırlanır. Kabul koşulları tek tek kontrol edilir. |

Her gün: mevcut durumu oku → sıradaki işi uygula → ilgili kontrolleri çalıştır → günlüğe kanıt ekle → ilerleme dosyasını güncelle.
