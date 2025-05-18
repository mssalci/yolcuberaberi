// pages/giris.js
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Giris() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.replace("/"); // Doğrulandıysa yönlendir
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setHata(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, sifre);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setHata("Lütfen e-posta adresinizi doğrulayın. Gelen kutunuzu kontrol edin.");
        return;
      }

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

      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Giriş Yap</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />
          {hata && <p className="text-red-500 text-sm">{hata}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </>
  );
          }
