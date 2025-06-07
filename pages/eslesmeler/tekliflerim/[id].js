import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function TeklifDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [teklif, setTeklif] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [yetkili, setYetkili] = useState(false);
  const [talepBaslik, setTalepBaslik] = useState("");
  const [teklifVerenAd, setTeklifVerenAd] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchTeklif = async () => {
    if (!id) return;
    try {
      const docRef = doc(db, "teklifler", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeklif(data);
        setFiyat(data.fiyat?.toString() || "");
        setNot(data.not || "");
        setTarih(data.tarih || "");

        const user = auth.currentUser;
        if (user && user.uid === data.teklifVerenId) {
          setYetkili(true);
        }

        if (data.talepId) {
          const talepRef = doc(db, "talepler", data.talepId);
          const talepSnap = await getDoc(talepRef);
          if (talepSnap.exists()) {
            setTalepBaslik(talepSnap.data().baslik || "Talep Başlığı");
          }
        }

        const kullaniciRef = doc(db, "kullanicilar", data.teklifVerenId);
        const kullaniciSnap = await getDoc(kullaniciRef);
        if (kullaniciSnap.exists()) {
          setTeklifVerenAd(kullaniciSnap.data().adSoyad || "Bilinmiyor");
        }
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  useEffect(() => {
    fetchTeklif();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (tarih && new Date(tarih) < new Date(todayStr)) {
      alert("Teslim tarihi bugünden önce olamaz.");
      return;
    }

    try {
      await updateDoc(doc(db, "teklifler", id), {
        fiyat: parseFloat(fiyat),
        not: not || "",
        tarih: tarih || "",
      });
      alert("Teklif güncellendi.");
      fetchTeklif();
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncelleme sırasında hata oluştu.");
    }
  };

  if (!teklif) return <p className="p-4">Yükleniyor...</p>;

  const teklifTipi = teklif?.talepId ? "Talep Teklifi" : "Yolculuk Teklifi";

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="bg-gray-50 border p-4 rounded mb-6 space-y-2">
        <p>
          <strong>{teklifTipi}:</strong>{" "}
          {teklif?.talepId ? talepBaslik}
        </p>
        <p><strong>Teklif Sahibi:</strong> {teklifVerenAd || "-"}</p>
        {teklif.tarih && <p><strong>Teslim Tarihi:</strong> {teklif.tarih}</p>}
        {teklif.kalkisUlke && (
          <p><strong>Kalkış Ülkesi:</strong> {teklif.kalkisUlke}</p>
        )}
        {teklif.varisUlke && (
          <p><strong>Varış Ülkesi:</strong> {teklif.varisUlke}</p>
        )}
        {teklif.tahminiTarih && (
          <p><strong>Tahmini Geliş Tarihi:</strong> {teklif.tahminiTarih}</p>
        )}
        {teklif.fiyat !== undefined && (
          <p><strong>Fiyat:</strong> ₺{teklif.fiyat}</p>
        )}
        {teklif.not && (
          <p><strong>Not:</strong> {teklif.not}</p>
        )}
        {typeof teklif.mesajSayisi === "number" && (
          <p><strong>Mesaj Sayısı:</strong> {teklif.mesajSayisi}</p>
        )}
      </div>

      {yetkili ? (
        <form onSubmit={handleUpdate} className="space-y-4 bg-white p-4 border rounded shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Tarih</label>
            <input
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              min={todayStr}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fiyat (₺)</label>
            <input
              type="number"
              value={fiyat}
              onChange={(e) => setFiyat(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Not</label>
            <textarea
              value={not}
              onChange={(e) => setNot(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Teklifi Güncelle
          </button>
        </form>
      ) : (
        <p className="text-red-600 text-sm">
          Bu teklif size ait değil. Sadece görüntüleyebilirsiniz.
        </p>
      )}
    </div>
  );
          }
