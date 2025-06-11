import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import GirisUyari from "../../components/GirisUyari";

export default function Taleplerim() {
  const [talepler, setTalepler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [user, setUser] = useState(null);
  const [kontrolEdildi, setKontrolEdildi] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setKontrolEdildi(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTalepler = async () => {
      if (!user) return;
      setYukleniyor(true);

      try {
        const taleplerSnap = await getDocs(
          query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))
        );

        const taleplerArr = taleplerSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTalepler(taleplerArr);
      } catch (error) {
        console.error("Talepler alınırken hata:", error);
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

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : talepler.length === 0 ? (
        <p>Henüz talebiniz bulunmamaktadır.</p>
      ) : (
        <ul className="space-y-4">
          {talepler.map((talep) => (
            <li key={talep.id} className="border p-4 rounded bg-white shadow">
              <h2 className="font-semibold text-lg">{talep.baslik || "Başlıksız Talep"}</h2>
              <p><strong>Açıklama:</strong> {talep.aciklama || "-"}</p>
              <p><strong>Bütçe:</strong> ₺{talep.butce || "-"}</p>
              <p><strong>Kategori:</strong> {talep.kategori || "-"}</p>
              <p><strong>Ülke:</strong> {talep.ulke || "-"}</p>
              <p><strong>Tarih:</strong> {talep.tarih?.toDate ? talep.tarih.toDate().toLocaleString() : talep.tarih || "-"}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
