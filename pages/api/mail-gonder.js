// pages/api/mail-gonder.js

import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST isteği destekleniyor" });
  }

  const { ad, email, mesaj } = req.body;

  if (!ad || !email || !mesaj) {
    return res.status(400).json({ message: "Tüm alanlar gereklidir" });
  }

  try {
    // Firestore'a kaydet (isteğe bağlı; zaten iletisim.js'te kaydediliyor)
    // await addDoc(collection(db, "iletisimMesajlari"), {
    //   ad,
    //   email,
    //   mesaj,
    //   createdAt: Timestamp.now(),
    // });

    // Mail gönder
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Yolcu Beraberi" <${process.env.MAIL_USER}>`,
      to: "serdarsalci@hotmail.com",
      subject: "Yeni İletişim Mesajı",
      html: `
        <p><strong>Ad:</strong> ${ad}</p>
        <p><strong>E-posta:</strong> ${email}</p>
        <p><strong>Mesaj:</strong><br>${mesaj}</p>
      `,
    });

    return res.status(200).json({ message: "Mesaj gönderildi" });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ message: "Bir hata oluştu" });
  }
}
