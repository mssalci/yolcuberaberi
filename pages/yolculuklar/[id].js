// pages/yolculuklar/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

export default function YolculukDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [yolculuk, setYolculuk] = useState(null);
  const [user, setUser] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

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
          setYolculuk({ id: snap.id, ...snap.data() });
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
      setYolculuk(null); // 404 hatasını önlemek için önce state boşalt
      alert("Yolculuk silindi.");
      router.push("/talepler"); // yönlendirme yeni hedefe
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme işlemi başarısız oldu.");
    }
  };
const [kullaniciAdlari, setKullaniciAdlari] = useState({});

const fetchYolcular = async (yolculuklar) => {
  const yeniAdlar = {};
  for (const y of yolculuklar) {
    if (y.kullaniciId && !kullaniciAdlari[y.kullaniciId]) {
      const docRef = doc(db, "kullanicilar", y.kullaniciId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        yeniAdlar[y.kullaniciId] = snap.data().adSoyad || "Bilinmiyor";
      }
    }
  }
  setKullaniciAdlari((prev) => ({ ...prev, ...yeniAdlar }));
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
      <p className="text-gray-700 mb-6">Not: {yolculuk.not || "-"}</p>
<p className="text-sm text-gray-500">Yolcu: {kullaniciAdlari[y.kullaniciId] || "Yükleniyor..."}</p>
  
      {kullaniciYolculukSahibiMi && (
        <button
          onClick={handleYolculukSil}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Yolculuğu Sil
        </button>
      )}
    </main>
  );
    }
