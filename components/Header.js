import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const { language, setLanguage } = useLanguage();
  const isEnglish = language === "en";

  const prefix = isEnglish ? "/en" : "";

  const handleLogout = async () => {
    await signOut(auth);
    router.replace(`${prefix}/giris`);
    setMenuOpen(false);
  };

  const switchLanguage = () => {
    setLanguage(isEnglish ? "tr" : "en");
    setMenuOpen(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const links = [
    {
      href: `${prefix}/talep`,
      label: isEnglish ? "Create Request" : "Talep Oluştur",
    },
    {
      href: `${prefix}/talepler`,
      label: isEnglish ? "Requests" : "Talepler",
    },
    {
      href: `${prefix}/eslesmeler`,
      label: isEnglish ? "Matches" : "Eşleşmeler",
    },
    {
      href: `${prefix}/iletisim`,
      label: isEnglish ? "Contact" : "İletişim",
    },
  ];

  return (
    <header className="w-full border-b shadow-sm bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={isEnglish ? "/en" : "/"} className="flex items-center gap-2">
          <Image src="/favicon.ico" alt="Logo" width={28} height={28} />
          <span className="text-base font-semibold text-black hover:underline">
            yolcuberaberi.com
          </span>
        </Link>

        <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className="hidden sm:flex gap-4 text-sm font-medium text-gray-800">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center space-x-2 text-sm">
          <button
            onClick={switchLanguage}
            className="border px-3 py-1 rounded-md hover:bg-gray-100 font-semibold"
          >
            {isEnglish ? "TR" : "EN"}
          </button>

          {user ? (
            <>
              <Link
                href={`${prefix}/profil`}
                className="text-gray-700 hover:text-blue-600"
              >
                👤 {user.displayName || user.email?.split("@")[0]}
              </Link>

              <button
                onClick={handleLogout}
                className="border px-3 py-1 rounded-md text-red-500 hover:bg-gray-100"
              >
                {isEnglish ? "Log Out" : "Çıkış"}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`${prefix}/giris`}
                className="border px-4 py-1 rounded-md hover:bg-gray-100"
              >
                {isEnglish ? "Log In" : "Giriş Yap"}
              </Link>

              <Link
                href={`${prefix}/kayit`}
                className="border px-4 py-1 rounded-md hover:bg-gray-100"
              >
                {isEnglish ? "Sign Up" : "Kayıt Ol"}
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-3 px-4 pb-4 text-sm text-gray-800">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link href={`${prefix}/profil`} onClick={closeMenu}>
                👤 {user.displayName || user.email?.split("@")[0]}
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-500 text-left"
              >
                {isEnglish ? "Log Out" : "Çıkış"}
              </button>
            </>
          ) : (
            <>
              <Link href={`${prefix}/giris`} onClick={closeMenu}>
                {isEnglish ? "Log In" : "Giriş Yap"}
              </Link>

              <Link href={`${prefix}/kayit`} onClick={closeMenu}>
                {isEnglish ? "Sign Up" : "Kayıt Ol"}
              </Link>
            </>
          )}

          <button
            onClick={switchLanguage}
            className="border rounded-md px-3 py-2 text-left"
          >
            {isEnglish ? "Türkçe'ye geç" : "Switch to English"}
          </button>
        </div>
      )}
    </header>
  );
}