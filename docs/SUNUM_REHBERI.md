# Pong Atölyesi sunum rehberi

Bu metin çalışan oyunu anlatmak için bir hazırlık rehberidir. Kendi yaptığın değişiklikleri, denemeleri ve öğrendiklerini ekle. Yaşamadığın bir sorunu yaşanmış gibi anlatma. Kodları ezberlemek yerine aşağıdaki akışı ekranda gösterebilmen amaçlanır.

## 1 Fikir ve amaç

Pong, iki raketin topu karşılıklı çevirdiği basit bir oyundur. Bu projede oyuncu, raketin temas noktasını değiştirerek topun açısını kontrol eder. Tek oyuncuda refleks pratiği, iki oyuncuda aynı cihazda rekabet sunar. Hedef kullanıcı kısa ve anlaşılır bir oyun deneyimi isteyen kişilerdir.

Önerilen giriş: “HTML, CSS ve JavaScript kullanarak Pong Atölyesi'ni geliştirdim. Topun yönünü yalnızca geri çevirmek yerine vuruş noktasına bağlı olarak değiştirdim. Ralli uzadıkça top hızlanıyor; böylece oyuncu hem zamanlama hem açı seçimi yapıyor.” Bu cümleyi kendi katkını doğru ifade edecek şekilde uyarlamalısın.

## 2 Canlı demo

1. Teslim edeceğin ZIP'ten çıkarılmış `index.html` dosyasını aç. İnternete ihtiyaç olmadığını göster.
2. Tek oyuncu, Normal ve 5 sayı seç. Maça başla; W/S ve ok tuşlarını göster.
3. Raketin ortası ve kenarıyla vurmayı dene. Topun açısının ve hızının nasıl değiştiğini anlat.
4. Boşlukla duraklat ve devam et. Başka pencereye geçince otomatik duraklamayı göster.
5. Yeni maç düğmesine bas. Vazgeçmeyi ve sıfırlamayı göster.
6. İki oyuncuyu seç; W/S ile sol, oklarla sağ raketin bağımsız hareket ettiğini göster.
7. Ses aç/kapat, hedef skor ve zorluğu göster. Zorluğun iki kişilik modda kullanılmadığını açıkla.
8. Kısa bir maçı bitir ve sonucu göster. Zaman yetmezse puanı yapay olarak değiştirmek yerine önceden kısa bir demo provası yap.
9. Özel güçler açık bir maçta topu bir simgeye değdir. Etkinin topa son vuran oyuncuya verildiğini, süre etiketini ve çoklu topta ilk kaçanın tek sayı verdiğini göster.
10. Koyu/açık temayı değiştir; maçın devam ettiğini ve yenilemede tercihin korunduğunu göster. Kod kalitesi için `npm run lint`, doğrulama için `npm test` komutlarını açıkla.
11. Tam ekran düğmesini kullan; skorun korunduğunu, oyunun durakladığını ve Oyuna dön ile devam ettiğini göster. Telefonu yatay/dikey çevir; dokunmatik okları ve iki parmağı dene.
12. İmkânsız seviyesini seçip topun duvar sekmelerinden sonraki geliş konumunu bilgisayarın hesapladığını anlat.

## 3 Tasarım kararları

Saha en geniş bölümdür; oyuncunun dikkati topun üzerinde kalır. Krem arka plan ve koyu yeşil saha, bilgi alanıyla oyun alanını ayırır. Raketlerin renkleri farklıdır. Başlangıç, servis, duraklama ve sonuç açık metinlerle gösterilir. Ayarlar maç sırasında kilitlenir; değiştirmek için yeni maç açılır. Küçük ekranlarda ayarlar aşağı taşınır; dokunmatik cihazlarda ok butonları görünür.

Bu tercihlerden hangisini kendin değiştirdiğini ve neden değiştirdiğini ayrıca anlat.

## 4 Bu çalışma sırasında izlenen geliştirme süreci

Bu oturumda kullanıcı oyun olarak Pong'u seçti ve Word yönergesinin dikkate alınmasını istedi. OpenAI Codex yönergedeki teknoloji, yerel çalışma, teslim ve sunum şartlarını okudu. Ardından harici bağımlılık gerektirmeyen HTML/CSS/JavaScript yapısı kuruldu. Oyun motoru arayüzden ayrıldı; açıya bağlı çarpışma, bilgisayar rakibi ve skor akışı eklendi. Klavye/dokunma desteği, duraklatma, yeni maç onayı, isteğe bağlı ses ve yerel ralli rekoru bağlandı.

Kullanıcının sonraki isteğiyle rastgele güç simgeleri, boyut/hız etkileri, çoklu top, açık/koyu tema ve ESLint eklendi. Topa son vuran oyuncunun gücü kazanması, etkilerin sınırlı süreli olması ve ilk kaçan topun tek sayı vermesi bu uygulamada belirlenen oyun kurallarıdır. Öğrenci bu kararları deneyerek değerlendirmelidir.

