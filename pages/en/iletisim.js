
import Head from "next/head";
import { useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function Contact() {
  const [form, setForm] = useState({
    ad: "",
    email: "",
    mesaj: ""
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Save message to Firebase
      await addDoc(collection(db, "iletisimMesajlari"), {
        ...form,
        tarih: Timestamp.now()
      });

      // Send email
      await fetch("/api/mail-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      setForm({ ad: "", email: "", mesaj: "" });
      setSuccess(true);
    } catch (err) {
      console.error("An error occurred:", err);
    }
  };

  return (
    <>
      <Head>
        <title>Contact | Yolcu Beraberi</title>
        <meta
          name="description"
          content="Contact Yolcu Beraberi - ALONGO for questions, suggestions and collaboration opportunities."
        />
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-16 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

        <p className="mb-4">
          For questions, suggestions or collaboration inquiries
          regarding Yolcu Beraberi - ALONGO, you can reach us
          through the form below.
        </p>

        <div className="space-y-4">
          <p>
            <strong>Address:</strong> Istanbul, Türkiye
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">
            Send Us a Message
          </h2>

          {success && (
            <p className="text-green-600 mb-4">
              Your message has been sent successfully!
            </p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-2 border rounded"
              required
              value={form.ad}
              onChange={(e) =>
                setForm({ ...form, ad: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Your Email Address"
              className="w-full p-2 border rounded"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <textarea
              placeholder="Your Message"
              rows={5}
              className="w-full p-2 border rounded"
              required
              value={form.mesaj}
              onChange={(e) =>
                setForm({ ...form, mesaj: e.target.value })
              }
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
