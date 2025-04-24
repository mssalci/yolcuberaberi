// components/Header.js
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Header() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setName(docSnap.data().name);
        }
      } else {
        setName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Çıkış Hatası:", error.message);
    }
  };

  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/talep">Talep Oluştur</Link>
<Link href="/talepler">Tüm Talepler</Link>
<Link href="/tekliflerim">Gelen Teklifler</Link>


          {user ? (
            <>
              <Link href="/profile">Profil</Link>
              <button onClick={handleLogout} style={{ background: "red", color: "white" }}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Giriş</Link>
              <Link href="/register">Kayıt</Link>
            </>
          )}
        </div>
        {user && <span>👋 Merhaba, {name || user.email}</span>}
      </nav>
    </header>
  );
}
