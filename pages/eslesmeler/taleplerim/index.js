// pages/eslesmeler/taleplerim/index.js

import { useRouter } from "next/router";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { useEffect, useState } from "react";

export default function Taleplerim() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      if (usr) setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

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
                  ? { eslesmeId: esDoc.id, id: esDoc.data().teklifId, ...teklifSnap.data() }
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
                  ? { eslesmeId: esDoc.id, id: esDoc.data().teklifId, ...teklifSnap.data() }
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
      } catch (err) {
        console.error("Veri alma hatası:", err);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSil = async (item) => {
    if (!confirm(`${item.tur === "talep" ? "Talebi" : "Yolculuğu"} silmek istediğinize emin misiniz?`)) return;
    setIsDeleting(item.id);
    try {
      const eslesmeSnap = await getDocs(
        query(collection(db, "eslesmeler"), where(item.tur === "talep" ? "talepId" : "yolculukId", "==", item.id))
      );

      const silmeIslemleri = eslesmeSnap.docs.map(async (esDoc) => {
        const eslesmeId = esDoc.id;
        const teklifId = esDoc.data().teklifId;

        const mesajSnap = await getDocs(query(collection(db, "mesajlar"), where("eslesmeId", "==", eslesmeId)));
        const mesajSil = mesajSnap.docs.map((m) => deleteDoc(m.ref));
        const teklifSil = deleteDoc(doc(db, "teklifler", teklifId));
        const eslesmeSil = deleteDoc(esDoc.ref);

        return Promise.all([...mesajSil, teklifSil, eslesmeSil]);
      });

      await Promise.all([
        ...silmeIslemleri,
        deleteDoc(doc(db, `${item.tur}ler`, item.id)),
      ]);

      setVeriler((prev) => prev.filter((v) => v.id !== item.id));
      alert("Silme işlemi başarılı.");
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme sırasında hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (yukleniyor) return <p className="text-center p-4">Yükleniyor...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim & Yolculuklarım</h1>
      {veriler.length === 0 ? (
        <p>Henüz talep veya yolculuk oluşturmadınız.</p>
      ) : (
        <ul className="space-y-6">
          {veriler.map((item) => (
            <li key={item.id} className="border p-4 rounded bg-white shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold">
                    {item.tur === "talep" ? "Talep" : "Yolculuk"}:
                    {item.tur === "talep"
                      ? ` ${item.baslik}`
                      : ` ${item.kalkis} → ${item.varis}`}
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
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  {isDeleting === item.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>

              {item.teklifler?.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold mb-2">Teklifler:</h4>
                  {item.teklifler.map((teklif, index) => (
                    <div key={index} className="p-3 border rounded mb-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <p><span className="font-medium">Fiyat:</span> ₺{teklif.fiyat}</p>
                        <p><span className="font-medium">Tarih:</span> {teklif.tarih}</p>
                        {teklif.not && (
                          <p className="col-span-2">
                            <span className="font-medium">Not:</span> {teklif.not}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/chat/${teklif.eslesmeId}`)}
                          className="flex-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Mesajlaş
                        </button>
                        <Link
                          href={`/teklifler/${teklif.id}`}
                          className="flex-1 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm text-center"
                        >
                          Detay
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
        }
