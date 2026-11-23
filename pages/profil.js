import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase/firebaseConfig";

import {
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  sendEmailVerification
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  deleteField
} from "firebase/firestore";

export default function Profil() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [adSoyad, setAdSoyad] = useState("");
  const [telefon, setTelefon] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [emailVerified, setEmailVerified] = useState(true);

  // E-posta doğrulama kontrolleri
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  // Oturum ve profil bilgilerini yükle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/giris");
        return;
      }

      try {
        await currentUser.reload();

        const refreshedUser = auth.currentUser;

        setUser(refreshedUser);
        setEmailVerified(refreshedUser.emailVerified);

        const ref = doc(db, "kullanicilar", refreshedUser.uid);
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setAdSoyad(
            data.adSoyad || refreshedUser.displayName || ""
          );

          setTelefon(data.telefon || "");
        } else {
          setAdSoyad(refreshedUser.displayName || "");
        }

      } catch (error) {
        console.error("Profil bilgileri alınamadı:", error);
        alert("Profil bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Doğrulama bekleme süresi
  useEffect(() => {
    if (verificationCooldown <= 0) return;

    const timer = setTimeout(() => {
      setVerificationCooldown((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [verificationCooldown]);

  // E-posta doğrulama durumunu yenile
  const handleCheckVerification = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      setUser(refreshedUser);
      setEmailVerified(refreshedUser.emailVerified);

      if (refreshedUser.emailVerified) {
        alert("E-posta adresiniz başarıyla doğrulanmış.");
      } else {
        alert("E-posta adresiniz henüz doğrulanmamış.");
      }

    } catch (error) {
      console.error("Doğrulama kontrol hatası:", error);
      alert("Doğrulama durumu kontrol edilemedi.");
    }
  };

  // Doğrulama e-postası gönder
  const handleSendVerification = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || verificationSending || verificationCooldown > 0) {
      return;
    }

    try {
      setVerificationSending(true);

      // Güncel doğrulama durumunu kontrol et
      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      setUser(refreshedUser);
      setEmailVerified(refreshedUser.emailVerified);

      if (refreshedUser.emailVerified) {
        alert("E-posta adresiniz zaten doğrulanmış.");
        return;
      }

      // Doğrulama e-postası gönder
      await sendEmailVerification(refreshedUser);

      setVerificationCooldown(60);

      alert(
        "Doğrulama e-postası gönderildi. Lütfen gelen kutunuzu kontrol edin."
      );

      console.log("VERIFY MAIL: SUCCESS");

    } catch (error) {
      console.error(
        "VERIFY MAIL ERROR:",
        error.code,
        error.message
      );

      switch (error.code) {
        case "auth/too-many-requests":
          alert(
            "Firebase geçici olarak çok fazla istek algıladı. " +
            "Lütfen bir süre bekleyin ve daha sonra tekrar deneyin."
          );
          break;

        case "auth/network-request-failed":
          alert(
            "İnternet bağlantısı nedeniyle e-posta gönderilemedi."
          );
          break;

        case "auth/user-disabled":
          alert(
            "Bu kullanıcı hesabı devre dışı bırakılmış."
          );
          break;

        case "auth/invalid-user-token":
        case "auth/user-token-expired":
          alert(
            "Oturumunuzun süresi dolmuş. Lütfen yeniden giriş yapın."
          );
          router.push("/giris");
          break;

        default:
          alert(
            "E-posta gönderilemedi. Hata: " +
            (error.code || error.message)
          );
      }

    } finally {
      setVerificationSending(false);
    }
  };

  // Profil bilgilerini kaydet
  const handleSave = async () => {
    if (!user || saving) return;

    const temizAdSoyad = adSoyad.trim();
    const temizTelefon = telefon.trim();

    if (!temizAdSoyad) {
      alert("Lütfen adınızı ve soyadınızı girin.");
      return;
    }

    if (!temizTelefon) {
      alert("Lütfen telefon numaranızı girin.");
      return;
    }

    setSaving(true);

    try {
      const ref = doc(db, "kullanicilar", user.uid);

      await setDoc(
        ref,
        {
          uid: user.uid,
          adSoyad: temizAdSoyad,
          email: user.email,
          telefon: temizTelefon,
          iban: deleteField()
        },
        { merge: true }
      );

      await updateProfile(user, {
        displayName: temizAdSoyad
      });

      await auth.currentUser.reload();

      setUser(auth.currentUser);

      alert("Profil başarıyla güncellendi.");

    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert(
        "Profil güncellenemedi: " + error.message
      );

    } finally {
      setSaving(false);
    }
  };

  // Hesabı sil
  const handleHesapSil = async () => {
    const onay = confirm(
      "Hesabınızı silmek istediğinizden emin misiniz?"
    );

    if (!onay || !user) return;

    try {
      await deleteDoc(doc(db, "kullanicilar", user.uid));

      await deleteUser(user);

      alert("Hesabınız silindi.");

      router.push("/");

    } catch (error) {
      console.error("Hesap silme hatası:", error);

      if (error.code === "auth/requires-recent-login") {
        alert(
          "Güvenlik nedeniyle hesabınızı silmeden önce yeniden giriş yapmalısınız."
        );
      } else {
        alert(
          "Hesap silinemedi: " + error.message
        );
      }
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10">
        Yükleniyor...
      </p>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Profil Bilgilerim
      </h1>

      {/* E-posta doğrulama alanı */}
      {!emailVerified && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-4 rounded mb-6">

          <p className="font-medium mb-2">
            E-posta adresiniz henüz doğrulanmamış.
          </p>

          <p className="text-sm mb-3">
            Hesabınızın güvenliği için e-posta adresinizi doğrulayın.
          </p>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={handleSendVerification}
              disabled={
                verificationSending ||
                verificationCooldown > 0
              }
              className="text-blue-700 underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificationSending
                ? "Gönderiliyor..."
                : verificationCooldown > 0
                ? `Tekrar gönder (${verificationCooldown} sn)`
                : "Doğrulama e-postası gönder"}
            </button>

            <button
              type="button"
              onClick={handleCheckVerification}
              className="text-blue-700 underline font-medium"
            >
              Doğrulama durumunu kontrol et
            </button>

          </div>
        </div>
      )}

      {/* Doğrulanmış e-posta bilgisi */}
      {emailVerified && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-6">
          E-posta adresiniz doğrulanmış.
        </div>
      )}

      {/* Profil formu */}
      <div className="space-y-4">

        <div>
          <label className="block text-sm font-medium">
            Ad Soyad
          </label>

          <input
            type="text"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Adınız ve soyadınız"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            E-posta (değiştirilemez)
          </label>

          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Telefon
          </label>

          <input
            type="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="05XX XXX XX XX"
            autoComplete="tel"
          />
        </div>

        <div className="flex gap-4 pt-4">

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>

          <button
            type="button"
            onClick={handleHesapSil}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Hesabı Sil
          </button>

        </div>
      </div>
    </main>
  );
}
