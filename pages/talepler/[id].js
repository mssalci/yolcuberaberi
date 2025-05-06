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
  orderBy,
} from "firebase/firestore";

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [talep, setTalep] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [loading, setLoading] = useState(false);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [mesajlar, setMesajlar] = useState({});
  const [mesajInput, setMesajInput] = useState({});
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

    fetchTalep();
  }, [id]);

  useEffect(() => {
    const fetchEslesmeler = async () => {
      if (!id) return;
      try {
        const q = query(collection(db, "eslesmeler"), where("talepId", "==", id));
        const querySnapshot = await getDocs(q);
        const eslesmelerList = [];
        const mesajVerileri = {};

        for (const docSnap of querySnapshot.docs) {
          const eslesme = { id: docSnap.id, ...docSnap.data() };
          eslesmelerList.push(eslesme);

          // Mesajları al
          const mesajQuery = query(
            collection(db, "eslesmeler", docSnap.id, "mesajlar"),
            orderBy("olusturmaZamani", "asc")
          );
          const mesajSnap = await getDocs(mesajQuery);
          mesajVerileri[docSnap.id] = mesajSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        }

        setEslesmeler(eslesmelerList);
        setMesajlar(mesajVerileri);
      } catch (error) {
        console.error("Eşleşmeler çekilirken hata:", error);
      }
    };

    fetchEslesmeler();
  }, [id]);

  const handleTeklifVer = async (e) => {
    e.preventDefault();
    if (!user || !fiyat || !talep) return;

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
    } catch (error) {
      console.error("Teklif/Eşleşme hatası:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleMesajGonder = async (eslesmeId) => {
    if (!user || !mesajInput[eslesmeId]) return;
    try {
      await addDoc(collection(db, "eslesmeler", eslesmeId, "mesajlar"), {
        gonderenId: user.uid,
        icerik: mesajInput[eslesmeId],
        olusturmaZamani: serverTimestamp(),
      });
      setMesajInput((prev) => ({ ...prev, [eslesmeId]: "" }));
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  };

  if (!talep) {
    return <p className="text-center mt-10">Yükleniyor...</p>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">{talep.baslik}</h1>
      <p className="text-gray-700 mb-2">{talep.aciklama}</p>
      <p className="text-gray-500 mb-6 text-sm">Kategori: {talep.kategori}</p>

      <form onSubmit={handleTeklifVer} className="space-y-4 bg-gray-100 p-4 rounded mb-10">
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

      <section>
        <h2 className="text-xl font-semibold mb-4">Eşleşmeler</h2>
        {eslesmeler.length === 0 ? (
          <p>Henüz eşleşme yok.</p>
        ) : (
          eslesmeler.map((eslesme) => (
            <div key={eslesme.id} className="mb-6 border rounded p-4 bg-gray-50">
              <p className="font-medium">Teklif Veren ID: {eslesme.teklifVerenId}</p>
              <div className="mt-3">
                <h3 className="font-semibold mb-2">Sohbet</h3>
                <div className="bg-white border p-2 h-40 overflow-y-auto mb-2">
                  {mesajlar[eslesme.id]?.map((mesaj) => (
                    <div
                      key={mesaj.id}
                      className={`mb-1 text-sm ${
                        mesaj.gonderenId === user?.uid ? "text-right text-blue-600" : "text-left"
                      }`}
                    >
                      {mesaj.icerik}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={mesajInput[eslesme.id] || ""}
                    onChange={(e) =>
                      setMesajInput((prev) => ({ ...prev, [eslesme.id]: e.target.value }))
                    }
                    className="flex-1 border rounded px-2 py-1"
                    placeholder="Mesaj yaz..."
                  />
                  <button
                    onClick={() => handleMesajGonder(eslesme.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Gönder
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
          }
