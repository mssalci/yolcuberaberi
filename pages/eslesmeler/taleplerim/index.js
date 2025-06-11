import { useRouter } from "next/router";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function Taleplerim() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (kullanici) => {
      if (kullanici) {
        console.log("Aktif kullanıcı ID:", kullanici.uid);
        setUser(kullanici);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setYukleniyor(true);
      try {
        // Verileri çek
        const [tSnap, ySnap, teklifSnap] = await Promise.all([
          getDocs(collection(db, "talepler")), // filtre yok
          getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
          getDocs(collection(db, "teklifler")),
        ]);

        const teklifler = teklifSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        console.log("Tüm taleplerin sayısı:", tSnap.docs.length);

        const talepler = tSnap.docs
          .map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              tur: "talep",
              ...data,
              teklifler: teklifler.filter(t => t.talepId === docSnap.id),
            };
          })
          .filter(t => t.kullaniciId === user.uid); // filtre burada

        console.log("Kullanıcıya ait filtrelenmiş talepler:", talepler);

        const yolculuklar = ySnap.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            tur: "yolculuk",
            ...data,
            teklifler: teklifler.filter(t => t.yolculukId === docSnap.id),
          };
        });

        setVeriler([...talepler, ...yolculuklar]);
      } catch (e) {
        console.error("Veri çekme hatası:", e);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSil = async (item) => {
    if (!confirm("Silmek istediğine emin misin?")) return;
    setIsDeleting(item.id);
    await deleteDoc(doc(db, `${item.tur}ler`, item.id));
    setVeriler(prev => prev.filter(v => v.id !== item.id));
    setIsDeleting(null);
  };

  if (yukleniyor) return <p className="p-4 text-center">Yükleniyor...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim ve Yolculuklarım</h1>

      {veriler.length === 0 ? (
        <p>Henüz talep veya yolculuk oluşturmadınız.</p>
      ) : (
        <ul className="space-y-6">
          {veriler.map(item => (
            <li key={item.id} className="border p-4 rounded bg-white shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold">
                    {item.tur === "talep" ? `Talep: ${item.baslik}` : `Yolculuk: ${item.kalkis} → ${item.varis}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.tur === "talep"
                      ? `Ülke: ${item.ulke} • Bütçe: ₺${item.butce || "-"}`
                      : `Tarih: ${item.tarih || "-"}`}
                  </p>
                </div>
                <button
                  onClick={() => handleSil(item)}
                  disabled={isDeleting === item.id}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  {isDeleting === item.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>

              {/* Teklifler varsa göster */}
              {item.teklifler.length > 0 ? (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold mb-1">Teklifler:</h4>
                  {item.teklifler.map((t, i) => (
                    <div key={i} className="p-2 border rounded bg-gray-50 mb-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">₺{t.fiyat} — {t.tarih}</span>
                        {t.eslesmeId && (
                          <button
                            onClick={() => router.push(`/chat/${t.eslesmeId}`)}
                            className="text-blue-600 hover:underline text-sm"
                          >Mesajlaş</button>
                        )}
                      </div>
                      {t.not && <p className="mt-1 text-gray-600">{t.not}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Henüz teklif yok.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
                    }
