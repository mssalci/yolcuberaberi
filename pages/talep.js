import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Talep() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [talep, setTalep] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!talep) return alert("Lütfen bir talep girin.");

    try {
      await addDoc(collection(db, "talepler"), {
        uid: user.uid,
        talep,
        createdAt: serverTimestamp(),
      });
      alert("Talebiniz başarıyla oluşturuldu!");
      setTalep("");
    } catch (error) {
      console.error("Talep Hatası:", error.message);
      alert("Talep gönderilirken bir hata oluştu.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Talep Oluştur</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={talep}
          onChange={(e) => setTalep(e.target.value)}
          placeholder="Talebinizi buraya yazın"
          style={{ width: "100%", height: "100px", marginBottom: "1rem" }}
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}
