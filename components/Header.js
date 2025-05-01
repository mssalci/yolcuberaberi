// components/Header.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Header() {
  const [user, setUser] = useState(null);

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
    <header className="w-full flex items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
      <Link href="/" className="text-xl font-semibold text-black hover:underline">
        www.yolcuberaberi.com
      </Link>

      <nav className="space-x-6 text-sm font-medium text-gray-800">
        <Link href="/talep" className="hover:text-blue-600">Talep Oluştur</Link>
        <Link href="/talepler" className="hover:text-blue-600">Talepler</Link>
        <Link href="/tekliflerim" className="hover:text-blue-600">Tekliflerim</Link>
      </nav>

      <div className="space-x-2 text-sm">
        {user ? (
          <>
            <Link href="/profil" className="text-gray-700 hover:text-blue-600">
              👤 {user.email?.split("@")[0] || user.uid.substring(0, 6)}
            </Link>
            <button
              onClick={handleLogout}
              className="border px-3 py-1 rounded-md text-red-500 hover:bg-gray-100"
            >
              Çıkış Yap
            </button>
          </>
        ) : (
          <>
            <Link href="/giris" className="border px-4 py-1 rounded-md hover:bg-gray-100">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="border px-4 py-1 rounded-md hover:bg-gray-100">
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
