// pages/giris.js
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Giris() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, sifre);
      router.push("/");
    } catch (error) {
      setHata("Giriş başarısız: " + error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Giriş Yap | Yolcu Beraberi</title>
        <meta name="description" content="Hesabınıza giriş yapın, talepleri yönetin, teklifler verin." />
        <meta property="og:title" content="Giriş Yap" />
        <meta property="og:description" content="Yolcu Beraberi hesabınıza erişin." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yolcuberaberi.com.tr/giris" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <main className="min-h-screen bg-white flex items-center justify-center px-4 text-gray-800">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center">Giriş Yap</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="email">E-posta</label>
              <input
                id="email"
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="password">Şifre</label>
              <input
                id="password"
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
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </main>
    </>
  );
            }
