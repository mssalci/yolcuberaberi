// pages/eslesmeler/index.js

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
        let snapshot;

        if (aktifSekme === "tekliflerim") {
          snapshot = await getDocs(
            query(collection(db, "eslesmeler"), where("teklifVerenId", "==", user.uid))
);
        } else {
          const [taleplerSnap, yolculuklarSnap] = await Promise.all([
            getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))),
            getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
          ]);

          const eslesmelerArr = [];

          for (const talepDoc of taleplerSnap.docs) {
            const esSnap = await getDocs(query(collection(db, "eslesmeler"), where("talepId", "==", talepDoc.id)));
            for (const esDoc of esSnap.docs) {
              const esData = esDoc.data();
              const teklifDoc = await getDoc(doc(db, "teklifler", esData.teklifId));
              eslesmelerArr.push({
                id: esDoc.id,
                tip: "talep",
                talep: { id: talepDoc.id, ...talepDoc.data() },
                teklif: teklifDoc.exists() ? teklifDoc.data() : null,
                teklifId: esData.teklifId,
                teklifVerenId: esData.teklifVerenId,
              });
            }
          }

          for (const yolculukDoc of yolculuklarSnap.docs) {
            const esSnap = await getDocs(query(collection(db, "eslesmeler"), where("yolculukId", "==", yolculukDoc.id)));
            for (const esDoc of esSnap.docs) {
              const esData = esDoc.data();
              const teklifDoc = await getDoc(doc(db, "teklifler", esData.teklifId));
              const talepDoc = esData.talepId
                ? await getDoc(doc(db, "talepler", esData.talepId))
: null;

              eslesmelerArr.push({
                id: esDoc.id,
                tip: "yolculuk",
                yolculuk: { id: yolculukDoc.id, ...yolculukDoc.data() },
                teklif: teklifDoc.exists() ? teklifDoc.data() : null,
                teklifId: esData.teklifId,
                teklifVerenId: esData.teklifVerenId,
                talep: talepDoc?.exists() ? talepDoc.data() : null,
              });
            }
          }

          setEslesmeler(eslesmelerArr);
          setYukleniyor(false);
          return;
        }

        const veriler = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const talepDoc = data.talepId ? await getDoc(doc(db, "talepler", data.talepId)) : null;
            const teklifDoc = data.teklifId ? await getDoc(doc(db, "teklifler", data.teklifId)) : null;
            const yolculukDoc = data.yolculukId ? await getDoc(doc(db, "yolculuklar", data.yolculukId)) : null;
            return {
              id: docSnap.id,
              ...data,
              tip: data.yolculukId ? "yolculuk" : "talep",
              talep: talepDoc?.exists() ? talepDoc.data() : null,
              teklif: teklifDoc?.exists() ? teklifDoc.data() : null,
              yolculuk: yolculukDoc?.exists() ? yolculukDoc.data() : null,
            };
          })
        );
        setEslesmeler(veriler);
      } catch (error) {
        console.error("Eşleşmeler alınırken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchEslesmeler();
  }, [aktifSekme, user]);

  const teklifIptalEt = async (teklifId, eslesmeId) => {
    if (!confirm("Teklifi iptal etmek istediğinize emin misiniz?")) return;
try {
      await deleteDoc(doc(db, "teklifler", teklifId));
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      setEslesmeler((prev) => prev.filter((e) => e.id !== eslesmeId));
      alert("Teklif ve eşleşme iptal edildi.");
    } catch (err) {
      console.error("İptal hatası:", err);
      alert("Bir hata oluştu.");
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
        <ul className="space-y-4">
          {eslesmeler.map((e) => (
            <li key={e.id || Math.random()} className="border p-4 rounded bg-white shadow space-y-2">
              {e.tip === "yolculuk" && e.yolculuk ? (
<>
                  <p className="font-semibold">Yolculuk Teklifi</p>
                  <p className="text-sm text-gray-600">Kalkış: {e.yolculuk.kalkis || "-"}</p>
                  <p className="text-sm text-gray-600">Varış: {e.yolculuk.varis || "-"}</p>
                  <p className="text-sm text-gray-600">Tarih: {e.yolculuk.tarih || "-"}</p>
                </>
              ) : e.tip === "talep" && e.talep ? (
                <>
                  <p className="font-semibold">Talep: {e.talep.baslik || "-"}</p>
                  <p className="text-sm text-gray-600">Kategori: {e.talep.kategori || "-"}</p>
                  <p className="text-sm text-gray-600">Açıklama: {e.talep.aciklama || "-"}</p>
</>
              ) : null}

              {e.teklif && (
<>
                  <p className="text-sm text-gray-600">Fiyat: ₺{e.teklif.fiyat}</p>
                  <p className="text-sm text-gray-600">Not: {e.teklif.not || "-"}</p>
                  <div className="flex gap-3 pt-2">
                    <Link href={`/eslesmeler/tekliflerim/${e.teklifId}`} className="text-blue-600 underline">
                      Teklif Detayı
</Link>
                    <Link href={`/chat/${e.id}`} className="text-green-600 underline">
                      Mesajlaş
                    </Link>
                    {e.teklifVerenId === user.uid && (
                      <button
                        onClick={() => teklifIptalEt(e.teklifId, e.id)}
                        className="text-red-600 underline"
                      >
                        Teklifi İptal Et
                      </button>
                    )}
</div>
</>
)}
</li>
))}
</ul>
)}
</main>
);
            }
