
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

function getAdminServices() {
  const serviceAccountText = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountText) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT tanımlı değil.");
  }

  const serviceAccount = JSON.parse(serviceAccountText);

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
      });

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Sadece POST isteği destekleniyor." });
  }

  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Yetkilendirme gerekli." });
    }

    const idToken = authorization.substring(7);
    const { auth, db } = getAdminServices();

    const decodedToken = await auth.verifyIdToken(idToken);
    const senderId = decodedToken.uid;

    const { offerId } = req.body || {};

    if (!offerId || typeof offerId !== "string" || offerId.length > 200) {
      return res.status(400).json({ message: "Geçerli bir offerId gerekli." });
    }

    const offerRef = db.collection("teklifler").doc(offerId);
    const offerSnapshot = await offerRef.get();

    if (!offerSnapshot.exists) {
      return res.status(404).json({ message: "Teklif bulunamadı." });
    }

    const offer = offerSnapshot.data();

    if (offer.teklifVerenId !== senderId) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
    }

    let ownerId;
    let itemType;

    if (offer.talepId) {
      const itemSnapshot = await db.collection("talepler").doc(offer.talepId).get();

      if (!itemSnapshot.exists) {
        return res.status(404).json({ message: "Talep bulunamadı." });
      }

      ownerId = itemSnapshot.data().kullaniciId;
      itemType = "talep";
    } else if (offer.yolculukId) {
      const itemSnapshot = await db.collection("yolculuklar").doc(offer.yolculukId).get();

      if (!itemSnapshot.exists) {
        return res.status(404).json({ message: "Yolculuk bulunamadı." });
      }

      ownerId = itemSnapshot.data().kullaniciId;
      itemType = "yolculuk";
    } else {
      return res.status(400).json({ message: "Teklifin bağlı olduğu kayıt bulunamadı." });
    }

    if (!ownerId || ownerId === senderId) {
      return res.status(200).json({ sent: false, message: "Bildirim gönderilmedi." });
    }

    const owner = await auth.getUser(ownerId);

    if (!owner.email || !owner.emailVerified || owner.disabled) {
      return res.status(200).json({
        sent: false,
        message: "Alıcının doğrulanmış e-posta adresi bulunamadı.",
      });
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error("E-posta ortam değişkenleri eksik.");
    }

    const notificationRef = db
      .collection("offerEmailNotifications")
      .doc(offerId);

    const shouldSend = await db.runTransaction(async (transaction) => {
      const notificationSnapshot = await transaction.get(notificationRef);

      if (notificationSnapshot.exists) {
        const notification = notificationSnapshot.data();

        if (notification.status === "sent") {
          return false;
        }

        if (
          notification.status === "processing" &&
          notification.lockedAtMs &&
          Date.now() - notification.lockedAtMs < 5 * 60 * 1000
        ) {
          return false;
        }
      }

      transaction.set(
        notificationRef,
        {
          status: "processing",
          lockedAtMs: Date.now(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return true;
    });

    if (!shouldSend) {
      return res.status(200).json({
        sent: false,
        message: "Bildirim daha önce gönderilmiş veya işlemde.",
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const subject = "Yolcu Beraberi | Yeni Teklif / New Offer";

      const recordName =
        itemType === "talep" ? "talebinize / your request" : "yolculuğunuza / your journey";

      await transporter.sendMail({
        from: `"Yolcu Beraberi" <${process.env.MAIL_USER}>`,
        to: owner.email,
        subject,
        text: `
Merhaba,

Yolcu Beraberi'nde yeni bir teklifiniz var.

Teklifinizi görüntülemek için hesabınıza giriş yapabilirsiniz.

Hello,

You have a new offer on Yolcu Beraberi.

Please log in to your account to view the offer.

Yolcu Beraberi
        `,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333;line-height:1.6">
            <h2>Yolcu Beraberi</h2>

            <h3>Yeni Teklif Aldınız!</h3>
            <p>Merhaba,</p>
            <p>Yolcu Beraberi'nde yeni bir teklifiniz var.</p>
            <p>Teklifinizi görüntülemek için hesabınıza giriş yapabilirsiniz.</p>

            <hr style="border:none;border-top:1px solid #ddd;margin:24px 0">

            <h3>You Have a New Offer!</h3>
            <p>Hello,</p>
            <p>You have a new offer on Yolcu Beraberi.</p>
            <p>Please log in to your account to view the offer.</p>

            <hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
            <p style="color:#777;font-size:12px">Yolcu Beraberi</p>
          </div>
        `,
      });

      await notificationRef.set(
        {
          status: "sent",
          sentAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return res.status(200).json({ sent: true });
    } catch (mailError) {
      await notificationRef.set(
        {
          status: "failed",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      throw mailError;
    }
  } catch (error) {
    console.error("Teklif e-posta bildirimi hatası:", error.message);

    return res.status(500).json({
      message: "E-posta bildirimi gönderilemedi.",
    });
  }
}
