// pages/index.js
import Link from 'next/link';
import { useAuth } from '../firebase/authContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Yolcu Beraberi Platformu</h1>
      <div className="flex flex-col space-y-4">
        {user ? (
          <>
            <Link href="/taleplerim">
              <button className="w-64 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                Taleplerim
              </button>
            </Link>
            <Link href="/tekliflerim">
              <button className="w-64 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700">
                Tekliflerim
              </button>
            </Link>
            <Link href="/profil">
              <button className="w-64 py-3 px-4 bg-gray-800 text-white rounded-xl hover:bg-gray-900">
                Profilim
              </button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="w-64 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                Giriş Yap
              </button>
            </Link>
            <Link href="/register">
              <button className="w-64 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700">
                Kayıt Ol
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
