// pages/talepler.js
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Talepler() {
  const [talepler, setTalepler] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
const handleTeklifVer = async (talepId) => {
  if (!currentUser) {
    alert("Teklif vermek için giriş yapmalısınız.");
    return;
  }

  try {
    await addDoc(collection(db, "teklifler"), {
      talepId,
      teklifVerenUid: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    alert("Teklifiniz iletildi!");
  } catch (error) {
    console.error("Teklif hatası:", error.message);
    alert("Teklif verilirken bir hata oluştu.");
  }
};
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    
const fetchTalepler = async () => {
      const snapshot = await getDocs(collection(db, "talepler"));
      const taleplerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTalepler(taleplerList);
    };



    fetchTalepler();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Tüm Talepler</h1>
      {talepler.length === 0 ? (
        <p>Henüz bir talep oluşturulmamış.</p>
      ) : (
        talepler.map((talep) => (
          <div key={talep.id} style={{ marginBottom: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
            <h2>{talep.baslik}</h2>
            <p><strong>Açıklama:</strong> {talep.aciklama}</p>
            <p><strong>Nereden:</strong> {talep.nereden}</p>
            <p><strong>Tahmini Teslim Tarihi:</strong> {talep.tahminiTarih || "-"}</p>

            {currentUser?.uid !== talep.uid && (
              <button style={{ marginTop: "1rem" }} onClick={() => handleTeklifVer(talep.id)}>
  ✈️ Getirebilirim
</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
