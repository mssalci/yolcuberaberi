// pages/talep.js
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";

export default function TalepOlustur() {
  const [form, setForm] = useState({ isim: "", email: "", icerik: "" });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "talepler"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      alert("Talep başarıyla oluşturuldu!");
      router.push("/");
    } catch (err) {
      console.error("Hata:", err);
      alert("Bir hata oluştu.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Talep Oluştur</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="isim"
          placeholder="İsminiz"
          value={form.isim}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          required
        /><br /><br />
        <textarea
          name="icerik"
          placeholder="Talep detayları"
          value={form.icerik}
          onChange={handleChange}
          required
        /><br /><br />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}
