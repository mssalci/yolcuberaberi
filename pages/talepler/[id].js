//pages/talepler/[id].js

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

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [talep, setTalep] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [loading, setLoading] = useState(false);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [user, setUser] = useState(null);
  const [talepSahibiadSoyad, setTalepSahibiAdSoyad] = useState("");

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD formatı

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTalep = async () => {
      try {
        const docRef = doc(db, "talepler", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const talepData = { id: docSnap.id, ...docSnap.data() };
          setTalep(talepData);

          const kullaniciRef = doc(db, "kullanicilar", talepData.kullaniciId);
          const kullaniciSnap = await getDoc(kullaniciRef);
          if (kullaniciSnap.exists()) {
            setTalepSahibiAdSoyad(kullaniciSnap.data().adSoyad || "Bilinmiyor");
          }
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

    if (id) {
      fetchTalep();
      fetchEslesmeler();
    }
  }, [id]);

const handleTeklifVer = async (e) => {
  e.preventDefault();

  if (!user) {
    alert("Teklif verebilmek için giriş yapmalısınız.");
    return;
  }

  if (!user.emailVerified) {
    alert("Teklif verebilmek için e-posta adresinizi doğrulamanız gerekiyor.");
    return;
  }

  if (!fiyat || !talep) return;

  if (new Date(tarih) < new Date(todayStr)) {
    alert("Teslim tarihi bugünden önce olamaz.");
    return;
  }

  try {
    setLoading(true);

    // 1. Kullanıcının daha önce herhangi bir teklifi var mı kontrol et
    const q = query(
      collection(db, "teklifler"),
      where("teklifVerenId", "==", user.uid)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("Zaten başka bir talep veya yolculuğa teklif verdiniz. Yeni teklif veremezsiniz.");
      setLoading(false);
      return;
    }

    // 2. Bu talebe özel daha önce teklif verildi mi kontrolü (opsiyonel ama kalsın)
    const mevcutTeklifVarMi = eslesmeler.some(
      (eslesme) => eslesme.teklifVerenId === user.uid
    );
    if (mevcutTeklifVarMi) {
      alert("Bu talebe zaten bir teklif verdiniz.");
      setLoading(false);
      return;
    }

    // 3. Teklif oluştur
    const teklifRef = await addDoc(collection(db, "teklifler"), {
      talepId: talep.id,
      teklifVerenId: user.uid,
      fiyat: parseFloat(fiyat),
      not,
      tarih,
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
    setTarih("");
    router.reload();
  } catch (error) {
    console.error("Teklif/Eşleşme hatası:", error);
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  } finally {
    setLoading(false);
  }
};

  const handleTalepSil = async () => {
    const onay = confirm("Talebi silmek istediğinize emin misiniz?");
    if (!onay) return;
    try {
      await deleteDoc(doc(db, "talepler", talep.id));
      alert("Talep silindi.");
      router.push("/talepler");
    } catch (err) {
      console.error("Talep silme hatası:", err);
      alert("Talep silinemedi.");
    }
  };

  const kullaniciTalepSahibiMi = user && talep?.kullaniciId === user.uid;

  if (!talep) {
    return <p className="text-center mt-10">Yükleniyor...</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">{talep.baslik}</h1>
      <p className="text-gray-700 mb-2">{talep.aciklama}</p>
      <p className="text-gray-600 text-sm mb-1">Ülke/Şehir: {talep.ulke || "-"}</p>
      <p className="text-gray-600 text-sm mb-1">
        Tarih: {talep.tarih?.toDate?.().toLocaleDateString() || "-"}
      </p>
      <p className="text-gray-600 text-sm mb-1">Bütçe: {talep.butce || "-"}</p>
      <p className="text-gray-600 text-sm mb-6">Talep Sahibi: {talepSahibiadSoyad || "-"}</p>

      {kullaniciTalepSahibiMi && (
        <button
          onClick={handleTalepSil}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Talebi Sil
        </button>
      )}

      {user && !kullaniciTalepSahibiMi && (
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

      {eslesmeler.length > 0 && kullaniciTalepSahibiMi && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Teklif Verenler</h2>
          <ul className="space-y-3">
            {eslesmeler.map((eslesme) => (
              <li key={eslesme.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-medium">Fiyat: ₺{eslesme.teklif?.fiyat}</p>
                  <p className="text-sm text-gray-600">
                    Teslim Tarihi: {eslesme.teklif?.tarih || "-"}
                  </p>
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
