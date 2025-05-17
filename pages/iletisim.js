import Head from "next/head";
import { useState } from "react";
import { db } from "../lib/firebase"; // Firebase bağlantın burada olmalı
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function Iletisim() {
  const [form, setForm] = useState({ ad: "", email: "", mesaj: "" });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Firebase'e kaydet
      await addDoc(collection(db, "iletisimMesajlari"), {
        ...form,
        tarih: Timestamp.now()
      });

      // Mail gönder
      await fetch("/api/mail-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      setForm({ ad: "", email: "", mesaj: "" });
      setSuccess(true);
    } catch (err) {
      console.error("Hata oluştu:", err);
    }
  };

  return (
    <>
      <Head>
        <title>İletişim | Yolcu Beraberi</title>
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-16 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">İletişim</h1>

        <p className="mb-4">
          Yolcu Beraberi hakkında sorularınız, önerileriniz ya da iş birliği
          talepleriniz için bize aşağıdaki kanallar üzerinden ulaşabilirsiniz.
        </p>

        <div className="space-y-4">
          <p><strong>Adres:</strong> İstanbul, Türkiye</p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Bize Mesaj Gönderin</h2>

          {success && (
            <p className="text-green-600 mb-4">Mesajınız başarıyla gönderildi!</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Adınız"
              className="w-full p-2 border rounded"
              required
              value={form.ad}
              onChange={(e) => setForm({ ...form, ad: e.target.value })}
            />
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="w-full p-2 border rounded"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <textarea
              placeholder="Mesajınız"
              rows={5}
              className="w-full p-2 border rounded"
              required
              value={form.mesaj}
              onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Gönder
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
