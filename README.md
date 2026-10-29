# Pong Atölyesi

BİLP1117 Web Programlama I için HTML, CSS ve JavaScript ile hazırlanmış yerel Pong projesi. Amaç, zamanlama ve topun açısını kullanarak rakibinden önce hedef skora ulaşmak. Hedef kullanıcı; kısa bir oyun molası vermek, reflekslerini denemek veya aynı cihazda bir arkadaşıyla oynamak isteyen kişiler.

## Çalıştırma

1. ZIP dosyasını tamamen bir klasöre çıkar.
2. Bu klasördeki `index.html` dosyasına çift tıkla; Chrome, Edge veya Firefox ile aç.
3. Oyun modunu, zorluğu ve hedef skoru seç; **Maça başla** düğmesine bas.

İnternet, paket kurulumu, Node.js, sunucu veya hesap gerekmez. Dosyaları ZIP içinden tek tek açma; klasör yapısı birlikte korunmalıdır. İstersen VS Code Live Server ile de açabilirsin, ancak zorunlu değildir.

## GitHub Pages yayını

Proje GitHub Pages üzerinde de doğrudan statik dosyalarla yayınlanabilir. Yayın kaynağı `main` dalının kök klasörüdür. `.nojekyll` dosyası sayesinde Jekyll derlemesine gerek kalmaz. Yerel kullanım ve Pages aynı HTML, CSS ve JavaScript dosyalarını kullanır. Göreli dosya bağlantıları, projenin depo adına bağlı alt adreste açılmasını destekler.

GitHub CLI ile giriş yapılıp kaynaklar depoya gönderildikten sonra Pages kaynağı etkinleştirilir. Sonraki değişiklikler `main` dalına gönderildiğinde yayın güncellenir. `node_modules`, `.env` dosyaları ve kurulum araçları yayın kaynaklarına dahil edilmez. Giriş bilgilerini kaynak dosyalarına ekleme.

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

Kort başlığındaki **Tam ekran** düğmesi oyunu skor, güç göstergeleri ve kontrolleriyle birlikte büyütür. Tarayıcı destekliyorsa Fullscreen API kullanılır; desteklemiyorsa veya isteği reddediyorsa oyun tarayıcı penceresini kaplayan görünüme geçer. Bu durumda tarayıcının adres çubuğu kalabilir. **Küçült** düğmesi veya **Esc** ile normal görünüme dönülür.

Görünüm veya ekran yönü değişince basılı girdiler temizlenir ve aktif oyun duraklar. Skor ve etki süreleri korunur; **Oyuna dön** ile devam edilir. Geniş görünümde sayfanın dışındaki ayarlar klavye odağı alamaz. Çıkışta tekrar kullanılabilir hâle gelir.

Telefon ve tabletlerde sahada parmağını sürükleyebilir veya büyük ok butonlarına basılı tutabilirsin. İki kişilik maçta iki ayrı parmak aynı anda iki raketi yönetebilir. Parmağın kaldırılması veya dokunmanın iptal edilmesi hareketi durdurur. Yatay tam ekran görünümünde oklar kortun iki yanına taşınır; dikey görünüm de desteklenir. Daha geniş kort için telefonu yatay çevirebilirsin. Çentik ve ekran kenarı boşlukları CSS safe-area değerleriyle korunur. Canvas çözünürlüğü ekran yoğunluğuna göre, en fazla 2 kat olacak şekilde ayarlanır.

## Zorluk seviyeleri

Kolay, Normal ve Zor seviyeleri farklı hareket hızı, tepki süresi ve hedef hatası kullanır. **İmkânsız** seviyesinde başlangıç top hızı 620 piksel/saniyedir. Bilgisayar 980 piksel/saniye hızla hareket eder, 0.012 saniyelik tepki aralığı ve sıfır hedef hatası kullanır. Topun kendi tarafına geliş noktasını duvar sekmelerini de hesaplayarak öngörür. Çoklu topta en erken gelecek topa öncelik verir. Bu ad çok yüksek zorluğu ifade eder; bilgisayar ışınlanmaz, güç etkilerine ve saha sınırlarına uyar, mutlak yenilmezlik garantisi yoktur. İki kişilik modda zorluk seçimi kullanılmaz.

