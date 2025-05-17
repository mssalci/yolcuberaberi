import Head from "next/head";
import { CalendarDays, PackageSearch, Users } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Yolcu Beraberi | Yurt Dışından Eşya Getir, Kazan</title>
        <meta
          name="description"
          content="Yurt dışından eşya getirmek isteyenlerle seyahat eden yolcuları buluşturan platform. Hemen talep oluştur ve gelir elde et."
        />
        <meta property="og:title" content="Yolcu Beraberi" />
        <meta property="og:description" content="Yurt dışından eşya getir, yolculuğunu kazanca dönüştür." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yolcuberaberi.com.tr/" />
        <meta property="og:image" content="/og-image.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <main className="p-6 max-w-5xl mx-auto space-y-16">
        {/* Giriş Bölümü */}
        <section>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Yurtdışından uygun fiyata parça mı getirmek istiyorsun? Yolcunu bul!
          </h1>
          <p className="text-gray-700 mb-6">
            Yukarıdaki menüden talepleri görüntüleyebilir, yeni talepler oluşturabilir veya eşleşmeleri yönetebilirsiniz.
          </p>

          <div className="flex flex-col md:flex-row gap-4 bg-white shadow-md rounded-xl p-6">
            <select className="border px-4 py-2 rounded w-full md:w-60">
              <option>Ülke seç</option>
              <option>Almanya</option>
              <option>Fransa</option>
              <option>ABD</option>
            </select>
            <input
              type="text"
              placeholder="Tarih aralığı"
              className="border px-4 py-2 rounded w-full md:w-60"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Ara
            </button>
          </div>
        </section>

        {/* Nasıl Çalışır */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-6">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <PackageSearch className="mx-auto w-8 h-8 text-blue-600" />
              <h3 className="font-semibold">Gönderi ilanı oluştur</h3>
              <p className="text-gray-500 text-sm">
                Ürününü tanımla ve almak istediğin ülkeyi belirt.
              </p>
            </div>
            <div className="space-y-3">
              <CalendarDays className="mx-auto w-8 h-8 text-blue-600" />
              <h3 className="font-semibold">Yolcunu bul</h3>
              <p className="text-gray-500 text-sm">
                Uygun tarihte seyahat eden yolcuyu seç.
              </p>
            </div>
            <div className="space-y-3">
              <Users className="mx-auto w-8 h-8 text-blue-600" />
              <h3 className="font-semibold">Eşyayı teslim al</h3>
              <p className="text-gray-500 text-sm">
                Güvenli teslimat ile eşyana kavuş.
              </p>
            </div>
          </div>
        </section>

        {/* Öne Çıkan Gönderiler */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-6">Öne Çıkan Gönderiler</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { from: "Berlin", to: "İstanbul", date: "10–20 Mayıs", weight: "1 kg", price: "50 €" },
              { from: "New York", to: "Ankara", date: "5–12 Haziran", weight: "8 kg", price: "150 $" },
              { from: "İzmir", to: "Paris", date: "20–25 Nisan", weight: "3 kg", price: "40 €" },
              { from: "Londra", to: "Adana", date: "1–4 Temmuz", weight: "12 kg", price: "200 £" },
            ].map((item, i) => (
              <div key={i} className="border p-4 rounded-lg shadow hover:shadow-lg transition">
                <div className="font-semibold">{item.from} → {item.to}</div>
                <div className="text-sm text-gray-500">{item.date}</div>
                <div className="text-sm mt-2">{item.weight} eşya</div>
                <div className="font-semibold">{item.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-10 space-x-4">
          <a href="#">Hakkımızda</a>
          <a href="#">KVKK</a>
          <a href="#">İletişim</a>
        </footer>
      </main>
    </>
  );
          }
