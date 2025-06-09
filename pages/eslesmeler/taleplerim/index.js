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
                ? { eslesmeId: esDoc.id, id: esDoc.data().teklifId, ...teklifSnap.data() }
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
                ? { eslesmeId: esDoc.id, id: esDoc.data().teklifId, ...teklifSnap.data() }
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
      const eslesmeQuery = query(
        collection(db, "eslesmeler"),
        where(item.tur === "talep" ? "talepId" : "yolculukId", "==", item.id)
      );
      const eslesmeSnap = await getDocs(eslesmeQuery);

      const deletionPromises = eslesmeSnap.docs.map(async (esDoc) => {
        const eslesmeId = esDoc.id;
        const teklifId = esDoc.data().teklifId;

        const mesajQuery = query(collection(db, "mesajlar"), where("eslesmeId", "==", eslesmeId));
        const mesajSnap = await getDocs(mesajQuery);
        const mesajSilmePromises = mesajSnap.docs.map(mesaj => deleteDoc(mesaj.ref));

        const teklifSilmePromise = deleteDoc(doc(db, "teklifler", teklifId));
        const eslesmeSilmePromise = deleteDoc(esDoc.ref);

        return Promise.all([...mesajSilmePromises, teklifSilmePromise, eslesmeSilmePromise]);
      });

      const anaDocSilmePromise = deleteDoc(doc(db, `${item.tur}ler`, item.id));

      await Promise.all([...deletionPromises, anaDocSilmePromise]);

      setVeriler(prevVeriler => prevVeriler.filter(v => v.id !== item.id));
      alert("Silme işlemi başarılı.");
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
        <ul className="space-y-4">
          {veriler.map((item) => (
            <li key={item.id} className="border p-4 rounded bg-white shadow">
              {/* Talep/Yolculuk Bilgisi (Üst Kısım) */}
              <div className="mb-3">
                <h3 className="font-bold text-lg">
                  {item.tur === "talep" ? "Talep" : "Yolculuk"}: 
                  <span className="font-normal"> {item.tur === "talep" ? item.baslik : `${item.kalkis} → ${item.varis}`}</span>
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  {item.tur === "talep" ? (
                    <>
                      <span>Ülke: {item.ulke}</span>
                      <span className="mx-2">•</span>
                      <span>Bütçe: ₺{item.butce || "-"}</span>
                    </>
                  ) : (
                    <span>Tarih: {item.tarih || "-"}</span>
                  )}
                </div>
              </div>

              {/* Teklifler Listesi */}
              {item.teklifler?.length > 0 && (
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-semibold mb-2">Gelen Teklifler ({item.teklifler.length}):</h4>
                  {item.teklifler.map((teklif, index) => (
                    <div key={index} className="p-3 border rounded mb-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <p className="text-sm"><span className="font-medium">Fiyat:</span> ₺{teklif.fiyat}</p>
                        <p className="text-sm"><span className="font-medium">Tarih:</span> {teklif.tarih}</p>
                        {teklif.not && <p className="col-span-2 text-sm"><span className="font-medium">Not:</span> {teklif.not}</p>}
                      </div>
                      
                      {/* BUTONLAR - Silme butonu burada */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/chat/${teklif.eslesmeId}`)}
                          className="flex-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Mesajlaş
                        </button>
                        <Link
                          href={`/teklifler/${teklif.id}`}
                          className="flex-1 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm text-center"
                        >
                          Detay
                        </Link>
                        <button
                          onClick={() => handleSil(item)} // Burada item siliniyor (teklif değil)
                          className="flex-1 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          disabled={isDeleting === item.id}
                        >
                          {isDeleting === item.id ? 'Siliniyor...' : 'Sil'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Eğer teklif yoksa yine de silme butonu gösterilsin */}
              {item.teklifler?.length === 0 && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleSil(item)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    disabled={isDeleting === item.id}
                  >
                    {isDeleting === item.id ? 'Siliniyor...' : 'Sil'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
                    }
