// pages/talepler.js
import Head from "next/head";
import Link from "next/link";

export default function Talepler() {
  return (
    <>
      <Head>
        <title>Tüm Talepler - Yolcu Beraberi</title>
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-10 text-center">Tüm Talepler</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">MacBook Air M2</h3>
              <p className="mb-4">ABD'den Türkiye'ye getirilecek. Hızlı teslimat gerekiyor.</p>
              <Link href="/chat/1" className="text-blue-600 hover:underline">Detayları Gör</Link>
            </div>

            <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">Zara Mont</h3>
              <p className="mb-4">İspanya'dan İstanbul'a getirilecek.</p>
              <Link href="/chat/2" className="text-blue-600 hover:underline">Detayları Gör</Link>
            </div>

            <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2">Apple Watch Ultra</h3>
              <p className="mb-4">ABD siparişi. Hızlı iletişim bekleniyor.</p>
              <Link href="/chat/3" className="text-blue-600 hover:underline">Detayları Gör</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
