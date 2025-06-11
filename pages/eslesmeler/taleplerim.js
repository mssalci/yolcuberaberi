import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import GirisUyari from "../../components/GirisUyari";

export default function Taleplerim() {
  const [talepler, setTalepler] = useState([]);
  const [yolculuklar, setYolculuklar] = useState([]);
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
    const fetchData = async () => {
      if (!user) return;
      setYukleniyor(true);

      try {
        // Talepler
        const taleplerSnap = await getDocs(
          query(collection(db, "talepler"), where("kullaniciId", "==", user.uid))
        );
        const taleplerArr = taleplerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTalepler(taleplerArr);

        // Yolculuklar
        const yolculuklarSnap = await getDocs(
          query(collection(db, "yolculuklar"), where("kullaniciId", "==", user.uid))
        );
        const yolculuklarArr = yolculuklarSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setYolculuklar(yolculuklarArr);

      } catch (error) {
        console.error("Veriler alınırken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchData();
  }, [user]);

  if (!kontrolEdildi) return null;
  if (!user) return <GirisUyari />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Taleplerim ve Yolculuklarım</h1>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Taleplerim</h2>
            {talepler.length === 0 ? (
              <p>Henüz talebiniz bulunmamaktadır.</p>
            ) : (
              <ul className="space-y-4">
                {talepler.map((talep) => (
                  <li key={talep.id} className="border p-4 rounded bg-white shadow">
                    <h3 className="font-semibold text-lg">{talep.baslik || "-"}</h3>
                    <p><strong>Açıklama:</strong> {talep.aciklama || "-"}</p>
                    <p><strong>Bütçe:</strong> ₺{talep.butce || "-"}</p>
                    <p><strong>Ülke:</strong> {talep.ulke || "-"}</p>
                    <p><strong>Tarih:</strong> {talep.tarih?.toDate ? talep.tarih.toDate().toLocaleString() : talep.tarih || "-"}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
  <h2 className="text-xl font-semibold mb-4">Yolculuklarım</h2>
  {yolculuklar.length === 0 ? (
    <p>Henüz yolculuğunuz bulunmamaktadır.</p>
  ) : (
    <ul className="space-y-4">
      {yolculuklar.map((yolculuk) => (
        <li key={yolculuk.id} className="border p-4 rounded bg-white shadow">
          <h3 className="font-semibold text-lg">
            {`Kalkış: ${yolculuk.kalkis || "-"} - Varış: ${yolculuk.varis || "-"}`}
          </h3>
          <p><strong>Not:</strong> {yolculuk.not || "-"}</p>
          <p><strong>Oluşturna Tarihi:</strong> {
            yolculuk.tarihOlusturma?.toDate
              ? yolculuk.tarihOlusturma.toDate().toLocaleDateString()
              : yolculuk.tarih || "-"
          }</p>
        </li>
      ))}
    </ul>
  )}
</section>
        </>
      )}
    </main>
  );
}
