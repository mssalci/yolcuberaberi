// pages/eslesmeler/index.js
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
              const teklifDoc = data.teklifId
                ? await getDoc(doc(db, "teklifler", data.teklifId))
                : null;
              return {
                id: docSnap.id,
                ...data,
                talep: talepDoc?.exists() ? talepDoc.data() : null,
                teklif: teklifDoc?.exists() ? teklifDoc.data() : null,
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
              if (!eslesmeSnap.empty) {
                const eslesmeDoc = eslesmeSnap.docs[0];
                const eslesmeData = eslesmeDoc.data();
                const teklifDoc = await getDoc(doc(db, "teklifler", eslesmeData.teklifId));
                return {
                  id: eslesmeDoc.id,
                  tip: "talep",
                  talep: talepData,
                  teklif: teklifDoc?.exists() ? teklifDoc.data() : null,
                  teklifId: eslesmeData.teklifId,
                };
              } else {
                return {
                  id: null,
                  tip: "talep",
                  talep: talepData,
                  teklif: null,
                };
              }
            })
          );

          const yolculuklar = yolculuklarSnap.docs.map((docSnap) => ({
            id: docSnap.id,
            tip: "yolculuk",
            yolculuk: docSnap.data(),
          }));

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

  const teklifIptalEt = async (teklifId, eslesmeId) => {
    const onay = confirm("Teklifi iptal etmek istediğinize emin misiniz?");
    if (!onay) return;
    try {
      await deleteDoc(doc(db, "teklifler", teklifId));
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      alert("Teklif ve eşleşme iptal edildi.");
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
          className={`px-4 py-2 rounded ${
            aktifSekme === "tekliflerim" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Tekliflerim
        </button>
        <button
          onClick={() => setAktifSekme("taleplerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "taleplerim" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Taleplerim
        </button>
      </div>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p>Hiç kayıt bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((e) =>
            e.tip === "yolculuk" ? (
  <li key={e.id} className="border p-4 rounded bg-white shadow space-y-2">
    <p className="font-semibold">Yolculuk</p>
    <p className="text-sm text-gray-600">Kalkış: {e.yolculuk?.kalkis || "-"}</p>
    <p className="text-sm text-gray-600">Varış: {e.yolculuk?.varis || "-"}</p>
    <p className="text-sm text-gray-600">Tarih: {e.yolculuk?.tarih || "-"}</p>
    <p className="text-sm text-gray-600">Not: {e.yolculuk?.not || "-"}</p>

    {/* Teklif yoksa uyarı göster */}
    {!e.teklifler || e.teklifler.length === 0 ? (
      <p className="text-sm text-yellow-600 mt-2">Henüz teklif alınmadı.</p>
    ) : (
      <div className="mt-2 space-y-2">
        <p className="text-sm font-semibold">Teklifler:</p>
        {e.teklifler.map((teklif, idx) => (
          <div key={idx} className="text-sm text-gray-700 border p-2 rounded">
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
    )}
  </li>
            ) : (
              <li key={e.id || e.talep?.id} className="border p-4 rounded bg-white shadow space-y-2">
                <p className="font-semibold">Talep: {e.talep?.baslik || "-"}</p>
                <p className="text-sm text-gray-600">Ülke: {e.talep?.ulke || "-"}</p>
                <p className="text-sm text-gray-600">Açıklama: {e.talep?.aciklama || "-"}</p>
                <p className="text-sm text-gray-600">
                  Tarih: {e.talep?.tarih?.toDate?.().toLocaleDateString?.() || "-"}
                </p>
                <p className="text-sm text-gray-600">Bütçe: ₺{e.talep?.butce || "-"}</p>

                {e.teklif ? (
                  <>
                    <p className="text-sm text-gray-600">Fiyat: ₺{e.teklif?.fiyat}</p>
                    <p className="text-sm text-gray-600">Not: {e.teklif?.not || "-"}</p>
                    <div className="flex gap-3 pt-2">
                      <Link
                        href={`/eslesmeler/tekliflerim/${e.teklifId}`}
                        className="text-blue-600 underline"
                      >
                        Teklif Detayı
                      </Link>
                      <Link
                        href={`/chat/${e.id}`}
                        className="text-green-600 underline"
                      >
                        Mesajlaş
                      </Link>
                      <button
                        onClick={() => teklifIptalEt(e.teklifId, e.id)}
                        className="text-red-600 underline"
                      >
                        Teklifi İptal Et
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-yellow-600">Henüz teklif alınmadı.</p>
                )}
              </li>
            )
          )}
        </ul>
      )}
    </main>
  );
}
