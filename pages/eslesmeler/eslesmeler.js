import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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

export default function Eslesmeler() {
  const router = useRouter();
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEslesmeler = async () => {
      if (!user) return;
      setYukleniyor(true);

      try {
        const field =
          aktifSekme === "tekliflerim" ? "teklifVerenId" : "talepSahibiId";
        const q = query(collection(db, "eslesmeler"), where(field, "==", user.uid));

        const snapshot = await getDocs(q);

        const eslesmeVerileri = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            const talep = data.talepId
              ? await getDoc(doc(db, "talepler", data.talepId))
              : null;
            const teklif = data.teklifId
              ? await getDoc(doc(db, "teklifler", data.teklifId))
              : null;

            return {
              id: docSnap.id,
              ...data,
              talep: talep?.exists() ? talep.data() : null,
              teklif: teklif?.exists() ? teklif.data() : null,
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

  const teklifIptalEt = async (teklifId, eslesmeId) => {
    const onay = confirm("Teklifi iptal etmek istediğinize emin misiniz?");
    if (!onay) return;

    try {
      await deleteDoc(doc(db, "teklifler", teklifId));
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      alert("Teklif ve eşleşme iptal edildi.");
      setEslesmeler((prev) => prev.filter((e) => e.id !== eslesmeId));
    } catch (err) {
      console.error("İptal hatası:", err);
      alert("Bir hata oluştu.");
    }
  };

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
            <li key={eslesme.id} className="border p-4 rounded bg-white shadow space-y-2">
              <p className="font-semibold">
                Talep: {eslesme.talep?.baslik || "-"}
              </p>
              <p className="text-sm text-gray-600">Ülke: {eslesme.talep?.ulke || "-"}</p>
              <p className="text-sm text-gray-600">
                Açıklama: {eslesme.talep?.aciklama || "-"}
              </p>
              <p className="text-sm text-gray-600">
                Fiyat: ₺{eslesme.teklif?.fiyat?.toFixed(2) || "-"}
              </p>
              <p className="text-sm text-gray-600">Not: {eslesme.teklif?.not || "-"}</p>
              <p className="text-sm text-gray-500">
                Tarih: {eslesme.teklif?.olusturmaZamani?.toDate?.().toLocaleString() || "-"}
              </p>
              <div className="flex gap-3 pt-2">
                <Link
                  href={`/eslesmeler/tekliflerim/${eslesme.teklifId}`}
                  className="text-blue-600 underline"
                >
                  Teklif Detayı
                </Link>
                <Link
                  href={`/chat/${eslesme.id}`}
                  className="text-green-600 underline"
                >
                  Mesajlaş
                </Link>
                {aktifSekme === "tekliflerim" && (
                  <button
                    onClick={() => teklifIptalEt(eslesme.teklifId, eslesme.id)}
                    className="text-red-600 underline"
                  >
                    İptal Et
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
