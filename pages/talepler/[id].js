// pages/talepler/[id].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;
  const [talep, setTalep] = useState(null);
  const [teklifler, setTeklifler] = useState([]);
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);

  const fetchTalep = async () => {
    const docRef = doc(db, "talepler", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setTalep({ id: docSnap.id, ...docSnap.data() });
    }
    setLoading(false);
  };

  const fetchTeklifler = async () => {
    const q = query(collection(db, "teklifler"), where("talepId", "==", id));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeklifler(data);
  };

  const teklifVer = async () => {
    if (!user) {
      alert("Teklif vermek için giriş yapmalısınız.");
      return;
    }

    const yeniTeklif = {
      talepId: id,
      kullaniciId: user.uid,
      teklifZamani: serverTimestamp(),
      durum: "beklemede"
    };

    await addDoc(collection(db, "teklifler"), yeniTeklif);
    alert("Teklifiniz iletildi.");
    fetchTeklifler(); // listeyi güncelle
  };

  useEffect(() => {
    if (id) {
      fetchTalep();
      fetchTeklifler();
    }
  }, [id]);

  if (loading || !talep) return <p>Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">{talep.baslik}</h1>
      <p className="mb-2">{talep.aciklama}</p>
      <p className="text-gray-600 mb-6">Ülke: {talep.ulke}</p>

      {user && (
        <button onClick={teklifVer} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6">
          Bu talebe teklif ver
        </button>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilen Teklifler</h2>
      {teklifler.length === 0 ? (
        <p>Henüz teklif verilmemiş.</p>
      ) : (
        <ul className="space-y-2">
          {teklifler.map(t => (
            <li key={t.id} className="p-3 border rounded bg-gray-100">
              <p>Kullanıcı ID: {t.kullaniciId}</p>
              <p>Durum: {t.durum}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
