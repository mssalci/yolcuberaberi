// components/Header.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import app from "@/firebase"; // firebase.js dosyanıza göre düzenleyin

export default function Header() {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="bg-white border-b shadow-sm py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">YolcuBeraberi</Link>

      <nav className="flex gap-4 items-center">
        <Link href="/talepler" className="hover:underline">Talepler</Link>
        {user ? (
          <>
            <Link href="/profil" className="hover:underline">{user.displayName || "Profil"}</Link>
            <button onClick={handleLogout} className="text-red-600 hover:underline">Çıkış Yap</button>
          </>
        ) : (
          <Link href="/giris" className="hover:underline">Giriş Yap / Kayıt Ol</Link>
        )}
      </nav>
    </header>
  );
}
