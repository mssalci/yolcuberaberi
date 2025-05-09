import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function TeklifDetay() {
  const router = useRouter();
  const { id } = router.query;
  const [teklif, setTeklif] = useState(null);
  const [fiyat, setFiyat] = useState("");
  const [not, setNot] = useState("");
  const [tarih, setTarih] = useState("");
  const [yetkili, setYetkili] = useState(false);

  const fetchTeklif = async () => {
    if (!id) return;
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
    }
  };

  useEffect(() => {
    fetchTeklif();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Teklif Detayı</h1>
      {yetkili ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm">Fiyat (₺)</label>
            <input
              type="number"
              value={fiyat}
              onChange={(e) => setFiyat(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm">Tarih</label>
            <input
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Not</label>
            <textarea
              value={not}
              onChange={(e) => setNot(e.target.value)}
              className="w-full p-2 border rounded"
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
        <p className="text-gray-600 mt-4">Bu teklif size ait değil, düzenleyemezsiniz.</p>
      )}
    </div>
  );
}
