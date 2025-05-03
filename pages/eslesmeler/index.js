import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function Eslesmeler() {
  const [eslesmeler, setEslesmeler] = useState([]);

  useEffect(() => {
    const fetchEslesmeler = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "eslesmeler"),
        where("kullaniciId", "==", user.uid)
      );
      const q2 = query(
        collection(db, "eslesmeler"),
        where("talepSahibiId", "==", user.uid)
      );

      const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)]);
      const tum = [...snap1.docs, ...snap2.docs].map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEslesmeler(tum);
    };

    fetchEslesmeler();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Eşleşmelerim</h1>
      {eslesmeler.length === 0 ? (
        <p>Henüz eşleşme yok.</p>
      ) : (
        <ul className="space-y-3">
          {eslesmeler.map((eslesme) => (
            <li key={eslesme.id} className="border p-3 rounded">
              <p><strong>Talep:</strong> {eslesme.talepId}</p>
              <p><strong>Teklif:</strong> {eslesme.teklifId}</p>
              <Link href={`/eslesmeler/${eslesme.id}`} className="text-blue-600 underline">
                Detaya Git
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
        }
