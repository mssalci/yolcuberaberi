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
      router.push("/"); // Kayıt başarılıysa anasayfaya yönlendir
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
    </Head>
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Kayıt Ol</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Ad Soyad"
          value={adSoyad}
          onChange={(e) => setAdSoyad(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        {hata && <p className="text-red-500">{hata}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Kayıt Ol
        </button>
      </form>
    </div>
    </>
  );
}
