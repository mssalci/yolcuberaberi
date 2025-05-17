// pages/api/mail-gonder.js

import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST isteği destekleniyor" });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Tüm alanlar gereklidir" });
  }

  try {
    // Firestore'a kaydet
    await addDoc(collection(db, "iletisimMesajlari"), {
      name,
      email,
      message,
      createdAt: Timestamp.now(),
    });

    // Mail gönder
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, // .env içine yazacağız
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Yolcu Beraberi" <${process.env.MAIL_USER}>`,
      to: "serdarsalci@hotmail.com",
      subject: "Yeni İletişim Mesajı",
      html: `
        <p><strong>Ad:</strong> ${name}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Mesaj:</strong><br>${message}</p>
      `,
    });

    return res.status(200).json({ message: "Mesaj gönderildi ve kaydedildi" });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ message: "Bir hata oluştu" });
  }
}
