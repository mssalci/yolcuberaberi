import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";
import { auth, db } from "../../firebase/firebaseConfig";

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;
  const [talep, setTalep] = useState(null);
  const [loading, setLoading] = useState(true);

  const [teklifData, setTeklifData] = useState({
    fiyat: "",
    not: "",
    tarih: "",
  });

  const handleTeklifChange = (e) => {
    setTeklifData({ ...teklifData, [e.target.name]: e.target.value });
  };

  const handleTeklifSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Lütfen giriş yapın.");
    try {
      await addDoc(collection(db, "teklifler"), {
        ...teklifData,
        kullaniciId: user.uid,
        talepId: talep.id,
        olusturmaZamani: serverTimestamp(),
      });
      alert("Teklif başarıyla gönderildi!");
      setTeklifData({ fiyat: "", not: "", tarih: "" });
    } catch (err) {
      alert("Teklif gönderilemedi: " + err.message);
    }
  };

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

        {/* Teklif Verme Formu */}
        <section className="mt-12 border-t pt-10">
          <h2 className="text-2xl font-semibold mb-6">Teklif Ver</h2>
          <form onSubmit={handleTeklifSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Fiyat Teklifi (TL)</label>
              <input
                type="number"
                name="fiyat"
                value={teklifData.fiyat}
                onChange={handleTeklifChange}
                required
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Tahmini Getirme Tarihi</label>
              <input
                type="date"
                name="tarih"
                value={teklifData.tarih}
                onChange={handleTeklifChange}
                required
                className="w-full border px-4 py-2 rounded"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Not / Açıklama</label>
              <textarea
                name="not"
                value={teklifData.not}
                onChange={handleTeklifChange}
                className="w-full border px-4 py-2 rounded"
                rows="3"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Teklif Gönder
            </button>
          </form>
        </section>
      </main>
    </>
  );
    }
