import Head from "next/head";
import { CalendarDays, PackageSearch, Users } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Yolcu Beraberi | Yurt Dışından Eşya Getir, Kazan</title>
        <meta
          name="description"
          content="Yurt dışından eşya getirmek isteyenlerle seyahat eden yolcuları buluşturan İLK ve TEK platform. Hemen talep oluştur ve gelir elde et."
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

        </section>

        {/* Nasıl Çalışır */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-6">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <PackageSearch className="mx-auto w-8 h-8 text-blue-600" />
              <h3 className="font-semibold">Eşyan için talep oluştur yada talepler için yolculuk oluştur</h3>
              <p className="text-gray-500 text-sm">
                Ürününü tanımla ve getirtmek istediğin ülkeyi belirt yada gideceğin ülkeyi ve tarihi belirt.
              </p>
            </div>
            <div className="space-y-3">
              <CalendarDays className="mx-auto w-8 h-8 text-blue-600" />
              <h3 className="font-semibold">Teklif et yada teklif al ve Yolcunu bul yada getiren yolcu ol</h3>
              <p className="text-gray-500 text-sm">
                Uygun tarihte seyahat eden yolcu taleple eşleşsin.
              </p>
            </div>
            <div className="space-y-3">
              <Users className="mx-auto w-8 h-8 text-blue-600" />
              <h3 className="font-semibold">Eşyayı teslim et ödemeni al</h3>
              <p className="text-gray-500 text-sm">
                Güvenli teslimat ile eşyana kavuş.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-10 space-x-4">
          <a href="/iletisim">İletişim</a>
        </footer>
      </main>
    </>
  );
          }
