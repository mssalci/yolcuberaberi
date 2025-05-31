// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

admin.initializeApp();
const db = admin.firestore();

// Mail transporter ayarı
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Teklif oluştuğunda hem talep hem yolculuk sahibine mail at
exports.sendEmailOnNewOffer = functions.firestore
  .document("teklifler/{teklifId}")
  .onCreate(async (snap, context) => {
    const teklif = snap.data();
    const { talepId, yolculukId } = teklif;

    let hedefKoleksiyon = "";
    let hedefId = "";
    if (talepId) {
      hedefKoleksiyon = "talepler";
      hedefId = talepId;
    } else if (yolculukId) {
      hedefKoleksiyon = "yolculuklar";
      hedefId = yolculukId;
    } else {
      console.log("Ne talep ne de yolculuk ID mevcut.");
      return;
    }

    const hedefDoc = await db.collection(hedefKoleksiyon).doc(hedefId).get();
    if (!hedefDoc.exists) {
      console.log("Hedef belge bulunamadı.");
      return;
    }

    const hedefData = hedefDoc.data();
    const kullaniciId = hedefData.kullaniciId;

    const userDoc = await db.collection("kullanicilar").doc(kullaniciId).get();
    if (!userDoc.exists) {
      console.log("Kullanıcı bulunamadı.");
      return;
    }

    const userData = userDoc.data();
    const userEmail = userData.email;
    if (!userEmail) {
      console.log("Kullanıcının e-posta adresi yok.");
      return;
    }

    const mailOptions = {
      from: `"Yolcu Beraberi" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Yeni teklif geldi!",
      text: `Talebinize veya yolculuğunuza yeni bir teklif geldi. Detayları görmek için uygulamayı ziyaret edin.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Mail gönderildi: ${userEmail}`);
    } catch (error) {
      console.error("Mail gönderilemedi:", error);
    }
  });
