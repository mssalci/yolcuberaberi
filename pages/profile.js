import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc
} from "firebase/firestore";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [taleplerim, setTaleplerim] = useState([]);
  const [verdigimTeklifler, setVerdigimTeklifler] = useState([]);
  const [eslesmeler, setEslesmeler] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Talepler
        const q = query(collection(db, "talepler"), where("uid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const talepler = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTaleplerim(talepler);

        // Verdiğim teklifler
        const teklifSnap = await getDocs(
          query(collection(db, "teklifler"), where("teklifVerenUid", "==", currentUser.uid))
        );
        const teklifList = [];
        const eslesenList = [];

        for (let docItem of teklifSnap.docs) {
          const data = docItem.data();
          const talepDoc = await getDoc(doc(db, "talepler", data.talepId));

          const teklifData = {
            id: docItem.id,
            ...data,
            talep: talepDoc.exists() ? talepDoc.data() : null,
          };

          teklifList.push(teklifData);

          if (data.durum === "kabul edildi") {
            eslesenList.push(teklifData);
          }
        }

        setVerdigimTeklifler(teklifList);
        setEslesmeler(eslesenList);
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

      <h2 style={{ marginTop: "2rem" }}>Verdiğiniz Teklifler</h2>
      {verdigimTeklifler.length === 0 ? (
        <p>Henüz teklif vermediniz.</p>
      ) : (
        <ul>
          {verdigimTeklifler.map((teklif) => (
            <li key={teklif.id} style={{ marginBottom: "1rem", border: "1px solid #aaa", padding: "1rem" }}>
              <strong>Talep:</strong> {teklif.talep?.baslik || "Silinmiş talep"}<br />
              <strong>Durum:</strong> {teklif.durum || "beklemede"}
              {teklif.durum === "karşı teklif" && teklif.mesaj && (
                <div><em>Not:</em> {teklif.mesaj}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: "2rem" }}>Eşleşmeler (Kabul Edilen Teklifler)</h2>
      {eslesmeler.length === 0 ? (
        <p>Henüz eşleşme oluşmadı.</p>
      ) : (
        <ul>
          {eslesmeler.map((tek) => (
            <li key={tek.id} style={{ marginBottom: "1rem", border: "1px solid green", padding: "1rem" }}>
              <strong>Talep:</strong> {tek.talep?.baslik}<br />
              <strong>Durum:</strong> ✅ Kabul Edildi
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
