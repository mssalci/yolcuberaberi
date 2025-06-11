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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (kullanici) => {
      if (kullanici) {
        setUser(kullanici);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setMessage("Veriler yükleniyor...");
      setYukleniyor(true);

      const talepSnap = await getDocs(query(collection(db, "talepler"), where("kullaniciId", "==", user.uid)));

      setMessage(`Talep sayısı: ${talepSnap.size}`);

      const talepler = talepSnap.docs.map((doc) => {
        return { id: doc.id, ...doc.data(), tur: "talep", teklifler: [] };
      });

      setVeriler(talepler);
      setYukleniyor(false);
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-6">
      <p>Mesaj: {message}</p>
      <p>Yükleniyor: {yukleniyor ? "Evet" : "Hayır"}</p>
      <p>Kullanıcı: {user ? user.uid : "Yok"}</p>
      <p>Veri sayısı: {veriler.length}</p>

      {yukleniyor && <p>Yükleniyor...</p>}

      {!yukleniyor && veriler.length === 0 && <p>Henüz talep oluşturmadınız.</p>}

      {!yukleniyor && veriler.length > 0 &&
        veriler.map((item) => (
          <div key={item.id} className="border rounded p-4 bg-white shadow">
            <h3 className="font-bold">Talep: {item.baslik}</h3>
            <p className="text-sm text-gray-600">Ülke: {item.ulke} • Bütçe: ₺{item.butce || "-"}</p>
          </div>
        ))
      }
    </div>
  );
      }
