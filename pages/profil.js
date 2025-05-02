import Head from "next/head";
import { useEffect, useState } from "react";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { useRouter } from "next/router";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

export default function Profil() {
  const [user, setUser] = useState(null);
  const [adSoyad, setAdSoyad] = useState("");
  const [iban, setIban] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/giris");
      } else {
        setUser(currentUser);
        const ref = doc(db, "kullanicilar", currentUser.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAdSoyad(data.adSoyad || "");
          setIban(data.iban || "");
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    const ref = doc(db, "kullanicilar", user.uid);
    await setDoc(ref, {
      adSoyad,
      iban,
      email: user.email,
    });

    alert("Bilgiler güncellendi ✅");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      // Firestore'daki kullanıcı verisini sil
      await deleteDoc(doc(db, "kullanicilar", user.uid));

      // Auth hesabını sil
      await deleteUser(user);

      alert("Hesabınız silindi");
      router.push("/kayit");
    } catch (error) {
      alert("Hesap silme hatası: " + error.message);
    }
  };

  if (loading || !user) return null;

  return (
    <>
    <Head>
      <title>Profilim | Yolcu Beraberi</title>
      <meta name="description" content="Ad Soyad, IBAN ve e-posta bilgilerinizi yönetin. Hesabınızı güvenle kontrol edin." />
      <meta property="og:title" content="Profilim" />
      <meta property="og:description" content="Kullanıcı hesabınızı güncelleyin veya hesabınızı yönetin." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.yolcuberaberi.com.tr/profil" />
    </Head>
    <main className="max-w-2xl mx-auto px-4 py-12 bg-white min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center">Profil Bilgilerim</h1>

      <form onSubmit={handleSave} className="space-y-6 border p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm text-gray-600">Ad Soyad</label>
          <input
            type="text"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="w-full border px-4 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">IBAN</label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="w-full border px-4 py-2 rounded-md"
            placeholder="TR..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">E-posta</label>
          <input
            type="text"
            value={user.email}
            disabled
            className="w-full border px-4 py-2 rounded-md bg-gray-100"
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
          >
            Bilgileri Kaydet
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700"
          >
            Hesabı Sil
          </button>
        </div>
      </form>
    </main>
</>
  );
}
