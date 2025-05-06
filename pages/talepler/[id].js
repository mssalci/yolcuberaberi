import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [talep, setTalep] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [loading, setLoading] = useState(false);
  const [eslesmeler, setEslesmeler] = useState([]);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchTalep = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "talepler", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTalep({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Talep çekilirken hata:", error);
      }
    };

    const fetchEslesmeler = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, "eslesmeler"), where("talepId", "==", id));
        const querySnapshot = await getDocs(q);
        const data = [];
        for (let docSnap of querySnapshot.docs) {
          const teklifDoc = await getDoc(doc(db, "teklifler", docSnap.data().teklifId));
          data.push({
            id: docSnap.id,
            ...docSnap.data(),
            teklif: teklifDoc.exists() ? teklifDoc.data() : null,
          });
        }
        setEslesmeler(data);
      } catch (error) {
        console.error("Eşleşmeler alınamadı:", error);
      }
    };

    fetchTalep();
    fetchEslesmeler();
  }, [id]);

  const handleTeklifVer = async (e) => {
    e.preventDefault();
    if (!user || !fiyat || !talep) return;

    const mevcutTeklifVarMi = eslesmeler.some(
      (eslesme) => eslesme.teklifVerenId === user.uid
    );
    if (mevcutTeklifVarMi) {
      alert("Bu talebe zaten bir teklif verdiniz.");
      return;
    }

    try {
      setLoading(true);

      const teklifRef = await addDoc(collection(db, "teklifler"), {
        talepId: talep.id,
        teklifVerenId: user.uid,
        fiyat: parseFloat(fiyat),
        not,
        olusturmaZamani: serverTimestamp(),
      });

      await addDoc(collection(db, "eslesmeler"), {
        talepId: talep.id,
        teklifId: teklifRef.id,
        teklifVerenId: user.uid,
        talepSahibiId: talep.kullaniciId || null,
        olusturmaZamani: serverTimestamp(),
      });

      alert("Teklif ve eşleşme başarıyla oluşturuldu.");
      setFiyat("");
      setNot("");
      router.reload(); // eşleşmeleri güncellemek için
    } catch (error) {
      console.error("Teklif/Eşleşme hatası:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!talep) {
    return <p className="text-center mt-10">Yükleniyor...</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">{talep.baslik}</h1>
      <p className="text-gray-700 mb-2">{talep.aciklama}</p>
      <p className="text-gray-500 mb-6 text-sm">Kategori: {talep.kategori}</p>

      <form onSubmit={handleTeklifVer} className="space-y-4 bg-gray-100 p-4 rounded mb-8">
        <div>
          <label className="block text-sm font-medium">Fiyat (₺)</label>
          <input
            type="number"
            value={fiyat}
            onChange={(e) => setFiyat(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Not</label>
          <textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Gönderiliyor..." : "Teklif Ver"}
        </button>
      </form>

      {eslesmeler.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Teklif Verenler</h2>
          <ul className="space-y-3">
            {eslesmeler.map((eslesme) => (
              <li key={eslesme.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    Fiyat: ₺{eslesme.teklif?.fiyat}
                  </p>
                  <p className="text-sm text-gray-600">
                    Not: {eslesme.teklif?.not || "-"}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/sohbet/${eslesme.id}`)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Sohbet
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
