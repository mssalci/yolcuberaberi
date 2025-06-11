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

export default function Taleplerim() {
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
        const taleplerSnap = await getDocs(
          query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))
        );

        const eslesmelerArr = [];

        for (const talepDoc of taleplerSnap.docs) {
          const esSnap = await getDocs(
            query(collection(db, "eslesmeler"), where("talepId", "==", talepDoc.id))
          );
          for (const esDoc of esSnap.docs) {
            const esData = esDoc.data();
            const teklifDoc = await getDoc(doc(db, "teklifler", esData.teklifId));
            let teklifVerenAdi = "-";
            if (teklifDoc.exists()) {
              const teklifData = teklifDoc.data();
              if (teklifData.teklifVerenId) {
                const kullaniciDoc = await getDoc(doc(db, "kullanicilar", teklifData.teklifVerenId));
                teklifVerenAdi = kullaniciDoc.exists() ? kullaniciDoc.data().adSoyad || "-" : "-";
              }
            }

            eslesmelerArr.push({
              id: esDoc.id,
              tip: "talep",
              talep: { id: talepDoc.id, ...talepDoc.data() },
              teklif: teklifDoc.exists() ? teklifDoc.data() : null,
              teklifId: esData.teklifId,
              teklifVerenId: esData.teklifVerenId,
              teklifVerenAdi,
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

  const eslesmeSil = async (eslesmeId, teklifId, talepId) => {
    if (!confirm("Bu eşleşmeyi ve ilişkili verileri silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      if (teklifId) await deleteDoc(doc(db, "teklifler", teklifId));
      if (talepId) await deleteDoc(doc(db, "talepler", talepId));
      setEslesmeler((prev) => prev.filter((e) => e.id !== eslesmeId));
      alert("Eşleşme ve ilişkili veriler silindi.");
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme işlemi sırasında hata oluştu.");
    }
  };

  if (!kontrolEdildi) return null;
  if (!user) return <GirisUyari />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim Eşleşmeleri</h1>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p>Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((e) => (
            <li key={e.id} className="border p-4 rounded bg-white shadow space-y-2">
              <p className="font-semibold">Talep: {e.talep.baslik || "-"}</p>
              <p className="text-sm text-gray-600">Kategori: {e.talep.kategori || "-"}</p>
              <p className="text-sm text-gray-600">Açıklama: {e.talep.aciklama || "-"}</p>

              {e.teklif && (
                <>
                  <p className="text-sm text-gray-600">Fiyat: ₺{e.teklif.fiyat}</p>
                  <p className="text-sm text-gray-600">Not: {e.teklif.not || "-"}</p>
                  <p className="text-sm text-gray-600">Teklif Veren: {e.teklifVerenAdi || "-"}</p>

                  <div className="flex gap-3 pt-2">
                    <Link href={`/eslesmeler/tekliflerim/${e.teklifId}`} className="text-blue-600 underline">
                      Teklif Detayı
                    </Link>
                    <Link href={`/chat/${e.id}`} className="text-green-600 underline">
                      Mesajlaş
                    </Link>
                    {e.teklifVerenId === user.uid && (
                      <button
                        onClick={() => eslesmeSil(e.id, e.teklifId, e.talep.id)}
                        className="text-red-600 underline"
                      >
                        Eşleşmeyi ve Teklifi Sil
                      </button>
                    )}
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
