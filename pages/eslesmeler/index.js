import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { format } from "date-fns";

export default function Eslesmeler() {
  const user = auth.currentUser;
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aktifMesajEslesmeId, setAktifMesajEslesmeId] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState("");

  useEffect(() => {
    const fetchEslesmeler = async () => {
      if (!user) return;
      setYukleniyor(true);
      try {
        const q = query(
          collection(db, "eslesmeler"),
          where(
            aktifSekme === "tekliflerim" ? "teklifVerenId" : "talepSahibiId",
            "==",
            user.uid
          )
        );
        const snapshot = await getDocs(q);
        const eslesmeVerileri = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const talepDoc = await getDoc(doc(db, "talepler", data.talepId));
            const teklifDoc = await getDoc(doc(db, "teklifler", data.teklifId));
            return {
              id: docSnap.id,
              ...data,
              talep: talepDoc.exists() ? talepDoc.data() : null,
              teklif: teklifDoc.exists() ? teklifDoc.data() : null,
            };
          })
        );
        setEslesmeler(eslesmeVerileri);
      } catch (error) {
        console.error("Eşleşmeler alınırken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchEslesmeler();
  }, [aktifSekme, user]);

  const toggleMesajlasma = (eslesmeId) => {
    if (aktifMesajEslesmeId === eslesmeId) {
      setAktifMesajEslesmeId(null);
      setMesajlar([]);
      return;
    }
    setAktifMesajEslesmeId(eslesmeId);
    const q = query(
      collection(db, "chat"),
      where("eslesmeId", "==", eslesmeId),
      orderBy("olusturmaZamani", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mesajlar = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMesajlar(mesajlar);
    });
  };

  const handleMesajGonder = async (e) => {
    e.preventDefault();
    if (!user || !yeniMesaj.trim() || !aktifMesajEslesmeId) return;
    try {
      await addDoc(collection(db, "chat"), {
        eslesmeId: aktifMesajEslesmeId,
        gonderenId: user.uid,
        mesaj: yeniMesaj.trim(),
        olusturmaZamani: serverTimestamp(),
      });
      setYeniMesaj("");
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err.message);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eşleşmeler</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAktifSekme("tekliflerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "tekliflerim" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Tekliflerim
        </button>
        <button
          onClick={() => setAktifSekme("taleplerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "taleplerim" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Taleplerim
        </button>
      </div>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : eslesmeler.length === 0 ? (
        <p>Hiç eşleşme bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {eslesmeler.map((eslesme) => (
            <li key={eslesme.id} className="border p-4 rounded bg-white shadow">
              <p className="font-semibold">{eslesme.talep?.baslik || "Talep bilgisi yok"}</p>
              <p className="text-sm text-gray-600">
                Fiyat: ₺{eslesme.teklif?.fiyat?.toFixed(2) || "-"}
              </p>
              <p className="text-sm text-gray-600">Not: {eslesme.teklif?.not || "-"}</p>

              <button
                onClick={() => toggleMesajlasma(eslesme.id)}
                className="mt-3 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              >
                {aktifMesajEslesmeId === eslesme.id ? "Mesajlaşmayı Gizle" : "Mesajlaş"}
              </button>

              {aktifMesajEslesmeId === eslesme.id && (
                <div className="mt-4 border-t pt-4 space-y-2">
                  <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded">
                    {mesajlar.length === 0 ? (
                      <p className="text-sm text-gray-400">Henüz mesaj yok.</p>
                    ) : (
                      mesajlar.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2 rounded mb-1 max-w-xs ${
                            msg.gonderenId === user.uid
                              ? "bg-blue-100 text-right ml-auto"
                              : "bg-gray-200 text-left"
                          }`}
                        >
                          <p className="text-sm">{msg.mesaj}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {msg.olusturmaZamani?.seconds
                              ? format(new Date(msg.olusturmaZamani.seconds * 1000), "dd.MM.yyyy HH:mm")
                              : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleMesajGonder} className="flex gap-2">
                    <input
                      type="text"
                      value={yeniMesaj}
                      onChange={(e) => setYeniMesaj(e.target.value)}
                      className="flex-grow border rounded px-3 py-2"
                      placeholder="Mesaj yaz..."
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Gönder
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
                }
