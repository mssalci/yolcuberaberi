import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kullanıcı bilgisini dinle
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error.message);
    }
  };

  return (
    <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/tekliflerim" style={{ marginLeft: '10px' }}>Tekliflerim</Link>
        </div>

        <div>
          {user ? (
            <>
              <span style={{ marginRight: '10px' }}>
                {user.email}
              </span>
              <button onClick={handleLogout}>Çıkış Yap</button>
            </>
          ) : (
            <>
              <Link href="/login">Giriş Yap</Link>
              <Link href="/register" style={{ marginLeft: '10px' }}>Kayıt Ol</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
