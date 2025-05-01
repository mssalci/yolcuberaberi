import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { useRouter } from "next/router";
import {
  doc,
  getDoc,
  setDoc,
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
    alert("Profil bilgileri kaydedildi ✅");
  };

  if (loading || !user) return null;

  return (
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
          <label className="block text-sm text-gray-600">E-Posta</label>
          <input
            type="text"
            value={user.email}
            disabled
            className="w-full border px-4 py-2 rounded-md bg-gray-100"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          Kaydet
        </button>
      </form>
    </main>
  );
}
