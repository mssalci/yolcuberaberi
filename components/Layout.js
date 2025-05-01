import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sol Menü */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between">
        <div>
          <Link href="/" className="text-2xl font-bold block mb-6 hover:text-yellow-300">
            Yolcu Beraberi
          </Link>
          <nav className="space-y-4">
            <Link href="/talepler" className="block hover:text-yellow-300">Tüm Talepler</Link>
            <Link href="/tekliflerim" className="block hover:text-yellow-300">Eşleşmeler</Link>
            <Link href="/talep" className="block hover:text-yellow-300">Talep Oluştur</Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-600"
        >
          Çıkış Yap
        </button>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
