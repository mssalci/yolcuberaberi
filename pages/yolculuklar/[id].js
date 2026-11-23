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

  // Yerel tarih: UTC kaynaklı gün kaymasını önler.
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

  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const fetchYolculuk = async () => {
      setJourneyLoading(true);

      try {
        const yolculukRef = doc(db, "yolculuklar", id);
        const yolculukSnap = await getDoc(yolculukRef);

        if (!yolculukSnap.exists()) {
          if (!cancelled) {
            setYolculuk(null);
            setJourneyLoading(false);
          }
          return;
        }

        const yolculukData = {
          id: yolculukSnap.id,
          ...yolculukSnap.data(),
        };

        if (cancelled) return;

        setYolculuk(yolculukData);

        // Yolculuk sahibinin adını ve soyadını getir.
        if (yolculukData.kullaniciId) {
          const kullaniciRef = doc(
            db,
            "kullanicilar",
            yolculukData.kullaniciId
          );

          const kullaniciSnap = await getDoc(kullaniciRef);

          if (!cancelled) {
            setYolculukSahibiAdSoyad(
              kullaniciSnap.exists()
                ? kullaniciSnap.data().adSoyad || "Bilinmiyor"
                : "Bilinmiyor"
            );
          }
        }

        // Yolculuğa ait eşleşmeleri getir.
        const eslesmeQuery = query(
          collection(db, "eslesmeler"),
          where("yolculukId", "==", id)
        );

        const eslesmeSnapshot = await getDocs(eslesmeQuery);
        const eslesmeData = [];

        for (const eslesmeDoc of eslesmeSnapshot.docs) {
          const eslesme = eslesmeDoc.data();

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

          eslesmeData.push({
            id: eslesmeDoc.id,
            ...eslesme,
            teklif: teklifData,
            teklifVerenAd,
          });
        }

        if (!cancelled) {
          setEslesmeler(eslesmeData);
        }
      } catch (err) {
        console.error("Yolculuk veya eşleşmeler alınamadı:", err);

        if (!cancelled) {
          alert("Yolculuk bilgileri alınırken bir hata oluştu.");
        }
      } finally {
        if (!cancelled) {
          setJourneyLoading(false);
        }
      }
    };

    fetchYolculuk();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  const handleTeklifVer = async (e) => {
    e.preventDefault();

    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Teklif verebilmek için giriş yapmalısınız.");
      return;
    }

    if (!yolculuk) {
      alert("Yolculuk bilgisi bulunamadı.");
      return;
    }

    if (yolculuk.kullaniciId === currentUser.uid) {
      alert("Kendi yolculuğunuza teklif veremezsiniz.");
      return;
    }

    try {
      setLoading(true);

      // Firebase kullanıcı bilgisini güncelle.
      await currentUser.reload();

      const refreshedUser = auth.currentUser;

      if (!refreshedUser) {
        alert("Oturum bilgisi alınamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      setUser(refreshedUser);
      setEmailVerified(refreshedUser.emailVerified === true);

      // Token bilgisini de yenile.
      await refreshedUser.getIdToken(true);

      if (!refreshedUser.emailVerified) {
        alert(
          "Teklif verebilmek için e-posta adresinizi doğrulamanız gerekir."
        );
        return;
      }

      // Fiyat kontrolü.
      const teklifFiyati = Number(fiyat);

      if (!Number.isFinite(teklifFiyati) || teklifFiyati <= 0) {
        alert("Lütfen geçerli ve sıfırdan büyük bir fiyat girin.");
        return;
      }

      // Teslim tarihi kontrolü.
      if (!tarih) {
        alert("Lütfen teslim tarihi seçin.");
        return;
      }

      if (tarih < todayStr) {
        alert("Teslim tarihi bugünden önce olamaz.");
        return;
      }

      // Kullanıcının daha önce teklif verip vermediğini kontrol et.
      const teklifQuery = query(
        collection(db, "teklifler"),
        where("teklifVerenId", "==", refreshedUser.uid)
      );

      const teklifSnapshot = await getDocs(teklifQuery);

      if (!teklifSnapshot.empty) {
        alert("Zaten bir teklif verdiniz. Yeni teklif veremezsiniz.");
        return;
      }

      // Bu yolculuk için mevcut eşleşme kontrolü.
      const mevcutTeklifVarMi = eslesmeler.some(
        (eslesme) => eslesme.teklifVerenId === refreshedUser.uid
      );

      if (mevcutTeklifVarMi) {
        alert("Bu yolculuğa zaten bir teklif verdiniz.");
        return;
      }

      // Teklif ve eşleşmeyi tek batch içerisinde oluştur.
      // Böylece işlemlerden biri başarısız olursa diğeri tek başına kaydedilmez.
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

      alert("Teklif ve eşleşme başarıyla oluşturuldu.");

      setFiyat("");
      setNot("");
      setTarih("");

      router.reload();
    } catch (err) {
      console.error("Teklif oluşturulamadı:", err);

      if (err.code === "permission-denied") {
        alert(
          "Bu işlem için yetkiniz bulunmuyor. E-posta doğrulamanızı ve giriş durumunuzu kontrol edin."
        );
      } else {
        alert("Teklif oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleYolculukSil = async () => {
    if (!yolculuk || !user) return;

    if (yolculuk.kullaniciId !== user.uid) {
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

      for (const eslesmeDoc of eslesmeSnap.docs) {
        const eslesme = eslesmeDoc.data();

        // Eşleşmeye bağlı teklifi sil.
        if (eslesme.teklifId) {
          await deleteDoc(doc(db, "teklifler", eslesme.teklifId));
        }

        // Eşleşmeye bağlı mesajları sil.
        const mesajQuery = query(
          collection(db, "mesajlar"),
          where("eslesmeId", "==", eslesmeDoc.id)
        );

        const mesajSnap = await getDocs(mesajQuery);

        for (const mesajDoc of mesajSnap.docs) {
          await deleteDoc(mesajDoc.ref);
        }

        // Eşleşmeyi sil.
        await deleteDoc(eslesmeDoc.ref);
      }

      // Son olarak yolculuğu sil.
      await deleteDoc(doc(db, "yolculuklar", yolculuk.id));

      alert("Yolculuk, teklifleri, eşleşmeleri ve mesajları silindi.");

      router.push("/talepler?sekme=yolculuklar");
    } catch (err) {
      console.error("Yolculuk silme hatası:", err);

      if (err.code === "permission-denied") {
        alert("Silme işlemi için yetkiniz bulunmuyor.");
      } else {
        alert(
          "Silme işlemi sırasında bir hata oluştu. Bazı kayıtlar silinmiş olabilir."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const kullaniciYolculukSahibiMi =
    !!user && !!yolculuk && yolculuk.kullaniciId === user.uid;

  if (authLoading || journeyLoading) {
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

      {user && !kullaniciYolculukSahibiMi && emailVerified && (
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
            <label className="block text-sm font-medium">Teslim Tarihi</label>
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

      {user && !kullaniciYolculukSahibiMi && !emailVerified && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded mb-8">
          <p className="font-medium">E-posta doğrulaması gerekli</p>
          <p className="text-sm mt-1">
            Yolculukları görüntüleyebilirsiniz. Ancak teklif verebilmek için
            önce e-posta adresinizi doğrulamanız gerekir.
          </p>
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