## Özel güçler

Maçtan önce **Özel güçler** anahtarını açabilir veya klasik Pong için kapatabilirsin. Açıkken ilk güç yaklaşık 2 saniye sonra, diğerleri 4–6 saniye arayla sahanın rastgele yerlerinde çıkar. Aynı anda en fazla iki simge görünür; toplanmayan simge 12 saniye sonra kaybolur. Simgeye top değdiğinde etkiyi **o topa son vuran oyuncu** kazanır. Raket teması olmadan servis topu güç toplayamaz.

| Simge | Güç | Etki |
| --- | --- | --- |
| » | Turbo top | Tüm toplar 6 saniye boyunca %35 hızlanır; turbo sınırı 1100 piksel/saniye |
| − | Rakibi küçült | Rakibin raket boyu 8 saniye boyunca normalin %62'si |
| + | Raketi büyüt | Kendi raket boyun 8 saniye boyunca normalin %160'ı |
| ↑ | Hızlı raket | Kendi raketin 8 saniye boyunca %50 hızlı hareket eder |
| ↓ | Rakibi yavaşlat | Rakibin raketi 8 saniye boyunca normal hızın %60'ıyla hareket eder |
| ×3 | Çoklu top | Farklı açılarda en fazla üç top; ilk kaçan top tek sayı verir |

Kalan süreler sahanın altındaki etki etiketlerinde görünür. Boyut ve hız etkisi birlikte çalışabilir. Aynı etki tekrar alınınca katlanmaz, süresi yenilenir. Aynı rakette büyütme/küçültme veya hızlandırma/yavaşlatma birbirinin yerini alır. Her sayıda, maç sonunda veya yeni maçta bütün etkiler ve ek toplar temizlenir. Duraklatma güç sürelerini de dondurur. Bilgisayar da güç kazanabilir; çoklu topta kendisine en erken ulaşacak topu takip eder.

## Koyu tema

Sağ üstteki **Koyu tema / Açık tema** düğmesi görünümü değiştirir. İlk açılışta sistem tercihi kullanılır; kendi seçimin tarayıcı depolamasına kaydedilir ve sonraki açılışta korunur. Kayıt engelliyse tema yine oturum içinde değişir. Tema değişikliği maçı veya skoru sıfırlamaz.

## Dosya düzeni

```text
pong/
  index.html                 Sayfa, ayarlar ve kontroller
  css/style.css              Görünüm, ekran uyumu ve odak stilleri
  js/engine.js               Hareket, yapay rakip, çarpışma ve skor
  js/app.js                  Kullanıcı olayları, Canvas çizimi, ses ve DOM
  js/theme.js                Sistem tercihi, tema düğmesi ve yerel kayıt
  js/display.js              Tam ekran, geniş görünüm ve saha boyutlandırma
  assets/favicon.svg         Proje için çizilmiş yerel simge
  docs/SUNUM_REHBERI.md       Demo akışı ve kod anlatımı
  docs/YONERGE_UYUMU.md       Yönergedeki koşulların karşılıkları
  tests/engine.test.cjs       İsteğe bağlı geliştirici testleri
  tests/ui.test.cjs           DOM ortamında arayüz akış testleri
  eslint.config.mjs          ESLint hata denetimi kuralları
  package.json               Geliştirme komutları
  package-lock.json          Sabit geliştirme bağımlılıkları
  scripts/package.cmd        node_modules içermeyen teslim ZIP'i üretir
  README.md                  Çalıştırma açıklaması
```

## Teknik yapı

HTML ve CSS arayüzü oluşturur. Canvas 2D API oyun sahasını çizer. `Pong.Engine` oyun verilerini ve kurallarını yönetir. `app.js`, DOM olaylarını bu motora aktarır ve sonucu ekrana çizer. `requestAnimationFrame` her ekranda yenilemede çağrılır; hareket piksel/saniye ve geçen zamanla hesaplanır. Motor bir kareyi küçük zaman adımlarına böler, böylece hızlı top raketin içinden geçmez.

