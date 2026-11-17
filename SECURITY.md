# Güvenlik politikası

Pong Atölyesi'nin desteklenen sürümü `main` dalındaki güncel sürümdür. Yayınlanan oyun statik dosyalardan oluşur; kullanıcı hesabı, sunucu taraflı oturum, reklam/analiz kodu veya istemcide saklanan servis anahtarı içermez. Tema ve ralli rekoru yalnızca tarayıcıda saklanır.

## Güvenlik bildirimi

Şüpheli bir açık [GitHub'ın özel güvenlik bildirimi](https://github.com/emengin/emengin-pong-atolyesi/security/advisories/new) üzerinden iletilebilir. Etkilenen sürümü, beklenen davranışı ve kişisel veri içermeyen yeniden üretme adımlarını ekleyin. Açık issue veya pull request içine erişim anahtarı, parola ya da kişisel bilgi koymayın.

## Bakım

- `package-lock.json` geliştirme bağımlılıklarını sabitler; `npm ci` ile kurulur.
- CI kod denetimini, testleri ve bilinen bağımlılık açıkları için `npm audit` kontrolünü çalıştırır.
- İçerik güvenliği politikası uzak bağlantıları, satır içi betikleri ve dinamik betik derlemeyi engeller. Dinamik arayüz metinleri HTML olarak yorumlanmaz.
- Bağımlılık uyarıları ve otomatik güncellemeler güvenlik bakımının bir parçasıdır; testlerin geçmesi veya taramanın temiz olması koşulsuz güvenlik garantisi değildir.