Motor için 36 otomatik davranış testi ve DOM ortamında 21 arayüz testi geçti. ESLint sıfır hata ve uyarıyla tamamlandı. Yeni istekte tam ekran, İmkânsız seviyesi ve mobil kontrol düzeni eklendi. Görünüm veya ekran yönü değişince oyun duraklatılıp basılı girdiler temizlendi. İmkânsız rakip için yansıtılmış koordinat hesabıyla duvar sekmeleri tahmin edildi. Tarayıcı erişim servisi kullanılamadığı için gerçek tarayıcıdaki görsel ve giriş kontrolü tamamlanamadı. Son canlı kontrolü kendi bilgisayarında yapıp bulgularını ekle.

AI aracı ve rolü: **OpenAI Codex**; şartları inceleme, fikirleri uygulama, HTML/CSS/JS üretimi, oyun motoru testleri ve açıklama dosyalarını hazırlama. Kullanılan başka bir araç varsa yalnız gerçekten kullandıklarını ekle.

Öğrencinin doldurması gereken kişisel notlar:

- İlk denememde neyi beğendim, neyi değiştirmek istedim?
- AI aracına hangi somut değişikliği tarif ettim?
- Hangi hatayı veya kullanım sorununu bizzat gördüm? Nasıl düzelttim?
- Benim eklediğim veya değiştirdiğim anlamlı özellik hangisi?
- Değişiklikten önce ve sonra ne farklı çalıştı?

## 5 Kullanıcı aksiyonu hangi kodu çalıştırıyor

| Kullanıcı aksiyonu | Kod akışı | Ekrandaki sonuç |
| --- | --- | --- |
| Maça başla | `app.js`: `startMatch()` → `engine.js`: `start()` | Skor sıfırlanır, servis sayımı başlar |
| W/S veya ok tuşları | `keydown` / `keyup` → `inputState()` → `update()` → `movePaddle()` | Raket hareket eder |
| Dokunup sürükleme | `pointerdown` / `pointermove` → `setPointer()` → `leftTarget` veya `rightTarget` | Raket parmağın yüksekliğine yaklaşır |
| Topun rakete çarpması | `step()` temas düzlemini ve temas yüksekliğini hesaplar | Top açı değiştirir, hız ve ralli sayacı artar |
| Topun sahanın arkasından çıkması | `awardPoint()` | Rakibe sayı yazılır; servis veya sonuç gösterilir |
| Boşluk veya Duraklat | `togglePause()` → `pause()` / `resume()` | Oyun donar veya kaldığı yerden sürer |
| Yeni maç | `newMatch()` → onay → `returnToSetup()` | Skor silinir, ayarlar açılır |
| Mod / zorluk / skor seçimi | `change` → `syncSettings()`; başlangıçta `readConfig()` | Seçim metinleri ve yeni maç kuralları değişir |
| Ses düğmesi | `unlockAudio()` ve `beep()` | Web Audio API kısa oyun sesleri üretir |
| Yeni en uzun ralli | `handleEvent()` → `localStorage.setItem()` | Rekor bu tarayıcıda saklanır |
| Topun güç simgesine değmesi | `collectPickup()` → `activatePower()` | Son vuran oyuncuya göre kendine veya rakibe etki uygulanır |
| Süreli etki | `updatePowers()` → `updateModifiers()` | Süre etiketi azalır; bitince boyut/hız normale döner |
| Çoklu top | `activatePower('multiball', …)` → `balls` dizisi | Farklı açılarda üç top çizilir; ilk kaçan sayı verir |
| Tema düğmesi | `theme.js`: `apply()` → `data-theme` ve `localStorage` | CSS renkleri ve Canvas zemin rengi değişir |

## 6 Temel kod mantığı

**Durum yönetimi:** Motor `ready`, `countdown`, `playing`, `between`, `paused`, `ended` durumlarından birindedir. Hazır durumda top hareket etmez. Sayımdan sonra oyun başlar. Sayıdan sonra kısa servis beklemesi gelir. Hedef skorda motor biter. Duraklama önceki durumu hatırlar.

**Oyun döngüsü:** `requestAnimationFrame`, `frame()` fonksiyonunu çağırır. Önce geçen zaman hesaplanır. `inputState()` tuşları ve işaretçileri okur. `engine.update(delta, input)` oyun verisini ilerletir. `updateInterface()` metin ve sayıları, `draw()` sahayı günceller. Raket hızı 510 piksel/saniyedir; geçen zamanla çarpılır. Bu nedenle hareket her karede sabit piksel sayısı kadar değildir.

**Çarpışma:** Motor topun bir önceki ve yeni konumuyla raket düzlemini geçip geçmediğini bulur. Geçtiyse temas yüksekliğinin rakete denk gelip gelmediğini denetler. Temasın raket merkezine uzaklığı -1 ile +1 arasına dönüştürülür. Bu değer en fazla 60 derecelik dönüş açısına çevrilir. Yatay hız `cos(açı) × hız`, dikey hız `sin(açı) × hız` ile hesaplanır.

