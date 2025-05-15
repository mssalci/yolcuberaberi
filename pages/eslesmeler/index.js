import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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

export default function Eslesmeler() {
  const router = useRouter();
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEslesmeler = async () => {
      if (!user) return;
      setYukleniyor(true);
      try {
        if (aktifSekme === "tekliflerim") {
          const q = query(
            collection(db, "eslesmeler"),
            where("teklifVerenId", "==", user.uid)
          );
          const snapshot = await getDocs(q);
          const veriler = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const talepDoc = data.talepId
                ? await getDoc(doc(db, "talepler", data.talepId))
                : null;
              const yolculukDoc = data.yolculukId
                ? await getDoc(doc(db, "yolculuklar", data.yolculukId))
                : null;
              const teklifDoc = await getDoc(doc(db, "teklifler", data.teklifId));

              return {
                id: docSnap.id,
                ...data,
                teklif: teklifDoc.exists() ? teklifDoc.data() : null,
                talep: talepDoc?.exists() ? talepDoc.data() : null,
                yolculuk: yolculukDoc?.exists() ? yolculukDoc.data() : null,
              };
            })
          );
          setEslesmeler(veriler);
        } else {
          const [taleplerSnap, yolculuklarSnap] = await Promise.all([
            getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))),
            getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
          ]);

          const talepler = await Promise.all(
            taleplerSnap.docs.map(async (talepDoc) => {
              const talepData = { id: talepDoc.id, ...talepDoc.data() };
              const eslesmeSnap = await getDocs(
                query(collection(db, "eslesmeler"), where("talepId", "==", talepDoc.id))
              );
              const teklifler = await Promise.all(
                eslesmeSnap.docs.map(async (esDoc) => {
                  const teklif = await getDoc(doc(db, "teklifler", esDoc.data().teklifId));
                  return {
                    eslesmeId: esDoc.id,
                    ...teklif.data(),
                  };
                })
              );
              return {
                tip: "talep",
                id: talepDoc.id,
                talep: talepData,
                teklifler,
              };
            })
          );

          const yolculuklar = await Promise.all(
            yolculuklarSnap.docs.map(async (yolculukDoc) => {
              const yolculukData = { id: yolculukDoc.id, ...yolculukDoc.data() };
              const eslesmeSnap = await getDocs(
                query(collection(db, "eslesmeler"), where("yolculukId", "==", yolculukDoc.id))
              );
              const teklifler = await Promise.all(
                eslesmeSnap.docs.map(async (esDoc) => {
                  const teklif = await getDoc(doc(db, "teklifler", esDoc.data().teklifId));
                  return {
                    eslesmeId: esDoc.id,
                    ...teklif.data(),
                  };
                })
              );
              return {
                tip: "yolculuk",
                id: yolculukDoc.id,
                yolculuk: yolculukData,
                teklifler,
              };
            })
          );

          setEslesmeler([...talepler, ...yolculuklar]);
        }
      } catch (error) {
        console.error("Eşleşmeler alınırken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchEslesmeler();
  }, [aktifSekme, user]);

  const handleSil = async (tip, id) => {
    const onay = confirm(`Bu ${tip === "talep" ? "talebi" : "yolculuğu"} silmek istediğinize emin misiniz?`);
    if (!onay) return;
    try {
      await deleteDoc(doc(db, tip === "talep" ? "talepler" : "yolculuklar", id));
      alert(`${tip === "talep" ? "Talep" : "Yolculuk"} silindi.`);
      setEslesmeler((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silinemedi.");
    }
  };

  const teklifIptalEt = async (teklifId, eslesmeId) => {
    const onay = confirm("Teklifi iptal etmek istediğinize emin misiniz?");
    if (!onay) return;
    try {
      await deleteDoc(doc(db, "teklifler", teklifId));
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      alert("Teklif iptal edildi.");
      setEslesmeler((prev) => prev.filter((e) => e.id !== eslesmeId));
    } catch (err) {
      console.error("İptal hatası:", err);
      alert("Bir hata oluştu.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eşleşmeler</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAktifSekme("tekliflerim")}
          className={`px-4 py-2 rounded ${aktifSekme === "tekliflerim" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Tekliflerim
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
      ) : eslesmeler.length === 0 ? (
        <p>Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-6">
          {eslesmeler.map((item) => (
            <li key={item.id} className="bg-white border p-4 rounded shadow space-y-2">
              {item.tip === "talep" ? (
                <>
                  <p className="font-semibold">Talep: {item.talep?.baslik}</p>
                  <p className="text-sm text-gray-600">Ülke: {item.talep?.ulke}</p>
                  <p className="text-sm text-gray-600">Bütçe: ₺{item.talep?.butce || "-"}</p>
                  {item.teklifler.length > 0 ? (
                    item.teklifler.map((teklif, i) => (
                      <div key={i} className="text-sm border-t pt-2 mt-2">
                        <p>Fiyat: ₺{teklif.fiyat}</p>
                        <p>Teslim: {teklif.tarih}</p>
                        <p>Not: {teklif.not}</p>
                        <Link href={`/chat/${teklif.eslesmeId}`} className="text-blue-600 underline text-sm">Mesajlaş</Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-yellow-600">Henüz teklif yok.</p>
                  )}
                  <button
                    onClick={() => handleSil("talep", item.id)}
                    className="text-red-600 underline text-sm"
                  >
                    Talebi Sil
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold">Yolculuk: {item.yolculuk.kalkis} → {item.yolculuk.varis}</p>
                  <p className="text-sm text-gray-600">Tarih: {item.yolculuk.tarih}</p>
                  {item.teklifler.length > 0 ? (
                    item.teklifler.map((teklif, i) => (
                      <div key={i} className="text-sm border-t pt-2 mt-2">
                        <p>Fiyat: ₺{teklif.fiyat}</p>
                        <p>Teslim: {teklif.tarih}</p>
                        <p>Not: {teklif.not}</p>
                        <Link href={`/chat/${teklif.eslesmeId}`} className="text-blue-600 underline text-sm">Mesajlaş</Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-yellow-600">Henüz teklif yok.</p>
                  )}
                  <button
                    onClick={() => handleSil("yolculuk", item.id)}
                    className="text-red-600 underline text-sm"
                  >
                    Yolculuğu Sil
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
                    }
