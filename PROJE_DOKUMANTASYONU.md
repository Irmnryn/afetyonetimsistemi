# Afet Destek Yönetimi

## 1. Tasarım Amacı

Bu dokümantasyon, Afet Destek Yönetimi frontend arayüzünün tasarım kararlarını açıklar. Sistem, depo görevlisinin afet anında stokları, kullanıcı taleplerini ve depolar arası transferleri hızlı şekilde takip etmesi için sade, okunabilir ve operasyon odaklı bir panel olarak tasarlanmıştır.

Arayüzün temel amacı, kritik bilgileri tek bakışta görünür kılmak ve depo görevlisinin fazla adım atmadan işlem yapmasını sağlamaktır.

## 2. Hedef Kullanıcı

| Kullanıcı | Beklenen İhtiyaç |
| --- | --- |
| Depo görevlisi | Stokları görmek, stok girişi yapmak, kullanıcı taleplerini hazırlamak, transferleri yönetmek |
| Backend geliştiricisi | Hangi ekranın hangi API verisine ihtiyaç duyduğunu görmek |
| Proje değerlendiricisi | Arayüzün sayfa yapısını, kullanıcı akışını ve tasarım mantığını anlamak |

## 3. Genel Arayüz Yapısı

Uygulama tek sayfalı bir yönetim paneli şeklinde tasarlanmıştır. Sol tarafta sabit menü, üst tarafta aktif sayfa başlığı, orta alanda ise seçilen ekranın içeriği bulunur.

| Alan | Tasarım Görevi |
| --- | --- |
| Sol menü | Ana ekranlar arasında hızlı geçiş sağlar |
| Üst başlık | Kullanıcının hangi sayfada olduğunu gösterir |
| Ana içerik | Tablo, form, durum etiketi ve işlem butonlarını gösterir |
| Kullanıcı alanı | Depo görevlisi bilgisini ve çıkış ikonunu gösterir |

## 4. Renk ve Görsel Dil

Arayüzde açık zemin, yumuşak kartlar ve durum renkleri kullanılmıştır. Bu tercih, yoğun operasyon ekranlarında okunabilirliği artırmak için yapılmıştır.

| Kullanım | Renk / Stil | Amaç |
| --- | --- | --- |
| Ana vurgu | Mor / indigo tonları `#4f46e5` | Aktif menü, ana buton ve önemli değerleri vurgulamak |
| Arka plan | Çok açık gri / mavi `#f8faff`, `#fcfcff` | Göz yormayan panel hissi vermek |
| Kart zeminleri | Beyaz | İçerik bloklarını temiz ayırmak |
| Kenarlık | Açık gri `#e5e7eb` | Tablo ve kart sınırlarını yumuşak göstermek |
| Başarılı durum | Yeşil | Normal stok, teslim edildi, başarılı işlem |
| Uyarı durumu | Sarı / turuncu | Beklemede, hazırlanıyor, kritik stok |
| Kritik durum | Kırmızı | Stok yok veya acil öncelik |
| Yolda durumu | Mor | Transfer veya talebin yolda olduğunu belirtmek |

## 5. Tipografi ve Okunabilirlik

Başlıklarda kalın ve büyük yazı kullanılmıştır. Tablo içerikleri daha küçük tutulmuştur; böylece çok satırlı veri ekranda daha düzenli görünür.

| Metin Türü | Tasarım Kullanımı |
| --- | --- |
| Sayfa başlıkları | Büyük, kalın ve koyu renk |
| Yardımcı açıklamalar | Gri tonlu ve orta kalınlıkta |
| Tablo başlıkları | Küçük, büyük harfli ve kalın |
| Durum etiketleri | Küçük, renkli kapsül görünümünde |
| Butonlar | Kısa metinli, yüksek kontrastlı ve yuvarlatılmış |

## 6. Navigasyon Tasarımı

Sol menü dört ana işlem alanına ayrılmıştır:

- Depo Malzemeleri
- Stok Girişi
- Kullanıcı Talepleri
- Depolar Arası Transfer

Aktif menü elemanı mor zemin ve beyaz metinle gösterilir. Pasif menüler gri metinlidir ve üzerine gelindiğinde açık gri zemin alır. Bu yapı, kullanıcının bulunduğu ekranı hızlıca anlamasını sağlar.

## 7. Sayfa Tasarımları

