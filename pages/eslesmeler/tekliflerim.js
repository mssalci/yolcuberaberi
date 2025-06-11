// pages/eslesmeler/taleplerim.js
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function Taleplerim() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eslesmeler, setEslesmeler] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchEslesmeler(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchEslesmeler = async (uid) => {
    try {
      const taleplerRef = collection(db, "talepler");
      const q = query(taleplerRef, where("olusturanId", "==", uid));
      const querySnapshot = await getDocs(q);

      const talepler = [];
      for (const talepDoc of querySnapshot.docs) {
        const talepData = talepDoc.data();
        const tekliflerRef = collection(db, "talepler", talepDoc.id, "teklifler");
        const tekliflerSnapshot = await getDocs(tekliflerRef);

        for (const teklifDoc of tekliflerSnapshot.docs) {
          const teklifData = teklifDoc.data();
          if (teklifData.durum === "kabul edildi") {
            const teklifVerenRef = doc(db, "kullanicilar", teklifData.teklifVerenId);
            const teklifVerenSnap = await getDoc(teklifVerenRef);
            const teklifVerenBilgi = teklifVerenSnap.exists() ? teklifVerenSnap.data() : null;

            talepler.push({
              talepId: talepDoc.id,
              talep: talepData,
              teklif: teklifData,
              teklifVeren: teklifVerenBilgi,
            });
          }
        }
      }

      setEslesmeler(talepler);
      setLoading(false);
    } catch (error) {
      console.error("Eşleşmeleri alırken hata:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  if (eslesmeler.length === 0) {
    return <p>Henüz kabul edilmiş teklifin yok.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Taleplerime Gelen Eşleşmeler</h2>
      <ul className="space-y-4">
        {eslesmeler.map((eslesme, index) => (
          <li key={index} className="border rounded p-4 bg-gray-50">
            <p><strong>Talep:</strong> {eslesme.talep.urunAdi} - {eslesme.talep.kategori}</p>
            <p><strong>Teklif Tutarı:</strong> {eslesme.teklif.teklifTutari} ₺</p>
            <p><strong>Teklif Veren:</strong> {eslesme.teklifVeren?.isim || "Bilinmiyor"}</p>
            <p><strong>Durum:</strong> {eslesme.teklif.durum}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
