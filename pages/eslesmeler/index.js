import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Eslesmeler() {
  const [user, setUser] = useState(null);
  const [aktifSekme, setAktifSekme] = useState("tekliflerim");
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setYukleniyor(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchEslesmeler = async (aktifKullanici) => {
    setYukleniyor(true);
    try {
      const field =
        aktifSekme === "tekliflerim" ? "teklifVerenId" : "talepSahibiId";
      const q = query(
        collection(db, "eslesmeler"),
        where(field, "==", aktifKullanici.uid)
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

  useEffect(() => {
    if (user) {
      fetchEslesmeler(user);
    }
  }, [aktifSekme, user]);

  useEffect(() => {
    if (!user && !yukleniyor) {
      router.push("/giris");
    }
  }, [user, yukleniyor, router]);

  const mesajGonder = async (eslesme) => {
    const mesaj = prompt("Göndermek istediğiniz mesajı yazınız:");
    if (!mesaj || !user) return;

    const aliciId =
      user.uid === eslesme.teklifVerenId
        ? eslesme.talepSahibiId
        : eslesme.teklifVerenId;

    try {
      await addDoc(collection(db, "chat"), {
        mesaj,
        gonderenId: user.uid,
        aliciId,
        eslesmeId: eslesme.id,
        tarih: serverTimestamp(),
      });
      alert("Mesaj gönderildi.");
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
      alert("Mesaj gönderilirken hata oluştu.");
    }
  };

  const detaylaraGit = (talepId) => {
    router.push(`/talepler/${talepId}`);
  };

  const teklifIptalEt = async (eslesmeId, teklifId) => {
    const onay = confirm("Bu teklifi iptal etmek istediğinize emin misiniz?");
    if (!onay) return;

    try {
      await deleteDoc(doc(db, "teklifler", teklifId));
      await deleteDoc(doc(db, "eslesmeler", eslesmeId));
      alert("Teklif başarıyla iptal edildi.");
      fetchEslesmeler(user);
    } catch (error) {
      console.error("Teklif iptali hatası:", error);
      alert("Teklif iptal edilemedi.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Eşleşmeler</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAktifSekme("tekliflerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "tekliflerim"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Tekliflerim
        </button>
        <button
          onClick={() => setAktifSekme("taleplerim")}
          className={`px-4 py-2 rounded ${
            aktifSekme === "taleplerim"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
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
              <h2 className="text-lg font-semibold mb-2">
                {eslesme.talep?.baslik || "Talep başlığı bulunamadı"}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                Talep Tarihi:{" "}
                {eslesme.talep?.tarih
                  ? new Date(eslesme.talep.tarih.seconds * 1000).toLocaleDateString()
                  : "Tarih bilgisi yok"}
              </p>
              <p className="mb-2">{eslesme.talep?.aciklama || "Açıklama yok."}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => detaylaraGit(eslesme.talepId)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Detaylara Git
                </button>
                <button
                  onClick={() => mesajGonder(eslesme)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Mesaj Gönder
                </button>
                {user.uid === eslesme.teklifVerenId && (
                  <button
                    onClick={() => teklifIptalEt(eslesme.id, eslesme.teklifId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Teklifi İptal Et
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
            }
