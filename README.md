# Pong Atölyesi

BİLP1117 Web Programlama I için HTML, CSS ve JavaScript ile hazırlanmış yerel Pong projesi. Zamanlamanı ve vuruş açını kullanarak rakibinden önce hedef skora ulaş. Bilgisayara karşı pratik yap veya aynı cihazda bir arkadaşınla oyna.

**[Oyunu aç → pong.emengin.dev](https://pong.emengin.dev/)**

## Nasıl oynanır

| İşlem | Kontrol |
| --- | --- |
| Tek oyuncuda sol raket | W / S veya yukarı / aşağı ok |
| İki oyuncuda sol raket | W / S |
| İki oyuncuda sağ raket | Yukarı / aşağı ok |
| Duraklat ve devam et | Boşluk veya Duraklat düğmesi |
| Dokunmatik kontrol | Sahada sürükleme veya alttaki oklar |
| Fareyle kontrol | Sahaya basılı tutarak sürükleme |
| Ses | Sağ üstteki Ses düğmesi |
| Açık / koyu tema | Sağ üstteki tema düğmesi |
| Tam ekran | Kort başlığındaki Tam ekran / Küçült düğmesi; çıkış için Esc de kullanılabilir |

İki kişilik dokunmatik oyunda her oyuncu sahanın kendi yarısına dokunur; aynı anda iki parmak kullanılabilir. İki kişilik klavye oyununda bazı klavyelerin eşzamanlı tuş algılama sınırı olabilir; gerekirse fare/dokunmatik kontrol kullanılabilir.

İlk 5, 7 veya 11 sayıya ulaşan kazanır. Top rakibin arkasından çıktığında sayı alırsın. Raketin ortası düz, kenarları açılı vuruş üretir. Her raket temasında top biraz hızlanır; üst sınır vardır. Sayıdan sonra raketler ortalanır, kısa servis beklemesi olur. Oyun sırasında ayarlar kilitlenir; **Yeni maç** ile sıfırlamayı onaylayıp ayarları değiştirebilirsin. Sekme veya pencere odağı kaybolursa oyun duraklar.

Sesler Web Audio API ile üretilir; ses dosyası indirilmez. En uzun ralli, tarayıcı izin verirse `localStorage` içinde bu cihazda saklanır. Depolama engellense de oyun çalışır. Bu rekor farklı tarayıcılarda veya dosya konumlarında paylaşılmayabilir.

## Tam ekran ve mobil kullanım

Kort başlığındaki **Tam ekran** düğmesi oyunu skor, güç göstergeleri ve kontrolleriyle birlikte büyütür. **Küçült** düğmesi veya **Esc** ile normal görünüme dönülür. Tam ekranı desteklemeyen tarayıcılarda oyun pencereyi kaplayan bir görünümde açılır.

Görünüm veya ekran yönü değişince oyun duraklar. Skor ve aktif güçlerin süreleri korunur; **Oyuna dön** ile devam edilir.

Telefon ve tabletlerde sahada parmağını sürükleyebilir veya büyük ok butonlarına basılı tutabilirsin. İki kişilik maçta iki parmakla iki raket aynı anda kontrol edilebilir. Yatay tam ekran görünümünde oklar kortun iki yanına taşınır. Dikey görünümde de oynanabilir; daha geniş bir kort için telefonu yatay çevirebilirsin.

## Zorluk seviyeleri

| Seviye | Rakip |
| --- | --- |
| Kolay | Daha sakin tempo ve daha fazla hata yapan bir rakip. |
| Normal | Dengeli hız ve tepki süresi. |
| Zor | Daha hızlı top ve daha çevik bir rakip. |
| İmkânsız | Duvar sekmelerini hesaplayan, çok hızlı tepki veren bir rakip. |

İmkânsız rakip, çoklu topta kendisine en erken ulaşacak topa öncelik verir. Güç etkilerine ve saha sınırlarına uyar. İki kişilik modda zorluk seçimi kullanılmaz.

## Özel güçler

Maçtan önce **Özel güçler** anahtarını açabilir veya klasik Pong için kapatabilirsin. Açıkken ilk güç yaklaşık 2 saniye sonra, diğerleri 4–6 saniye arayla sahanın rastgele yerlerinde çıkar. Aynı anda en fazla iki simge görünür; toplanmayan simge 12 saniye sonra kaybolur. Simgeye top değdiğinde etkiyi **o topa son vuran oyuncu** kazanır. Raket teması olmadan servis topu güç toplayamaz.

| Simge | Güç | Etki |
| --- | --- | --- |
| » | Turbo top | Tüm topları 6 saniye boyunca hızlandırır. |
| − | Rakibi küçült | Rakibin raketini 8 saniye boyunca küçültür. |
| + | Raketi büyüt | Kendi raketini 8 saniye boyunca büyütür. |
| ↑ | Hızlı raket | Kendi raketini 8 saniye boyunca hızlandırır. |
| ↓ | Rakibi yavaşlat | Rakibin raketini 8 saniye boyunca yavaşlatır. |
| ×3 | Çoklu top | Farklı açılarda üç top oluşturur; ilk kaçan top tek sayı verir. |

Kalan süreler sahanın altındaki etiketlerde görünür. Boyut ve hız etkisi birlikte çalışabilir. Aynı etki tekrar alınınca katlanmaz, süresi yenilenir. Aynı rakette büyütme/küçültme veya hızlandırma/yavaşlatma birbirinin yerini alır. Her sayıda, maç sonunda veya yeni maçta etkiler ve ek toplar temizlenir. Duraklatma güç sürelerini de dondurur. Bilgisayar da güç kazanabilir.

## Açık ve koyu tema

Sağ üstteki **Koyu tema / Açık tema** düğmesi görünümü değiştirir. İlk açılışta sistem tercihi kullanılır; kendi seçimin tarayıcıda kaydedilir ve sonraki açılışta korunur. Tema değişikliği maçı veya skoru sıfırlamaz.

## Bilgisayarda çalıştırma

1. Proje dosyalarını bir klasöre çıkar.
2. `index.html` dosyasını tarayıcıda aç.
3. Oyun modunu, zorluğu ve hedef skoru seç; **Maça başla** düğmesine bas.

Oynamak için internet bağlantısı, kurulum veya hesap gerekmez. Dosyaları aynı klasör yapısında tutman yeterli.
