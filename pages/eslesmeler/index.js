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
            <li key={item.id} className="border p-4 rounded bg-white shadow relative">
              {/* Sil butonu */}
              <button
                onClick={() => handleSil(item)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                title="Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>

              <p className="font-semibold">
                {item.tur === "talep"
                  ? `Talep: ${item.baslik}`
                  : `Yolculuk: ${item.kalkis} → ${item.varis}`}
              </p>

              {item.tur === "talep" ? (
                <>
                  <p className="text-sm text-gray-600">Ülke: {item.ulke}</p>
                  <p className="text-sm text-gray-600">Bütçe: ₺{item.butce || "-"}</p>
                  <Link href={`/talepler/${item.id}`} className="text-blue-600 underline text-sm">
                    Detayları Gör
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Tarih: {item.tarih || "-"}</p>
                  <p className="text-sm text-gray-600">Not: {item.not || "-"}</p>
                  <Link href={`/yolculuklar/${item.id}`} className="text-blue-600 underline text-sm">
                    Detayları Gör
                  </Link>
                </>
              )}

              {item.teklifler?.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Teklifler:</p>
                  {item.teklifler.map((teklif, index) => (
                    <div key={index} className="text-sm text-gray-700 border p-2 rounded">
                      <p>Fiyat: ₺{teklif.fiyat}</p>
                      <p>Not: {teklif.not || "-"}</p>
                      <p>Teslim Tarihi: {teklif.tarih}</p>
                      <button
                        onClick={() => router.push(`/chat/${teklif.eslesmeId}`)}
                        className="text-blue-600 underline text-sm mt-1"
                      >
                        Mesajlaş
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-yellow-600 text-sm mt-2">Henüz teklif yok.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
                                                  }