### 7.1. Depo Malzemeleri

Bu ekran, depodaki malzemelerin anlık stok durumunu göstermek için tasarlanmıştır.

| Arayüz Elemanı | Tasarım Kararı |
| --- | --- |
| Sayfa başlığı | Ekranın depo malzemelerini gösterdiğini açıkça belirtir |
| Özet kartları | Toplam çeşit, kritik stok ve stokta olmayan ürünleri öne çıkarır |
| Malzeme tablosu | Malzeme adı, ID, kategori, stok ve durum bilgisini listeler |
| Durum etiketi | Stok Yok, Kritik ve Normal durumlarını renklerle ayırır |
| Otomatik yenileme | Veriler 30 saniyede bir güncellenir |

Bu ekranın tasarımında hızlı karar verme önceliklidir. Depo görevlisi kritik ve stokta olmayan ürünleri tabloya girmeden önce üst kartlardan görebilir.

### 7.2. Stok Girişi

Bu ekran, depoya yeni gelen ürünlerin sisteme girilmesi için tasarlanmıştır.

| Arayüz Elemanı | Tasarım Kararı |
| --- | --- |
| Form kartı | Malzeme, miktar, kaynak türü ve bağışçı bilgisini toplar |
| Kaynak türü | Bağış veya transfer seçenekleriyle giriş kaynağını ayırır |
| Ana buton | Stok girişini tek işlemle kaydeder |
| Son girişler kartı | Kullanıcının yaptığı işlemi hemen kontrol etmesini sağlar |

Form iki kolonlu yapıdadır. Sol tarafta işlem formu, sağ tarafta son girişler bulunur. Böylece kullanıcı hem giriş yapar hem de sonucun ekrana yansıdığını görebilir.

### 7.3. Kullanıcı Talepleri

Bu ekran, depoya atanmış kullanıcı taleplerini operasyon sırasına göre yönetmek için tasarlanmıştır.

| Arayüz Elemanı | Tasarım Kararı |
| --- | --- |
| Talep tablosu | Talep ID, malzemeler, durum ve işlem alanlarını gösterir |
| Malzeme etiketleri | Talepteki ürünler küçük kapsüller halinde listelenir |
| Durum etiketi | Beklemede, Hazırlanıyor, Yolda ve Teslim Edildi durumlarını ayırır |
| İşlem butonu | Talebin mevcut durumuna göre sıradaki aksiyonu gösterir |

Kullanıcı akışı şu şekildedir:

| Adım | Durum | Kullanıcı Aksiyonu |
| --- | --- | --- |
| 1 | Beklemede | Hazırla |
| 2 | Hazırlanıyor | Yola Çık |
| 3 | Yolda | Teslim Edildi |
| 4 | Teslim Edildi | Tamamlandı olarak gösterilir |

Bu yapı, kullanıcının yanlış işlem yapmasını azaltır çünkü ekranda sadece mevcut duruma uygun aksiyon gösterilir.

### 7.4. Depolar Arası Transfer

Bu ekran, admin tarafından atanan aktif transferleri yönetmek için tasarlanmıştır.

| Arayüz Elemanı | Tasarım Kararı |
| --- | --- |
| Transfer tablosu | Talep ID, öncelik, malzemeler, durum, harita ve işlem alanlarını gösterir |
| Öncelik etiketi | Acil, orta ve düşük öncelikleri renkle ayırır |
| Harita butonu | Transfer rotasını modal içinde gösterir |
| Durum butonu | Hazırla, Yola Çık ve Teslim Edildi akışını yönetir |

Transfer ekranı, kullanıcı talepleri ekranına benzer bir durum akışı kullanır. Ek olarak harita modalı sayesinde kaynak ve hedef depo konumları görselleştirilir.

## 8. Harita Modal Tasarımı

Transfer rotası modal pencerede gösterilir. Modal kullanımı, ana tablodan ayrılmadan konum bilgisini incelemeyi sağlar.

| Harita Elemanı | Tasarım Görevi |
| --- | --- |
| Modal başlığı | Transfer rotasının açıldığını gösterir |
| Kaynak depo | Mor işaret ve metinle gösterilir |
| Hedef depo | Kırmızı işaret ve metinle gösterilir |
| Rota çizgisi | İki nokta arasındaki transfer yönünü görselleştirir |
| Malzeme listesi | Transfer edilen ürünleri modal altında gösterir |

