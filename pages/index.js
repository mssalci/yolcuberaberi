// pages/index.js
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Yolcu Beraberi - Yurtdışından Parça Getir</title>
      </Head>

      <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
        {/* Üst Menü */}
        <header className="w-full flex justify-between items-center py-4 px-6 bg-white shadow-sm">
          <div className="text-2xl font-bold text-black">yolcuberaberi.com</div>
          <div className="flex gap-4">
            <button className="text-black">Gönderi Oluştur</button>
            <button className="text-black">Yolcu İlanı Oluştur</button>
            <button className="border px-4 py-2 rounded">Giriş Yap</button>
            <button className="border px-4 py-2 rounded">Kayıt Ol</button>
          </div>
        </header>

        {/* Ana Başlık */}
        <section className="text-center my-12">
          <h1 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
            Yurtdışından uygun fiyata parça mı getirmek istiyorsun? Yolcunu bul!
          </h1>
        </section>

        {/* Arama Alanı */}
        <section className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4 items-center mb-16 w-full max-w-4xl">
          <select className="border p-3 rounded w-full md:w-1/2">
            <option>Ülke seç</option>
            {/* Ülkeler gelecek */}
          </select>
          <input
            type="text"
            placeholder="Tarih Aralığı"
            className="border p-3 rounded w-full md:w-1/2"
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded w-full md:w-auto">
            Ara
          </button>
        </section>

        {/* Nasıl Çalışır */}
        <section className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-8">Nasıl Çalışır?</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">📄</div>
              <h3 className="font-bold">Gönderi İlanı Oluştur</h3>
              <p className="text-gray-600">Kritik belgeleri doldur ve ilanı ver.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">✈️</div>
              <h3 className="font-bold">Yolcunu Bul</h3>
              <p className="text-gray-600">Uygun yolcu ile eşleş ve anlaş.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">📦</div>
              <h3 className="font-bold">Eşyayı Teslim Al</h3>
              <p className="text-gray-600">Kolayca eşyana kavuş.</p>
            </div>
          </div>
        </section>

        {/* Öne Çıkan Gönderiler */}
        <section className="w-full max-w-5xl mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Öne Çıkan Gönderiler/Yolcular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartlar */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold">Berlin → İstanbul</h3>
              <p className="text-gray-600">10–20 Mayıs</p>
              <p className="text-gray-600">1 kg eşya • 50 €</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold">New York → Ankara</h3>
              <p className="text-gray-600">5–12 Haziran</p>
              <p className="text-gray-600">8 kg boş alan • 150 $</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold">İzmir → Paris</h3>
              <p className="text-gray-600">20–25 Nisan</p>
              <p className="text-gray-600">3 kg eşya • 40 €</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold">Londra → Adana</h3>
              <p className="text-gray-600">1–4 Temmuz</p>
              <p className="text-gray-600">12 kg boş alan • 200 £</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-gray-500">
          <div className="flex justify-center gap-4 mb-2">
            <a href="#">Hakkımızda</a>
            <a href="#">KVKK</a>
            <a href="#">İletişim</a>
          </div>
          <div className="flex justify-center gap-4">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </div>
        </footer>
      </main>
    </>
  );
}
