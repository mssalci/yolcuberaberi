
import nodemailer from "nodemailer";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin bağlantısı
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminApp = getAdminApp();
const adminAuth = getAuth(adminApp);
const db = getFirestore(adminApp);

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// HTML içeriğinde güvenli metin kullanımı
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Sadece POST isteği destekleniyor.",
    });
  }

  try {
    // Firebase oturumunu doğrula
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Oturum doğrulanamadı.",
      });
    }

    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const kullaniciId = decodedToken.uid;
    const { offerId } = req.body || {};

    if (!offerId || typeof offerId !== "string") {
      return res.status(400).json({
        message: "Teklif ID bilgisi eksik.",
      });
    }

    // Teklifi bul
    const teklifRef = db.collection("teklifler").doc(offerId);
    const teklifDoc = await teklifRef.get();

    if (!teklifDoc.exists) {
      return res.status(404).json({
        message: "Teklif bulunamadı.",
      });
    }

    const teklif = teklifDoc.data();

    // Yalnızca teklifi oluşturan kullanıcı bildirim isteyebilir
    if (teklif.teklifVerenId !== kullaniciId) {
      return res.status(403).json({
        message: "Bu işlem için yetkiniz yok.",
      });
    }

    // Talep veya yolculuk sahibini belirle
    let hedefKoleksiyon;
    let hedefId;
    let hedefTuru;

    if (teklif.talepId) {
      hedefKoleksiyon = "talepler";
      hedefId = teklif.talepId;
      hedefTuru = "talep";
    } else if (teklif.yolculukId) {
      hedefKoleksiyon = "yolculuklar";
      hedefId = teklif.yolculukId;
      hedefTuru = "yolculuk";
    } else {
      return res.status(400).json({
        message: "Teklifin talep veya yolculuk bağlantısı bulunamadı.",
      });
    }

    const hedefDoc = await db
      .collection(hedefKoleksiyon)
      .doc(hedefId)
      .get();

    if (!hedefDoc.exists) {
      return res.status(404).json({
        message: "Talep veya yolculuk bulunamadı.",
      });
    }

    const hedefData = hedefDoc.data();
    const sahipId = hedefData.kullaniciId;

    if (!sahipId || sahipId === kullaniciId) {
      return res.status(400).json({
        message: "Bildirim alıcısı geçersiz.",
      });
    }

    // Alıcının Firebase Authentication bilgileri
    const alici = await adminAuth.getUser(sahipId);

    if (!alici.email || !alici.emailVerified) {
      return res.status(200).json({
        message: "Alıcının doğrulanmış e-posta adresi bulunamadı.",
        sent: false,
      });
    }

    // Aynı teklif için mükerrer e-posta gönderimini engelle
    const bildirimRef = db
      .collection("offerEmailNotifications")
      .doc(offerId);

    const bildirimAlindi = await db.runTransaction(async (transaction) => {
      const bildirimDoc = await transaction.get(bildirimRef);

      if (
        bildirimDoc.exists &&
        ["processing", "sent"].includes(bildirimDoc.data().status)
      ) {
        return false;
      }

      transaction.set(
        bildirimRef,
        {
          status: "processing",
          recipientId: sahipId,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      return true;
    });

    if (!bildirimAlindi) {
      return res.status(200).json({
        message: "Bu teklif için bildirim zaten gönderilmiş veya işleniyor.",
        sent: false,
      });
    }

    const tur = hedefTuru === "talep" ? "talebinize" : "yolculuğunuza";
    const turEn = hedefTuru === "talep" ? "your request" : "your journey";

    const konu = "Yeni teklif aldınız! | You received a new offer!";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#333;line-height:1.6;">

        <h2>Merhaba!</h2>

        <p>
          <strong>${escapeHtml(tur)}</strong> yeni bir teklif geldi.
          Detayları görmek için Yolcu Beraberi hesabınızı ziyaret edebilirsiniz.
        </p>

        <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;">

        <h2>Hello!</h2>

        <p>
          You have received a new offer for
          <strong>${escapeHtml(turEn)}</strong>.
          Please visit your Yolcu Beraberi account to see the details.
        </p>

        <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;">

        <p style="font-size:13px;color:#777;">
          Bu otomatik bir bilgilendirme mesajıdır. / This is an automated notification.
        </p>

        <p><strong>Yolcu Beraberi</strong></p>
      </div>
    `;

    const text = `
YOLCU BERABERİ

Merhaba!

${tur} yeni bir teklif geldi.
Detayları görmek için hesabınızı ziyaret edebilirsiniz.

---

Hello!

You have received a new offer for ${turEn}.
Please visit your account to see the details.

Yolcu Beraberi
    `;

    try {
      await transporter.sendMail({
        from: `"Yolcu Beraberi" <${process.env.MAIL_USER}>`,
        to: alici.email,
        subject: konu,
        text,
        html,
      });

      await bildirimRef.update({
        status: "sent",
        sentAt: new Date(),
      });

      return res.status(200).json({
        message: "Bildirim e-postası gönderildi.",
        sent: true,
      });
    } catch (mailError) {
      await bildirimRef.update({
        status: "failed",
        error: String(mailError.message || mailError),
        updatedAt: new Date(),
      });

      throw mailError;
    }
  } catch (error) {
    console.error("Teklif bildirim hatası:", error);

    return res.status(500).json({
      message: "Bildirim e-postası gönderilemedi.",
    });
  }
}
