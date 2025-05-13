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
import { db, auth } from "../../../firebase/firebaseConfig";
import { useEffect, useState } from "react";

export default function Taleplerim() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // Kullanıcıyı dinle ve sadece tanımlandığında işlemlere başla
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      if (usr) setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !user.uid) return;

    const fetchData = async () => {
      setYukleniyor(true);
      try {
        const [taleplerSnap, yolculuklarSnap] = await Promise.all([
          getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))),
          getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
        ]);

        const talepler = await Promise.all(
          taleplerSnap.docs.map(async (docSnap) => {
            const talepId = docSnap.id;
            const eslesmeSnap = await getDocs(
              query(collection(db, "eslesmeler"), where("talepId", "==", talepId))
            );
            const teklifler = await Promise.all(
              eslesmeSnap.docs.map(async (esDoc) => {
                const teklifSnap = await getDoc(doc(db, "teklifler", esDoc.data().teklifId));
                return teklifSnap.exists()
                  ? { eslesmeId: esDoc.id, ...teklifSnap.data() }
                  : null;
              })
            );

            return {
              id: talepId,
              ...docSnap.data(),
              tur: "talep",
              teklifler: teklifler.filter(Boolean),
            };
          })
        );

        const yolculuklar = await Promise.all(
          yolculuklarSnap.docs.map(async (docSnap) => {
            const yolculukId = docSnap.id;
            const eslesmeSnap = await getDocs(
              query(collection(db, "eslesmeler"), where("yolculukId", "==", yolculukId))
            );
            const teklifler = await Promise.all(
              eslesmeSnap.docs.map(async (esDoc) => {
                const teklifSnap = await getDoc(doc(db, "teklifler", esDoc.data().teklifId));
                return teklifSnap.exists()
                  ? { eslesmeId: esDoc.id, ...teklifSnap.data() }
                  : null;
              })
            );

            return {
              id: yolculukId,
              ...docSnap.data(),
              tur: "yolculuk",
              teklifler: teklifler.filter(Boolean),
            };
          })
        );

        setVeriler([...talepler, ...yolculuklar]);
      } catch (error) {
        console.error("Veri getirme hatası:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchData();
  }, [user]);

  if (yukleniyor) return <p className="p-4 text-center">Yükleniyor...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim & Yolculuklarım</h1>

      {veriler.length === 0 ? (
        <p>Henüz bir talep veya yolculuk oluşturmadınız.</p>
      ) : (
        <ul className="space-y-6">
          {veriler.map((item) => (
            <li key={item.id} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold">
                {item.tur === "talep"
                  ? `Talep: ${item.baslik}`
                  : `Yolculuk: ${item.kalkis} → ${item.varis}`}
              </p>

              {item.tur === "talep" ? (
                <>
                  <p className="text-sm text-gray-600">Ülke: {item.ulke}</p>
                  <p className="text-sm text-gray-600">Bütçe: ₺{item.butce || "-"}</p>
                  <Link href={`/talepler/${item.id}`} className="text-blue-600 underline text-sm">
                    Detayları Gör
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Tarih: {item.tarih || "-"}</p>
                  <p className="text-sm text-gray-600">Not: {item.not || "-"}</p>
                  <Link href={`/yolculuklar/${item.id}`} className="text-blue-600 underline text-sm">
                    Detayları Gör
                  </Link>
                </>
              )}

              {item.teklifler?.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Teklifler:</p>
                  {item.teklifler.map((teklif, index) => (
                    <div key={index} className="text-sm text-gray-700 border p-2 rounded">
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
