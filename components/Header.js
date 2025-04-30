import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

export default function Header() {
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="flex h-screen">
      {/* Sol Menü */}
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Yolcu Beraberi</h2>
          <nav className="space-y-4">
            <Link href="/talepler" className="flex items-center gap-2 hover:text-yellow-300">
              Tüm Talepler
            </Link>
            <Link href="/eslesmeler" className="flex items-center gap-2 hover:text-yellow-300">
              Tekliflerim
            </Link>
            <Link href="/talep" className="flex items-center gap-2 hover:text-yellow-300">
              Talep Oluştur
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
    </div>
  );
}
