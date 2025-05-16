// pages/eslesmeler/taleplerim/[id].js
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { auth, db } from "../../../firebase/firebaseConfig";

export default function KayitDetay() {
  const router = useRouter();
  const { id, tur } = router.query;

  const [kayit, setKayit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teklifler, setTeklifler] = useState([]);
  const [teklifData, setTeklifData] = useState({
    fiyat: "",
    not: "",
    tarih: "",
  });

  const handleTeklifChange = (e) => {
    setTeklifData({ ...teklifData, [e.target.name]: e.target.value });
  };

  const fetchTeklifler = async () => {
    const alan = tur === "yolculuk" ? "yolculukId" : "talepId";
    const q = query(collection(db, "teklifler"), where(alan, "==", id));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTeklifler(list);
  };

  const handleTeklifSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Lütfen giriş yapın.");
    if (kayit.kullaniciId === user.uid)
      return alert("Kendi oluşturduğunuz kayda teklif veremezsiniz.");

    try {
      const teklif = {
        ...teklifData,
        kullaniciId: user.uid,
        olusturmaZamani: serverTimestamp(),
        kabulEdildi: false,
      };
      teklif[tur === "yolculuk" ? "yolculukId" : "talepId"] = id;

      await addDoc(collection(db, "teklifler"), teklif);
      alert("Teklif başarıyla gönderildi!");
      setTeklifData({ fiyat: "", not: "", tarih: "" });
      fetchTeklifler();
    } catch (err) {
      alert("Teklif gönderilemedi: " + err.message);
    }
  };

  const handleTeklifKabul = async (teklif) => {
    try {
      await updateDoc(doc(db, "teklifler", teklif.id), {
        kabulEdildi: true,
        kabulZamani: serverTimestamp(),
      });

      await addDoc(collection(db, "eslesmeler"), {
        [tur === "yolculuk" ? "yolculukId" : "talepId"]: id,
        teklifId: teklif.id,
        teklifVerenId: teklif.kullaniciId,
        teklifSahibiId: kayit.kullaniciId,
        tur,
        olusturmaZamani: serverTimestamp(),
      });

      alert("Teklif kabul edildi ve eşleşme oluşturuldu.");
      fetchTeklifler();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  useEffect(() => {
    const fetchKayit = async () => {
      if (!id || !tur) return;

      const ref = doc(db, tur === "yolculuk" ? "yolculuklar" : "talepler", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setKayit({ id: snap.id, ...snap.data() });
        await fetchTeklifler();
      } else {
        alert("Kayıt bulunamadı.");
      }
      setLoading(false);
    };

    fetchKayit();
  }, [id, tur]);

  if (loading) return <p className="text-center mt-10">Yükleniyor...</p>;
  if (!kayit) return <p className="text-center mt-10 text-red-600">Kayıt bulunamadı.</p>;

  return (
    <>
      <Head>
        <title>{kayit.baslik || "Yolculuk"} | Yolcu Beraberi</title>
      </Head>

      <main className="bg-white text-gray-800 min-h-screen px-4 py-20 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {kayit.baslik || "Yolculuk Detayı"}
        </h1>
        {tur === "yolculuk" ? (
          <>
            <p className="mb-2 text-gray-700">Kalkış: {kayit.kalkis}</p>
            <p className="mb-2 text-gray-700">Varış: {kayit.varis}</p>
            <p className="mb-2 text-gray-700">Tarih: {kayit.tarih}</p>
            <p className="mb-2 text-gray-700">Not: {kayit.not || "-"}</p>
          </>
        ) : (
          <>
            <p className="mb-2 text-gray-700">{kayit.aciklama}</p>
            <p className="mb-2 text-sm text-gray-600">Ülke: {kayit.ulke}</p>
            <p className="mb-2 text-sm text-gray-600">
              Tarih:{" "}
              {kayit.tarih?.toDate?.()
                ? format(kayit.tarih.toDate(), "dd.MM.yyyy HH:mm")
                : "Bilinmiyor"}
            </p>
          </>
        )}

        {/* Teklif Verme Formu */}
        <form onSubmit={handleTeklifSubmit} className="bg-gray-100 p-4 rounded mt-6">
          <h2 className="text-lg font-semibold mb-2">Teklif Ver</h2>
          <input
            type="text"
            name="fiyat"
            value={teklifData.fiyat}
            onChange={handleTeklifChange}
            placeholder="Fiyat"
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="text"
            name="not"
            value={teklifData.not}
            onChange={handleTeklifChange}
            placeholder="Not"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="date"
            name="tarih"
            value={teklifData.tarih}
            onChange={handleTeklifChange}
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Teklif Gönder
          </button>
        </form>

        {/* Teklifler Listesi */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Gelen Teklifler</h2>
          {teklifler.length === 0 && <p>Henüz teklif yok.</p>}
          {teklifler.map((teklif) => (
            <div
              key={teklif.id}
              className="border p-4 mb-4 rounded bg-gray-50"
            >
              <p>
                <strong>Fiyat:</strong> {teklif.fiyat}
              </p>
              <p>
                <strong>Not:</strong> {teklif.not}
              </p>
              <p>
                <strong>Teslim Tarihi:</strong> {teklif.tarih}
              </p>

              {!teklif.kabulEdildi ? (
                <button
                  onClick={() => handleTeklifKabul(teklif)}
                  className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
                >
                  Kabul Et
                </button>
              ) : (
                <p className="text-green-700 mt-2 font-semibold">
                  Bu teklif kabul edildi.
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
        }
