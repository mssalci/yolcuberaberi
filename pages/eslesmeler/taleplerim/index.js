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
    if (!confirm(`Bu ${item.tur === "talep" ? "talebi" : "yolculuğu"} ve bağlı tüm teklifleri silmek istediğinize emin misiniz?`)) {
      return;
    }

    setIsDeleting(item.id);
    try {
      // 1. Önce eşleşmeleri bul
      const eslesmeQuery = query(
        collection(db, "eslesmeler"),
        where(item.tur === "talep" ? "talepId" : "yolculukId", "==", item.id)
      );
      const eslesmeSnap = await getDocs(eslesmeQuery);

      // 2. Tüm eşleşmeleri ve bağlı verileri sil
      const deletionPromises = eslesmeSnap.docs.map(async (esDoc) => {
        const eslesmeId = esDoc.id;
        const teklifId = esDoc.data().teklifId;
        
        // Mesajları sil
        const mesajQuery = query(collection(db, "mesajlar"), where("eslesmeId", "==", eslesmeId));
        const mesajSnap = await getDocs(mesajQuery);
        const mesajSilmePromises = mesajSnap.docs.map(mesaj => deleteDoc(mesaj.ref));
        
        // Teklifi sil
        const teklifSilmePromise = deleteDoc(doc(db, "teklifler", teklifId));
        
        // Eşleşmeyi sil
        const eslesmeSilmePromise = deleteDoc(esDoc.ref);
        
        return Promise.all([...mesajSilmePromises, teklifSilmePromise, eslesmeSilmePromise]);
      });

      // 3. Ana dokümanı sil (talep veya yolculuk)
      const anaDocSilmePromise = deleteDoc(doc(db, `${item.tur}ler`, item.id));

      // Tüm silme işlemlerini bekleyelim
      await Promise.all([...deletionPromises, anaDocSilmePromise]);

      // 4. State'i güncelle
      setVeriler(prevVeriler => prevVeriler.filter(v => v.id !== item.id));
      
      alert(`${item.tur === "talep" ? "Talep" : "Yolculuk"} ve bağlı tüm veriler başarıyla silindi.`);
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
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
        <ul className="space-y-4">
          {veriler.map((item) => (
            <li key={item.id} className="border p-4 rounded bg-white">
              <div>
                <h3 className="font-bold">
                  {item.tur === "talep" ? "Talep" : "Yolculuk"}:
                  {item.tur === "talep" ? ` ${item.baslik}` : ` ${item.kalkis} → ${item.varis}`}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.tur === "talep" 
                    ? `Ülke: ${item.ulke} • Bütçe: ₺${item.butce || "-"}` 
                    : `Tarih: ${item.tarih || "-"}`}
                </p>
              </div>

              {item.teklifler?.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold mb-2">Teklifler:</h4>
                  {item.teklifler.map((teklif, index) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      <p><b>Fiyat:</b> ₺{teklif.fiyat}</p>
                      <p><b>Tarih:</b> {teklif.tarih}</p>
                      {teklif.not && <p><b>Not:</b> {teklif.not}</p>}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => router.push(`/chat/${teklif.eslesmeId}`)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm"
                        >
                          Mesajlaş
                        </button>
                        <Link 
                          href={`/teklifler/${teklif.id}`} 
                          className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm"
                        >
                          Detay
                        </Link>
                        <button
                          onClick={() => handleSil(item)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm"
                          disabled={isDeleting === item.id}
                        >
                          {isDeleting === item.id ? 'Siliniyor...' : 'Sil'}
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
