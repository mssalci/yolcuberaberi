// pages/index.js
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Yolcu Beraberi - Yurt Dışından Eşya Getirt</title>
        <meta name="description" content="Yurtdışından eşya getirtmenin en kolay yolu. Yolcularla eşleşin, ihtiyaçlarınızı uygun fiyata karşılayın." />
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        {/* Hero Section */}
        <section className="text-center py-20 px-6">
          <h1 className="text-4xl font-bold mb-6">Yurtdışından Parça ve Ürün Getirtmenin En Kolay Yolu</h1>
          <p className="text-lg mb-8">İhtiyacını duyduğun ürünü talep oluştur, gelen teklifleri değerlendir, yolcularla anlaş!</p>
          <Link href="/talep-olustur" className="inline-block bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700">
            Talep Oluştur
          </Link>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Talep Oluştur</h3>
                <p>Yurtdışından almak istediğin ürünü ve detayları paylaş.</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Teklif Al</h3>
                <p>Yolculardan gelen fiyat tekliflerini değerlendir.</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Anlaş ve Teslim Al</h3>
                <p>En uygun yolcuyla anlaş, ürünü teslim al.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Öne Çıkan Talepler</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Dummy Example Posts */}
              <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">iPhone 15 Pro Max</h3>
                <p className="mb-4">ABD'den getirtilecek. Hızlı teklif bekleniyor.</p>
                <Link href="/tum-talepler" className="text-blue-600 hover:underline">Detayları Gör</Link>
              </div>
              <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Nike Air Jordan</h3>
                <p className="mb-4">Fransa'dan İstanbul'a getirilecek.</p>
                <Link href="/tum-talepler" className="text-blue-600 hover:underline">Detayları Gör</Link>
              </div>
              <div className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Sony PS5 Slim</h3>
                <p className="mb-4">ABD fırsat ürünü. Yolcu arıyor.</p>
                <Link href="/tum-talepler" className="text-blue-600 hover:underline">Detayları Gör</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
