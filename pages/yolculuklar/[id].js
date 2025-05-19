//pages/yolculuklar/[id].js

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
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [loading, setLoading] = useState(false);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [user, setUser] = useState(null);

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

    const fetchEslesmeler = async () => {
      try {
        const q = query(collection(db, "eslesmeler"), where("yolculukId", "==", id));
        const snapshot = await getDocs(q);
        const data = [];
        for (let docSnap of snapshot.docs) {
          const teklifDoc = await getDoc(doc(db, "teklifler", docSnap.data().teklifId));
          data.push({
            id: docSnap.id,
            ...docSnap.data(),
            teklif: teklifDoc.exists() ? teklifDoc.data() : null,
          });
        }
        setEslesmeler(data);
      } catch (err) {
        console.error("Eşleşme alınamadı:", err);
      }
    };

    if (id) {
      fetchYolculuk();
      fetchEslesmeler();
    }
  }, [id]);

  const handleTeklifVer = async (e) => {
  e.preventDefault();
  if (!user) return;

  // *** E-POSTA DOĞRULAMASI KONTROLÜ ***
  if (!user.emailVerified) {
    alert("Teklif verebilmek için e-posta adresinizi doğrulamanız gerekir.");
    return;
  }

  if (!fiyat || !yolculuk) return;
  if (new Date(tarih) < new Date(todayStr)) {
    alert("Teslim tarihi bugünden önce olamaz.");
    return;
  }

  // *** KULLANICININ HERHANGİ BİR TEKLİFİ VAR MI KONTROLÜ ***
  try {
    const teklifQuery = query(
      collection(db, "teklifler"),
      where("teklifVerenId", "==", user.uid)
    );
    const teklifSnapshot = await getDocs(teklifQuery);

    if (!teklifSnapshot.empty) {
      alert("Zaten bir teklif verdiniz. Yeni teklif veremezsiniz.");
      return;
    }
  } catch (err) {
    console.error("Teklif kontrolü sırasında hata:", err);
    alert("Teklif kontrolü sırasında bir hata oluştu.");
    return;
  }

  // *** BU YOLCULUĞA ZATEN TEKLİF VERİLMİŞ Mİ KONTROLÜ ***
  const mevcutTeklifVarMi = eslesmeler.some(
    (eslesme) => eslesme.teklifVerenId === user.uid
  );
  if (mevcutTeklifVarMi) {
    alert("Bu yolculuğa zaten bir teklif verdiniz.");
    return;
  }

  try {
    setLoading(true);
    const teklifRef = await addDoc(collection(db, "teklifler"), {
      yolculukId: yolculuk.id,
      teklifVerenId: user.uid,
      fiyat: parseFloat(fiyat),
      not,
      tarih,
      olusturmaZamani: serverTimestamp(),
    });

    await addDoc(collection(db, "eslesmeler"), {
      yolculukId: yolculuk.id,
      teklifId: teklifRef.id,
      teklifVerenId: user.uid,
      yolculukSahibiId: yolculuk.kullaniciId,
      olusturmaZamani: serverTimestamp(),
    });

    alert("Teklif ve eşleşme başarıyla oluşturuldu.");
    setFiyat("");
    setNot("");
    setTarih("");
    router.reload();
  } catch (err) {
    console.error("Teklif oluşturulamadı:", err);
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  } finally {
    setLoading(false);
  }
};

  const handleYolculukSil = async () => {
  const onay = confirm("Yolculuğu silmek istediğinize emin misiniz?");
  if (!onay) return;

  try {
    // 1. Bu yolculukla ilişkili eşleşmeleri bul
    const eslesmeQuery = query(collection(db, "eslesmeler"), where("yolculukId", "==", yolculuk.id));
    const eslesmeSnap = await getDocs(eslesmeQuery);

    // 2. Her eşleşme için teklifi ve sohbet mesajlarını sil
    for (const eslesmeDoc of eslesmeSnap.docs) {
      const eslesme = eslesmeDoc.data();
      const teklifId = eslesme.teklifId;

      // Teklifi sil
      await deleteDoc(doc(db, "teklifler", teklifId));

      // Mesajları sil
      const mesajQuery = query(collection(db, "mesajlar"), where("eslesmeId", "==", eslesmeDoc.id));
      const mesajSnap = await getDocs(mesajQuery);
      for (const mesaj of mesajSnap.docs) {
        await deleteDoc(mesaj.ref);
      }

      // Eşleşmeyi sil
      await deleteDoc(eslesmeDoc.ref);
    }

    // 3. Yolculuğu sil
    await deleteDoc(doc(db, "yolculuklar", yolculuk.id));

    alert("Yolculuk, teklifleri ve mesajlar silindi.");
    router.push("/talepler?sekme=yolculuklar");
  } catch (err) {
    console.error("Silme hatası:", err);
    alert("Silme işlemi sırasında bir hata oluştu.");
  }
};

  const kullaniciYolculukSahibiMi = user && yolculuk?.kullaniciId === user.uid;

  if (!yolculuk) return <p className="p-4 text-center">Yükleniyor...</p>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Yolculuk</h1>
      <p className="text-gray-700 mb-2">Kalkış: {yolculuk.kalkis}</p>
      <p className="text-gray-700 mb-2">Varış: {yolculuk.varis}</p>
      <p className="text-gray-700 mb-2">Tarih: {yolculuk.tarih}</p>
      <p className="text-gray-700 mb-6">Not: {yolculuk.not || "-"}</p>

      {kullaniciYolculukSahibiMi && (
        <button
          onClick={handleYolculukSil}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Yolculuğu Sil
        </button>
      )}

      {user && !kullaniciYolculukSahibiMi && (
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

      {eslesmeler.length > 0 && kullaniciYolculukSahibiMi && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Teklif Verenler</h2>
          <ul className="space-y-3">
            {eslesmeler.map((eslesme) => (
              <li key={eslesme.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-medium">Fiyat: ₺{eslesme.teklif?.fiyat}</p>
                  <p className="text-sm text-gray-600">Teslim Tarihi: {eslesme.teklif?.tarih || "-"}</p>
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
