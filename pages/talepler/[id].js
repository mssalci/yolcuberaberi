import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [talep, setTalep] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [loading, setLoading] = useState(false);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [talepSahibiadSoyad, setTalepSahibiAdSoyad] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Kullanıcı oturumunu takip et
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Talep ve talep sahibi bilgilerini getir
  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const fetchTalep = async () => {
      try {
        const docRef = doc(db, "talepler", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          if (!cancelled) setTalep(null);
          return;
        }

        const talepData = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        if (!cancelled) setTalep(talepData);

        if (talepData.kullaniciId) {
          const kullaniciRef = doc(
            db,
            "kullanicilar",
            talepData.kullaniciId
          );

          const kullaniciSnap = await getDoc(kullaniciRef);

          if (!cancelled && kullaniciSnap.exists()) {
            setTalepSahibiAdSoyad(
              kullaniciSnap.data().adSoyad || "Bilinmiyor"
            );
          }
        }
      } catch (error) {
        console.error("Talep çekilirken hata:", error);
      }
    };

    fetchTalep();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  // Talebe ait eşleşmeleri getir
  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const fetchEslesmeler = async () => {
      try {
        const q = query(
          collection(db, "eslesmeler"),
          where("talepId", "==", id)
        );

        const querySnapshot = await getDocs(q);
        const data = [];

        for (const docSnap of querySnapshot.docs) {
          const eslesmeData = docSnap.data();

          let teklifData = null;

          if (eslesmeData.teklifId) {
            const teklifDoc = await getDoc(
              doc(db, "teklifler", eslesmeData.teklifId)
            );

            if (teklifDoc.exists()) {
              teklifData = teklifDoc.data();
            }
          }

          data.push({
            id: docSnap.id,
            ...eslesmeData,
            teklif: teklifData,
          });
        }

        if (!cancelled) {
          setEslesmeler(data);
        }
      } catch (error) {
        console.error("Eşleşmeler alınamadı:", error);
      }
    };

    fetchEslesmeler();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  // Teklif oluştur
  const handleTeklifVer = async (e) => {
    e.preventDefault();

    if (loading) return;

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Teklif verebilmek için giriş yapmalısınız.");
      return;
    }

    try {
      setLoading(true);

      // Firebase kullanıcı bilgisini güncelle
      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      if (!refreshedUser || !refreshedUser.emailVerified) {
        setUser(refreshedUser || null);

        alert(
          "Teklif verebilmek için önce e-posta adresinizi doğrulamanız gerekiyor."
        );
        return;
      }

      // Güncel doğrulama bilgisini token'a yansıt
      await refreshedUser.getIdToken(true);

      setUser(refreshedUser);

      if (!talep) {
        alert("Talep bilgisi henüz yüklenmedi.");
        return;
      }

      if (talep.kullaniciId === refreshedUser.uid) {
        alert("Kendi talebinize teklif veremezsiniz.");
        return;
      }

      const teklifFiyati = Number(fiyat);

      if (!Number.isFinite(teklifFiyati) || teklifFiyati <= 0) {
        alert("Lütfen geçerli ve sıfırdan büyük bir teklif fiyatı girin.");
        return;
      }

      if (!tarih) {
        alert("Lütfen teslim tarihi seçin.");
        return;
      }

      if (tarih < todayStr) {
        alert("Teslim tarihi bugünden önce olamaz.");
        return;
      }

      // Kullanıcının daha önce herhangi bir teklifi var mı?
      const teklifQuery = query(
        collection(db, "teklifler"),
        where("teklifVerenId", "==", refreshedUser.uid)
      );

      const teklifSnapshot = await getDocs(teklifQuery);

      if (!teklifSnapshot.empty) {
        alert(
          "Zaten başka bir talep veya yolculuğa teklif verdiniz. Yeni teklif veremezsiniz."
        );
        return;
      }

      // Bu talebe özel mevcut teklif kontrolü
      const mevcutTeklifVarMi = eslesmeler.some(
        (eslesme) =>
          eslesme.teklifVerenId === refreshedUser.uid
      );

      if (mevcutTeklifVarMi) {
        alert("Bu talebe zaten bir teklif verdiniz.");
        return;
      }

      // Teklif oluştur
      const teklifRef = await addDoc(
        collection(db, "teklifler"),
        {
          talepId: talep.id,
          teklifVerenId: refreshedUser.uid,
          fiyat: teklifFiyati,
          not: not.trim(),
          tarih,
          olusturmaZamani: serverTimestamp(),
        }
      );

      try {
        // Eşleşme oluştur
        await addDoc(collection(db, "eslesmeler"), {
          talepId: talep.id,
          teklifId: teklifRef.id,
          teklifVerenId: refreshedUser.uid,
          talepSahibiId: talep.kullaniciId || null,
          olusturmaZamani: serverTimestamp(),
        });
      } catch (eslesmeError) {
        console.error(
          "Eşleşme oluşturulamadı:",
          eslesmeError
        );

        alert(
          "Teklif kaydedildi ancak eşleşme oluşturulamadı. Lütfen tekrar tekrar teklif göndermeyin; destek için iletişime geçin."
        );

        return;
      }

      alert("Teklif ve eşleşme başarıyla oluşturuldu.");

      setFiyat("");
      setNot("");
      setTarih("");

      router.reload();
    } catch (error) {
      console.error("Teklif/Eşleşme hatası:", error);

      if (error.code === "permission-denied") {
        alert(
          "İşlem için yetkiniz bulunmuyor. E-posta doğrulamanızı ve hesabınızı kontrol edin."
        );
      } else {
        alert("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Talebi sil
  const handleTalepSil = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || !talep || talep.kullaniciId !== currentUser.uid) {
      alert("Bu talebi silme yetkiniz bulunmuyor.");
      return;
    }

    const onay = confirm(
      "Talebi silmek istediğinize emin misiniz?"
    );

    if (!onay) return;

    try {
      await deleteDoc(doc(db, "talepler", talep.id));

      alert("Talep silindi.");
      router.push("/talepler");
    } catch (err) {
      console.error("Talep silme hatası:", err);
      alert("Talep silinemedi.");
    }
  };

  const kullaniciTalepSahibiMi =
    user && talep
      ? talep.kullaniciId === user.uid
      : false;

  const dogrulanmisKullaniciMi =
    user?.emailVerified === true;

  if (!router.isReady || authLoading || !talep) {
    return (
      <p className="text-center mt-10">
        Yükleniyor...
      </p>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">
        {talep.baslik}
      </h1>

      <p className="text-gray-700 mb-2">
        {talep.aciklama}
      </p>

      <p className="text-gray-600 text-sm mb-1">
        Ülke/Şehir: {talep.ulke || "-"}
      </p>

      <p className="text-gray-600 text-sm mb-1">
        Tarih: {talep.tarih?.toDate?.().toLocaleDateString() || "-"}
      </p>

      <p className="text-gray-600 text-sm mb-1">
        Bütçe: {talep.butce || "-"}
      </p>

      <p className="text-gray-600 text-sm mb-6">
        Talep Sahibi: {talepSahibiadSoyad || "-"}
      </p>

      {kullaniciTalepSahibiMi && (
        <button
          onClick={handleTalepSil}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Talebi Sil
        </button>
      )}

      {/* E-posta doğrulanmış kullanıcıya teklif formu */}
      {user &&
        dogrulanmisKullaniciMi &&
        !kullaniciTalepSahibiMi && (
          <form
            onSubmit={handleTeklifVer}
            className="space-y-4 bg-gray-100 p-4 rounded mb-8"
          >
            <div>
              <label className="block text-sm font-medium">
                Fiyat (₺)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={fiyat}
                onChange={(e) => setFiyat(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Teslim Tarihi
              </label>

              <input
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
                min={todayStr}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Not
              </label>

              <textarea
                value={not}
                onChange={(e) => setNot(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Gönderiliyor..." : "Teklif Ver"}
            </button>
          </form>
        )}

      {/* E-posta doğrulanmamış kullanıcıya bilgi */}
      {user &&
        !dogrulanmisKullaniciMi &&
        !kullaniciTalepSahibiMi && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded mb-8">
            Teklif verebilmek için önce e-posta adresinizi
            doğrulamanız gerekiyor.
          </div>
        )}

      {/* Talep sahibinin teklifleri */}
      {eslesmeler.length > 0 &&
        kullaniciTalepSahibiMi && (
          <section>
            <h2 className="text-xl font-semibold mb-4">
              Teklif Verenler
            </h2>

            <ul className="space-y-3">
              {eslesmeler.map((eslesme) => (
                <li
                  key={eslesme.id}
                  className="p-3 bg-white rounded shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      Fiyat: ₺{eslesme.teklif?.fiyat}
                    </p>

                    <p className="text-sm text-gray-600">
                      Teslim Tarihi: {eslesme.teklif?.tarih || "-"}
                    </p>

                    <p className="text-sm text-gray-600">
                      Not: {eslesme.teklif?.not || "-"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/chat/${eslesme.id}`)
                    }
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Sohbete Git
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
    </main>
  );
}
