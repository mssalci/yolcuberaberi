// pages/profile.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [iban, setIban] = useState("");
  const [paypal, setPaypal] = useState("");
  const [activeTab, setActiveTab] = useState("hesap");
  const [taleplerim, setTaleplerim] = useState([]);
  const [verdigimTeklifler, setVerdigimTeklifler] = useState([]);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (!loaded) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.name || "");
            setIban(data.iban || "");
            setPaypal(data.paypal || "");
          }

          const q = query(collection(db, "talepler"), where("uid", "==", currentUser.uid));
          const taleplerSnapshot = await getDocs(q);
          setTaleplerim(taleplerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          const teklifSnap = await getDocs(
            query(collection(db, "teklifler"), where("teklifVerenUid", "==", currentUser.uid))
          );
          const teklifler = [];
          const eslesenler = [];

          for (let teklifDoc of teklifSnap.docs) {
            const data = teklifDoc.data();
            const talepDoc = await getDoc(doc(db, "talepler", data.talepId));
            const teklifData = {
              id: teklifDoc.id,
              ...data,
              talep: talepDoc.exists() ? talepDoc.data() : null,
            };
            teklifler.push(teklifData);
            if (data.durum === "kabul edildi") {
              eslesenler.push(teklifData);
            }
          }

          const gelenTekliflerSnap = await getDocs(
            query(collection(db, "teklifler"), where("durum", "==", "kabul edildi"))
          );

          for (let teklifDoc of gelenTekliflerSnap.docs) {
            const data = teklifDoc.data();
            const talepDoc = await getDoc(doc(db, "talepler", data.talepId));
            if (talepDoc.exists() && talepDoc.data().uid === currentUser.uid) {
              eslesenler.push({
                id: teklifDoc.id,
                ...data,
                talep: talepDoc.data(),
              });
            }
          }

          setVerdigimTeklifler(teklifler);
          setEslesmeler(eslesenler);
          setLoaded(true);
        }
      }
    });

    return () => unsubscribe();
  }, [loaded]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleSaveInfo = async () => {
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        name: userName,
        iban: iban,
        paypal: paypal
      });
      alert("Bilgileriniz güncellendi.");
    }
  };

  const startChat = (uid1, uid2) => {
    const chatId = [uid1, uid2].sort().join("_");
    router.push(`/chat/${chatId}`);
  };

  if (!user) return <p style={{ padding: "2rem" }}>Giriş yapmalısınız.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Profilim</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setActiveTab("hesap")}>Hesap Bilgileri</button>
        <button onClick={() => setActiveTab("talepler")}>Taleplerim</button>
        <button onClick={() => setActiveTab("teklifler")}>Verdiğim Teklifler</button>
        <button onClick={() => setActiveTab("eslesmeler")}>Eşleşmeler</button>
      </div>

      {activeTab === "hesap" && (
        <div>
          <label>Ad Soyad:<br />
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </label><br /><br />

          <label>IBAN:<br />
            <input type="text" value={iban} onChange={(e) => setIban(e.target.value)} />
          </label><br /><br />

          <label>PayPal:<br />
            <input type="email" value={paypal} onChange={(e) => setPaypal(e.target.value)} />
          </label><br /><br />

          <button onClick={handleSaveInfo}>Kaydet</button>
          <p><strong>E-posta:</strong> {user.email}</p>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      )}

      {activeTab === "talepler" && (
        <ul>
          {taleplerim.map((talep) => (
            <li key={talep.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
              <strong>{talep.baslik}</strong><br />
              {talep.aciklama}<br />
              <em>Nereden:</em> {talep.nereden}<br />
              <em>Teslim Tarihi:</em> {talep.tahminiTarih || "-"}
            </li>
          ))}
        </ul>
      )}

      {activeTab === "teklifler" && (
        <ul>
          {verdigimTeklifler.map((teklif) => (
            <li key={teklif.id} style={{ border: "1px solid #aaa", padding: "1rem", marginBottom: "1rem" }}>
              <strong>Talep:</strong> {teklif.talep?.baslik || "Silinmiş talep"}<br />
              <strong>Durum:</strong> {teklif.durum || "beklemede"}
              {teklif.durum === "karşı teklif" && teklif.mesaj && (
                <div><em>Not:</em> {teklif.mesaj}</div>
              )}
            </li>
          ))}
        </ul>
      )}

      {activeTab === "eslesmeler" && (
        <ul>
          {eslesmeler.map((tek) => (
            <li key={tek.id} style={{ border: "1px solid green", padding: "1rem", marginBottom: "1rem" }}>
              <strong>Talep:</strong> {tek.talep?.baslik}<br />
              <strong>Durum:</strong> ✅ Kabul Edildi<br />
              <button onClick={() => startChat(user.uid, tek.teklifVerenUid)}>Mesajlaş</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
                                                          }
