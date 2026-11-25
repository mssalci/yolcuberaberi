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
  writeBatch,
} from "firebase/firestore";

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [talep, setTalep] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [loading, setLoading] = useState(false);
  const [talepLoading, setTalepLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [talepSahibiAdSoyad, setTalepSahibiAdSoyad] = useState("");

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

  // Talep ve talep sahibi bilgilerini getir.
  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const fetchTalep = async () => {
      setTalepLoading(true);

      try {
        const talepRef = doc(db, "talepler", id);
        const talepSnap = await getDoc(talepRef);

        if (!talepSnap.exists()) {
          if (!cancelled) {
            setTalep(null);
            setTalepLoading(false);
          }
          return;
        }

        const talepData = {
          id: talepSnap.id,
          ...talepSnap.data(),
        };

        if (cancelled) return;

        setTalep(talepData);

        if (talepData.kullaniciId) {
          const kullaniciSnap = await getDoc(
            doc(db, "kullanicilar", talepData.kullaniciId)
          );

          if (!cancelled) {
            setTalepSahibiAdSoyad(
              kullaniciSnap.exists()
                ? kullaniciSnap.data().adSoyad || "Bilinmiyor"
                : "Bilinmiyor"
            );
          }
        }
      } catch (error) {
        console.error("Talep alınamadı:", error);
        if (!cancelled) setTalep(null);
      } finally {
        if (!cancelled) setTalepLoading(false);
      }
    };

    fetchTalep();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, id]);

  // Talebe ait eşleşmeleri ve teklifleri getir.
  useEffect(() => {
    if (!router.isReady || !id) return;

    let cancelled = false;

    const fetchEslesmeler = async () => {
      try {
        const q = query(
          collection(db, "eslesmeler"),
          where("talepId", "==", id)
        );

        const snapshot = await getDocs(q);
        const data = [];

        for (const docSnap of snapshot.docs) {
          const eslesme = docSnap.data();
          let teklifData = null;

          if (eslesme.teklifId) {
            const teklifSnap = await getDoc(
              doc(db, "teklifler", eslesme.teklifId)
            );

            if (teklifSnap.exists()) {
              teklifData = teklifSnap.data();
            }
          }

          data.push({
            id: docSnap.id,
            ...eslesme,
            teklif: teklifData,
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

      // Bu talebe ait mevcut teklif kontrolü.
      const mevcutTeklifVarMi = eslesmeler.some(
        (eslesme) => eslesme.teklifVerenId === refreshedUser.uid
      );

      if (mevcutTeklifVarMi) {
        alert("Bu talebe zaten bir teklif verdiniz.");
        return;
      }

      // Teklif ve eşleşmeyi tek işlemde kaydet.
      const batch = writeBatch(db);

      const teklifRef = doc(collection(db, "teklifler"));
      const eslesmeRef = doc(collection(db, "eslesmeler"));

      batch.set(teklifRef, {
        talepId: talep.id,
        teklifVerenId: refreshedUser.uid,
        fiyat: teklifFiyati,
        not: not.trim(),
        tarih,
        olusturmaZamani: serverTimestamp(),
      });

      batch.set(eslesmeRef, {
        talepId: talep.id,
        teklifId: teklifRef.id,
        teklifVerenId: refreshedUser.uid,
        talepSahibiId: talep.kullaniciId,
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


  // Talebi ve ilişkili kayıtları sil.
  const handleTalepSil = async () => {
    const currentUser = auth.currentUser;

    if (
      !currentUser ||
      !talep ||
      talep.kullaniciId !== currentUser.uid
    ) {
      alert("Bu talebi silme yetkiniz bulunmuyor.");
      return;
    }

    const onay = confirm(
      "Talebi, teklifleri, eşleşmeleri ve mesajları silmek istediğinize emin misiniz?"
    );

    if (!onay) return;

    try {
      setLoading(true);

      const eslesmeQuery = query(
        collection(db, "eslesmeler"),
        where("talepId", "==", talep.id)
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
        where("talepId", "==", talep.id)
      );

      const tekliflerSnap = await getDocs(tekliflerQuery);

      for (const teklifDoc of tekliflerSnap.docs) {
        await deleteDoc(teklifDoc.ref);
      }

      // Son olarak talebi sil.
      await deleteDoc(doc(db, "talepler", talep.id));

      alert("Talep, teklifleri, eşleşmeleri ve mesajları silindi.");
      router.push("/talepler");
    } catch (error) {
      console.error("Talep silme hatası:", error);

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


  const kullaniciTalepSahibiMi =
    !!user && !!talep && talep.kullaniciId === user.uid;

  const dogrulanmisKullaniciMi = emailVerified === true;

  if (!router.isReady || authLoading || talepLoading) {
    return <p className="text-center mt-10">Yükleniyor...</p>;
  }

  if (!talep) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-center">Talep bulunamadı.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">{talep.baslik}</h1>

      <p className="text-gray-700 mb-2">{talep.aciklama}</p>

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
        Talep Sahibi: {talepSahibiAdSoyad || "-"}
      </p>

      {kullaniciTalepSahibiMi && (
        <button
          onClick={handleTalepSil}
          disabled={loading}
          className="mb-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Talebi Sil
        </button>
      )}

      {user && dogrulanmisKullaniciMi && !kullaniciTalepSahibiMi && (
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

      {user && !dogrulanmisKullaniciMi && !kullaniciTalepSahibiMi && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded mb-8">
          Teklif verebilmek için önce e-posta adresinizi doğrulamanız gerekiyor.
        </div>
      )}

      {!user && (
        <div className="bg-gray-100 p-4 rounded mb-8">
          Teklif verebilmek için giriş yapmalısınız.
        </div>
      )}

      {eslesmeler.length > 0 && kullaniciTalepSahibiMi && (
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
