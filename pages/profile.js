// pages/profil.js
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "next/router";

export default function Profil() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/giris");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12 bg-white min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center">Profil Bilgilerim</h1>

      <div className="space-y-6 border p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm text-gray-600">Ad Soyad</label>
          <input
            type="text"
            value={user.displayName || ""}
            disabled
            className="w-full border px-4 py-2 rounded-md bg-gray-100"
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

        <div>
          <label className="block text-sm text-gray-600">Kullanıcı ID (UID)</label>
          <input
            type="text"
            value={user.uid}
            disabled
            className="w-full border px-4 py-2 rounded-md bg-gray-100"
          />
        </div>
      </div>
    </main>
  );
}
