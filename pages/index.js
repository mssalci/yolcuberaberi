// pages/index.js
import Head from "next/head";

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

      <main className="min-h-screen flex items-center justify-center bg-white px-6 text-center text-gray-800">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Hoş Geldiniz!</h1>
          <p className="text-lg sm:text-xl leading-relaxed">
            Yukarıdaki menüden talepleri görüntüleyebilir, yeni talepler oluşturabilir veya eşleşmeleri yönetebilirsiniz.
          </p>
        </div>
      </main>
    </>
  );
            }
