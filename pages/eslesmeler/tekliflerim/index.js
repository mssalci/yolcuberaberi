import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function Tekliflerim() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [verilenTeklifler, setVerilenTeklifler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTeklifler = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, "teklifler"), where("teklifVerenId", "==", user.uid));
        const snapshot = await getDocs(q);

        const teklifler = await Promise.all(
          snapshot.docs.map(async (teklifDoc) => {
            const teklif = { id: teklifDoc.id, ...teklifDoc.data() };

            // Talep bilgisi
            let iliski = "talep";
            let iliskiDetay = null;

            if (teklif.talepId) {
              const talepSnap = await getDoc(doc(db, "talepler", teklif.talepId));
              if (talepSnap.exists()) {
                iliskiDetay = talepSnap.data();
              }
            } else if (teklif.yolculukId) {
              iliski = "yolculuk";
              const yolculukSnap = await getDoc(doc(db, "yolculuklar", teklif.yolculukId));
              if (yolculukSnap.exists()) {
                iliskiDetay = yolculukSnap.data();
              }
            }

            return { ...teklif, iliski, iliskiDetay };
          })
        );

        setVerilenTeklifler(teklifler);
      } catch (err) {
        console.error("Teklifler alınamadı:", err);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchTeklifler();
  }, [user]);

  if (yukleniyor) return <p className="p-4">Yükleniyor...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Verdiğim Teklifler</h1>

      {verilenTeklifler.length === 0 ? (
        <p>Henüz herhangi bir teklif vermediniz.</p>
      ) : (
        <ul className="space-y-6">
          {verilenTeklifler.map((teklif) => (
            <li key={teklif.id} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold text-gray-800">
                {teklif.iliski === "talep"
                  ? `Talep: ${teklif.iliskiDetay?.baslik || "-"}`
                  : `Yolculuk: ${teklif.iliskiDetay?.kalkis} → ${teklif.iliskiDetay?.varis}`}
              </p>
              <p className="text-sm text-gray-600">Fiyat: ₺{teklif.fiyat}</p>
              <p className="text-sm text-gray-600">Teslim Tarihi: {teklif.tarih || "-"}</p>
              <p className="text-sm text-gray-600">Not: {teklif.not || "-"}</p>
              <button
                onClick={() => router.push(`/chat/${teklif.id}`)}
                className="text-blue-600 underline mt-2 text-sm"
              >
                Mesajlaş
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
        }
