# Pong Atölyesi — Özellik kapsamı

Proje HTML, CSS ve JavaScript ile geliştirilmiş bağımsız bir tarayıcı oyunudur. Bu belge mevcut ürün özelliklerini ve sınırlarını özetler.

| Alan          | Mevcut davranış                                                               |
| ------------- | ----------------------------------------------------------------------------- |
| Oyun          | Tek oyuncu veya aynı cihazda iki kişiyle Pong                                 |
| Etkileşim     | Açıya bağlı vuruş, hızlanan ralli, skor, servis ve maç sonucu                 |
| Rakipler      | Dört zorluk; İmkânsız seviyesinde duvar sekmesi öngörüsü                      |
| Özel güçler   | Altı süreli etki, son vuran oyuncuya ödül ve en fazla üç top                  |
| Kontroller    | Klavye, fare, dokunmatik oklar ve iki parmak                                  |
| Görünüm       | Portre/yatay düzen, native/fallback tam ekran, açık/koyu tema                 |
| Tercihler     | 5/7/11 hedef skor, ses, klasik/güçlü oyun, yerel ralli rekoru                 |
| Geri bildirim | Canlı skor, servis geri sayımı, güç süreleri ve maç sonucu                    |
| Güvenlik      | Dış bağlantı gerektirmeyen statik oyun, CSP, metin tabanlı DOM güncellemeleri |
| Kod kalitesi  | ESLint, 40 motor testi ve 23 jsdom arayüz testi                               |

## Sınırlar

İki oyunculu mod yereldir; internet üzerinden eşleşme, kullanıcı hesabı veya bulut rekoru yoktur. Tema ve ralli kaydı tarayıcıya özeldir. Bazı klavyeler aynı anda basılan tuşları sınırlayabilir; fare veya dokunma alternatifleri kullanılabilir.

## Teknik belgeler

[README](../README.md) oyuncu kılavuzunu ve teknoloji listesini; [teknik işleyiş](SUNUM_REHBERI.md) kod bileşenlerini; [güvenlik politikası](../SECURITY.md) bildirim kanalını açıklar.
