// pages/eslesmeler/taleplerim/index.js
import { useRouter } from "next/router";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useEffect, useState } from "react";

export default function Taleplerim() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      if (usr) setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!user?.uid) return;
    
    setYukleniyor(true);
    try {
      const [taleplerSnap, yolculuklarSnap] = await Promise.all([
        getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))),
        getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
      ]);

      const talepler = await Promise.all(
        taleplerSnap.docs.map(async (docSnap) => {
          const talepId = docSnap.id;
          const eslesmeSnap = await getDocs(
            query(collection(db, "eslesmeler"), where("talepId", "==", talepId))
          );
          const teklifler = await Promise.all(
            eslesmeSnap.docs.map(async (esDoc) => {
              const teklifSnap = await getDoc(doc(db, "teklifler", esDoc.data().teklifId));
              return teklifSnap.exists()
                ? { eslesmeId: esDoc.id, ...teklifSnap.data() }
                : null;
            })
          );

          return {
            id: talepId,
            ...docSnap.data(),
            tur: "talep",
            teklifler: teklifler.filter(Boolean),
          };
        })
      );

      const yolculuklar = await Promise.all(
        yolculuklarSnap.docs.map(async (docSnap) => {
          const yolculukId = docSnap.id;
          const eslesmeSnap = await getDocs(
            query(collection(db, "eslesmeler"), where("yolculukId", "==", yolculukId))
          );
          const teklifler = await Promise.all(
            eslesmeSnap.docs.map(async (esDoc) => {
              const teklifSnap = await getDoc(doc(db, "teklifler", esDoc.data().teklifId));
              return teklifSnap.exists()
                ? { eslesmeId: esDoc.id, ...teklifSnap.data() }
                : null;
            })
          );

          return {
            id: yolculukId,
            ...docSnap.data(),
            tur: "yolculuk",
            teklifler: teklifler.filter(Boolean),
          };
        })
      );

      setVeriler([...talepler, ...yolculuklar]);
    } catch (error) {
      console.error("Veri getirme hatası:", error);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSil = async (item) => {
    if (!confirm(`Bu ${item.tur === "talep" ? "talebi" : "yolculuğu"} silmek istediğinize emin misiniz?`)) {
      return;
    }

    setIsDeleting(item.id);
    try {
      // Eşleşmeleri ve teklifleri sil
      const eslesmeQuery = query(
        collection(db, "eslesmeler"),
        where(item.tur === "talep" ? "talepId" : "yolculukId", "==", item.id)
      );
      const eslesmeSnap = await getDocs(eslesmeQuery);

      for (const esDoc of eslesmeSnap.docs) {
        // Teklifi sil
        await deleteDoc(doc(db, "teklifler", esDoc.data().teklifId));
        
        // Mesajları sil
        const mesajQuery = query(collection(db, "mesajlar"), where("eslesmeId", "==", esDoc.id));
        const mesajSnap = await getDocs(mesajQuery);
        mesajSnap.forEach(async (mesaj) => {
          await deleteDoc(mesaj.ref);
        });

        // Eşleşmeyi sil
        await deleteDoc(esDoc.ref);
      }

      // Ana dokümanı sil (talep veya yolculuk)
      await deleteDoc(doc(db, `${item.tur}ler`, item.id));

      // Listeyi güncelle
      setVeriler(veriler.filter(v => v.id !== item.id));
      alert(`${item.tur === "talep" ? "Talep" : "Yolculuk"} başarıyla silindi.`);
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silme işlemi sırasında bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (yukleniyor) return <p className="p-4 text-center">Yükleniyor...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim & Yolculuklarım</h1>

      {veriler.length === 0 ? (
        <p>Henüz bir talep veya yolculuk oluşturmadınız.</p>
      ) : (
        <ul className="space-y-6">
          {veriler.map((item) => (
            <li key={item.id} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold">
                {item.tur === "talep"
                  ? `Talep: ${item.baslik}`
                  : `Yolculuk: ${item.kalkis} → ${item.varis}`}
              </p>

              {item.tur === "talep" ? (
                <>
                  <p className="text-sm text-gray-600">Ülke: {item.ulke}</p>
                  <p className="text-sm text-gray-600">Bütçe: ₺{item.butce || "-"}</p>
                  <div className="flex gap-3 mt-2">
                    <Link href={`/talepler/${item.id}`} className="text-blue-600 underline text-sm">
                      Detayları Gör
                    </Link>
                    <button 
                      onClick={() => handleSil(item)}
                      className="text-red-600 underline text-sm"
                      disabled={isDeleting === item.id}
                    >
                      {isDeleting === item.id ? 'Siliniyor...' : 'Talep Sil'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Tarih: {item.tarih || "-"}</p>
                  <p className="text-sm text-gray-600">Not: {item.not || "-"}</p>
                  <div className="flex gap-3 mt-2">
                    <Link href={`/yolculuklar/${item.id}`} className="text-blue-600 underline text-sm">
                      Detayları Gör
                    </Link>
                    <button 
                      onClick={() => handleSil(item)}
                      className="text-red-600 underline text-sm"
                      disabled={isDeleting === item.id}
                    >
                      {isDeleting === item.id ? 'Siliniyor...' : 'Yolculuk Sil'}
                    </button>
                  </div>
                </>
              )}

              {item.teklifler?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Teklifler:</p>
                  {item.teklifler.map((teklif, index) => (
                    <div key={index} className="text-sm text-gray-700 border p-2 rounded">
                      <p>Fiyat: ₺{teklif.fiyat}</p>
                      <p>Not: {teklif.not || "-"}</p>
                      <p>Teslim Tarihi: {teklif.tarih}</p>
                      <div className="flex gap-3 mt-1">
                        <button
                          onClick={() => router.push(`/chat/${teklif.eslesmeId}`)}
                          className="text-blue-600 underline text-sm"
                        >
                          Mesajlaş
                        </button>
                        <button
                          onClick={() => handleSil(item)}
                          className="text-red-600 underline text-sm"
                          disabled={isDeleting === item.id}
                        >
                          {isDeleting === item.id ? 'Siliniyor...' : (item.tur === 'talep' ? 'Talep Sil' : 'Yolculuk Sil')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
                }
