// pages/tekliflerim.js
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";

export default function Tekliflerim() {
  const [user, setUser] = useState(null);
  const [teklifler, setTeklifler] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Önce bu kullanıcıya ait tüm talepleri bul
        const taleplerSnapshot = await getDocs(query(collection(db, "talepler"), where("uid", "==", currentUser.uid)));
        const talepIdler = taleplerSnapshot.docs.map((doc) => doc.id);

        // Sonra bu taleplere gelen teklifleri al
        const teklifSnapshot = await getDocs(collection(db, "teklifler"));
        const gelenTeklifler = [];

        for (let teklifDoc of teklifSnapshot.docs) {
          const data = teklifDoc.data();
          if (talepIdler.includes(data.talepId)) {
            const talepDoc = await getDoc(doc(db, "talepler", data.talepId));
            gelenTeklifler.push({
              ...data,
              id: teklifDoc.id,
              talep: talepDoc.data(),
            });
          }
        }

        setTeklifler(gelenTeklifler);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleKabulEt = async (teklifId) => {
    try {
      await updateDoc(doc(db, "teklifler", teklifId), {
        durum: "kabul edildi",
      });
      alert("Teklif kabul edildi!");
    } catch (err) {
      alert("Teklif kabul hatası: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bana Gelen Teklifler</h1>
      {teklifler.length === 0 ? (
        <p>Henüz teklif almadınız.</p>
      ) : (
        teklifler.map((teklif) => (
          <div key={teklif.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
            <strong>Talep:</strong> {teklif.talep?.baslik} <br />
            <strong>Teklifi Veren UID:</strong> {teklif.teklifVerenUid} <br />
            <strong>Durum:</strong> {teklif.durum || "Beklemede"} <br />
            {teklif.durum !== "kabul edildi" && (
              <button onClick={() => handleKabulEt(teklif.id)}>✅ Teklifi Kabul Et</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
