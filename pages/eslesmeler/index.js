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
  const [user, setUser] = useState(null);
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

    if (user) fetchEslesmeler();
  }, [aktifSekme, user]);

  const handleTeklifIptal = async (teklifId, eslesmeId) => {
    const onay = confirm("Bu teklifi iptal etmek istediğinize emin misiniz?");
    if (!onay) return;
    try {
      await deleteDoc(doc(db, "teklifler", teklifId));
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      alert("Teklif iptal edildi.");
      setEslesmeler((prev) => prev.filter((e) => e.id !== eslesmeId));
    } catch (err) {
      console.error("İptal hatası:", err.message);
      alert("Bir hata oluştu. Teklif silinemedi.");
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
        <p className="text-center">Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p className="text-center">Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((eslesme) => (
            <li
              key={eslesme.id}
              className="border p-4 rounded bg-white shadow-sm space-y-2"
            >
              <h2 className="text-lg font-semibold">
                Talep: {eslesme.talep?.baslik || "Talep bilgisi yok"}
              </h2>
              <p className="text-sm text-gray-700">
                Açıklama: {eslesme.talep?.aciklama || "-"}
              </p>
              <p className="text-sm text-gray-600">
                Ülke: {eslesme.talep?.ulke || "-"}
              </p>
              <p className="text-sm text-gray-600">
                Fiyat: ₺{eslesme.teklif?.fiyat?.toFixed(2) || "-"}
              </p>
              <p className="text-sm text-gray-600">Not: {eslesme.teklif?.not || "-"}</p>
              <p className="text-sm text-gray-500">
                Zaman:{" "}
                {eslesme.olusturmaZamani?.seconds
                  ? format(
                      new Date(eslesme.olusturmaZamani.seconds * 1000),
                      "dd.MM.yyyy HH:mm"
                    )
                  : "-"}
              </p>

              <div className="flex flex-wrap gap-4 mt-2">
                <Link
                  href={`/teklif/${eslesme.teklifId}`}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Teklif Detayı
                </Link>
                <Link
                  href={`/sohbet/${eslesme.id}`}
                  className="text-green-600 underline hover:text-green-800"
                >
                  Mesajlaş
                </Link>
                {aktifSekme === "tekliflerim" && (
                  <button
                    onClick={() =>
                      handleTeklifIptal(eslesme.teklifId, eslesme.id)
                    }
                    className="text-red-600 underline hover:text-red-800"
                  >
                    Teklifi İptal Et
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
