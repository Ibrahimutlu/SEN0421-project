# Günlük çalışma talimatı

Bu proje her gün Türkiye saatiyle 10.00'da bu sohbete dönülerek geliştirilecek.

Çalışma dizini: `C:\Users\ibrah\.codex\.chatgpt-projects\g-p-6ad3b8b9dbbc81918962cf31d51b1c72\SDS-09`

1. AGENTS.md, docs/progress.json, docs/ROADMAP.md ve docs/DAILY_LOG.md dosyalarını oku; mevcut değişiklikleri incele.
2. Tarihi Europe/Istanbul'a göre belirle. lastCompletedOn bugünse yeni aşama açma. Yarım kalan bir iş varsa yalnızca onu onar.
3. İlk tamamlanmamış aşamanın kabul koşullarını uygula. Bu görev hatırlatma değildir; kodu ve ilgili belgeleri gerçekten geliştir. Önceki başarısız kontrolleri düzelt.
4. npm.cmd run verify çalıştır. Arayüz değiştiyse npm.cmd run test:ui çalıştır ve üretilen görüntüleri incele. Kabul koşuluna özgü olumsuz testleri de ekle/çalıştır.
5. Kontroller geçtiyse ilgili aşamayı completed, lastCompletedOn değerini bugünün yerel tarihi ve nextStage değerini ilk tamamlanmamış aşama olarak güncelle. Aşama başarısızsa tamamlandı işaretleme. Kullanıcı değişikliklerini ezme.
6. Günlüğe iş, değişen dosyalar, test kanıtı, engeller ve sonraki adımı yaz. Gereksiz yorum veya tanıtım metni ekleme.
7. Yalnızca anlamlı tamamlanma, hata, yeni engel veya kullanıcı girdisi gerektiğinde kısa Türkçe bildirim ver. Değişmeyen durumu tekrar bildirme.
8. Tüm aşamalar tamamlandıktan sonra kabul koşullarını kontrol et, teslim dosyalarını göster ve bu günlük otomasyonu durdur.

Kapsam: yerel proje dosyaları. sources/ ve Yönerge.txt değiştirilmez. Harici sitelerde değişiklik yapılmaz; otomatik iyileştirme yerel kopya veya patch üretir. Ücretli servis ya da yayınlama bu görevin kapsamında değildir. Ekran okuyucu ile insan testi yapılmadıysa açık iş olarak kalır.

Çalışma koşulu: bilgisayar ve masaüstü uygulaması açık; proje klasörü erişilebilir olmalı. Uygulama hesabının kullanım sınırları geçerlidir. Kaçırılan çalışmaları tamamlandı sayma.

Ürün belgesi: https://learn.chatgpt.com/docs/automations?surface=app
