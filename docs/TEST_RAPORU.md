# Pong Atölyesi — Doğrulama kapsamı

**17 Kasım 2026**

- `npm run lint`: hata veya uyarı yok.
- `npm test`: **40 motor + 23 arayüz testi geçti**. Skor, çarpışmalar, güçler, bilgisayar rakibi, bağımsız girdiler, tema, depolama, mobil ve tam ekran akışları kapsanır.
- `npm audit`: üretim ve geliştirme bağımlılıklarında **0 bilinen açık**. Oyun çalışırken npm bağımlılığı kullanılmaz.
- Gerçek Chromium'da HTTP üzerinden açılış, servis, maç, duraklatma ve devam denendi. `file://` ile çevrimdışı açılış ve oyun ayrıca doğrulandı. 390×844 dokunmatik emülasyonunda iki oyunculu yerleşim açıldı.
- İçerik güvenliği politikası etkin halde oyun çalıştı; zararsız satır içi betik ve dış bağlantı denemeleri engellendi. Normal oynanışta JavaScript/konsol hatası görülmedi.
- Kaynakların ve tam Git geçmişinin bilinen erişim anahtarı/özel anahtar desenleriyle taramasında eşleşme bulunmadı. GitHub açık secret-scanning uyarısı bulunmadı.

Bu kontroller gerçek telefonları, bütün tarayıcıları, uzun süreli donanım kullanımını veya koşulsuz güvenliği garanti etmez. Güvenlik bildirimi için [SECURITY.md](../SECURITY.md) kullanılabilir.
