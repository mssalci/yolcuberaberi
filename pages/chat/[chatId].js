import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export default function ChatSayfasi() {
  const router = useRouter();
  const { chatId } = router.query;

  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState("");

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chat"),
      where("chatId", "==", chatId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const guncelMesajlar = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMesajlar(guncelMesajlar.sort((a, b) => a.olusturmaZamani?.seconds - b.olusturmaZamani?.seconds));
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleGonder = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !yeniMesaj.trim()) return;

    try {
      await addDoc(collection(db, "chat"), {
        chatId,
        gonderenId: user.uid,
        mesaj: yeniMesaj.trim(),
        olusturmaZamani: serverTimestamp(),
      });
      setYeniMesaj("");
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Mesajlaşma</h1>

      <div className="border rounded h-96 overflow-y-auto p-4 mb-4 bg-gray-50">
        {mesajlar.length === 0 && <p className="text-sm text-gray-500">Henüz mesaj yok.</p>}
        {mesajlar.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded text-sm ${
              msg.gonderenId === auth.currentUser?.uid
                ? "bg-blue-100 text-right"
                : "bg-gray-200 text-left"
            }`}
          >
            {msg.mesaj}
          </div>
        ))}
      </div>

      <form onSubmit={handleGonder} className="flex gap-2">
        <input
          type="text"
          value={yeniMesaj}
          onChange={(e) => setYeniMesaj(e.target.value)}
          className="flex-grow border rounded px-3 py-2"
          placeholder="Mesaj yaz..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}
