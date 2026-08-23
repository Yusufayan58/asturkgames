# Astürk Games

Kendi yaptığın oyunları dosya (klasör) olarak ekleyip oynatabildiğin, Poki tarzı sol menülü bir oyun portalı.
Sunucu, veritabanı yok — sadece HTML/CSS/JS. `games/` klasörüne oyun klasörü at, `games.js`'e bir satır ekle, bitti.

Site şunları içerir:
- **Sol menü**: Anasayfa, Yeni Eklenenler, Popüler, Tüm Oyunlar ve `games.js`'teki kategorilerden **otomatik** üretilen kategori listesi.
- **Anasayfa**: öne çıkan oyun için büyük bir banner + "Yeni Eklenenler" / "Popüler" satırları + tüm oyunların ızgarası.
- **Arama**: üst bardan yazınca menüden bağımsız, anında sonuç gösterir.
- Mobilde sol menü hamburger ikonuyla açılıp kapanan bir çekmeceye dönüşür.

## ⚠️ ÖNCE ZIP'İ ÇIKART

İndirdiğin `asturk-games.zip` dosyasını **çift tıklayıp direkt açma** — zip'in içinden tarayıcıyla gezinirsen (adres çubuğunda `...zip.ecb\...` gibi bir şey görürsen bu olmuş demektir) sayfa bomboş gelir, çünkü tarayıcı zip'in içindeki dosyaları doğru okuyamaz.

Doğrusu:
1. `asturk-games.zip` dosyasına **sağ tık** → **"Tümünü Ayıkla" / "Extract All"** de.
2. Masaüstü gibi normal bir yere çıkan `asturk-games` klasörünü aç.
3. O klasörün İÇİNDEKİ `index.html` dosyasına çift tıkla.

Bundan sonra site sunucu falan gerekmeden, direkt çift tıklamayla çalışır — oyun listesi artık `games.js` adında sıradan bir JavaScript dosyasından okunuyor (JSON + `fetch` değil), bu yüzden tarayıcı `file://` üzerinden açmayı engellemiyor.

## Klasör yapısı

```
asturk-games/
├── index.html          → ana sayfa (menü, banner, raf, oynatıcı)
├── style.css            → tasarım
├── script.js             → oyunları games.js'ten okuyup sayfayı çizer
├── games.js             → hangi oyunlar rafta görünecek (SEN DÜZENLEYECEKSİN)
├── assets/
│   └── favicon.svg
└── games/
    └── ornek-oyun/       → her oyun kendi klasöründe yaşar
        ├── index.html    → oyunun kendisi (ZORUNLU dosya adı: index.html)
        └── assets/
            └── cover.png → rafta görünecek kapak görseli
```

## Yeni oyun nasıl eklenir?

1. `games/` klasörünün içine yeni bir klasör aç. Klasör adında Türkçe karakter veya boşluk kullanma — örn: `zombi-kacisi`.
2. Oyununun tüm dosyalarını (png, mp3, js, css ne varsa) bu klasörün içine koy.
3. Klasörün İÇİNDE mutlaka bir **`index.html`** dosyası olsun — oyun buradan açılır. (Farklı bir dosya adı kullanacaksan aşağıda `entry` alanına o adı yaz.)
4. `games.js` dosyasını bir metin editörüyle (Not Defteri de olur) aç ve `GAMES` dizisine şu şekilde bir kayıt ekle — mevcut son elemanın sonuna virgül koymayı unutma:

```js
{
  id: "zombi-kacisi",
  title: "Zombi Kaçışı",
  tag: "AKSİYON",
  folder: "zombi-kacisi",
  entry: "index.html",
  cover: "assets/cover.png",
  categories: ["aksiyon", "korku"],
  featured: false,
  isNew: true,
  popular: false
}
```

Alanların açıklaması:

