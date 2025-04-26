// components/Header.js
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-black text-white flex justify-between items-center px-4 py-3 shadow-md">
      <div className="flex items-center space-x-6">
        <Link href="/" className="hover:underline">
          Ana Sayfa
        </Link>
        <Link href="/talep-olustur" className="hover:underline">
          Talep Oluştur
        </Link>
        <Link href="/tum-talepler" className="hover:underline">
          Tüm Talepler
        </Link>
        <Link href="/gelen-teklifler" className="hover:underline">
          Gelen Teklifler
        </Link>
        <Link href="/profil" className="hover:underline">
          Profil
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <>
            <span>Merhaba, {user.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
            >
              Çıkış Yap
            </button>
          </>
        )}
      </div>
    </header>
  );
}
