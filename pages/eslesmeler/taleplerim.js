import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
import GirisUyari from "../../components/GirisUyari";

export default function Taleplerim() {
  const [user, setUser] = useState(null);
  const [kontrolEdildi, setKontrolEdildi] = useState(false);
  const [talepler, setTalepler] = useState([]);
  const [yolculuklar, setYolculuklar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setKontrolEdildi(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    setYukleniyor(true);

    // Talep ve Yolculukları, ardından teklifleri çek
    const fetchData = async () => {
      try {
        // Talepler
        const talepSnap = await getDocs(
          query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))
        );
        const taleplerArr = [];

        for (const talepDoc of talepSnap.docs) {
          const talepData = talepDoc.data();

          // Bu talepe gelen teklifleri çek
          const teklifSnap = await getDocs(
            query(collection(db, "teklifler"), where("talepId", "==", talepDoc.id))
          );
          const teklifler = teklifSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          taleplerArr.push({ id: talepDoc.id, ...talepData, teklifler });
        }

        // Yolculuklar
        const yolculukSnap = await getDocs(
          query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))
        );
        const yolculuklarArr = [];

        for (const yolculukDoc of yolculukSnap.docs) {
          const yolculukData = yolculukDoc.data();

          // Bu yolculuğa gelen teklifleri çek
          const teklifSnap = await getDocs(
            query(collection(db, "teklifler"), where("yolculukId", "==", yolculukDoc.id))
          );
          const teklifler = teklifSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

          yolculuklarArr.push({ id: yolculukDoc.id, ...yolculukData, teklifler });
        }

        setTalepler(taleplerArr);
        setYolculuklar(yolculuklarArr);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchData();
  }, [user]);

  // Talep veya Yolculuk Silme (Teklifleri de siler)
  const silItem = async (itemType, itemId) => {
    if (!confirm(`Bu ${itemType} ve ilişkili teklifleri silmek istediğinize emin misiniz?`)) return;

    try {
      // İlgili teklifler
      const teklifQuery = query(
        collection(db, "teklifler"),
        where(itemType === "talep" ? "talepId" : "yolculukId", "==", itemId)
      );
      const teklifSnap = await getDocs(teklifQuery);

      // Teklifleri sil
      for (const teklifDoc of teklifSnap.docs) {
        await deleteDoc(doc(db, "teklifler", teklifDoc.id));
      }

      // Talep veya yolculuğu sil
      await deleteDoc(doc(db, itemType === "talep" ? "talepler" : "yolculuklar", itemId));

      // State güncelle
      if (itemType === "talep") {
        setTalepler((prev) => prev.filter((t) => t.id !== itemId));
      } else {
        setYolculuklar((prev) => prev.filter((y) => y.id !== itemId));
      }

      alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ve ilişkili teklifler silindi.`);
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme işlemi sırasında hata oluştu.");
    }
  };

  if (!kontrolEdildi) return null;
  if (!user) return <GirisUyari />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim & Yolculuklarım</h1>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          {/* Talepler */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Taleplerim</h2>
            {talepler.length === 0 ? (
              <p>Henüz talebiniz bulunmamaktadır.</p>
            ) : (
              <ul className="space-y-4">
                {talepler.map((talep) => (
                  <li key={talep.id} className="border p-4 rounded bg-white shadow space-y-2">
                    <p className="font-semibold">Talep: {talep.baslik || "-"}</p>
                    <p>Açıklama: {talep.aciklama || "-"}</p>
                    <p>Bütçe: ₺{talep.butce || "-"}</p>

                    {/* Gelen teklifler */}
                    <div className="mt-2">
                      <p className="font-semibold">Gelen Teklifler:</p>
                      {talep.teklifler.length === 0 ? (
                        <p>Teklif yok.</p>
                      ) : (
                        <ul className="space-y-1">
                          {talep.teklifler.map((teklif) => (
                            <li key={teklif.id} className="flex gap-3 items-center text-sm">
                              <span>Fiyat: ₺{teklif.fiyat} - Not: {teklif.not || "-"}</span>
                              <Link href={`/eslesmeler/tekliflerim/${teklif.id}`} className="text-blue-600 underline">
                                Teklif Detayı
                              </Link>
                              <Link href={`/chat/${teklif.id}`} className="text-green-600 underline">
                                Mesajlaş
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => silItem("talep", talep.id)}
                      className="mt-3 text-red-600 underline"
                    >
                      Talebi ve Teklifleri Sil
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Yolculuklar */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Yolculuklarım</h2>
            {yolculuklar.length === 0 ? (
              <p>Henüz yolculuğunuz bulunmamaktadır.</p>
            ) : (
              <ul className="space-y-4">
                {yolculuklar.map((yolculuk) => (
                  <li key={yolculuk.id} className="border p-4 rounded bg-white shadow space-y-2">
                    <p>
                      <strong>Kalkış:</strong> {yolculuk.kalkis || "-"} - <strong>Varış:</strong> {yolculuk.varis || "-"}
                    </p>
                    <p><strong>Not:</strong> {yolculuk.not || "-"}</p>
                    <p>
                      <strong>Yolculuk Tarihi:</strong>{" "}
                      {yolculuk.tarihOlusturma?.toDate
                        ? yolculuk.tarihOlusturma.toDate().toLocaleDateString()
                        : yolculuk.tarih || "-"}
                    </p>

                    {/* Gelen teklifler */}
                    <div className="mt-2">
                      <p className="font-semibold">Gelen Teklifler:</p>
                      {yolculuk.teklifler.length === 0 ? (
                        <p>Teklif yok.</p>
                      ) : (
                        <ul className="space-y-1">
                          {yolculuk.teklifler.map((teklif) => (
                            <li key={teklif.id} className="flex gap-3 items-center text-sm">
                              <span>
                              Fiyat: ₺{teklif.fiyat}
                              Not: {teklif.not || "-"}
                              </span>
                              <Link href={`/eslesmeler/tekliflerim/${teklif.id}`} className="text-blue-600 underline">
                                Teklif Detayı
                              </Link>
                              <Link href={`/chat/${teklif.id}`} className="text-green-600 underline">
                                Mesajlaş
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      onClick={() => silItem("yolculuk", yolculuk.id)}
                      className="mt-3 text-red-600 underline"
                    >
                      Yolculuğu ve Teklifleri Sil
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
              }
