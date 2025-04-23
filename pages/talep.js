// pages/talep.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Talep() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [talepData, setTalepData] = useState({
    baslik: "",
    aciklama: "",
    nereden: "",
    tahminiTarih: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        alert("Talep oluşturmak için giriş yapmanız gerekiyor.");
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTalepData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { baslik, aciklama, nereden, tahminiTarih } = talepData;

    if (!baslik || !aciklama || !nereden) {
      alert("Lütfen tüm gerekli alanları doldurun.");
      return;
    }

    try {
      await addDoc(collection(db, "talepler"), {
        uid: user.uid,
        ...talepData,
        createdAt: serverTimestamp(),
      });
      alert("Talebiniz başarıyla oluşturuldu!");
      setTalepData({ baslik: "", aciklama: "", nereden: "", tahminiTarih: "" });
    } catch (error) {
      console.error("Talep Hatası:", error.message);
      alert("Talep gönderilirken bir hata oluştu.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Yeni Talep Oluştur</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="baslik"
          value={talepData.baslik}
          onChange={handleChange}
          placeholder="Talep Başlığı"
          required
        /><br />
        <textarea
          name="aciklama"
          value={talepData.aciklama}
          onChange={handleChange}
          placeholder="Ayrıntılı Açıklama"
          required
        /><br />
        <input
          type="text"
          name="nereden"
          value={talepData.nereden}
          onChange={handleChange}
          placeholder="Nereden (ülke, şehir vs.)"
          required
        /><br />
        <input
          type="date"
          name="tahminiTarih"
          value={talepData.tahminiTarih}
          onChange={handleChange}
        /><br />
        <button type="submit">Talebi Gönder</button>
      </form>
    </div>
  );
}
