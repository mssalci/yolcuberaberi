import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Üst Menü */}
      <Header />

      {/* Ana İçerik */}
      <main className="flex flex-col items-center text-center px-4 mt-12 space-y-10">

        {/* Başlık */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold">Yurt Dışından Uygun Fiyata Ürün Getirt</h1>
          <p className="text-lg md:text-xl text-gray-600">Yolculardan ürün getirmelerini isteyerek tasarruf et!</p>
        </div>

        {/* Arama Kutuları */}
        <div className="flex flex-col md:flex-row items-center gap-4 mt-6 w-full max-w-2xl">
          <input
            type="text"
            placeholder="Nereden"
            className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Nereye"
            className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* İlan Oluştur Butonları */}
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl">
            Gönderi Talebi Oluştur
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl">
            Yolcu İlanı Oluştur
          </button>
        </div>

        {/* Nasıl Çalışır Bölümü */}
        <section className="mt-16 w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold">Talebini Oluştur</h3>
              <p className="text-gray-500 text-sm">Yurt dışından getirilmesini istediğin ürünü talep et.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold">Yolcuyla Anlaş</h3>
              <p className="text-gray-500 text-sm">Yolcular teklif verir, en uygununu seçersin.</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold">Ürünü Teslim Al</h3>
              <p className="text-gray-500 text-sm">Yolcudan ürünü teslim al, tasarruf et!</p>
            </div>
          </div>
        </section>

        {/* Öne Çıkanlar */}
        <section className="mt-16 w-full max-w-6xl">
          <h2 className="text-3xl font-bold mb-8">Öne Çıkan Talepler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sahte kartlar (sonra Firestore'dan çekilecek) */}
            <div className="border p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">iPhone 15 Pro</h3>
              <p className="text-gray-600 text-sm mb-4">ABD'den İstanbul'a</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Detaylar</button>
            </div>
            <div className="border p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">Nike Air Jordan</h3>
              <p className="text-gray-600 text-sm mb-4">Almanya'dan Ankara'ya</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Detaylar</button>
            </div>
            <div className="border p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">Macbook Pro</h3>
              <p className="text-gray-600 text-sm mb-4">İngiltere'den İzmir'e</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Detaylar</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center py-6 text-gray-400 text-sm">
        © 2025 Yolcu Beraberi. Tüm Hakları Saklıdır.
      </footer>
    </div>
  );
}
