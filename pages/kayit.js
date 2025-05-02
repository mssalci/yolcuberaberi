// pages/kayit.js
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Kayit() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [hata, setHata] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, sifre);
      await updateProfile(userCredential.user, {
        displayName: adSoyad,
      });
      router.push("/");
    } catch (error) {
      setHata("Kayıt başarısız: " + error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Kayıt Ol | Yolcu Beraberi</title>
        <meta name="description" content="Yeni bir hesap oluşturun. Talepler oluşturun veya eşya getirerek gelir kazanın." />
        <meta property="og:title" content="Kayıt Ol" />
        <meta property="og:description" content="Yolcu Beraberi'ne katılmak için hemen kayıt olun." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yolcuberaberi.com.tr/kayit" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <main className="min-h-screen flex items-center justify-center bg-white text-gray-800 px-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">Kayıt Ol</h1>

          <form onSubmit={handleRegister} className="space-y-5 border p-6 rounded-lg shadow">
            <div>
              <label className="block text-sm mb-1 text-gray-700">Ad Soyad</label>
              <input
                type="text"
                placeholder="Ad Soyad"
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">E-posta</label>
              <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">Şifre</label>
              <input
                type="password"
                placeholder="Şifre"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            {hata && <p className="text-red-500 text-sm">{hata}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Kayıt Ol
            </button>
          </form>
        </div>
      </main>
    </>
  );
            }
