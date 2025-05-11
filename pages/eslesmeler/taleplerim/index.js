import { useRouter } from "next/router";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { auth } from "../../../firebase/firebaseConfig";
import { useEffect, useState } from "react";

export default function Taleplerim() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const taleplerSnap = await getDocs(
          query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))
        );
        const yolculuklarSnap = await getDocs(
          query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))
        );

        const talepler = await Promise.all(
          taleplerSnap.docs.map(async (docSnap) => {
            const data = { id: docSnap.id, ...docSnap.data(), tur: "talep" };
            const eslesmeSnap = await getDocs(
              query(collection(db, "eslesmeler"), where("talepId", "==", docSnap.id))
            );
            const teklifDoc = !eslesmeSnap.empty
              ? await getDoc(doc(db, "teklifler", eslesmeSnap.docs[0].data().teklifId))
              : null;
            return {
              ...data,
              teklif: teklifDoc?.exists() ? teklifDoc.data() : null,
            };
          })
        );

        const yolculuklar = await Promise.all(
          yolculuklarSnap.docs.map(async (docSnap) => {
            const data = { id: docSnap.id, ...docSnap.data(), tur: "yolculuk" };
            const eslesmeSnap = await getDocs(
              query(collection(db, "eslesmeler"), where("yolculukId", "==", docSnap.id))
            );
            const teklifDoc = !eslesmeSnap.empty
              ? await getDoc(doc(db, "yolculukTeklifleri", eslesmeSnap.docs[0].data().teklifId))
              : null;
            return {
              ...data,
              teklif: teklifDoc?.exists() ? teklifDoc.data() : null,
            };
          })
        );

        setVeriler([...talepler, ...yolculuklar]);
      } catch (err) {
        console.error("Veri alınamadı:", err);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchData();
  }, [user]);

  if (yukleniyor) return <p className="p-4">Yükleniyor...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim & Yolculuklarım</h1>

      {veriler.length === 0 ? (
        <p>Herhangi bir talep veya yolculuk bulunamadı.</p>
      ) : (
        <ul className="space-y-6">
          {veriler.map((item) => (
            <li key={item.id} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold">
                {item.tur === "talep" ? `Talep: ${item.baslik}` : `Yolculuk: ${item.kalkis} → ${item.varis}`}
              </p>
              {item.tur === "talep" ? (
                <>
                  <p className="text-sm text-gray-600">Ülke: {item.ulke}</p>
                  <p className="text-sm text-gray-600">Bütçe: ₺{item.butce || "-"}</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Tarih: {item.tarih || "-"}</p>
                  <p className="text-sm text-gray-600">Not: {item.not || "-"}</p>
                </>
              )}
              {item.teklif ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Teklif Fiyatı: ₺{item.teklif?.fiyat}
                  </p>
                  <p className="text-sm text-gray-600">Not: {item.teklif?.not}</p>
                </div>
              ) : (
                <p className="text-yellow-600 text-sm mt-2">Henüz teklif yok.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
          }
