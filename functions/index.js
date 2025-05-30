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
    const { talepId } = teklif;

    if (!talepId) return;

    const talepDoc = await db.collection("talepler").doc(talepId).get();
    const talepData = talepDoc.data();
    if (!talepData) return;

    const talepSahibiId = talepData.kullaniciId;
    const userDoc = await db.collection("users").doc(talepSahibiId).get();
    const userData = userDoc.data();
    if (!userData?.email) return;

    const mailOptions = {
      from: `"Yolcu Beraberi" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: "Yeni teklif geldi!",
      text: `Talebinize yeni bir teklif geldi. Detayları görmek için uygulamayı ziyaret edin.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Mail gönderildi: ${userData.email}`);
  });