## 9. Durum ve Öncelik Tasarımı

Durumlar metinle birlikte renkli kapsüllerle gösterilir. Bu tercih, tablodaki satırlar arasında hızlı tarama yapılmasını sağlar.

| Durum | Görsel Anlam |
| --- | --- |
| Beklemede | İşlem başlamamış |
| Hazırlanıyor | Depo hazırlık aşamasında |
| Yolda | Transfer veya teslimat hareket halinde |
| Teslim Edildi | Süreç tamamlanmış |

| Öncelik | Görsel Anlam |
| --- | --- |
| Acil | Kırmızı, hızlı müdahale gerektirir |
| Orta | Turuncu, takip edilmelidir |
| Düşük | Gri, normal önceliklidir |

## 10. Kullanıcı Akış Diyagramları

### Genel Panel Akışı

| Adım | Kullanıcı Davranışı | Arayüz Tepkisi |
| --- | --- | --- |
| 1 | Kullanıcı paneli açar | Sol menü ve varsayılan ekran görünür |
| 2 | Menüden ekran seçer | Aktif sayfa başlığı ve içerik değişir |
| 3 | Tabloyu inceler | Durum etiketleri ve işlem butonları görünür |
| 4 | İşlem butonuna basar | API isteği gönderilir |
| 5 | İşlem tamamlanır | Liste yeniden güncellenir |

### Talep / Transfer Durum Akışı

| Başlangıç | İşlem | Sonraki Durum |
| --- | --- | --- |
| Beklemede | Hazırla | Hazırlanıyor |
| Hazırlanıyor | Yola Çık | Yolda |
| Yolda | Teslim Edildi | Teslim Edildi |

## 11. Bileşen Tasarım Haritası

| Bileşen | Arayüzdeki Görevi |
| --- | --- |
| AfetDestekPaneli | Ana panel düzenini, menüyü ve aktif ekranı yönetir |
| MalzemeListesiEkrani | Depo malzemelerini ve stok durumlarını gösterir |
| StokGirisEkrani | Yeni stok giriş formunu ve son giriş listesini gösterir |
| KullaniciTaleplerEkrani | Kullanıcı taleplerini ve işlem akışını gösterir |
| TransferEkrani | Depolar arası transferleri, öncelikleri ve harita modalını gösterir |
| apiFetch | Arayüzün backend ile iletişim kurmasını sağlar |

## 12. API Entegrasyonunun Tasarıma Etkisi

Arayüz, gerçek backend verisiyle çalışacak şekilde tasarlanmıştır. Yedek veri akışı kaldırılmıştır ve `apiFetch` üzerinden yalnızca gerçek API istekleri yapılır.

| Ekran | Veri İhtiyacı |
| --- | --- |
| Depo Malzemeleri | Malzeme listesi ve stok bilgisi |
| Stok Girişi | Malzeme listesi ve stok kayıt endpointi |
| Kullanıcı Talepleri | Gönderilecek talepler ve durum güncelleme endpointleri |
| Depolar Arası Transfer | Aktif transferler, durum güncelleme ve konum bilgisi |

Bu yapı sayesinde frontend, backend ile birleştiğinde aynı arayüz düzenini koruyarak canlı veri gösterebilir.

## 13. Responsive ve Kullanılabilirlik Notları

Tasarım masaüstü kullanım için optimize edilmiştir. Depo görevlisi ekranı genellikle bilgisayar üzerinden kullanacağı için geniş tablo alanları, sol menü ve kart yapısı tercih edilmiştir.

Kullanılabilirlik açısından:

- Sayfa başlıkları açık tutulmuştur.
- İşlem butonları kısa ve doğrudan adlandırılmıştır.
- Kritik bilgiler renklerle vurgulanmıştır.
- Tablolarda satır aralıkları geniş bırakılmıştır.
- Boş veri durumlarında kullanıcıya açıklayıcı mesaj gösterilir.

## 14. Sonuç

Bu tasarım, afet destek operasyonlarında depo görevlisinin hızlı hareket etmesini destekleyen sade bir yönetim panelidir. Arayüzdeki ekranlar mevcut frontend koduyla uyumludur ve her sayfa gerçek kullanıcı ihtiyacına göre yapılandırılmıştır.
