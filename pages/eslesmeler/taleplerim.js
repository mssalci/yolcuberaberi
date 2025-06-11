// /pages/eslesmeler/Taleplerim.js
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import GirisUyari from "@/components/GirisUyari";
import Link from "next/link";

export default function Taleplerim() {
  const [user, setUser] = useState(null);
  const [kontrolEdildi, setKontrolEdildi] = useState(false);
  const [talepler, setTalepler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setKontrolEdildi(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTalepler = async () => {
      if (!user) return;

      setYukleniyor(true);

      try {
        const taleplerRef = collection(db, "talepler");
        const q = query(taleplerRef, where("talepEdenId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const taleplerData = [];

        for (const docu of querySnapshot.docs) {
          const talep = { id: docu.id, ...docu.data() };

          // Bu talebe teklif gelmiş mi kontrol et
          const teklifQuery = query(
            collection(db, "teklifler"),
            where("talepId", "==", docu.id)
          );
          const teklifSnap = await getDocs(teklifQuery);

          talep.teklifSayisi = teklifSnap.size;
          talep.teklifler = teklifSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

          taleplerData.push(talep);
        }

        setTalepler(taleplerData);
      } catch (err) {
        console.error("Talepler alınırken hata:", err);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchTalepler();
  }, [user]);

  if (!kontrolEdildi) return null;
  if (!user) return <GirisUyari />;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Taleplerim</h2>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : talepler.length === 0 ? (
        <p>Henüz hiç talep oluşturmadınız.</p>
      ) : (
        <ul className="space-y-4">
          {talepler.map((talep) => (
            <li key={talep.id} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold">{talep.baslik}</p>
              <p className="text-sm text-gray-600">{talep.aciklama}</p>
              <p className="text-sm text-gray-600">Kategori: {talep.kategori}</p>
              <p className="text-sm">
                Teklif Sayısı: {talep.teklifSayisi}
              </p>

              {talep.teklifSayisi > 0 && (
                <ul className="ml-4 mt-2 space-y-1 text-sm">
                  {talep.teklifler.map((t) => (
                    <li key={t.id} className="text-gray-700">
                      ₺{t.fiyat} - {t.not || "Not yok"}
                      {" - "}
                      <Link href={`/chat/${t.id}`} className="text-blue-600 underline ml-1">
                        Mesajlaş
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
        }
