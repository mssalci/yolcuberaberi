
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = router.query;

  const [mesajlar, setMesajlar] = useState([]);
  const [mesaj, setMesaj] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hata, setHata] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!router.isReady || !chatId || authLoading) return;

    if (!user) {
      setMesajlar([]);
      return;
    }

    const q = query(
      collection(db, "chat", chatId, "messages"),
      orderBy("zaman", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMesajlar(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setHata("");
      },
      (err) => {
        console.error("Mesajlar yüklenemedi:", err);
        setHata("Mesaj geçmişi yüklenemedi.");
      }
    );

    return () => unsubscribe();
  }, [router.isReady, chatId, user, authLoading]);

  const handleGonder = async (e) => {
    e.preventDefault();

    if (!user || !chatId || !mesaj.trim() || gonderiliyor) return;

    try {
      setGonderiliyor(true);
      setHata("");

      await addDoc(
        collection(db, "chat", chatId, "messages"),
        {
          mesaj: mesaj.trim(),
          gonderenId: user.uid,
          zaman: serverTimestamp(),
        }
      );

      setMesaj("");
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
      setHata("Mesaj gönderilemedi.");
    } finally {
      setGonderiliyor(false);
    }
  };

  if (authLoading) {
    return <div className="max-w-2xl mx-auto py-6 px-4">Yükleniyor...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        Mesajlaşmak için giriş yapmalısınız.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-xl font-semibold mb-4">
        Mesajlaşma ({mesajlar.length})
      </h1>

      <div className="h-96 overflow-y-auto border rounded p-4 bg-gray-50 mb-4">
        {mesajlar.length === 0 ? (
          <p className="text-gray-500">Henüz mesaj yok.</p>
        ) : (
          mesajlar.map((m) => (
            <div
              key={m.id}
              className={`mb-3 p-2 rounded ${
                m.gonderenId === user.uid
                  ? "bg-blue-100 text-right ml-auto max-w-xs"
                  : "bg-gray-200 text-left mr-auto max-w-xs"
              }`}
            >
              <p className="text-sm">{m.mesaj}</p>
              <p className="text-xs text-gray-500 mt-1">
                {m.zaman?.toDate?.().toLocaleString?.() || "-"}
              </p>
            </div>
          ))
        )}
      </div>

      {hata && (
        <p className="text-red-600 text-sm mb-3">{hata}</p>
      )}

      <form onSubmit={handleGonder} className="flex gap-2">
        <input
          type="text"
          value={mesaj}
          onChange={(e) => setMesaj(e.target.value)}
          placeholder="Mesaj yaz..."
          className="flex-grow border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={!mesaj.trim() || gonderiliyor}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {gonderiliyor ? "Gönderiliyor..." : "Gönder"}
        </button>
      </form>
    </div>
  );
}
