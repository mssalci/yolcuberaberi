// pages/profile.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("hesap");
  const [taleplerim, setTaleplerim] = useState([]);
  const [verdigimTeklifler, setVerdigimTeklifler] = useState([]);
  const [eslesmeler, setEslesmeler] = useState([]);

  const [userName, setUserName] = useState("");
  const [iban, setIban] = useState("");
  const [paypal, setPaypal] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserName(data.name || "");
          setIban(data.iban || "");
          setPaypal(data.paypal || "");
        }

        const qTalepler = query(collection(db, "talepler"), where("uid", "==", currentUser.uid));
        const taleplerSnapshot = await getDocs(qTalepler);
        setTaleplerim(taleplerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const qTeklifler = query(collection(db, "teklifler"), where("teklifVerenUid", "==", currentUser.uid));
        const teklifSnapshot = await getDocs(qTeklifler);
        const teklifler = [];
        const eslesen = [];

        for (let teklif of teklifSnapshot.docs) {
          const data = teklif.data();
          const talepRef = doc(db, "talepler", data.talepId);
          const talepSnap = await getDoc(talepRef);
          const teklifData = {
            id: teklif.id,
            ...data,
            talep: talepSnap.exists() ? talepSnap.data() : null,
          };
          teklifler.push(teklifData);
          if (data.durum === "kabul edildi") {
            eslesen.push(teklifData);
          }
        }

        // Kullanıcının taleplerine gelen ve kabul ettiği teklifler
        const gelenTeklifSnap = await getDocs(query(collection(db, "teklifler"), where("durum", "==", "kabul edildi")));
        for (let teklif of gelenTeklifSnap.docs) {
          const data = teklif.data();
          const talepSnap = await getDoc(doc(db, "talepler", data.talepId));
          if (talepSnap.exists() && talepSnap.data().uid === currentUser.uid) {
            eslesen.push({
              id: teklif.id,
              ...data,
              talep: talepSnap.data(),
            });
          }
        }

        setVerdigimTeklifler(teklifler);
        setEslesmeler(eslesen);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (user) {
      await updateDoc(doc(db, "users", user.uid), {
        name: userName,
        iban,
        paypal,
      });
      alert("Bilgiler kaydedildi.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user) return <p style={{ padding: "2rem" }}>Giriş yapmalısınız.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Profil</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setActiveTab("hesap")}>Hesap</button>
        <button onClick={() => setActiveTab("talepler")}>Talepler</button>
        <button onClick={() => setActiveTab("teklifler")}>Teklifler</button>
        <button onClick={() => setActiveTab("eslesmeler")}>Eşleşmeler</button>
      </div>

      {activeTab === "hesap" && (
        <div>
          <label>Ad Soyad<br /><input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} /></label><br /><br />
          <label>IBAN<br /><input type="text" value={iban} onChange={(e) => setIban(e.target.value)} /></label><br /><br />
          <label>PayPal<br /><input type="text" value={paypal} onChange={(e) => setPaypal(e.target.value)} /></label><br /><br />
          <button onClick={handleSave}>Kaydet</button>
          <p><strong>E-posta:</strong> {user.email}</p>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      )}

      {activeTab === "talepler" && (
        <ul>
          {taleplerim.map((t) => (
            <li key={t.id}>{t.baslik} - {t.aciklama}</li>
          ))}
        </ul>
      )}

      {activeTab === "teklifler" && (
        <ul>
          {verdigimTeklifler.map((t) => (
            <li key={t.id}>Talep: {t.talep?.baslik || "Silinmiş"} - Durum: {t.durum || "beklemede"}</li>
          ))}
        </ul>
      )}

      {activeTab === "eslesmeler" && (
        <ul>
          {eslesmeler.map((e) => (
            <li key={e.id}>{e.talep?.baslik} - ✅ Kabul Edildi</li>
          ))}
        </ul>
      )}
    </div>
  );
        }
