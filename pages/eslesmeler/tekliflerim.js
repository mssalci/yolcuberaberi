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
import GirisUyari from "../../components/GirisUyari";

export default function Tekliflerim() {
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [user, setUser] = useState(null);
  const [kontrolEdildi, setKontrolEdildi] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setKontrolEdildi(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEslesmeler = async () => {
      if (!user) return;
      setYukleniyor(true);

      try {
        // Kullanıcının verdiği teklifler
        const tekliflerSnap = await getDocs(
          query(collection(db, "teklifler"), where("teklifVerenId", "==", user.uid))
        );

        const eslesmelerArr = [];

        for (const teklifDoc of tekliflerSnap.docs) {
          const teklifData = teklifDoc.data();
          const esSnap = await getDocs(
            query(collection(db, "eslesmeler"), where("teklifId", "==", teklifDoc.id))
          );

          for (const esDoc of esSnap.docs) {
            const esData = esDoc.data();

            // Talep bilgisi al
            const talepDoc = esData.talepId ? await getDoc(doc(db, "talepler", esData.talepId)) : null;

            eslesmelerArr.push({
              id: esDoc.id,
              tip: esData.talepId ? "talep" : "bilinmiyor",
              talep: talepDoc?.exists() ? { id: talepDoc.id, ...talepDoc.data() } : null,
              teklif: { id: teklifDoc.id, ...teklifData },
            });
          }
        }

        setEslesmeler(eslesmelerArr);
      } catch (error) {
        console.error("Eşleşmeler alınırken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchEslesmeler();
  }, [user]);

  const eslesmeSil = async (eslesmeId, teklifId) => {
    if (!confirm("Bu eşleşmeyi ve ilişkili teklif verisini silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      if (teklifId) await deleteDoc(doc(db, "teklifler", teklifId));
      setEslesmeler((prev) => prev.filter((e) => e.id !== eslesmeId));
      alert("Eşleşme ve teklif silindi.");
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme işlemi sırasında hata oluştu.");
    }
  };

  if (!kontrolEdildi) return null;
  if (!user) return <GirisUyari />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tekliflerim Eşleşmeleri</h1>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p>Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((e) => (
            <li key={e.id} className="border p-4 rounded bg-white shadow space-y-2">
              {e.tip === "talep" && e.talep ? (
                <>
                  <p className="font-semibold">Talep: {e.talep.baslik || "-"}</p>
                  <p className="text-sm text-gray-600">Kategori: {e.talep.kategori || "-"}</p>
                  <p className="text-sm text-gray-600">Açıklama: {e.talep.aciklama || "-"}</p>
                </>
              ) : (
                <p>Bilinmeyen eşleşme türü</p>
              )}

              {e.teklif && (
                <>
                  <p className="text-sm text-gray-600">Fiyat: ₺{e.teklif.fiyat}</p>
                  <p className="text-sm text-gray-600">Not: {e.teklif.not || "-"}</p>

                  <div className="flex gap-3 pt-2">
                    <Link href={`/eslesmeler/tekliflerim/${e.teklif.id}`} className="text-blue-600 underline">
                      Teklif Detayı
                    </Link>
                    <Link href={`/chat/${e.id}`} className="text-green-600 underline">
                      Mesajlaş
                    </Link>
                    <button
                      onClick={() => eslesmeSil(e.id, e.teklif.id)}
                      className="text-red-600 underline"
                    >
                      Eşleşmeyi ve Teklifi Sil
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
        }
