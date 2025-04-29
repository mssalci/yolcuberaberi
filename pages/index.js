import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import Link from 'next/link';
import { LogOut, PlusCircle, Mail, FileText, Users } from 'lucide-react';

export default function HomePage() {
  const auth = getAuth();
  const router = useRouter();
  const [talepler, setTalepler] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        fetchTalepler();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchTalepler = async () => {
    const querySnapshot = await getDocs(collection(db, 'talepler'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTalepler(data);
  };

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
            <Link href="/" className="flex items-center gap-2 hover:text-yellow-300">
              <FileText size={20} /> Taleplerim
            </Link>
            <Link href="/tekliflerim" className="flex items-center gap-2 hover:text-yellow-300">
              <Mail size={20} /> Tekliflerim
            </Link>
            <Link href="/eslesmelerim" className="flex items-center gap-2 hover:text-yellow-300">
              <Users size={20} /> Eşleşmeler
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

      {/* İçerik */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Taleplerim</h1>
          <Link href="/talep-olustur" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <PlusCircle size={20} /> Talep Oluştur
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talepler.length === 0 ? (
            <p>Henüz talep yok.</p>
          ) : (
            talepler.map((talep) => (
              <div key={talep.id} className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-lg font-bold mb-2">{talep.baslik}</h2>
                <p className="text-gray-700">{talep.aciklama}</p>
                <p className="text-sm text-gray-500 mt-2">{talep.ulke} → {talep.sehir}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
