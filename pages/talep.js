// pages/talep.js
import Head from "next/head";

export default function Talep() {
  return (
    <>
      <Head>
        <title>Talep Oluştur - Yolcu Beraberi</title>
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        <section className="py-20 px-6 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-10 text-center">Yeni Talep Oluştur</h1>

          <form className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">Ürün Adı</label>
              <input type="text" className="w-full border px-4 py-2 rounded-lg" placeholder="Örn: iPhone 15 Pro" />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Ürün Açıklaması</label>
              <textarea className="w-full border px-4 py-2 rounded-lg" placeholder="Ürün hakkında detaylı bilgi verin"></textarea>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Ülke</label>
              <input type="text" className="w-full border px-4 py-2 rounded-lg" placeholder="Örn: Amerika" />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Bütçe (Opsiyonel)</label>
              <input type="number" className="w-full border px-4 py-2 rounded-lg" placeholder="Örn: 500 USD" />
            </div>

            <button type="submit" className="bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 w-full">
              Talep Oluştur
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
