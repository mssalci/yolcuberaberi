// pages/yolculuklar/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function YolculukDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [yolculuk, setYolculuk] = useState(null);
  const [user, setUser] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yolcuAdi, setYolcuAdi] = useState("");
  const [teklif, setTeklif] = useState({ fiyat: "", teslimTarihi: "", not: "" });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchYolculuk = async () => {
      if (!id) return;
      try {
        const ref = doc(db, "yolculuklar", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setYolculuk(data);

          // Yolcu adı çek
          const userRef = doc(db, "kullanicilar", data.kullaniciId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setYolcuAdi(userSnap.data().adSoyad || "Bilinmiyor");
          }
        }
      } catch (err) {
        console.error("Yolculuk alınamadı:", err);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchYolculuk();
  }, [id]);

  const handleYolculukSil = async () => {
    const onay = confirm("Yolculuğu silmek istediğinize emin misiniz?");
    if (!onay || !yolculuk) return;

    try {
      await deleteDoc(doc(db, "yolculuklar", yolculuk.id));
      setYolculuk(null);
      alert("Yolculuk silindi.");
      router.push("/talepler?sekme=yolculuklar");
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme işlemi başarısız oldu.");
    }
  };

  const handleTeklifVer = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "yolculukTeklifleri"), {
        yolculukId: yolculuk.id,
        teklifVerenId: user.uid,
        fiyat: parseFloat(teklif.fiyat),
        teslimTarihi: teklif.teslimTarihi,
        not: teklif.not,
        olusturmaZamani: serverTimestamp(),
      });
      alert("Teklif gönderildi!");
      setTeklif({ fiyat: "", teslimTarihi: "", not: "" });
    } catch (err) {
      console.error("Teklif hatası:", err);
      alert("Teklif gönderilemedi.");
    }
  };

  const kullaniciYolculukSahibiMi = user && yolculuk?.kullaniciId === user.uid;

  if (yukleniyor) return <p className="p-4 text-center">Yükleniyor...</p>;
  if (!yolculuk) return <p className="p-4 text-center">Yolculuk bulunamadı.</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Yolculuk Detayı</h1>
      <p className="text-gray-700 mb-2">Kalkış: {yolculuk.kalkis}</p>
      <p className="text-gray-700 mb-2">Varış: {yolculuk.varis}</p>
      <p className="text-gray-700 mb-2">Tarih: {yolculuk.tarih || "-"}</p>
      <p className="text-gray-700 mb-2">Not: {yolculuk.not || "-"}</p>
      <p className="text-sm text-gray-500 mb-6">Yolcu: {yolcuAdi || "Yükleniyor..."}</p>

      {kullaniciYolculukSahibiMi && (
        <button
          onClick={handleYolculukSil}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Yolculuğu Sil
        </button>
      )}

      {!kullaniciYolculukSahibiMi && user && (
        <form onSubmit={handleTeklifVer} className="mt-10 space-y-4 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Teklif Ver</h2>
          <input
            type="number"
            placeholder="Fiyat (₺)"
            value={teklif.fiyat}
            onChange={(e) => setTeklif({ ...teklif, fiyat: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="date"
            value={teklif.teslimTarihi}
            onChange={(e) => setTeklif({ ...teklif, teslimTarihi: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <textarea
            placeholder="Not (Opsiyonel)"
            value={teklif.not}
            onChange={(e) => setTeklif({ ...teklif, not: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Gönder
          </button>
        </form>
      )}
    </main>
  );
              }
