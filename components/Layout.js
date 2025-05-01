// components/Layout.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase/firebaseConfig';
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
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sol Menü */}
      <aside className="w-full md:w-64 bg-gray-900 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">Yolcu Beraberi</h2>
          <nav className="space-y-4">
            <Link href="/talepler" className="block hover:text-yellow-300">
              Tüm Talepler
            </Link>
            <Link href="/tekliflerim" className="block hover:text-yellow-300">
              Eşleşmeler
            </Link>
            <Link href="/talep" className="block hover:text-yellow-300">
              Talep Oluştur
            </Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 text-red-400 hover:text-red-600"
        >
          Çıkış Yap
        </button>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
