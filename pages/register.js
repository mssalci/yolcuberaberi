// pages/register.js

import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Kullanıcıyı Firebase Authentication ile oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore'da kullanıcı profili oluştur
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
      });

      alert("Kayıt başarılı! Giriş yapabilirsiniz.");
      router.push("/login");
    } catch (error) {
      console.error("Kayıt Hatası:", error.message);
      alert("Kayıt sırasında bir hata oluştu: " + error.message);
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
