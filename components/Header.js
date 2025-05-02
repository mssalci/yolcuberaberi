import Image from "next/image";
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
    <header className="w-full flex items-center justify-between px-4 py-3 border-b shadow-sm bg-white">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/favicon.ico" alt="Logo" width={28} height={28} />
        <span className="text-base font-semibold text-black hover:underline">
          yolcuberaberi.com
        </span>
      </Link>

      <nav className="hidden sm:flex gap-4 text-sm font-medium text-gray-800">
        <Link href="/talep" className="hover:text-blue-600">Talep Oluştur</Link>
        <Link href="/talepler" className="hover:text-blue-600">Talepler</Link>
        <Link href="/tekliflerim" className="hover:text-blue-600">Tekliflerim</Link>
      </nav>

      <div className="space-x-2 text-sm">
        {user ? (
          <>
            <Link href="/profil" className="text-gray-700 hover:text-blue-600">
              👤 {user.displayName || user.email?.split("@")[0]}
            </Link>
            <button
              onClick={handleLogout}
              className="border px-3 py-1 rounded-md text-red-500 hover:bg-gray-100"
            >
              Çıkış
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
