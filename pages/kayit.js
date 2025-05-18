// pages/kayit.js

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export default function Kayit() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [hata, setHata] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, sifre);
      const user = userCredential.user;

      await updateProfile(user, { displayName: adSoyad });

      // Firestore'a kullanıcı bilgilerini yaz
      await setDoc(doc(db, "kullanicilar", user.uid), {
        uid: user.uid,
        email: user.email,
        adSoyad: adSoyad,
        iban: "",
      });

      // E-posta doğrulama bağlantısı gönder
      await sendEmailVerification(user);

      alert("Kayıt başarılı! Lütfen e-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin.");

      router.push("/giris"); // Giriş sayfasına yönlendirme
    } catch (error) {
      setHata("Kayıt başarısız: " + error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Kayıt Ol | Yolcu Beraberi</title>
        <meta name="description" content="Yeni bir hesap oluşturun." />
        <meta property="og:title" content="Kayıt Ol" />
        <meta property="og:description" content="Yolcu Beraberi'ne katılmak için kayıt olun." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yolcuberaberi.com.tr/kayit" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Kayıt Ol</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Ad Soyad"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />
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
            Kayıt Ol
          </button>
        </form>
      </div>
    </>
  );
          }
