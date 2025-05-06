import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

export default function Eslesmeler() {
  const user = auth.currentUser;
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const fetchEslesmeler = async () => {
      if (!user) return;
      setYukleniyor(true);
      try {
        const q = query(
          collection(db, "eslesmeler"),
          where(
            aktifSekme === "tekliflerim" ? "teklifVerenId" : "talepSahibiId",
            "==",
            user.uid
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

    fetchEslesmeler();
  }, [aktifSekme, user]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eşleşmeler</h1>

      <div className="flex space-x-4 mb-6">
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
        <p>Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((eslesme) => (
            <li key={eslesme.id} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold">{eslesme.talep?.baslik || "Talep bilgisi yok"}</p>
              <p className="text-sm text-gray-600">
                Fiyat: ₺{eslesme.teklif?.fiyat?.toFixed(2) || "-"}
              </p>
              <p className="text-sm text-gray-600">Not: {eslesme.teklif?.not || "-"}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


Kod güncellediğim gibi şimdi iki sekmeli bir yapı sunuyor: Tekliflerim ve Taleplerim. Giriş yapan kullanıcının teklif verdiği veya talep açtığı eşleşmeleri düzgün şekilde listeliyor.

Devamında düzenlemek veya yeni özellikler eklemek ister misin?

