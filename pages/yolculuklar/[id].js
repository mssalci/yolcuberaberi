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
  deleteDoc,
} from "firebase/firestore";

export default function YolculukDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [yolculuk, setYolculuk] = useState(null);
  const [user, setUser] = useState(null);
  const [teklifler, setTeklifler] = useState([]);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchYolculuk = async () => {
      try {
        const ref = doc(db, "yolculuklar", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setYolculuk({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Yolculuk alınamadı:", err);
      }
    };

    const fetchTeklifler = async () => {
      try {
        const q = query(collection(db, "yolculukEslesmeleri"), where("yolculukId", "==", id));
        const snapshot = await getDocs(q);
        const data = [];

        for (let eslesme of snapshot.docs) {
          const teklifDoc = await getDoc(doc(db, "yolculukTeklifleri", eslesme.data().teklifId));
          data.push({
            id: eslesme.id,
            ...eslesme.data(),
            teklif: teklifDoc.exists() ? teklifDoc.data() : null,
          });
        }

        setTeklifler(data);
      } catch (err) {
        console.error("Teklifler alınamadı:", err);
      }
    };

    if (id) {
      fetchYolculuk();
      fetchTeklifler();
    }
  }, [id]);

  const handleTeklifVer = async (e) => {
    e.preventDefault();

    if (!user || !fiyat || !tarih || !yolculuk) return;

    if (new Date(tarih) < new Date(todayStr)) {
      alert("Teslim tarihi bugünden önce olamaz.");
      return;
    }

    const mevcutTeklifVarMi = teklifler.some(
      (eslesme) => eslesme.teklifVerenId === user.uid
    );
    if (mevcutTeklifVarMi) {
      alert("Bu yolculuğa zaten teklif verdiniz.");
      return;
    }

    try {
      setLoading(true);
      const teklifRef = await addDoc(collection(db, "yolculukTeklifleri"), {
        yolculukId: yolculuk.id,
        teklifVerenId: user.uid,
        fiyat: parseFloat(fiyat),
        not,
        tarih,
        olusturmaZamani: serverTimestamp(),
      });

      await addDoc(collection(db, "yolculukEslesmeleri"), {
        yolculukId: yolculuk.id,
        teklifId: teklifRef.id,
        teklifVerenId: user.uid,
        yolculukSahibiId: yolculuk.kullaniciId || null,
        olusturmaZamani: serverTimestamp(),
      });

      alert("Teklif ve eşleşme başarıyla oluşturuldu.");
      setFiyat("");
      setNot("");
      setTarih("");
      router.reload();
    } catch (err) {
      console.error("Teklif/Eşleşme hatası:", err);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleYolculukSil = async () => {
    const onay = confirm("Yolculuğu silmek istediğinize emin misiniz?");
    if (!onay || !yolculuk) return;

    try {
      await deleteDoc(doc(db, "yolculuklar", yolculuk.id));
      alert("Yolculuk silindi.");
      router.push("/talepler?sekme=yolculuklar");
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme işlemi başarısız oldu.");
    }
  };

  const kullaniciSahibiMi = user && yolculuk?.kullaniciId === user.uid;

  if (!yolculuk) return <p className="p-4 text-center">Yükleniyor...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Yolculuk Detayı</h1>
      <p className="text-gray-700 mb-2">Kalkış: {yolculuk.kalkis}</p>
      <p className="text-gray-700 mb-2">Varış: {yolculuk.varis}</p>
      <p className="text-gray-700 mb-2">Tarih: {yolculuk.tarih || "-"}</p>
      <p className="text-gray-700 mb-6">Not: {yolculuk.not || "-"}</p>

      {kullaniciSahibiMi && (
        <button
          onClick={handleYolculukSil}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Yolculuğu Sil
        </button>
      )}

      {user && !kullaniciSahibiMi && (
        <form
          onSubmit={handleTeklifVer}
          className="space-y-4 bg-gray-100 p-4 rounded mb-8"
        >
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
            <label className="block text-sm font-medium">Teslim Tarihi</label>
            <input
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              min={todayStr}
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
      )}

      {teklifler.length > 0 && kullaniciSahibiMi && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Teklif Verenler</h2>
          <ul className="space-y-3">
            {teklifler.map((eslesme) => (
              <li
                key={eslesme.id}
                className="p-3 bg-white rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">Fiyat: ₺{eslesme.teklif?.fiyat}</p>
                  <p className="text-sm text-gray-600">Tarih: {eslesme.teklif?.tarih || "-"}</p>
                  <p className="text-sm text-gray-600">Not: {eslesme.teklif?.not || "-"}</p>
                </div>
                <button
                  onClick={() => router.push(`/chat/${eslesme.id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Sohbete Git
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
                }
