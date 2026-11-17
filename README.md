# Pong Atölyesi

Bilgisayara karşı veya aynı cihazda iki kişiyle oynanan, özel güçlerle zenginleştirilmiş bir Pong oyunu. Raketin temas noktasını kullanarak vuruş açısını değiştirin, ralliyi sürdürün ve hedef skora ilk ulaşan oyuncu olun.

**[Hemen oynayın → pong.emengin.dev](https://pong.emengin.dev/)**

Hesap, eklenti veya oyun kurulumu gerekmez. Dosyalar indirildikten sonra oyun çevrimdışı da çalışır.

## Oyun özellikleri

- **Tek oyuncu:** Kolay, Normal, Zor ve İmkânsız olmak üzere dört bilgisayar rakibi.
- **Yerel iki oyuncu:** Aynı klavyede veya dokunmatik ekranda karşılıklı maç.
- **Maç seçenekleri:** 5, 7 veya 11 sayılık karşılaşmalar; klasik veya özel güçlerin açık olduğu oyun.
- **Açı kontrollü vuruşlar:** Raketin ortası düz, kenarları açılı vuruş üretir. Ralli uzadıkça top hızlanır.
- **Altı özel güç:** Turbo top, raket büyütme/küçültme, raket hızlandırma/yavaşlatma ve üç toplu oyun.
- **Masaüstü ve mobil:** Klavye, fare, çoklu dokunma, portre/yatay görünüm ve tam ekran.
- **Kişisel tercihler:** Açık/koyu tema, isteğe bağlı ses ve bu cihazda saklanan en uzun ralli rekoru.
- **Güvenli duraklatma:** Sekme odağı veya ekran yönü değiştiğinde maç duraklar. Yeni maç açılırken mevcut skor için onay istenir.

## Nasıl oynanır?

Oyun modunu, zorluğu ve hedef skoru seçip **Maça başla** düğmesine basın. Topu rakibin arkasına geçiren oyuncu sayı kazanır. Hedefe ilk ulaşan maçı kazanır.

| Kontrol                               | İşlev                                    |
| ------------------------------------- | ---------------------------------------- |
| W / S                                 | Sol raket                                |
| ↑ / ↓                                 | Tek oyuncuda sol, iki oyuncuda sağ raket |
| Boşluk                                | Duraklat / devam et                      |
| Sahada fareyle sürükleme              | Raket hareketi                           |
| Dokunarak sürükleme veya ok düğmeleri | Mobil raket kontrolü                     |
| Tam ekran / Küçült                    | Kort görünümünü büyütme / küçültme       |

İki kişilik dokunmatik maçta her oyuncu sahanın kendi yarısını kullanır. İmkânsız rakip duvar sekmelerini hesaplar; raket boyu ve hareket hızı oyuncuyla aynıdır. İki oyunculu modda zorluk seçimi kullanılmaz.

### Özel güçler

Bir güç simgesine top değdiğinde, etkiyi o topa son vuran oyuncu kazanır. Kalan süreler sahanın altında görünür. **Özel güçler** anahtarı kapatılarak klasik Pong oynanabilir.

| Güç                           | Etki                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| Turbo top                     | Topları 6 saniye hızlandırır.                                  |
| Raketi büyüt / Rakibi küçült  | İlgili raketin boyunu 8 saniye değiştirir.                     |
| Hızlı raket / Rakibi yavaşlat | İlgili raketin hızını 8 saniye değiştirir.                     |
| Çoklu top                     | 5 saniyeliğine üç top oluşturur; ilk kaçan top tek sayı verir. |

Her sayıda etkiler temizlenir. Duraklatma güç sürelerini de dondurur; aynı etki yeniden alındığında süre yenilenir.

## Kullanılan teknolojiler

| Teknoloji                        | Kullanım                                                              |
| -------------------------------- | --------------------------------------------------------------------- |
| HTML5 ve Canvas 2D               | Oyun sahası, raketler, toplar ve efektlerin çizimi                    |
| CSS                              | Duyarlı yerleşim, açık/koyu tema, tam ekran ve dokunmatik kontroller  |
| JavaScript                       | Top fiziği, çarpışmalar, rakip yapay zekâsı, özel güçler ve maç akışı |
| Pointer Events ve Fullscreen API | Fare/dokunma girdisi ve desteklenen tarayıcılarda tam ekran           |
| Web Audio API                    | Dosya indirmeden üretilen oyun sesleri                                |
| localStorage                     | Yalnızca bu tarayıcıdaki tema tercihi ve en uzun ralli rekoru         |
| Node.js, ESLint ve jsdom         | Geliştirme sırasında kod denetimi ve otomatik motor/arayüz testleri   |

Oyun çalışırken üçüncü taraf JavaScript kütüphanesi, CDN, uzak font, analiz aracı veya sunucu bağlantısı kullanılmaz. Görseller kodla çizilir, sesler tarayıcıda üretilir.

## Çevrimdışı oynama

GitHub'da **Code → Download ZIP** ile dosyaları indirin, arşivin tamamını çıkarın ve `index.html` dosyasını açın. `assets`, `css` ve `js` klasörlerini aynı dizinde tutun. Oynamak için Node.js veya npm kurulumu gerekmez.

## Geliştirme ve doğrulama

Geliştirme araçları için Node.js 24 LTS önerilir:

```sh
npm ci
npm run lint
npm test
npm audit
```

Geliştirme bağımlılıkları oyunun çalışması için gerekli değildir. Oyun motoru `js/engine.js`, çizim ve maç arayüzü `js/app.js`, tema `js/theme.js`, tam ekran davranışı `js/display.js` içindedir.

## Gizlilik ve güvenlik

Oyun hesap açmaz ve oyuncu verilerini bir sunucuya göndermez. Tema ve ralli rekoru bu tarayıcıda saklanır; site verileri temizlenerek silinebilir. Yayın adresini açarken barındırma hizmeti standart bağlantı bilgilerini işleyebilir.

Güvenlik bildirimleri için [güvenlik politikasına](SECURITY.md) bakın. Bilinen bağımlılık uyarıları `npm audit` ile kontrol edilebilir; hiçbir yazılım için koşulsuz güvenlik garantisi verilmez.
