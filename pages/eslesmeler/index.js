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

export default function Eslesmeler() {
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
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
        if (aktifSekme === "tekliflerim") {
          // Tekliflerim sekmesi aslında burada boş kalacak, çünkü tekliflerim ayrı sayfada olacak
          setEslesmeler([]);
          setYukleniyor(false);
          return;
        } else {
          // Taleplerim sekmesi: Kendi taleplerim ve yolculuklarım + onlara gelen teklifler
          const [taleplerSnap, yolculuklarSnap] = await Promise.all([
            getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))),
            getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
          ]);

          const eslesmelerArr = [];

          // Talepler ve altındaki teklifler
          for (const talepDoc of taleplerSnap.docs) {
            // Teklifleri getir
            const teklifSnap = await getDocs(query(collection(db, "teklifler"), where("talepId", "==", talepDoc.id)));

            const teklifler = await Promise.all(
              teklifSnap.docs.map(async (tDoc) => {
                // Teklif veren kullanıcı adını al
                const teklifData = tDoc.data();
                let teklifVerenAdi = "Bilinmiyor";
                if (teklifData.teklifVerenId) {
                  const userDoc = await getDoc(doc(db, "kullanicilar", teklifData.teklifVerenId));
                  if (userDoc.exists()) teklifVerenAdi = userDoc.data().isim || teklifVerenAdi;
                }
                return { id: tDoc.id, ...teklifData, teklifVerenAdi };
              })
            );

            eslesmelerArr.push({
              id: talepDoc.id,
              tip: "talep",
              data: { id: talepDoc.id, ...talepDoc.data() },
              teklifler,
            });
          }

          // Yolculuklar ve altındaki teklifler
          for (const yolculukDoc of yolculuklarSnap.docs) {
            const teklifSnap = await getDocs(query(collection(db, "teklifler"), where("yolculukId", "==", yolculukDoc.id)));

            const teklifler = await Promise.all(
              teklifSnap.docs.map(async (tDoc) => {
                const teklifData = tDoc.data();
                let teklifVerenAdi = "Bilinmiyor";
                if (teklifData.teklifVerenId) {
                  const userDoc = await getDoc(doc(db, "kullanicilar", teklifData.teklifVerenId));
                  if (userDoc.exists()) teklifVerenAdi = userDoc.data().isim || teklifVerenAdi;
                }
                return { id: tDoc.id, ...teklifData, teklifVerenAdi };
              })
            );

            eslesmelerArr.push({
              id: yolculukDoc.id,
              tip: "yolculuk",
              data: { id: yolculukDoc.id, ...yolculukDoc.data() },
              teklifler,
            });
          }

          setEslesmeler(eslesmelerArr);
          setYukleniyor(false);
        }
      } catch (error) {
        console.error("Eşleşmeler alınırken hata:", error);
        setYukleniyor(false);
      }
    };

    fetchEslesmeler();
  }, [aktifSekme, user]);

  // Talep veya Yolculuk silme
  const talepYolculukSil = async (tip, id) => {
    if (!confirm(`${tip === "talep" ? "Talebi" : "Yolculuğu"} silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteDoc(doc(db, tip === "talep" ? "talepler" : "yolculuklar", id));
      setEslesmeler((prev) => prev.filter((e) => e.id !== id));
      alert(`${tip === "talep" ? "Talep" : "Yolculuk"} silindi.`);
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme sırasında hata oluştu.");
    }
  };

  if (!kontrolEdildi) return null;
  if (!user) return <GirisUyari />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eşleşmeler</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAktifSekme("tekliflerim")}
          className={`px-4 py-2 rounded ${aktifSekme === "tekliflerim" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Tekliflerim (Farklı sayfa)
        </button>
        <button
          onClick={() => setAktifSekme("taleplerim")}
          className={`px-4 py-2 rounded ${aktifSekme === "taleplerim" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Taleplerim
        </button>
      </div>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : aktifSekme === "taleplerim" && eslesmeler.length === 0 ? (
        <p>Hiç talep veya yolculuk bulunamadı.</p>
      ) : aktifSekme === "taleplerim" ? (
        <ul className="space-y-6">
          {eslesmeler.map((e) => (
            <li key={e.id} className="border p-4 rounded bg-white shadow">
              {e.tip === "talep" ? (
                <>
                  <p className="font-semibold">Talep: {e.data.baslik || "-"}</p>
                  <p className="text-sm text-gray-600">Kategori: {e.data.kategori || "-"}</p>
                  <p className="text-sm text-gray-600">Açıklama: {e.data.aciklama || "-"}</p>
                  <button
                    onClick={() => talepYolculukSil("talep", e.id)}
                    className="text-red-600 underline mt-2"
                  >
                    Talebi Sil
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold">Yolculuk: {e.data.kalkis || "-"} → {e.data.varis || "-"}</p>
                  <p className="text-sm text-gray-600">Tarih: {e.data.tarih || "-"}</p>
                  <button
                    onClick={() => talepYolculukSil("yolculuk", e.id)}
                    className="text-red-600 underline mt-2"
                  >
                    Yolculuğu Sil
                  </button>
                </>
              )}

              <div className="mt-4 border-t pt-4">
                <p className="font-semibold">Teklifler:</p>
                {e.teklifler.length === 0 ? (
                  <p className="text-sm text-gray-600">Henüz teklif yok.</p>
                ) : (
                  <ul className="space-y-2 mt-2">
                    {e.teklifler.map((t) => (
                      <li key={t.id} className="border p-2 rounded bg-gray-50">
                        <p>
                          <strong>Kullanıcı:</strong> {t.teklifVerenAdi}
                        </p>
                        <p>
                          <strong>Fiyat:</strong> ₺{t.fiyat}
                        </p>
                        <p>
                          <strong>Not:</strong> {t.not || "-"}
                        </p>
                        <Link href={`/eslesmeler/tekliflerim/${t.id}`}>
                          <a className="text-blue-600 underline">Teklif Detayı</a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Tekliflerim sekmesi için lütfen Tekliflerim sayfasını kullanınız.</p>
      )}
    </main>
  );
                }
