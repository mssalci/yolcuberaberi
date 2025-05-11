// pages/talep-yolculuk-olustur.js
import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function TalepYolculukOlustur() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [aktifSekme, setAktifSekme] = useState("talep");

  const [talepData, setTalepData] = useState({
    baslik: "",
    aciklama: "",
    ulke: "",
    butce: "",
  });

  const [yolculukData, setYolculukData] = useState({
    kalkis: "",
    varis: "",
    tarih: "",
    not: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/giris");
    }
  }, [loading, user]);

  const handleChange = (e, setStateFunc) => {
    setStateFunc((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTalepSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "talepler"), {
        ...talepData,
        kullaniciId: user.uid,
        kullaniciEmail: user.email,
        tarih: serverTimestamp(),
      });
      router.push("/talepler");
    } catch (err) {
      alert("Talep oluşturulamadı: " + err.message);
    }
  };

  const handleYolculukSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "yolculuklar"), {
        ...yolculukData,
        kullaniciId: user.uid,
        kullaniciEmail: user.email,
        tarihOlusturma: serverTimestamp(),
      });
      router.push("/yolculuklar");
    } catch (err) {
      alert("Yolculuk oluşturulamadı: " + err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Head>
        <title>Talep/Yolculuk Oluştur | Yolcu Beraberi</title>
        <meta name="description" content="Talep veya yolculuk oluşturun." />
      </Head>

      <main className="bg-white min-h-screen text-gray-800">
        <section className="py-12 px-4 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Yeni {aktifSekme === "talep" ? "Talep" : "Yolculuk"} Oluştur</h1>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setAktifSekme("talep")}
              className={`px-4 py-2 rounded-full ${aktifSekme === "talep" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Talep Oluştur
            </button>
            <button
              onClick={() => setAktifSekme("yolculuk")}
              className={`px-4 py-2 rounded-full ${aktifSekme === "yolculuk" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Yolculuk Oluştur
            </button>
          </div>

          {aktifSekme === "talep" ? (
            <form onSubmit={handleTalepSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-semibold">Ürün Adı</label>
                <input name="baslik" type="text" onChange={(e) => handleChange(e, setTalepData)} className="w-full border px-4 py-2 rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Açıklama</label>
                <textarea name="aciklama" onChange={(e) => handleChange(e, setTalepData)} className="w-full border px-4 py-2 rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Ülke</label>
                <input name="ulke" type="text" onChange={(e) => handleChange(e, setTalepData)} className="w-full border px-4 py-2 rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Bütçe (₺)</label>
                <input name="butce" type="number" onChange={(e) => handleChange(e, setTalepData)} className="w-full border px-4 py-2 rounded" />
              </div>
              <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-full w-full hover:bg-blue-700">
                Talep Oluştur
              </button>
            </form>
          ) : (
            <form onSubmit={handleYolculukSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-semibold">Kalkış Ülkesi/Şehri</label>
                <input name="kalkis" type="text" onChange={(e) => handleChange(e, setYolculukData)} className="w-full border px-4 py-2 rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Varış Ülkesi/Şehri</label>
                <input name="varis" type="text" onChange={(e) => handleChange(e, setYolculukData)} className="w-full border px-4 py-2 rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Tarih</label>
                <input name="tarih" type="date" onChange={(e) => handleChange(e, setYolculukData)} className="w-full border px-4 py-2 rounded" required />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Not (Opsiyonel)</label>
                <textarea name="not" onChange={(e) => handleChange(e, setYolculukData)} className="w-full border px-4 py-2 rounded" />
              </div>
              <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-full w-full hover:bg-blue-700">
                Yolculuk Oluştur
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
                }
