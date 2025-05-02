import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebaseConfig";

export default function Header() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = () => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = checkAuth();

    // Route değiştiğinde auth'u tekrar kontrol et
    router.events?.on("routeChangeComplete", checkAuth);

    return () => {
      unsubscribe();
      router.events?.off("routeChangeComplete", checkAuth);
    };
  }, [router.events]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/giris");
  };

  if (loading) return null; // yüklenene kadar hiçbir şey gösterme

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 border-b shadow-sm bg-white flex-wrap gap-3">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/favicon.ico"
          alt="YolcuBeraberi Logo"
          width={32}
          height={32}
        />
        <span className="text-lg sm:text-xl font-semibold text-black hover:underline">
          www.yolcuberaberi.com
        </span>
      </Link>

      <nav className="space-x-4 text-sm font-medium text-gray-800">
        <Link href="/talep" className="hover:text-blue-600">Talep Oluştur</Link>
        <Link href="/talepler" className="hover:text-blue-600">Talepler</Link>
        <Link href="/tekliflerim" className="hover:text-blue-600">Tekliflerim</Link>
      </nav>

      {user ? (
        <div className="flex items-center gap-2 text-sm">
          <Link href="/profil" className="text-gray-700 hover:text-blue-600">
            👤 {user.displayName || user.email?.split("@")[0]}
          </Link>
          <button
            onClick={handleLogout}
            className="border px-3 py-1 rounded-md text-red-500 hover:bg-gray-100"
          >
            Çıkış Yap
          </button>
        </div>
      ) : (
        <div className="flex gap-2 text-sm">
          <Link href="/giris" className="border px-4 py-1 rounded-md hover:bg-gray-100">
            Giriş Yap
          </Link>
          <Link href="/kayit" className="border px-4 py-1 rounded-md hover:bg-gray-100">
            Kayıt Ol
          </Link>
        </div>
      )}
    </header>
  );
}
