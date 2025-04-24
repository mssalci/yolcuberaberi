import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

export default function Tekliflerim() {
  const [user, setUser] = useState(null);
  const [gelenTeklifler, setGelenTeklifler] = useState([]);
  const [verdigimTeklifler, setVerdigimTeklifler] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Kullanıcının taleplerine gelen teklifler
        const taleplerSnapshot = await getDocs(
          query(collection(db, "talepler"), where("uid", "==", currentUser.uid))
        );
        const talepIdler = taleplerSnapshot.docs.map((doc) => doc.id);

        const teklifSnapshot = await getDocs(collection(db, "teklifler"));
        const gelen = [];
        const verdiklerim = [];

        for (let teklifDoc of teklifSnapshot.docs) {
          const data = teklifDoc.data();
          const talepDoc = await getDoc(doc(db, "talepler", data.talepId));

          const teklifData = {
            ...data,
            id: teklifDoc.id,
            talep: talepDoc.data(),
          };

          if (talepIdler.includes(data.talepId)) {
            gelen.push(teklifData);
          }

          if (data.teklifVerenUid === currentUser.uid) {
            verdiklerim.push(teklifData);
          }
        }

        setGelenTeklifler(gelen);
        setVerdigimTeklifler(verdiklerim);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDurumGuncelle = async (teklifId, yeniDurum) => {
    try {
      await updateDoc(doc(db, "teklifler", teklifId), {
        durum: yeniDurum,
      });
      alert(`Teklif ${yeniDurum} olarak işaretlendi.`);
    } catch (err) {
      alert("İşlem hatası: " + err.message);
    }
  };

  const handleKarsiTeklif = async (teklif) => {
    const mesaj = prompt("Karşı teklif notunuz:");
    if (!mesaj) return;
    try {
      await updateDoc(doc(db, "teklifler", teklif.id), {
        durum: "karşı teklif",
        mesaj,
      });
      alert("Karşı teklif gönderildi!");
    } catch (err) {
      alert("Karşı teklif hatası: " + err.message);
    }
  };

  const gelenBekleyen = gelenTeklifler.filter(t => !t.durum || t.durum === "beklemede");
  const gelenKabul = gelenTeklifler.filter(t => t.durum === "kabul edildi");

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Teklif Yönetimi</h1>

      <h2>Bana Gelen Teklifler</h2>
      {gelenBekleyen.length === 0 ? <p>Bekleyen teklif yok.</p> : (
        gelenBekleyen.map((teklif) => (
          <div key={teklif.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
            <strong>Talep:</strong> {teklif.talep?.baslik} <br />
            <strong>Teklifi Veren:</strong> {teklif.teklifVerenUid} <br />
            <strong>Durum:</strong> {teklif.durum || "beklemede"} <br />
            <button onClick={() => handleDurumGuncelle(teklif.id, "kabul edildi")}>✅ Kabul Et</button>
            <button onClick={() => handleDurumGuncelle(teklif.id, "reddedildi")}>❌ Reddet</button>
            <button onClick={() => handleKarsiTeklif(teklif)}>✏️ Karşı Teklif</button>
          </div>
        ))
      )}

      <h2 style={{ marginTop: "2rem" }}>Eşleşmeler (Kabul Edilen Teklifler)</h2>
      {gelenKabul.length === 0 ? <p>Henüz eşleşme yok.</p> : (
        gelenKabul.map((teklif) => (
          <div key={teklif.id} style={{ border: "1px solid green", marginBottom: "1rem", padding: "1rem" }}>
            <strong>Talep:</strong> {teklif.talep?.baslik} <br />
            <strong>Teklifi Veren:</strong> {teklif.teklifVerenUid} <br />
            <strong>Durum:</strong> ✅ Kabul Edildi
          </div>
        ))
      )}

      <h2 style={{ marginTop: "2rem" }}>Verdiğim Teklifler</h2>
      {verdigimTeklifler.length === 0 ? <p>Henüz teklif vermediniz.</p> : (
        verdigimTeklifler.map((teklif) => (
          <div key={teklif.id} style={{ border: "1px solid #666", marginBottom: "1rem", padding: "1rem" }}>
            <strong>Talep:</strong> {teklif.talep?.baslik} <br />
            <strong>Durum:</strong> {teklif.durum || "beklemede"} <br />
            {teklif.durum === "karşı teklif" && teklif.mesaj && (
              <p><em>Karşı Teklif Mesajı:</em> {teklif.mesaj}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
                                      }
