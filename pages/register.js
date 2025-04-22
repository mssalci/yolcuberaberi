// pages/register.js (veya signup.js)
import { useState } from "react";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

<p style={{ color: "#555", marginBottom: "1rem" }}>
  Lütfen önce kayıt olun veya giriş yapın. Talep oluşturabilmeniz için giriş yapmış olmanız gerekiyor.
</p>

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore'da kullanıcı profili oluştur
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        createdAt: new Date(),
      });

      router.push("/profile");
    } catch (error) {
      console.error("Kayıt Hatası:", error.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Kayıt Ol</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Ad Soyad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br />
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Kayıt Ol</button>
      </form>
    </div>
  );
}
