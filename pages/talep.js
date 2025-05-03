import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext"; // Buraya dikkat
import Loading from "../components/Loading"; // Basit bir yükleniyor bileşeni varsa güzel olur

export default function Talep() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [formData, setFormData] = useState({
    baslik: "",
    aciklama: "",
    ulke: "",
    butce: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/giris");
    }
  }, [loading, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Lütfen giriş yapın.");

    try {
      await addDoc(collection(db, "talepler"), {
        ...formData,
        kullaniciId: user.uid,
        tarih: serverTimestamp(),
      });
      router.push("/talepler");
    } catch (err) {
      alert("Talep oluşturulamadı. Hata: " + err.message);
    }
  };

  if (loading) return <Loading />; // veya sadece null da dönebilirsin

  return (
    <>
      <Head>
        <title>Talep Oluştur | Yolcu Beraberi</title>
        <meta name="description" content="Yurt dışından getirilecek ürün için talep oluşturun." />
        <meta property="og:title" content="Talep Oluştur" />
        <meta property="og:description" content="İstediğiniz ürünü kolayca talep edin, uygun yolcu bulunsun." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yolcuberaberi.com.tr/talep" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        <section className="py-20 px-6 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-10 text-center">Yeni Talep Oluştur</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">Ürün Adı</label>
              <input name="baslik" type="text" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" required />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Ürün Açıklaması</label>
              <textarea name="aciklama" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" required />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Ülke</label>
              <input name="ulke" type="text" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" required />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Bütçe (Opsiyonel)</label>
              <input name="butce" type="number" onChange={handleChange} className="w-full border px-4 py-2 rounded-lg" />
            </div>

            <button type="submit" className="bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 w-full">
              Talep Oluştur
            </button>
          </form>
        </section>
      </main>
    </>
  );
    }
