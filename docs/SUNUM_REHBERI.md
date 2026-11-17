# Pong Atölyesi — Özellikler ve teknik işleyiş

Pong Atölyesi, refleks ve vuruş açısı seçimini tek oyunculu veya aynı cihazda iki kişilik bir maçta birleştirir. Hedef skor, rakip zorluğu ve özel güçler maç başlamadan seçilir.

## Maç akışı

Başlangıç ayarları → servis geri sayımı → ralli → sayı → yeni servis veya maç sonucu. Duraklatma, top hareketini ve güç sürelerini birlikte dondurur. Yeni maç onayı, yanlışlıkla skor kaybını önler.

Raketin orta bölgesi daha düz, kenarları daha açılı bir dönüş üretir. Her temas topu üst sınıra kadar hızlandırır. Bilgisayar rakibi zorluk seviyesine göre farklı hız ve hedefleme davranışı kullanır. İmkânsız seviyesinde duvar sekmelerini öngörür; raket boyu ve hareket hızı oyuncuyla aynıdır.

Özel güçleri, simgeye değen topa son vuran oyuncu kazanır. Boyut/hız etkileri 8, turbo 6, çoklu top 5 saniye sürer. İlk kaçan top tek sayı verir; her sayıda güçler ve ek toplar temizlenir.

## Teknoloji ve dosyalar

| Bileşen         | Görev                                                          |
| --------------- | -------------------------------------------------------------- |
| `index.html`    | Kort, skor, ayarlar ve erişilebilir kontroller                 |
| `css/style.css` | Duyarlı yerleşim, iki tema, tam ekran ve mobil görünüm         |
| `js/engine.js`  | Top fiziği, çarpışma, bilgisayar rakibi, güçler ve maç durumu  |
| `js/app.js`     | Klavye/fare/dokunma, Canvas çizimi, arayüz, ses ve yerel rekor |
| `js/theme.js`   | Sistem tercihi, tema düğmesi ve yerel tema kaydı               |
| `js/display.js` | Native veya geniş görünümle tam ekran davranışı                |
| `tests/`        | Motor ve jsdom ortamındaki arayüz testleri                     |

Canvas 2D çizimi ve Web Audio sesleri tarayıcıda oluşturulur. Uzak görsel, font, CDN veya oyun sunucusu kullanılmaz. Node.js, ESLint ve jsdom yalnızca geliştirme araçlarıdır.

## Girdi ve davranış

| Etkileşim               | Sonuç                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| Maça başla              | Ayarlar motora aktarılır, skor sıfırlanır ve geri sayım başlar.        |
| W/S, oklar veya dokunma | İlgili raket saha ve hız sınırları içinde hareket eder.                |
| Top-raket teması        | Vuruş açısı, hız ve ralli sayacı güncellenir.                          |
| Boşluk / Duraklat       | Top, servis ve güç süreleri durur veya devam eder.                     |
| Yeni maç                | Onaydan sonra skor ve güçler temizlenir, ayarlar açılır.               |
| Tema / Ses              | Maç sıfırlanmadan görünüm veya ses tercihi değişir.                    |
| Tam ekran / ekran yönü  | Yerleşim yeniden hesaplanır, aktif girdiler bırakılır ve maç duraklar. |

## Veri ve güvenlik

Tema tercihi ve ralli rekoru `localStorage` içinde bu tarayıcıda tutulur. Depolama engellendiğinde oyun kayıtsız devam eder. Arayüz metinleri DOM metin düğümleriyle oluşturulur; dinamik içerik HTML olarak yorumlanmaz. Üretim sayfasının içerik güvenliği politikası dış bağlantıları ve satır içi betikleri engeller.

## Doğrulama

`npm run lint` kod denetimini; `npm test` 40 motor ve 23 arayüz testini çalıştırır. Testler skor, çarpışma, güçler, bağımsız girdiler, tema, tam ekran ve mobil davranışları kapsar. Gerçek tarayıcıdaki cihaz uyumluluğu ayrıca değerlendirilmelidir.

Proje HTML/CSS/JavaScript tabanlı bir eğitim projesi olarak başlamış, OpenAI Codex yardımıyla geliştirilmiştir. Oyun çalışırken herhangi bir yapay zekâ servisine bağlanmaz.
