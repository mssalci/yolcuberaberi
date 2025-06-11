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

export default function Taleplerim()
{
  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setYukleniyor(true);
      try {
        const [tSnap, ySnap] = await Promise.all([
          getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))),
          getDocs(query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))),
        ]);

        const talepler = tSnap.docs.map(docSnap => ({
          id: docSnap.id,
          tur: "talep",
          ...docSnap.data(),
          teklifler: [], // teklifler sonradan
        }));

        const yolculuklar = ySnap.docs.map(docSnap => ({
          id: docSnap.id,
          tur: "yolculuk",
          ...docSnap.data(),
          teklifler: [],
        }));

        // Şimdilik teklifleri eklemeden veriler set et. Render testi yapıldıktan sonra eklenecek.
        setVeriler([...talepler, ...yolculuklar]);
      } catch (e) {
        console.error(e);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSil = async (item) => {
    if (!confirm(`${item.tur === "talep" ? "Talebi" : "Yolculuğu"} silmek istediğinize emin misiniz?`)) return;
    setIsDeleting(item.id);
    await deleteDoc(doc(db, `${item.tur}ler`, item.id));
    setVeriler(prev => prev.filter(v => v.id !== item.id));
    setIsDeleting(null);
  };

  if (yukleniyor) return <p className="p-4 text-center">Yükleniyor...</p>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim & Yolculuklarım</h1>

      {veriler.length === 0 ? (
        <p>Henüz talep veya yolculuk oluşturmadınız.</p>
      ) : (
        <ul className="space-y-6">
          {veriler.map(item => (
            <li key={item.id} className="border p-4 rounded bg-white shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold">
                    {item.tur === "talep" ? "Talep: " : "Yolculuk: "}
                    {item.tur === "talep" ? item.baslik : `${item.kalkis} → ${item.varis}`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.tur === "talep"
                      ? `Ülke: ${item.ulke} • Bütçe: ₺${item.butce || "-"}`
                      : `Tarih: ${item.tarih || "-"}`
                    }
                  </p>
                </div>
                <button
                  onClick={() => handleSil(item)}
                  disabled={isDeleting === item.id}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  {isDeleting === item.id ? "Siliniyor..." : "Sil"}
                </button>
              </div>
              {/* Teklifler varsa alt kısımda göster */}
              {item.teklifler?.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold mb-1">Teklifler:</h4>
                  {item.teklifler.map((t, i) => (
                    <div key={i} className="p-2 border rounded bg-gray-50 mb-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">₺{t.fiyat} — {t.tarih}</span>
                        <button
                          onClick={() => router.push(`/chat/${t.eslesmeId}`)}
                          className="text-blue-600 hover:underline text-sm"
                        >Mesajlaş</button>
                      </div>
                      {t.not && <p className="mt-1 text-gray-600">{t.not}</p>}
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
      
