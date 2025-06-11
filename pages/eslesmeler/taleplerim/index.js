import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function EslesmeTaleplerim() {
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [message, setMessage] = useState("");
  const [hata, setHata] = useState(null);

  // Kullanıcı durumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (kullanici) => {
      if (kullanici) {
        setUser(kullanici);
      } else {
        setUser(null);
        setVeriler([]);
        setYukleniyor(false);
        setMessage("Giriş yapılmamış.");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    let isMounted = true; // cleanup için

    const fetchData = async () => {
      setMessage("Veriler yükleniyor...");
      setYukleniyor(true);
      setHata(null);

      try {
        const talepQuery = query(
          collection(db, "talepler"),
          where("kullaniciId", "==", user.uid)
        );
        const talepSnap = await getDocs(talepQuery);

        if (!isMounted) return; // component unmount olduysa iptal et

        setMessage(`Talep sayısı: ${talepSnap.size}`);

        // Taleplere boş teklifler dizisi ekleniyor, istersen teklifleri çekme kodu buraya eklenebilir
        const talepler = talepSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tur: "talep",
          teklifler: [],
        }));

        setVeriler(talepler);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        if (!isMounted) return;
        setHata("Veriler yüklenirken hata oluştu.");
        setVeriler([]);
      } finally {
        if (!isMounted) return;
        setYukleniyor(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return <p>Lütfen giriş yapınız.</p>;
  }

  return (
    <div className="space-y-6">
      {hata && <p className="text-red-600">Hata: {hata}</p>}
      <p>Mesaj: {message}</p>
      <p>Yükleniyor: {yukleniyor ? "Evet" : "Hayır"}</p>
      <p>Kullanıcı UID: {user.uid}</p>
      <p>Veri sayısı: {veriler.length}</p>

      {yukleniyor && <p>Veriler yükleniyor...</p>}

      {!yukleniyor && veriler.length === 0 && !hata && (
        <p>Henüz talep oluşturmadınız.</p>
      )}

      {!yukleniyor && veriler.length > 0 &&
        veriler.map((item) => (
          <div key={item.id} className="border rounded p-4 bg-white shadow">
            <h3 className="font-bold">Talep: {item.baslik || "(Başlık yok)"}</h3>
            <p className="text-sm text-gray-600">
              Ülke: {item.ulke || "-"} • Bütçe: ₺{item.butce ?? "-"}
            </p>
          </div>
        ))
      }
    </div>
  );
        }
