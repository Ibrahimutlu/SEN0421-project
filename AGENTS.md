# SDS-09 çalışma kuralları

- Kullanıcı Türkçe, kısa ve somut iletişim istiyor. Slogan, dolgu cümle, gereksiz kod yorumu yazma.
- Ana çalışma alanı bu klasördür. Üst klasördeki sources/ ve masaüstündeki Yönerge.txt salt okunur referanstır.
- Her günlük çalışmada önce docs/progress.json, docs/ROADMAP.md ve docs/DAILY_LOG.md dosyalarını oku. Kullanıcının değişikliklerini koru.
- Sıradaki tamamlanmamış aşamayı uygula. Başarısız önceki aşamayı onarmadan sonraki aşamaya geçme. Her yerel günde en fazla bir yeni aşama tamamla; aynı gün yeniden tetiklenirse sadece yarım işi onar.
- Bir aşamayı ancak kabul koşulları sağlanıp ilgili kontroller geçtikten sonra completed yap. Sonuçları, değişen dosyaları ve sonraki işi günlüğe kaydet. Yapılmayan işi yapılmış gösterme.
- En az npm.cmd run verify çalıştır. Arayüz değiştiyse npm.cmd run test:ui da çalıştır; ekran görüntülerini incele. Test başarısızsa önce düzelt.
- Yerel bir yazılım projesidir. Harici site yayınlama, ücretli servis açma veya başka sitelerde değişiklik yapma kapsamda değildir.
- Otomatik iyileştirme yerel kopya/patch üretir; önce-sonra farkı ve yeniden tarama gerekir. Belirsiz anlamsal kararları (görsel açıklaması gibi) kendiliğinden uydurma.
- WCAG 2.1 AA ana hedeftir. WCAG 2.0 A/AA kuralları bu taramaya dahildir. ISO sürümlerini WCAG 2.1 ile eşitleme; docs/SCOPE.md içindeki kaynakları esas al.
- Sıfır otomatik bulgu tam uygunluk anlamına gelmez. incomplete sonuçlarını koru; elle klavye ve ekran okuyucu testlerini tamamlandı sayma.
- İnternet adresi taraması eklenmeden önce SSRF, yönlendirme ve alt kaynak istekleri için özel IP/DNS, zaman ve kaynak sınırları uygula; olumsuz testleri ekle.
- Bağımlılık sürümlerini package-lock.json ile sabitle. Sırf yeni sürüm var diye paketleri güncelleme.
- Günlük rapor: tamamlanan iş, test sonucu, varsa engel ve sonraki aşama. İlerleme yoksa aynı durumu tekrar tekrar bildirme.
