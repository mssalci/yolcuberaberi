import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function TaleplerYolculuklar() {
  const [aktifSekme, setAktifSekme] = useState("talepler");

  const [talepler, setTalepler] = useState([]);
  const [yolculuklar, setYolculuklar] = useState([]);

  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [arama, setArama] = useState("");
  const [filtreli, setFiltreli] = useState(false);

  // === TALEPLER ===
  const fetchTalepler = async () => {
    const q = query(collection(db, "talepler"), orderBy("tarih", "desc"), limit(9));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTalepler(data);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === 9);
    setFiltreli(false);
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    const q = query(
      collection(db, "talepler"),
      orderBy("tarih", "desc"),
      startAfter(lastDoc),
      limit(9)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTalepler(prev => [...prev, ...data]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    if (snapshot.docs.length < 9) setHasMore(false);
  };

  const handleFiltreleTalepler = async (e) => {
    e.preventDefault();
    const kelime = arama.trim().toLowerCase();
    if (!kelime) return fetchTalepler();

    const snapshot = await getDocs(collection(db, "talepler"));
    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(
        talep =>
          talep.ulke?.toLowerCase().includes(kelime) ||
          talep.sehir?.toLowerCase().includes(kelime)
      );

    setTalepler(data);
    setHasMore(false);
    setFiltreli(true);
  };

  // === YOLCULUKLAR ===
  const fetchYolculuklar = async () => {
    const snapshot = await getDocs(query(collection(db, "yolculuklar"), orderBy("tarih", "desc")));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setYolculuklar(data);
    setFiltreli(false);
  };

  const handleFiltreleYolculuklar = async (e) => {
    e.preventDefault();
    const kelime = arama.trim().toLowerCase();
    if (!kelime) return fetchYolculuklar();

    const snapshot = await getDocs(collection(db, "yolculuklar"));
    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(
        y =>
          y.kalkis?.toLowerCase().includes(kelime) ||
          y.varis?.toLowerCase().includes(kelime)
      );

    setYolculuklar(data);
    setFiltreli(true);
  };

  useEffect(() => {
    if (aktifSekme === "talepler") fetchTalepler();
    else fetchYolculuklar();
  }, [aktifSekme]);

  const handleFiltreTemizle = () => {
    setArama("");
    if (aktifSekme === "talepler") fetchTalepler();
    else fetchYolculuklar();
  };

  return (
    <>
      <Head>
        <title>Talepler & Yolculuklar | Yolcu Beraberi</title>
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Talepler ve Yolculuklar</h1>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setAktifSekme("talepler")}
              className={`px-4 py-2 rounded-full ${
                aktifSekme === "talepler" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Tüm Talepler
            </button>
            <button
              onClick={() => setAktifSekme("yolculuklar")}
              className={`px-4 py-2 rounded-full ${
                aktifSekme === "yolculuklar" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              Tüm Yolculuklar
            </button>
          </div>

          {/* Arama kutusu */}
          <form
            onSubmit={aktifSekme === "talepler" ? handleFiltreleTalepler : handleFiltreleYolculuklar}
            className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-10 items-center justify-center"
          >
            <input
              type="text"
              placeholder="Ülke/Şehir"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              className="border px-4 py-2 rounded w-full sm:w-64"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
            >
              Filtrele
            </button>
            {filtreli && (
              <button
                type="button"
                onClick={handleFiltreTemizle}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 w-full sm:w-auto"
              >
                Temizle
              </button>
            )}
          </form>

          {aktifSekme === "talepler" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {talepler.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">Talep bulunamadı.</p>
              ) : (
                talepler.map((talep) => (
                  <div key={talep.id} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                    <h3 className="text-xl font-semibold mb-2">{talep.baslik}</h3>
                    <p className="mb-2">{talep.aciklama}</p>
                    <p className="text-sm text-gray-600 mb-1">Ülke/Şehir: {talep.ulke}</p>
                    <Link href={`/talepler/${talep.id}`} className="text-blue-600 hover:underline">
                      Detayları Gör
                    </Link>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {yolculuklar.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">Yolculuk bulunamadı.</p>
              ) : (
                yolculuklar.map((y) => (
                  <div key={y.id} className="border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                    <h3 className="text-lg font-semibold mb-2">Yolculuk</h3>
                    <p className="text-sm mb-1">Kalkış: {y.kalkis}</p>
                    <p className="text-sm mb-1">Varış: {y.varis}</p>
                    <p className="text-sm mb-1">Tarih: {y.tarih}</p>
                    <p className="text-sm text-gray-600">{y.not || "-"}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {aktifSekme === "talepler" && hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Daha Fazla Yükle
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
            }
