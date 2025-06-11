// pages/uidGuncelle.js

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function UIDGuncelle() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guncelle = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          setLog(["Lütfen giriş yapın."]);
          return;
        }

        // 🔐 Sadece senin UID'inse izin ver (önlem olarak)
        const adminUid = "vv6HBlSduQebPr8iE7SurIJDiha2"; // kendi UID'ini buraya yaz
        if (user.uid !== adminUid) {
          setLog(["Bu işlemi yapma yetkiniz yok."]);
          return;
        }

        const logTemp = [];
        try {
          const snapshot = await getDocs(collection(db, "kullanicilar"));
          const batch = [];

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            if (!data.uid) {
              const ref = doc(db, "kullanicilar", docSnap.id);
              await updateDoc(ref, { uid: docSnap.id });
              logTemp.push(`✅ Güncellendi: ${docSnap.id}`);
            } else {
              logTemp.push(`⏩ Zaten var: ${docSnap.id}`);
            }
          }

          setLog(logTemp);
        } catch (error) {
          console.error("Hata:", error);
          setLog([`❌ Hata oluştu: ${error.message}`]);
        } finally {
          setLoading(false);
        }
      });
    };

    guncelle();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">UID Güncelleme Aracı</h1>
      {loading ? (
        <p>Kontrol ediliyor ve güncelleniyor...</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
