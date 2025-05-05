import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
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
  const [kendiTeklif, setKendiTeklif] = useState(null);

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

    if (user) {
      const mevcut = data.find(t => t.kullaniciId === user.uid);
      setKendiTeklif(mevcut || null);
    }
  };

  const handleTeklifSubmit = async (e) => {
  e.preventDefault();
  const user = auth.currentUser;

  if (!user) return alert("Lütfen giriş yapın.");

  if (!talep || !talep.kullaniciId) {
    console.log("Talep nesnesi veya kullaniciId eksik:", talep);
    return alert("Talep bilgileri yüklenemedi. Lütfen tekrar deneyin.");
  }

  if (talep.kullaniciId === user.uid) {
    return alert("Kendi oluşturduğunuz talebe teklif veremezsiniz.");
  }

  try {
    await addDoc(collection(db, "teklifler"), {
      ...teklifData,
      kullaniciId: user.uid,
      talepId: talep.id,
      olusturmaZamani: serverTimestamp(),
      kabulEdildi: false,
    });
    alert("Teklif başarıyla gönderildi!");
    setTeklifData({ fiyat: "", not: "", tarih: "" });
    fetchTeklifler(talep.id);
  } catch (err) {
    alert("Teklif gönderilemedi: " + err.message);
  }
};

  const teklifIptalEt = async () => {
    if (!kendiTeklif) return;
    const teklifDoc = doc(db, "teklifler", kendiTeklif.id);
    await deleteDoc(teklifDoc);
    alert("Teklifiniz iptal edildi.");
    fetchTeklifler();
  };

  const mesajGonder = () => {
    const mail = talep?.kullaniciEmail;
    if (mail) {
      window.location.href = `mailto:${mail}?subject=Talep Hakkında&body=Merhaba, talebinizle ilgileniyorum.`;
    } else {
      alert("Talep sahibinin e-posta adresi bulunamadı.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchTalep();
      fetchTeklifler();
    }
  }, [id, user]);

  if (loading || !talep) return <p>Yükleniyor...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">{talep.baslik}</h1>
      <p className="mb-2">{talep.aciklama}</p>
      <p className="text-gray-600 mb-6">Ülke: {talep.ulke}</p>

      {user && !kendiTeklif && (
        <button onClick={teklifVer} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4">
          Bu talebe teklif ver
        </button>
      )}

      {user && kendiTeklif && (
        <div className="mb-4 space-y-2">
          <p className="text-green-600 font-medium">Bu talebe zaten teklif verdiniz.</p>
          <button onClick={teklifIptalEt} className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">
            Teklifi iptal et
          </button>
          <button onClick={mesajGonder} className="ml-2 bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-800">
            Talep sahibine mesaj gönder
          </button>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Verilen Teklifler</h2>
      {teklifler.length === 0 ? (
        <p>Henüz teklif verilmemiş.</p>
      ) : (
        <ul className="space-y-2">
          {teklifler.map(t => (
            <li key={t.id} className="p-3 border rounded bg-gray-100">
              <p>Kullanıcı: {t.kullaniciEmail || t.kullaniciId}</p>
              <p>Durum: {t.durum}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
