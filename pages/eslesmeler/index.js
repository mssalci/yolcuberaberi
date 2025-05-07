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
import Link from "next/link";
import { format } from "date-fns";

export default function Eslesmeler() {
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchEslesmeler(currentUser);
      } else {
        setUser(null);
        setEslesmeler([]);
      }
    });
    return () => unsubscribe();
  }, [aktifSekme]);

  const fetchEslesmeler = async (currentUser) => {
    setYukleniyor(true);
    try {
      const q = query(
        collection(db, "eslesmeler"),
        where(
          aktifSekme === "tekliflerim" ? "teklifVerenId" : "talepSahibiId",
          "==",
          currentUser.uid
        )
      );
      const snapshot = await getDocs(q);
      const veriler = await Promise.all(
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
      setEslesmeler(veriler);
    } catch (err) {
      console.error("Eşleşme verisi alınamadı:", err);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleTeklifiIptalEt = async (eslesme) => {
    try {
      await deleteDoc(doc(db, "teklifler", eslesme.teklifId));
      await deleteDoc(doc(db, "eslesmeler", eslesme.id));
      alert("Teklif ve eşleşme silindi.");
      fetchEslesmeler(user);
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Teklif iptal edilemedi.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Eşleşmeler</h1>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setAktifSekme("tekliflerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "tekliflerim" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Tekliflerim
        </button>
        <button
          onClick={() => setAktifSekme("taleplerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "taleplerim" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Taleplerim
        </button>
      </div>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p className="text-center">Hiç eşleşme bulunamadı.</p>
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
              <p className="text-sm text-gray-700">
                Ülke: {eslesme.talep?.ulke || "-"}
              </p>
              <p className="text-sm text-gray-700">
                Fiyat: ₺{eslesme.teklif?.fiyat?.toFixed(2) || "-"}
              </p>
              <p className="text-sm text-gray-700">Not: {eslesme.teklif?.not || "-"}</p>
              <p className="text-sm text-gray-500">
                Zaman:{" "}
                {eslesme.olusturmaZamani?.toDate
                  ? format(eslesme.olusturmaZamani.toDate(), "dd.MM.yyyy HH:mm")
                  : "-"}
              </p>

              <div className="flex flex-wrap gap-4 mt-2">
                {aktifSekme === "tekliflerim" && (
                  <button
                    onClick={() => handleTeklifiIptalEt(eslesme)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Teklifi İptal Et
                  </button>
                )}
                <Link
                  href={`/teklif/${eslesme.teklifId}`}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
