import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase/firebaseConfig";
import {
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

export default function Profil() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [adSoyad, setAdSoyad] = useState("");
  const [iban, setIban] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/giris");
      } else {
        setUser(currentUser);

        // Firestore'dan adSoyad ve iban çek
        const ref = doc(db, "kullanicilar", currentUser.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAdSoyad(data.adSoyad || currentUser.displayName || "");
          setIban(data.iban || "");
        } else {
          setAdSoyad(currentUser.displayName || "");
        }

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    try {
      if (!user) return;

      // Firestore'da kaydet
      await setDoc(doc(db, "kullanicilar", user.uid), {
        adSoyad,
        iban,
      });

      // Firebase Auth displayName güncelle
      await updateProfile(user, { displayName: adSoyad });

      alert("Profil başarıyla güncellendi.");

      // Sayfa yenilemeden üst menüde adı güncellemek için state'i de güncelleriz (isteğe bağlı)
      setUser({ ...user, displayName: adSoyad });
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Profil güncellenemedi.");
    }
  };

  if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profil Bilgilerim</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ad Soyad</label>
          <input
            type="text"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">IBAN</label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Kaydet
        </button>
      </div>
    </main>
  );
}
