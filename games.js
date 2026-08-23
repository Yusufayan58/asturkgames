// ASTÜRK GAMES — oyun listesi
// Bu dosya normal bir <script> etiketiyle yüklenir (fetch/JSON DEĞİL) — bu sayede
// dosyaya çift tıklayarak (file://) açtığında da tarayıcı hiçbir şeyi engellemez.
//
// Yeni oyun eklemek için: aşağıdaki diziye (GAMES) bir obje daha ekle.
// Son elemandan sonraki virgülü unutma, en sonuncudan sonra virgül KOYMA.

window.GAMES = [
  {
    id: "ornek-oyun",
    title: "Örnek Oyun",
    tag: "ENGELDEN ATLA",
    folder: "ornek-oyun",
    entry: "index.html",
    cover: "assets/cover.png",
    categories: ["arcade", "platform"],
    featured: true,
    isNew: true,
    popular: true
  },
  {
    id: "keko-oyun",
    title: "Keko Oyun",
    folder: "keko-oyun",
    entry: "index.html",
    cover: "icon.png"
  }
];
