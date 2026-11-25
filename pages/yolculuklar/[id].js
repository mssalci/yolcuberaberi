import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

export default function YolculukDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [yolculuk, setYolculuk] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [loading, setLoading] = useState(false);
  const [journeyLoading, setJourneyLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [yolculukSahibiAdSoyad, setYolculukSahibiAdSoyad] = useState("");

  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setEmailVerified(currentUser?.emailVerified === true);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Yolculuk ve yolculuk sahibinin bilgilerini getir.
  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const fetchYolculuk = async () => {
      setJourneyLoading(true);

      try {
        const yolculukSnap = await getDoc(
          doc(db, "yolculuklar", id)
        );

        if (!yolculukSnap.exists()) {
          if (!cancelled) setYolculuk(null);
          return;
        }

        const yolculukData = {
          id: yolculukSnap.id,
          ...yolculukSnap.data(),
        };

        if (cancelled) return;

        setYolculuk(yolculukData);

        if (yolculukData.kullaniciId) {
          const kullaniciSnap = await getDoc(
            doc(db, "kullanicilar", yolculukData.kullaniciId)
          );

          if (!cancelled) {
            setYolculukSahibiAdSoyad(
              kullaniciSnap.exists()
                ? kullaniciSnap.data().adSoyad || "Bilinmiyor"
                : "Bilinmiyor"
            );
          }
        }
      } catch (error) {
        console.error("Yolculuk alınamadı:", error);
        if (!cancelled) setYolculuk(null);
      } finally {
        if (!cancelled) setJourneyLoading(false);
      }
    };

    fetchYolculuk();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  // Yolculuğa ait eşleşmeleri, teklifleri ve teklif verenleri getir.
  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const fetchEslesmeler = async () => {
      try {
        const q = query(
          collection(db, "eslesmeler"),
          where("yolculukId", "==", id)
        );

        const snapshot = await getDocs(q);
        const data = [];

        for (const docSnap of snapshot.docs) {
          const eslesme = docSnap.data();

          let teklifData = null;
          let teklifVerenAd = "Bilinmiyor";

          if (eslesme.teklifId) {
            const teklifSnap = await getDoc(
              doc(db, "teklifler", eslesme.teklifId)
            );

            if (teklifSnap.exists()) {
              teklifData = teklifSnap.data();
            }
          }

          if (eslesme.teklifVerenId) {
            const teklifVerenSnap = await getDoc(
              doc(db, "kullanicilar", eslesme.teklifVerenId)
            );

            if (teklifVerenSnap.exists()) {
              teklifVerenAd =
                teklifVerenSnap.data().adSoyad || "Bilinmiyor";
            }
          }

          data.push({
            id: docSnap.id,
            ...eslesme,
            teklif: teklifData,
            teklifVerenAd,
          });
        }

        if (!cancelled) setEslesmeler(data);
      } catch (error) {
        console.error("Eşleşmeler alınamadı:", error);
      }
    };

    fetchEslesmeler();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  // Teklif oluştur.
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

      // Firebase'den güncel e-posta doğrulama bilgisini al.
      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      if (!refreshedUser || !refreshedUser.emailVerified) {
        setUser(refreshedUser || null);
        setEmailVerified(false);

        alert(
          "Teklif verebilmek için önce e-posta adresinizi doğrulamanız gerekiyor."
        );
        return;
      }

      await refreshedUser.getIdToken(true);

      setUser(refreshedUser);
      setEmailVerified(true);

      if (!yolculuk) {
        alert("Yolculuk bilgisi henüz yüklenmedi.");
        return;
      }

      if (yolculuk.kullaniciId === refreshedUser.uid) {
        alert("Kendi yolculuğunuza teklif veremezsiniz.");
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

      // Kullanıcının daha önce herhangi bir teklif verip vermediğini kontrol et.
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

      // Bu yolculuğa ait mevcut teklif kontrolü.
      const mevcutTeklifVarMi = eslesmeler.some(
        (eslesme) => eslesme.teklifVerenId === refreshedUser.uid
      );

      if (mevcutTeklifVarMi) {
        alert("Bu yolculuğa zaten bir teklif verdiniz.");
        return;
      }

      // Teklif ve eşleşmeyi tek işlemde kaydet.
      const batch = writeBatch(db);

      const teklifRef = doc(collection(db, "teklifler"));
      const eslesmeRef = doc(collection(db, "eslesmeler"));

      batch.set(teklifRef, {
        yolculukId: yolculuk.id,
        teklifVerenId: refreshedUser.uid,
        fiyat: teklifFiyati,
        not: not.trim(),
        tarih,
        olusturmaZamani: serverTimestamp(),
      });

      batch.set(eslesmeRef, {
        yolculukId: yolculuk.id,
        teklifId: teklifRef.id,
        teklifVerenId: refreshedUser.uid,
        yolculukSahibiId: yolculuk.kullaniciId,
        olusturmaZamani: serverTimestamp(),
      });

await batch.commit();

// Talep sahibine e-posta bildirimi gönder.
try {
  const idToken = await refreshedUser.getIdToken();

  const response = await fetch("/api/teklif-bildir", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      offerId: teklifRef.id,
    }),
  });

  if (!response.ok) {
    console.error(
      "Teklif e-posta bildirimi gönderilemedi:",
      await response.text()
    );
  }
} catch (notificationError) {
  console.error("E-posta bildirim hatası:", notificationError);
}

