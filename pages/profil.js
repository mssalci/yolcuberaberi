import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  auth,
  db
} from "../firebase/firebaseConfig";
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
  deleteDoc
} from "firebase/firestore";

export default function Profil() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [adSoyad, setAdSoyad] = useState("");
  const [iban, setIban] = useState("");
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/giris");
      } else {
        await currentUser.reload(); // doğrulama durumu güncel olsun
        setUser(currentUser);
        setEmailVerified(currentUser.emailVerified);

        const ref = doc(db, "kullanicilar", currentUser.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAdSoyad(data.adSoyad || currentUser.displayName || "");
          setIban(data.iban || "");
        } else {
          setAdSoyad(currentUser.displayName || "");
        }

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSendVerification = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        alert("Doğrulama e-postası gönderildi. Lütfen gelen kutunuzu kontrol edin.");
      } catch (error) {
        console.error("Doğrulama e-postası gönderilemedi:", error);
        alert("E-posta gönderilemedi. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      await setDoc(doc(db, "kullanicilar", user.uid), {
        adSoyad,
        iban,
        email: user.email,
      });

      await updateProfile(user, { displayName: adSoyad });

      await auth.currentUser.reload();
      setUser(auth.currentUser);

      alert("Profil başarıyla güncellendi.");
      router.reload();
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Profil güncellenemedi.");
    }
  };

  const handleHesapSil = async () => {
    const onay = confirm("Hesabınızı silmek istediğinizden emin misiniz?");
    if (!onay || !user) return;

    try {
      await deleteDoc(doc(db, "kullanicilar", user.uid));
      await deleteUser(user);
      alert("Hesabınız silindi.");
      router.push("/");
    } catch (err) {
      console.error("Hesap silme hatası:", err);
      alert("Hesap silinemedi. Lütfen tekrar deneyin.");
    }
  };

  if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profil Bilgilerim</h1>

      {!emailVerified && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
          <p>
            E-posta adresiniz henüz doğrulanmamış.{" "}
            <button
              onClick={handleSendVerification}
              className="text-blue-600 underline font-medium"
            >
              Doğrulama e-postası gönder
            </button>
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ad Soyad</label>
          <input
            type="text"
            value={adSoyad}
            onChange={(e) => setAdSoyad(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">E-posta (değiştirilemez)</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">IBAN</label>
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Kaydet
          </button>

          <button
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
