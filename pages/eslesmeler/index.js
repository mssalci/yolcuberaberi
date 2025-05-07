import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Eslesmeler() {
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (kullanici) => {
      setUser(kullanici);
      if (kullanici) {
        await fetchEslesmeler(kullanici.uid);
      }
    });
    return () => unsubscribe();
  }, [aktifSekme]);

  const fetchEslesmeler = async (uid) => {
    setYukleniyor(true);
    try {
      const q = query(
        collection(db, "eslesmeler"),
        where(
          aktifSekme === "tekliflerim" ? "teklifVerenId" : "talepSahibiId",
          "==",
          uid
        )
      );
      const snapshot = await getDocs(q);
      const eslesmeVerileri = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const talepDoc = await getDoc(doc(db, "talepler", data.talepId));
          const teklifDoc = await getDoc(doc(db, "teklifler", data.teklifId));
          return {
            id: docSnap.id,
            ...data,
            talep: talepDoc.exists() ? talepDoc.data() : null,
            teklif: teklifDoc.exists() ? teklifDoc.data() : null,
          };
        })
      );
      setEslesmeler(eslesmeVerileri);
    } catch (error) {
      console.error("Eşleşmeler alınırken hata:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleTeklifIptal = async (teklifId) => {
    if (!confirm("Teklifi iptal etmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, "teklifler", teklifId));
      alert("Teklif iptal edildi.");
      if (user) await fetchEslesmeler(user.uid);
    } catch (err) {
      console.error("İptal hatası:", err);
      alert("Teklif iptal edilemedi.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eşleşmeler</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAktifSekme("tekliflerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "tekliflerim"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Tekliflerim
        </button>
        <button
          onClick={() => setAktifSekme("taleplerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "taleplerim"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Taleplerim
        </button>
      </div>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p>Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((eslesme) => (
            <li
              key={eslesme.id}
              className="border p-4 rounded bg-white shadow space-y-2"
            >
              <p className="font-semibold text-lg">
                {eslesme.talep?.baslik || "Talep bilgisi yok"}
              </p>
              <p className="text-sm text-gray-600">
                Ülke: {eslesme.talep?.ulke || "-"}
              </p>
              <p className="text-sm text-gray-600">
                Fiyat: ₺{eslesme.teklif?.fiyat?.toFixed(2) || "-"}
              </p>
              <p className="text-sm text-gray-600">
                Not: {eslesme.teklif?.not || "-"}
              </p>
              <p className="text-sm text-gray-500">
                Zaman: {new Date(eslesme.olusturmaZamani?.seconds * 1000).toLocaleString("tr-TR") || "-"}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleTeklifIptal(eslesme.teklifId)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Teklifi İptal Et
                </button>
                <Link
                  href={`/teklif/${eslesme.teklifId}`}
                  className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
                >
                  Teklif Detayı
                </Link>
                <Link
                  href={`/sohbet/${eslesme.id}`}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Mesajlaş
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


Güncellenmiş dosya başarıyla tamamlandı. Artık eşleşmeler sayfasında:

Ülke, fiyat, not ve zaman bilgileri gösteriliyor.

Teklifi İptal Et, Teklif Detayı, Mesajlaş butonları mevcut ve işlevsel.

Yapı, tekliflerim ve taleplerim sekmeleriyle çalışıyor.


Şimdi başka bir modülün revizyonuna geçmek ister misin?