alert("Teklif ve eşleşme başarıyla oluşturuldu.");

setFiyat("");
setNot("");
setTarih("");

router.reload();
    } catch (error) {
      console.error("Teklif oluşturma hatası:", error);

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

 
  // Yolculuğu ve ilişkili kayıtları sil.
  const handleYolculukSil = async () => {
    const currentUser = auth.currentUser;

    if (
      !currentUser ||
      !yolculuk ||
      yolculuk.kullaniciId !== currentUser.uid
    ) {
      alert("Bu yolculuğu silme yetkiniz bulunmuyor.");
      return;
    }

    const onay = confirm(
      "Yolculuğu, teklifleri, eşleşmeleri ve mesajları silmek istediğinize emin misiniz?"
    );

    if (!onay) return;

    try {
      setLoading(true);

      const eslesmeQuery = query(
        collection(db, "eslesmeler"),
        where("yolculukId", "==", yolculuk.id)
      );

      const eslesmeSnap = await getDocs(eslesmeQuery);

      // Eşleşmelere bağlı mesajları ve eşleşmeleri sil.
      for (const eslesmeDoc of eslesmeSnap.docs) {
        // Önce eşleşmenin sohbetindeki mesajları sil.
        const mesajQuery = collection(
          db,
          "chat",
          eslesmeDoc.id,
          "messages"
        );

        const mesajSnap = await getDocs(mesajQuery);

        for (const mesajDoc of mesajSnap.docs) {
          await deleteDoc(mesajDoc.ref);
        }

        // Ardından eşleşmeyi sil.
        await deleteDoc(eslesmeDoc.ref);
      }

      // Eşleşmesi olmayan eski teklif kayıtlarını da sil.
      const tekliflerQuery = query(
        collection(db, "teklifler"),
        where("yolculukId", "==", yolculuk.id)
      );

      const tekliflerSnap = await getDocs(tekliflerQuery);

      for (const teklifDoc of tekliflerSnap.docs) {
        await deleteDoc(teklifDoc.ref);
      }

      // Son olarak yolculuğu sil.
      await deleteDoc(doc(db, "yolculuklar", yolculuk.id));

      alert("Yolculuk, teklifleri, eşleşmeleri ve mesajları silindi.");

      router.push("/talepler?sekme=yolculuklar");
    } catch (error) {
      console.error("Yolculuk silme hatası:", error);

      if (error.code === "permission-denied") {
        alert("Silme işlemi için yetkiniz bulunmuyor.");
      } else {
        alert(
          "Silme işlemi sırasında hata oluştu. Bazı kayıtlar silinmiş olabilir."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  const kullaniciYolculukSahibiMi =
    !!user && !!yolculuk && yolculuk.kullaniciId === user.uid;

  const dogrulanmisKullaniciMi = emailVerified === true;

  if (!router.isReady || authLoading || journeyLoading) {
    return <p className="p-4 text-center">Yükleniyor...</p>;
  }

  if (!yolculuk) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-center">Yolculuk bulunamadı.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Yolculuk Detayı</h1>

      <div className="space-y-3 mb-6">
        <p className="text-gray-700">Kalkış: {yolculuk.kalkis}</p>
        <p className="text-gray-700">Varış: {yolculuk.varis}</p>
        <p className="text-gray-600 text-sm">
          Tarih: {yolculuk.tarih || "-"}
        </p>
        <p className="text-gray-700">
          Yolculuk Sahibi: {yolculukSahibiAdSoyad || "-"}
        </p>
        <p className="text-gray-700">Not: {yolculuk.not || "-"}</p>
      </div>

      {kullaniciYolculukSahibiMi && (
        <button
          onClick={handleYolculukSil}
          disabled={loading}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Yolculuğu Sil
        </button>
      )}

      {user && dogrulanmisKullaniciMi && !kullaniciYolculukSahibiMi && (
        <form
          onSubmit={handleTeklifVer}
          className="space-y-4 bg-gray-100 p-4 rounded mb-8"
        >
          <div>
            <label className="block text-sm font-medium">Fiyat (₺)</label>
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
            <label className="block text-sm font-medium">Not</label>
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

      {user && !dogrulanmisKullaniciMi && !kullaniciYolculukSahibiMi && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded mb-8">
          Teklif verebilmek için önce e-posta adresinizi doğrulamanız gerekiyor.
        </div>
      )}

      {!user && (
        <div className="bg-gray-100 p-4 rounded mb-8">
          Teklif verebilmek için giriş yapmalısınız.
        </div>
      )}

      {eslesmeler.length > 0 && kullaniciYolculukSahibiMi && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Teklif Verenler</h2>

          <ul className="space-y-3">
            {eslesmeler.map((eslesme) => (
              <li
                key={eslesme.id}
                className="p-3 bg-white rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    Fiyat: ₺{eslesme.teklif?.fiyat ?? "-"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Teklif Veren: {eslesme.teklifVerenAd}
                  </p>

                  <p className="text-sm text-gray-600">
                    Teslim Tarihi: {eslesme.teklif?.tarih || "-"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Not: {eslesme.teklif?.not || "-"}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/chat/${eslesme.id}`)}
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
