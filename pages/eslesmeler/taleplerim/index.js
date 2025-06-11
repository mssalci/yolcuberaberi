import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebase/firebaseConfig";

export default function Taleplerim() {
  const [user, setUser] = useState(null);
  const [veriler, setVeriler] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Aktif kullanıcı UID:", currentUser?.uid);
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const getir = async () => {
      const q = query(collection(db, "talepler"), where("kullaniciId", "==", user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Gelen talepler:", data);
      setVeriler(data);
    };

    getir();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Taleplerim</h1>
      {veriler.length === 0 ? (
        <p>Hiç veri bulunamadı.</p>
      ) : (
        <ul>
          {veriler.map(talep => (
            <li key={talep.id} className="mb-4 border p-4 rounded">
              <h2 className="font-bold">{talep.baslik}</h2>
              <p>{talep.aciklama}</p>
              <p>Bütçe: ₺{talep.butce}</p>
              <p>Ülke: {talep.ulke}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
