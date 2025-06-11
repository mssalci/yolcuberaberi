import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function EslesmeTaleplerim() {
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (kullanici) => {
      if (kullanici) {
        setUser(kullanici);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setYukleniyor(true);

      const [talepSnap, yolculukSnap, teklifSnap] = await Promise.all([
        getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))),
        getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
        getDocs(collection(db, "teklifler")),
      ]);

      const teklifler = teklifSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const talepler = talepSnap.docs.map((doc) => {
        const veri = { id: doc.id, ...doc.data(), tur: "talep" };
        veri.teklifler = teklifler.filter((t) => t.talepId === veri.id);
        return veri;
      });

      const yolculuklar = yolculukSnap.docs.map((doc) => {
        const veri = { id: doc.id, ...doc.data(), tur: "yolculuk" };
        veri.teklifler = teklifler.filter((t) => t.yolculukId === veri.id);
        return veri;
      });

      setVeriler([...talepler, ...yolculuklar]);
      setYukleniyor(false);
    };

    fetchData();
  }, [user]);

  if (yukleniyor) return <p>Yükleniyor...</p>;

  return (
    <div className="space-y-6">
      {veriler.length === 0 ? (
        <p>Henüz talep veya yolculuk oluşturmadınız.</p>
      ) : (
        veriler.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 bg-white shadow"
          >
            <h3 className="font-bold">
              {item.tur === "talep" ? `Talep: ${item.baslik}` : `Yolculuk: ${item.kalkis} → ${item.varis}`}
            </h3>

            <p className="text-sm text-gray-600">
              {item.tur === "talep"
                ? `Ülke: ${item.ulke} • Bütçe: ₺${item.butce || "-"}`
                : `Tarih: ${item.tarih || "-"}`}
            </p>

            {item.teklifler.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm">
                {item.teklifler.map((teklif) => (
                  <li key={teklif.id} className="border p-2 rounded bg-gray-50">
                    {teklif.fiyat}₺ — {teklif.tarih}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-gray-500 mt-2">
                Henüz teklif yok.
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
