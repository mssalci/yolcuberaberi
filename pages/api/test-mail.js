import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Yolcu Beraberi" <${process.env.MAIL_USER}>`,
      to: 'serdarsalci@hotmail.com', // kendine gönder
      subject: 'Test Mail',
      text: 'Bu bir test mailidir. Mail sistemi çalışıyor.',
    });

    res.status(200).json({ success: true, message: 'E-posta gönderildi' });
  } catch (error) {
    console.error('Mail gönderim hatası:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
