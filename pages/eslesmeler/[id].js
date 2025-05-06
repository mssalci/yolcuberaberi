// pages/eslesmeler/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export default function EslesmeDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [eslesme, setEslesme] = useState(null);
  const [talep, setTalep] = useState(null);
  const [teklif, setTeklif] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState("");
  const [kullanicilar, setKullanicilar] = useState({});

  useEffect(() => {
    if (!id) return;

    const fetchKullanicilar = async (kullaniciIdleri) => {
      const promises = kullaniciIdleri.map(async (uid) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        return userDoc.exists() ? { uid, ...userDoc.data() } : null;
      });
      const results = await Promise.all(promises);
      const userMap = {};
      results.forEach((user) => {
        if (user) userMap[user.uid] = user;
      });
      setKullanicilar(userMap);
    };

    const fetchEslesme = async () => {
      const eslesmeRef = doc(db, "eslesmeler", id);
      const eslesmeSnap = await getDoc(eslesmeRef);
      if (eslesmeSnap.exists()) {
        const eslesmeData = eslesmeSnap.data();
        setEslesme({ id: eslesmeSnap.id, ...eslesmeData });

        // Talep verisi
        const talepSnap = await getDoc(doc(db, "talepler", eslesmeData.talepId));
        if (talepSnap.exists()) setTalep({ id: talepSnap.id, ...talepSnap.data() });

        // Teklif verisi
        const teklifSnap = await getDoc(doc(db, "teklifler", eslesmeData.teklifId));
        if (teklifSnap.exists()) setTeklif({ id: teklifSnap.id, ...teklifSnap.data() });

        // Kullanıcı bilgilerini çek
        const talepSahibiId = talepSnap?.data()?.olusturanId;
        const teklifVerenId = teklifSnap?.data()?.olusturanId;
        await fetchKullanicilar([talepSahibiId, teklifVerenId]);

        // Mesajları dinle
        const mesajQuery = query(
          collection(db, "eslesmeler", id, "mesajlar"),
          where("eslesmeId", "==", id)
        );
        const unsubscribe = onSnapshot(mesajQuery, (snapshot) => {
          const mesajList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setMesajlar(mesajList.sort((a, b) => a.olusturmaZamani?.seconds - b.olusturmaZamani?.seconds));
        });

        return () => unsubscribe();
      }
    };

    fetchEslesme();
  }, [id]);

  const handleMesajGonder = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !yeniMesaj.trim()) return;

    try {
      await addDoc(collection(db, "eslesmeler", id, "mesajlar"), {
        eslesmeId: id,
        gonderenId: user.uid,
        mesaj: yeniMesaj.trim(),
        olusturmaZamani: serverTimestamp(),
      });
      setYeniMesaj("");
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err.message);
    }
  };

  if (!eslesme || !talep || !teklif) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Eşleşme Detayı</h1>
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold">Talep: {talep.baslik}</h2>
        <p className="text-sm text-gray-600">{talep.aciklama}</p>
        <p className="mt-2">Teklif Fiyatı: {teklif.fiyat} ₺</p>
        <p>Not: {teklif.not}</p>
      </div>

      <div className="bg-white border rounded p-4 h-[400px] overflow-y-auto mb-4">
        <h3 className="font-semibold mb-2">Mesajlaşma</h3>
        {mesajlar.length === 0 && <p className="text-sm text-gray-500">Henüz mesaj yok.</p>}
        {mesajlar.map((msg) => {
          const user = kullanicilar[msg.gonderenId];
          const isim = user?.adSoyad || user?.email || "Bilinmeyen Kullanıcı";
          return (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded ${
                msg.gonderenId === auth.currentUser?.uid
                  ? "bg-blue-100 text-right"
                  : "bg-gray-200 text-left"
              }`}
            >
              <p className="text-xs font-semibold">{isim}</p>
              <p className="text-sm">{msg.mesaj}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleMesajGonder} className="flex gap-2">
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={yeniMesaj}
          onChange={(e) => setYeniMesaj(e.target.value)}
          className="flex-grow border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Gönder
        </button>
      </form>
    </main>
  );
}
