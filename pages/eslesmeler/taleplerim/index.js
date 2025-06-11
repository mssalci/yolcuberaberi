// pages/eslesmeler/taleplerim.js

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
        // Taleplerim (kullanıcıya ait talepler)
        const taleplerSnap = await getDocs(
          query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))
        );
        // Yolculuklarım (kullanıcıya ait yolculuklar)
        const yolculuklarSnap = await getDocs(
          query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))
        );

        const eslesmelerArr = [];

        // Taleplerim için eşleşmeler ve teklif bilgileri
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

        // Yolculuklarım için eşleşmeler ve teklif bilgileri
        for (const yolculukDoc of yolculuklarSnap.docs) {
          const esSnap = await getDocs(
            query(collection(db, "eslesmeler"), where("yolculukId", "==", yolculukDoc.id))
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

            const talepDoc = esData.talepId ? await getDoc(doc(db, "talepler", esData.talepId)) : null;

            eslesmelerArr.push({
              id: esDoc.id,
              tip: "yolculuk",
              yolculuk: { id: yolculukDoc.id, ...yolculukDoc.data() },
              teklif: teklifDoc.exists() ? teklifDoc.data() : null,
              teklifId: esData.teklifId,
              teklifVerenId: esData.teklifVerenId,
              talep: talepDoc?.exists() ? talepDoc.data() : null,
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

  const eslesmeSil = async (eslesmeId, tip, teklifId, yolculukId, talepId) => {
    if (!confirm("Bu eşleşmeyi ve ilişkili verileri silmek istediğinize emin misiniz?")) return;
    try {
      // Eşleşme sil
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));

      // Teklif varsa sil
      if (teklifId) {
        await deleteDoc(doc(db, "teklifler", teklifId));
      }

      // Eğer yolculuk eşleşmesi ise yolculuk belgesini sil
      if (tip === "yolculuk" && yolculukId) {
        await deleteDoc(doc(db, "yolculuklar", yolculukId));
      }

      // Eğer talep eşleşmesi ise talep belgesini sil
      if (tip === "talep" && talepId) {
        await deleteDoc(doc(db, "talepler", talepId));
      }

      // Listeyi güncelle
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
      <h1 className="text-2xl font-bold mb-6">Taleplerim & Yolculuklarım Eşleşmeleri</h1>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p>Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((e) => (
            <li key={e.id} className="border p-4 rounded bg-white shadow space-y-2">
              {e.tip === "yolculuk" && e.yolculuk ? (
                <>
                  <p className="font-semibold">Yolculuk Teklifi</p>
                  <p className="text-sm text-gray-600">Kalkış: {e.yolculuk.kalkis || "-"}</p>
                  <p className="text-sm text-gray-600">Varış: {e.yolculuk.varis || "-"}</p>
                  <p className="text-sm text-gray-600">Tarih: {e.yolculuk.tarih || "-"}</p>
                </>
              ) : e.tip === "talep" && e.talep ? (
                <>
                  <p className="font-semibold">Talep: {e.talep.baslik || "-"}</p>
                  <p className="text-sm text-gray-600">Kategori: {e.talep.kategori || "-"}</p>
                  <p className="text-sm text-gray-600">Açıklama: {e.talep.aciklama || "-"}</p>
                </>
              ) : null}

              {e.teklif && (
                <>
                  <p className="text-sm text-gray-600">Fiyat: ₺{e.teklif.fiyat}</p>
                  <p className="text-sm text-gray-600">Not: {e.teklif.not || "-"}</p>
                  <p className="text-sm text-gray-600">Teklif Veren: {e.teklifVerenAdi || "-"}</p>

                  <div className="flex gap-3 pt-2">
                    <Link
                      href={`/eslesmeler/tekliflerim/${e.teklifId}`}
                      className="text-blue-600 underline"
                    >
                      Teklif Detayı
                    </Link>
                    <Link href={`/chat/${e.id}`} className="text-green-600 underline">
                      Mesajlaş
                    </Link>
                    {e.teklifVerenId === user.uid && (
                      <button
                        onClick={() =>
                          eslesmeSil(
                            e.id,
                            e.tip,
                            e.teklifId,
                            e.yolculuk?.id,
                            e.talep?.id
                          )
                        }
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