| Alan         | Zorunlu mu | Açıklama |
|--------------|-----------|----------|
| `id`         | Evet      | Benzersiz kısa bir kod (kart renk temasını da bundan üretir) |
| `title`      | Evet      | Rafta görünen oyun adı |
| `tag`        | Hayır     | Kaset etiketindeki küçük yazı (örn: "PLATFORM", "BULMACA") |
| `folder`     | Evet      | `games/` altındaki klasörün adı |
| `entry`      | Hayır     | Oyunun başlangıç dosyası (varsayılan: `index.html`) |
| `cover`      | Hayır     | Oyun klasörüne göre kapak görselinin yolu. Boş bırakırsan otomatik olarak baş harflerden bir etiket üretilir |
| `categories` | Hayır     | Kategori id'lerinden oluşan bir liste. **Sol menüdeki kategori listesi buradan otomatik üretilir** — yeni bir kategori adı yazman yeterli, menüde kendiliğinden belirir |
| `featured`   | Hayır     | `true` yaparsan anasayfadaki büyük banner'da bu oyun öne çıkar (birden fazla `true` varsa ilki kullanılır) |
| `isNew`      | Hayır     | `true` yaparsan "Yeni Eklenenler" satırında görünür |
| `popular`    | Hayır     | `true` yaparsan "Popüler" satırında görünür |

`games.js` içindeki `GAMES`, bir liste — istediğin kadar oyunu art arda ekleyebilirsin. Örnek (iki oyunlu):

```js
const GAMES = [
  { id: "ornek-oyun", title: "Örnek Oyun", folder: "ornek-oyun", categories: ["arcade"] },
  { id: "zombi-kacisi", title: "Zombi Kaçışı", folder: "zombi-kacisi", tag: "AKSİYON", categories: ["aksiyon", "korku"], isNew: true }
];
```

### Kategoriler hakkında

`aksiyon`, `macera`, `bulmaca`, `spor`, `yaris`, `strateji`, `arcade`, `platform`, `korku` gibi bilinen kategori id'leri için hazır ikon ve Türkçe isim var (`script.js` içindeki `CATEGORY_META`). Listede olmayan bir id yazarsan (örn. `"puzzle-3d"`) site otomatik olarak 🎮 ikonuyla ve baş harfi büyük bir isimle menüye ekler — yani hiçbir yeri elle değiştirmeden istediğin kategoriyi kullanabilirsin. İstersen `CATEGORY_META` içine kendi kategorini de ikonuyla tanımlayabilirsin.

## Siteyi gerçek bir adrese taşıma

Test için çift tıklamak yeterli, ama gerçek bir siteye taşımak istersen `asturk-games` klasörünün tamamını olduğu gibi bir hosting'e yükle — GitHub Pages, Netlify, Vercel, cPanel/FTP, ne kullanıyorsan. Statik dosyalardan oluştuğu için hiçbir kurulum gerekmez, klasörü olduğu gibi kopyalaman yeterli.

## Logo ve site adını değiştirme

- Site adı `index.html` içinde `<span class="logo-word">` etiketinin içinde — "ASTÜRK" / "GAMES" olarak iki satır halinde yazıyor, oradan değiştirebilirsin.
- Şu anda logo SVG olarak kodun içinde çiziliyor (kaset ikonu). Kendi logonu koymak istersen:
  1. `assets/logo.png` (veya `.svg`) olarak logonu ekle.
  2. `index.html` içinde `<svg class="logo-mark">...</svg>` bloğunu `<img class="logo-mark" src="assets/logo.png" alt="Astürk Games">` ile değiştir.
- Renk paleti (amber/pembe/camgöbeği) `style.css` dosyasının en üstündeki `:root` bloğunda — `--marquee`, `--neon`, `--cyan` değerlerini değiştirerek tüm siteyi yeniden renklendirebilirsin.

## Sol menü nasıl çalışıyor?

- **Anasayfa, Yeni Eklenenler, Popüler, Tüm Oyunlar** sabit menü öğeleri — `index.html` içinde `#sidebar` altında dururlar.
- **Kategoriler** tamamen otomatik: `script.js`, tüm oyunların `categories` alanlarını tarayıp benzersiz olanları sıralı şekilde menüye ekler, yanına da o kategorideki oyun sayısını yazar. Yeni bir kategori eklemek için tek yapman gereken bir oyuna o kategori id'sini yazmak.
- Menüden bir öğeye tıklamak sağdaki içerik alanını değiştirir; arama kutusuna yazmak ise menüden bağımsız olarak anında sonuç filtreler.

## Örnek oyun

`games/ornek-oyun/` klasöründe basit bir "engelden atla" oyunu var — hem yapı örneği hem de her şeyin doğru çalıştığını test etmen için. İstersen silip yerine kendi oyunlarını koyabilirsin.
