import React from "react";
import Header from '../components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Diğer içerikler buraya */}
    </div>
  );
}
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 shadow-md">
        <div className="text-2xl font-bold text-primary">Yolcu Beraberi</div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark">
            Giriş Yap
          </button>
          <button className="px-4 py-2 border border-primary text-primary rounded-xl hover:bg-primary-light">
            Kayıt Ol
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 px-6 bg-gray-50">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Yurtdışından uygun fiyata parça mı getirmek istiyorsun? <br /> Yolcunu bul!
        </h1>

        {/* Search Box */}
        <div className="flex flex-wrap gap-4 justify-center w-full max-w-3xl mt-8">
          <input
            type="text"
            placeholder="Nereden?"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300"
          />
          <input
            type="text"
            placeholder="Nereye?"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300"
          />
          <input
            type="date"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300"
          />
          <button className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark">
            Ara
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-6 shadow-lg rounded-xl">
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold mb-2">Yolcu Bul</h3>
            <p>Yurt dışından dönen yolcuları kolayca bul.</p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-6 shadow-lg rounded-xl">
            <div className="text-4xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold mb-2">Sipariş Ver</h3>
            <p>İstediğin ürünü yolcudan rica et.</p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-6 shadow-lg rounded-xl">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Anlaş ve Teslim Al</h3>
            <p>Yolcu ile anlaşıp ürününü kolayca teslim al.</p>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Öne Çıkanlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Example Card */}
          <div className="border p-6 rounded-xl shadow-md bg-white">
            <h3 className="font-semibold text-lg mb-2">iPhone 15 Pro Max</h3>
            <p className="text-gray-500 mb-4">New York → İstanbul</p>
            <button className="mt-auto px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark">
              İlanı Gör
            </button>
          </div>
          {/* Diğer kartlar da böyle... */}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-primary text-white text-center">
        © 2025 Yolcu Beraberi. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
