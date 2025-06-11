import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function Eslesmeler() {
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [teklifler, setTeklifler] = useState([]);
  const [talepler, setTalepler] = useState([]);
  const [loadingTeklifler, setLoadingTeklifler] = useState(false);
  const [loadingTalepler, setLoadingTalepler] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Tekliflerimi çek
    const fetchTeklifler = async () => {
      setLoadingTeklifler(true);
      const teklifRef = collection(db, "teklifler");
      const q = query(teklifRef, where("kullaniciId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const tekliflerData = [];
      querySnapshot.forEach((doc) => {
        tekliflerData.push({ id: doc.id, ...doc.data() });
      });
      setTeklifler(tekliflerData);
      setLoadingTeklifler(false);
    };

    // Taleplerimi çek
    const fetchTalepler = async () => {
      setLoadingTalepler(true);
      const talepRef = collection(db, "talepler");
      const q = query(talepRef, where("kullaniciId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const taleplerData = [];
      querySnapshot.forEach((doc) => {
        taleplerData.push({ id: doc.id, ...doc.data() });
      });
      setTalepler(taleplerData);
      setLoadingTalepler(false);
    };

    fetchTeklifler();
    fetchTalepler();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Eşleşmeler</h1>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAktifSekme("tekliflerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "tekliflerim"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Tekliflerim
        </button>
        <button
          onClick={() => setAktifSekme("taleplerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "taleplerim"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Taleplerim
        </button>
      </div>

      {aktifSekme === "tekliflerim" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Tekliflerim</h2>
          {loadingTeklifler && <p>Yükleniyor...</p>}
          {!loadingTeklifler && teklifler.length === 0 && (
            <p>Henüz teklifiniz bulunmamaktadır.</p>
          )}
          <ul className="space-y-4">
            {teklifler.map((teklif) => (
              <li
                key={teklif.id}
                className="border p-4 rounded shadow-sm bg-white"
              >
                <p>
                  <strong>Teklif ID:</strong> {teklif.id}
                </p>
                <p>
                  <strong>Talep Başlığı:</strong> {teklif.talepBasligi || "—"}
                </p>
                <p>
                  <strong>Açıklama:</strong> {teklif.aciklama || "—"}
                </p>
                <p>
                  <strong>Durum:</strong> {teklif.durum || "—"}
                </p>
                {/* İstersen detay modal veya başka detaylar buraya eklenebilir */}
              </li>
            ))}
          </ul>
        </div>
      )}

      {aktifSekme === "taleplerim" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Taleplerim</h2>
          {loadingTalepler && <p>Yükleniyor...</p>}
          {!loadingTalepler && talepler.length === 0 && (
            <p>Henüz talebiniz bulunmamaktadır.</p>
          )}
          <ul className="space-y-4">
            {talepler.map((talep) => (
              <li
                key={talep.id}
                className="border p-4 rounded shadow-sm bg-white"
              >
                <p>
                  <strong>Talep ID:</strong> {talep.id}
                </p>
                <p>
                  <strong>Başlık:</strong> {talep.baslik || "—"}
                </p>
                <p>
                  <strong>Açıklama:</strong> {talep.aciklama || "—"}
                </p>
                <p>
                  <strong>Durum:</strong> {talep.durum || "—"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
