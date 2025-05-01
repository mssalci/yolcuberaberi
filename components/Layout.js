// components/Layout.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FileText, Mail, PlusCircle, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig'; // Doğru config dosyası

export default function Layout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // null yerine undefined başlangıç için

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

  // Kullanıcı kontrolü tamamlanana kadar children'ı render etme
  if (user === undefined) return null;

  return (
    <div className="flex h-screen">
      {/* Sol Menü */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Yolcu Beraberi</h2>
          <nav className="space-y-4">
            <Link href="/talepler" className="flex items-center gap-2 hover:text-yellow-300">
              <FileText size={20} /> Tüm Talepler
            </Link>
            <Link href="/tekliflerim" className="flex items-center gap-2 hover:text-yellow-300">
              <Mail size={20} /> Eşleşmeler
            </Link>
            <Link href="/talep" className="flex items-center gap-2 hover:text-yellow-300">
              <PlusCircle size={20} /> Talep Oluştur
            </Link>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-600"
        >
          <LogOut size={20} /> Çıkış Yap
        </button>
      </aside>

      {/* Ana İçerik */}
      <main className="flex-1 bg-gray-50 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
