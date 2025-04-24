// pages/profile.js
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [taleplerim, setTaleplerim] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const q = query(collection(db, "talepler"), where("uid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const talepler = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTaleplerim(talepler);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Profilim</h1>
      {user && <p>📧 {user.email}</p>}

      <h2 style={{ marginTop: "2rem" }}>Oluşturduğunuz Talepler</h2>
      {taleplerim.length === 0 ? (
        <p>Henüz bir talep oluşturmadınız.</p>
      ) : (
        <ul>
          {taleplerim.map((talep) => (
            <li key={talep.id} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
              <strong>{talep.baslik}</strong><br />
              {talep.aciklama}<br />
              <em>Nereden:</em> {talep.nereden}<br />
              <em>Tahmini Teslim Tarihi:</em> {talep.tahminiTarih || "-"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}