import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { format } from "date-fns";

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;
  const [talep, setTalep] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchTalep = async () => {
      const docRef = doc(db, "talepler", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTalep({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchTalep();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;
  if (!talep) return <p className="text-center mt-10 text-red-600">Talep bulunamadı.</p>;

  return (
    <>
      <Head>
        <title>{talep.baslik} | Yolcu Beraberi</title>
        <meta name="description" content={talep.aciklama} />
      </Head>

      <main className="bg-white text-gray-800 min-h-screen px-4 py-20 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{talep.baslik}</h1>
        <p className="mb-4 text-gray-700">{talep.aciklama}</p>
        <p className="mb-2 text-sm text-gray-600">Ülke: {talep.ulke}</p>
        <p className="mb-2 text-sm text-gray-600">
          Tarih: {talep.tarih?.toDate ? format(talep.tarih.toDate(), "dd.MM.yyyy HH:mm") : "Bilinmiyor"}
        </p>
        {/* Ek bilgiler */}
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Bu talebe teklif ver
          </button>
        </div>
      </main>
    </>
  );
}
