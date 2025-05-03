import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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

  const [teklifler, setTeklifler] = useState([]);

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
      fetchTeklifler(talep.id); // Yeni teklifi hemen yükle
    } catch (err) {
      alert("Teklif gönderilemedi: " + err.message);
    }
  };

  const fetchTeklifler = async (talepId) => {
    const q = query(collection(db, "teklifler"), where("talepId", "==", talepId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTeklifler(data);
  };

  useEffect(() => {
    if (!router.isReady) return;
    const fetchTalep = async () => {
      const docRef = doc(db, "talepler", router.query.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const talepVerisi = { id: docSnap.id, ...docSnap.data() };
        setTalep(talepVerisi);
        fetchTeklifler(docSnap.id);
      }
      setLoading(false);
    };
    fetchTalep();
  }, [router.isReady]);

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
          Tarih:{" "}
          {talep.tarih?.toDate
            ? format(talep.tarih.toDate(), "dd.MM.yyyy HH:mm")
            : "Bilinmiyor"}
        </p>

        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-3">Teklif Ver</h2>
          <form onSubmit={handleTeklifSubmit} className="space-y-4">
            <input
              type="text"
              name="fiyat"
              placeholder="Fiyat (TL)"
              value={teklifData.fiyat}
              onChange={handleTeklifChange}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              name="not"
              placeholder="Not"
              value={teklifData.not}
              onChange={handleTeklifChange}
              className="w-full border p-2 rounded"
            />
            <input
              type="text"
              name="tarih"
              placeholder="Tahmini Teslim Tarihi"
              value={teklifData.tarih}
              onChange={handleTeklifChange}
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Teklif Gönder
            </button>
          </form>
        </div>

        {teklifler.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-3">Gelen Teklifler</h2>
            {teklifler.map((teklif) => (
              <div key={teklif.id} className="border p-4 rounded mb-3 bg-gray-50">
                <p><strong>Fiyat:</strong> {teklif.fiyat} TL</p>
                <p><strong>Not:</strong> {teklif.not}</p>
                <p><strong>Teslim Tarihi:</strong> {teklif.tarih}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
          }
