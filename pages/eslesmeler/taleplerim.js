import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import GirisUyari from "../../components/GirisUyari";

export default function Taleplerim() {
  const [user, setUser] = useState(null);
  const [talepler, setTalepler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kontrolEdildi, setKontrolEdildi] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setKontrolEdildi(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTalepler = async () => {
      setYukleniyor(true);
      try {
        const taleplerRef = collection(db, "talepler");
        const snapshot = await getDocs(taleplerRef);

        const taleplerListesi = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTalepler(taleplerListesi);
      } catch (error) {
        console.error("Talepler alınırken hata oluştu:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchTalepler();
  }, [user]);

  if (!kontrolEdildi) return null;

  if (!user) return <GirisUyari />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim</h1>
      <p>Kullanıcı ID: {user?.uid || "Yükleniyor..."}</p>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : talepler.length === 0 ? (
        <p>Hiç talep bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {talepler.map((talep) => (
            <li key={talep.id} className="border p-4 rounded bg-white shadow">
              <h2 className="text-lg font-semibold">{talep.baslik || "Başlık yok"}</h2>
              <p className="text-gray-600">{talep.aciklama || "Açıklama yok"}</p>
              <p className="text-sm mt-1">Kategori: {talep.kategori || "Belirtilmemiş"}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
