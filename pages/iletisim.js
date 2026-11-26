
import Head from "next/head";
import { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function Iletisim() {
  const [form, setForm] = useState({ ad: "", email: "", mesaj: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess(false);
    setError("");
    setSending(true);

    let kaydedildi = false;

    try {
      // Mesajı Firebase'e kaydet
      await addDoc(collection(db, "iletisimMesajlari"), {
        ...form,
        tarih: Timestamp.now(),
      });

      kaydedildi = true;

      // E-posta gönder
      const response = await fetch("/api/mail-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "E-posta gönderilemedi.");
      }

      setForm({ ad: "", email: "", mesaj: "" });
      setSuccess(true);

    } catch (err) {
      console.error("İletişim formu hatası:", err);

      setError(
        kaydedildi
          ? "Mesajınız kaydedildi ancak e-posta gönderilemedi. Lütfen daha sonra tekrar deneyin."
          : "Mesajınız kaydedilemedi. Lütfen tekrar deneyin."
      );
    } finally {
      setSending(false);
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
          Yolcu Beraberi - ALONGO hakkında sorularınız, önerileriniz ya da iş birliği
          talepleriniz için bize aşağıdaki kanallar üzerinden ulaşabilirsiniz.
        </p>

        <div className="space-y-4">
          <p><strong>Adres:</strong> İstanbul, Türkiye</p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Bize Mesaj Gönderin</h2>

          {success && (
            <p className="text-green-600 mb-4">
              Mesajınız başarıyla gönderildi!
            </p>
          )}

          {error && (
            <p className="text-red-600 mb-4">
              {error}
            </p>
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
            />

            <button
              type="submit"
              disabled={sending}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Gönderiliyor..." : "Gönder"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
