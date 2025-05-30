const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
require("dotenv").config();

admin.initializeApp();
const db = admin.firestore();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmailOnNewOffer = functions.firestore
  .document("teklifler/{teklifId}")
  .onCreate(async (snap, context) => {
    const teklif = snap.data();
    const { talepId, yolculukId } = teklif;

    // Talebe gelen teklif için e-posta
    if (talepId) {
      try {
        const talepDoc = await db.collection("talepler").doc(talepId).get();
        const talepData = talepDoc.data();
        if (talepData?.kullaniciId) {
          const userDoc = await db.collection("kullanicilar").doc(talepData.kullaniciId).get();
          const userData = userDoc.data();
          if (userData?.email) {
            await transporter.sendMail({
              from: `"Yolcu Beraberi" <${process.env.EMAIL_USER}>`,
              to: userData.email,
              subject: "Talebinize yeni bir teklif geldi!",
              text: `Talebinize yeni bir teklif geldi. Detayları görmek için yolcuberaberi.com.tr'yi ziyaret edin.`,
            });
            console.log(`Talep sahibine e-posta gönderildi: ${userData.email}`);
          }
        }
      } catch (error) {
        console.error("Talep e-posta gönderme hatası:", error);
      }
    }

    // Yolculuğa gelen teklif için e-posta
    if (yolculukId) {
      try {
        const yolculukDoc = await db.collection("yolculuklar").doc(yolculukId).get();
        const yolculukData = yolculukDoc.data();
        if (yolculukData?.kullaniciId) {
          const userDoc = await db.collection("kullanicilar").doc(yolculukData.kullaniciId).get();
          const userData = userDoc.data();
          if (userData?.email) {
            await transporter.sendMail({
              from: `"Yolcu Beraberi" <${process.env.EMAIL_USER}>`,
              to: userData.email,
              subject: "Yolculuğunuza yeni bir teklif geldi!",
              text: `Yolculuğunuza yeni bir teklif geldi. Detayları görmek için yolcuberaberi.com.tr'yi ziyaret edin.`,
            });
            console.log(`Yolculuk sahibine e-posta gönderildi: ${userData.email}`);
          }
        }
      } catch (error) {
        console.error("Yolculuk e-posta gönderme hatası:", error);
      }
    }
  });