Üç boyutlu sahne gerekmediği için Three.js kullanılmadı. Framework, CDN, uzak font veya dış görsel kullanılmadı. Görsel saha ve simge bu proje için kodla çizildi. Bu yapı kaynakları ZIP içinde tutmayı ve çevrimdışı sunumu kolaylaştırır.

## Doğrulama

Oyun motorundaki 36 davranış testi ve gerçek uygulama betiklerini DOM ortamında çalıştıran 21 arayüz testi geçti. Mevcut oyun kurallarına ek olarak İmkânsız rakibin sekme hesabı, tam ekrana giriş/çıkış ve reddedilen istek, mobilde boyutlandırma, iki parmakla kontrol ve dokunma iptali denetlendi. ESLint denetimi sıfır hata ve sıfır uyarıyla geçti. JavaScript sözdizimi ve yerel dosya bağlantıları da denetlendi.

Node.js 24 veya üzeri ve npm bulunan geliştirme bilgisayarında tüm denetimleri tekrar çalıştırmak için proje klasöründe:

```text
npm ci
npm run lint
npm test
```

ESLint, önerilen JavaScript kurallarına ek olarak tanımsız/kullanılmayan değişkenleri ve kesin eşitlik kullanımını denetler. Yapılandırma `eslint.config.mjs` dosyasındadır. Oyun dosyaları tarayıcı, testler Node.js ortamı olarak denetlenir. ESLint yapılandırması için [resmi belgeler](https://eslint.org/docs/latest/use/configure/configuration-files) temel alınmıştır.

Node.js ve npm yalnız geliştirme denetimleri içindir; oyunu açmak için gerekmez. `npm ci` ilk kurulumda internet ister; oyun harici paketleri tarayıcıda yüklemez. Tarayıcı erişim servisi bu ortamda kullanılamadı. DOM testleri görsel yerleşimi, gerçek tarayıcı girdisini veya duyulan sesi doğrulamaz; bu kontrolleri teslimden önce kendi bilgisayarında yap.

Kaynakları değiştirince Windows'ta `scripts/package.cmd` dosyasına çift tıklayarak teslim ZIP'ini yeniden oluşturabilirsin. Windows'un yerleşik `tar.exe` aracı kullanılır. Betik `node_modules` ve geliştirme önbelleklerini ZIP'e almaz. Çıktı, proje klasörünün üstünde `BILP1117_Pong_Atolyesi.zip` olarak oluşur. İstersen yalnız proje kaynak dosyalarını Windows Dosya Gezgini ile de ZIP'e alabilirsin.

## Teslimden önce

- `index.html` dosyasını kendi sunum bilgisayarında aç; tek oyunculu kısa bir maç bitir.
- İki oyunculu modu seç; W/S ve ok tuşlarıyla iki raketi dene.
- Duraklat, devam et, Yeni maç onayla ve vazgeç akışlarını dene.
- Seviye ve hedef skoru değiştir; ses düğmesini dene.
- Özel güçler açıkken bir simge topla; süreyi, raket etkisini ve üç topta ilk kaçanın tek sayı verdiğini göster.
- Açık/koyu temayı değiştir; sayfayı yenileyince tercihin korunduğunu kontrol et.
- Tarayıcıyı daralt; küçük ekranda okunabilirliği kontrol et.
- Tam ekranı aç/kapat; telefonda dikey/yatay görünümü ve iki parmakla kontrolü dene.
- İmkânsız seviyesini seç; rakibin duvar sekmelerinden sonra topun geliş noktasına yöneldiğini göster.
- `docs/SUNUM_REHBERI.md` içindeki kişisel katkı sorularını kendi deneyimlerinle yanıtla. Bir değişiklik yaptıysan ZIP'i o son sürümden tekrar oluştur.
- Yönergeye göre son tarih **28 Kasım 2026**, teslim yeri **Blackboard**, biçim **tek ZIP**. Sunumda aynı ZIP'ten çıkarılmış sürümü kullan.

Kullanılan yapay zekâ aracı bu çalışma için **OpenAI Codex**. Tasarım, kod üretimi, test ve açıklama hazırlamada kullanıldı. Öğrencinin kendi denemelerini ve katkılarını ayrıca anlatması gerekir; rehber bu deneyimlerin yaşandığını iddia etmez.