**Hız:** Her raket vuruşunda yeni hız `eski hız × 1.055 + 8` olur; normalde en fazla 850, turbo etkisi sırasında en fazla 1100 piksel/saniyeye çıkar. Turbo ilk alındığında hız %35 artar, tekrar alınınca yalnız süresi yenilenir. Motor kare süresini 1/240 saniyelik küçük adımlara böler. Böylece hızlı topun raketin içinden geçmesi önlenir.

**Güçler:** `pickups` dizisi sahadaki simgeleri, `effects` dizisi hedef oyuncuyu, etki türünü ve kalan saniyeyi tutar. Her top kendi `lastHit` değerini taşır. Top simgeye değince bu bilgiyle etki sahibini buluruz. Küçültme/yavaşlatma rakibe, büyütme/hızlandırma kendine uygulanır. Boyut ve hız ayrı alanlardır; aynı alanın karşıt etkileri birbirinin yerini alır. Süreler yalnız `playing` durumunda azalır.

**Çoklu top:** `balls` dizisine iki farklı açıda kopya eklenir; sayı üçle sınırlıdır. Her topun çarpışması ayrı hesaplanır. Bir top çıkarsa `awardPoint()` çağrılır, o adım hemen sonlanır ve diğer toplar kaldırılır. Aynı karede birkaç topun çıkması skoru birkaç kez artırmaz.

**Tema ve linter:** `theme.js` açılışta kayıtlı tercihi, yoksa sistem temasını uygular. CSS değişkenleri `data-theme` değerine göre değişir. ESLint oyunun bir parçası olarak çalışmaz; geliştirme sırasında kod hatalarını yakalayan bir denetim aracıdır. `npm run lint` önerilen kurallarla kodu tarar; `npm test` davranış testlerini çalıştırır.

**Bilgisayar rakibi:** Topu anında kopyalamaz. Seçilen seviyeye göre tepki gecikmesi, en fazla hareket hızı ve hedef hatası bulunur. Top karşıya giderken takip eder, uzaklaşırken ortaya döner. Bu kod öğrenen bir model değildir; JavaScript ile yazılmış kurallı bir rakiptir.

**Veri ve görünüm ayrımı:** `engine.js` HTML elemanlarına erişmez; koordinatları ve kuralları tutar. `app.js` ise motorun verilerini okuyarak Canvas ve HTML elemanlarını günceller. Bu ayrım çarpışmaları tarayıcıdan bağımsız sınamayı sağlar.

## 7 Sorulabilecek sorular

**Neden Three.js kullanmadın?** Yönergede zorunlu değildi. 2D oyun için Canvas yeterliydi; kurulum ve sunum daha basit kaldı.

**Zorluk neyi değiştiriyor?** Tek oyuncuda bilgisayarın hızını, tepki gecikmesini, hedef hatasını ve başlangıç top hızını değiştiriyor. İki kişilik maçta iki taraf da kullanıcı kontrolünde olduğu için zorluk kapalı.

**Top neden her vuruşta farklı yöne gidiyor?** Vuruşun raketin merkezine göre konumu dönüş açısını belirliyor. Kenarlara yakın vuruşlar daha eğimli.

**Neden top hızı sınırlı?** Rallinin zorlaşmasıyla oynanabilirlik arasında denge kurmak ve çarpışma hesaplarını kararlı tutmak için.

**Oyun sayfadan ayrılınca neden duruyor?** Odak kaybında oyuncu kontrol edemez; motor duraklatılıp basılı tuş kayıtları temizleniyor.

**Tarayıcı kayıt izni vermezse ne olur?** Rekor kalıcı saklanamaz; `try/catch` nedeniyle oyun devam eder.

**Projedeki kendi katkın ne?** Bu soruya rehberdeki metni tekrar ederek değil, gerçekten yaptığın karar, deneme ve değişiklikleri göstererek yanıt ver.

## 8 Son prova

Yeni dosya `display.js`, Fullscreen API ile oyun panelini büyütür. API desteklenmediğinde `.is-expanded` sınıfıyla tarayıcı penceresine sığdırır; skor ve kontroller panelin içinde kalır. Tam ekran değişiminde `pong-view-change` olayı `app.js` içindeki duraklatmayı çalıştırır. Mobilde `pointerId`, aynı anda iki parmağın farklı raketlere ait olmasını sağlar. `pointercancel` parmağın kontrolünün kaybolması durumunda hareketi temizler.

İmkânsız seviyesinde `predictIntercept()`, topun sağ rakete kadar uçuş süresini bulur. Dikey koordinatı iki saha yüksekliği uzunluğunda bir aralıkta katlayarak bir veya birden çok duvar sekmesini hesaplar. Bilgisayar bu geliş noktasına sınırlı hızla hareket eder; büyütme/küçültme ve yavaşlatma kuralları geçerlidir.

Önce demo akışını baştan sona kendin uygula. Ardından `app.js` içinde bir tuş olayını, `engine.js` içinde `step()` ve `awardPoint()` fonksiyonlarını açıp kullanıcı aksiyonuyla ilişkisini anlat. Değiştirdiğin son kaynakları ZIP'e al; sunumda farklı bir kopya kullanma.
