// pages/uidGuncelle.js

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function UIDGuncelle() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const guncelle = () => {
      onAuthStateChanged(auth, async (user) => {
        const logTemp = [];

        if (!user) {
          logTemp.push("❌ Lütfen giriş yapın.");
          setLog(logTemp);
          setLoading(false);
          return;
        }

        logTemp.push(`👤 Giriş yapan UID: ${user.uid}`);

        // 🔐 Sadece belirli UID için işlem izni
        const adminUid = "vv6HBlSduQebPr8iE7SurIJDiha2"; // kendi UID'in
        if (user.uid !== adminUid) {
          logTemp.push("⛔ Bu işlemi yapma yetkiniz yok.");
          setLog(logTemp);
          setLoading(false);
          return;
        }

        try {
          logTemp.push("📡 Firestore'dan kullanıcılar alınıyor...");
          const snapshot = await getDocs(collection(db, "kullanicilar"));
          logTemp.push(`📄 Toplam ${snapshot.size} belge bulundu.`);

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const ref = doc(db, "kullanicilar", docSnap.id);

            if (!data.uid) {
              await updateDoc(ref, { uid: docSnap.id });
              logTemp.push(`✅ UID eklendi: ${docSnap.id}`);
            } else if (data.uid !== docSnap.id) {
              await updateDoc(ref, { uid: docSnap.id });
              logTemp.push(`🔁 UID düzeltildi: ${docSnap.id}`);
            } else {
              logTemp.push(`⏭️ Zaten doğru: ${docSnap.id}`);
            }

            // İsteğe bağlı: logları her 5 kullanıcıda bir ekrana yansıt
            if (logTemp.length % 5 === 0) setLog([...logTemp]);
          }

          logTemp.push("🎉 Tüm kullanıcılar kontrol edildi.");
        } catch (error) {
          console.error("🔥 Hata:", error);
          logTemp.push(`❌ Hata oluştu: ${error.message}`);
        } finally {
          setLog([...logTemp]);
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
        <p className="text-sm text-gray-500">Kontrol ediliyor ve güncelleniyor...</p>
      ) : (
        <ul className="space-y-1 text-sm bg-gray-50 p-3 rounded-md border">
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
        }
