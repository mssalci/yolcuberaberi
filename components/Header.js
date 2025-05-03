import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

const handleLogout = async () => {
  await signOut(auth);
  router.push("/giris");
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="w-full border-b shadow-sm bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/favicon.ico" alt="Logo" width={28} height={28} />
          <span className="text-base font-semibold text-black hover:underline">
            yolcuberaberi.com
          </span>
        </Link>

        <button onClick={toggleMenu} className="sm:hidden">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="hidden sm:flex gap-4 text-sm font-medium text-gray-800">
          <Link href="/talep" className="hover:text-blue-600">Talep Oluştur</Link>
          <Link href="/talepler" className="hover:text-blue-600">Talepler</Link>
          <Link href="/tekliflerim" className="hover:text-blue-600">Tekliflerim</Link>
        </nav>

        <div className="hidden sm:flex space-x-2 text-sm">
          {user ? (
            <>
              <Link href="/profil" className="text-gray-700 hover:text-blue-600">
                👤 {user.displayName || user.email?.split("@")[0]}
              </Link>
              <button onClick={handleLogout} className="border px-3 py-1 rounded-md text-red-500 hover:bg-gray-100">
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="border px-4 py-1 rounded-md hover:bg-gray-100">Giriş Yap</Link>
              <Link href="/kayit" className="border px-4 py-1 rounded-md hover:bg-gray-100">Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-3 px-4 pb-4 text-sm text-gray-800">
          <Link href="/talep" onClick={() => setMenuOpen(false)}>Talep Oluştur</Link>
          <Link href="/talepler" onClick={() => setMenuOpen(false)}>Talepler</Link>
          <Link href="/tekliflerim" onClick={() => setMenuOpen(false)}>Tekliflerim</Link>
          {user ? (
            <>
              <Link href="/profil" onClick={() => setMenuOpen(false)}>👤 {user.displayName || user.email?.split("@")[0]}</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-red-500 text-left">Çıkış</button>
            </>
          ) : (
            <>
              <Link href="/giris" onClick={() => setMenuOpen(false)}>Giriş Yap</Link>
              <Link href="/kayit" onClick={() => setMenuOpen(false)}>Kayıt Ol</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
