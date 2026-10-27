# Yönerge ve projenin karşılıkları

Bu eşleştirme, kullanıcı tarafından sağlanan `BILP1117_WEBI_Proje_Yonergesi.docx` belgesinin içeriğine dayanır. Belge proje koşulları için referans alınmıştır. Aşağıdaki karşılıklar bir not garantisi değildir; özellikle kişisel katkı ve sunum öğrencinin kendi çalışmasıyla tamamlanır.

| Yönergedeki koşul | Projedeki karşılığı |
| --- | --- |
| HTML + CSS + JavaScript | `index.html`, `css/style.css`, `js/engine.js`, `js/app.js` |
| JavaScript oyunu seçeneği | Kullanıcının seçtiği Pong oyunu |
| Bireysel proje | Tek proje paketi; öğrencinin kendi katkısını sunumda açıklaması gerekir |
| Hedef kullanıcı ve fayda | Kısa oyun, refleks ve açı seçimi pratiği; aynı cihazda iki kişilik rekabet |
| Anlamlı etkileşim | Raket hareketi, topun temas noktasına göre açı, hız artışı, skor ve maç sonucu |
| Yaratıcı oyun etkileşimleri | Rastgele konumlu altı güç, topa son vuran oyuncuya etki, süreli raket değişimleri ve çoklu top |
| Kullanıcı tercihleri | Klasik/güçlü Pong seçimi, kaydedilen açık/koyu tema |
| Kod kalitesi denetimi | ESLint yapılandırması, npm lint/test komutları, 31 motor ve 11 DOM akış testi |
| Çalışan kontroller | Başlatma, duraklatma/devam, yeni maç onayı, ses, mod, zorluk ve hedef skor |
| Anlaşılır geri bildirim | Canlı skor, servis sayımı, durum metni, ralli sayacı ve sonuç katmanı |
| Okunabilir ve tutarlı arayüz | Krem zemin, yeşil saha, iki raket için ayrı renk, tutarlı kontroller |
| Ekran ve kullanım biçimine uyum | CSS medya sorguları; klavye, fare ve dokunma girdileri; görünür odak stilleri |
| Yerel çalışma | Çift tıklamayla açılan, uzak bağımlılıksız dosyalar |
| Three.js isteğe bağlı | Oyun 2D olduğu için gerek duyulmadı |
| Kamera adımları, kullanılıyorsa | Kamera veya hareket takibi kullanılmıyor |
| AI kullanımını açıklama | README ve sunum rehberinde Codex'in yaptığı işlerin belirtilmesi |
| Geliştirme sürecini anlatma | Sunum rehberinde bu oturumdaki süreç ve öğrenci için deneme soruları |
| Kod bloklarının görevlerini bilme | Motor/arayüz ayrımı, girdi → güncelleme → çizim açıklaması |
| Kullanıcı aksiyonunu koda bağlama | Sunum rehberindeki olay ve fonksiyon tablosu |
| Özgün fikir ve anlamlı katkı | Açıyla vuruş, hızlanan ralli, yerel rekor, iki kişilik mod; öğrencinin bunları denemesi ve kendi değişikliğini yapması önerilir |
| Telif ve gizlilik | Dış görsel, müzik, font veya kişisel veri toplama yok; simge ve saha kodla çizildi |
| Tek ZIP ve düzenli kaynaklar | HTML/CSS/JS, simge, açıklamalar ve testler birlikte paketlenir |
| Aynı sürümü sunma ve teslim etme | Sunumda teslim ZIP'inden çıkarılan sürümün kullanılması önerilir |

## Değerlendirmede hazırlık

Yönergedeki dağılım: UI/UX 15, etkileşim ve aksiyonlar 15, yaratıcılık 30, sunum 40 puan. Oyunun çalışmasının yanında hangi tercihi neden yaptığını göstermek gerekir. Hazır kodu okumakla yetinmeden açı mekanizmasını dene, tek ve iki kişilik akışı göster, en az bir kendi tasarım/oyun kararını gerekçelendir.

Yaratıcılık için eklenen özellikler mevcut Pong fikrinin bu projeye özgü yorumudur; Pong oyununun kendisinin yeni bir icat olduğu iddia edilmez. Kişisel katkı bölümünü yalnız gerçekten yaptığın deneme ve değişikliklerle doldur.

## Henüz öğrenci tarafından tamamlanması gerekenler

Gerçek tarayıcıda görsel ve giriş kontrolü, bireysel katkının belirlenmesi, sunum provası ve Blackboard'a yükleme. DOM testleri tarayıcıdaki görsel kontrolün yerine geçmez. Yönergede hosting veya GitHub bağlantısı zorunlu değildir. Teslim tarihi belgede 28 Kasım 2026 olarak verilmiştir.
