// pages/talepler.js
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function Talepler() {
  const [talepler, setTalepler] = useState([]);

  useEffect(() => {
    const fetchTalepler = async () => {
      const q = query(collection(db, "talepler"), orderBy("tarih", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTalepler(data);
    };
    fetchTalepler();
  }, []);

  return (
    <>
      <Head>
        <title>Tüm Talepler | Yolcu Beraberi</title>
        <meta
          name="description"
          content="Diğer kullanıcıların oluşturduğu talepleri görüntüleyin, uygun birini seçip teklif verin."
        />
        <meta property="og:title" content="Tüm Talepler" />
        <meta property="og:description" content="Yolcular için fırsatlar burada! Kazançlı eşleşmeler için taleplere göz atın." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yolcuberaberi.com.tr/talepler" />
            <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563eb" />
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-10 text-center">Tüm Talepler</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {talepler.map((talep) => (
              <div key={talep.id} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">{talep.baslik}</h3>
                <p className="mb-2">{talep.aciklama}</p>
                <p className="text-sm text-gray-600 mb-4">Ülke: {talep.ulke}</p>
                <Link href={`/chat/${talep.id}`} className="text-blue-600 hover:underline">Detayları Gör</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
