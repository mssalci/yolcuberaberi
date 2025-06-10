// pages/eslesmeler/taleplerim/index.js
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from "firebase/firestore";
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

      const talepler = taleplerSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tur: "talep",
        teklifler: [] // Başlangıçta boş array
      }));

      const yolculuklar = yolculuklarSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tur: "yolculuk",
        teklifler: [] // Başlangıçta boş array
      }));

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
    if (!confirm(`${item.tur === "talep" ? "Talebi" : "Yolculuğu"} silmek istediğinize emin misiniz?`)) return;
    
    setIsDeleting(item.id);
    try {
      await deleteDoc(doc(db, `${item.tur}ler`, item.id));
      setVeriler(prev => prev.filter(v => v.id !== item.id));
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
        <ul className="space-y-4">
          {veriler.map((item) => (
            <li key={item.id} className="border p-4 rounded bg-white shadow">
              <div className="flex justify-between items-start">
                <div>
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
                <button 
                  onClick={() => handleSil(item)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  disabled={isDeleting === item.id}
                >
                  {isDeleting === item.id ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>

              {/* Teklifler bölümünü basitleştirdim */}
              {item.teklifler?.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <h4 className="text-sm font-semibold mb-2">Teklifler ({item.teklifler.length})</h4>
                  <div className="space-y-2">
                    {item.teklifler.map((teklif, index) => (
                      <div key={index} className="p-2 border rounded bg-gray-50">
                        <p className="text-sm"><b>Fiyat:</b> ₺{teklif.fiyat}</p>
                        <p className="text-sm"><b>Tarih:</b> {teklif.tarih}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => router.push(`/chat/${teklif.eslesmeId}`)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                          >
                            Mesajlaş
                          </button>
                          <Link
                            href={`/teklifler/${teklif.id}`}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                          >
                            Detay
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
                    }
