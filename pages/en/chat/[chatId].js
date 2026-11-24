
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
import { auth, db } from "../../../firebase/firebaseConfig";

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = router.query;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

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
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "chat", chatId, "messages"),
      orderBy("zaman", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setError("");
      },
      (err) => {
        console.error("Failed to load messages:", err);
        setError("Could not load message history.");
      }
    );

    return () => unsubscribe();
  }, [router.isReady, chatId, user, authLoading]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!user || !chatId || !message.trim() || sending) return;

    try {
      setSending(true);
      setError("");

      await addDoc(
        collection(db, "chat", chatId, "messages"),
        {
          mesaj: message.trim(),
          gonderenId: user.uid,
          zaman: serverTimestamp(),
        }
      );

      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return <div className="max-w-2xl mx-auto py-6 px-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4">
        You must sign in to use chat.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-xl font-semibold mb-4">
        Chat ({messages.length})
      </h1>

      <div className="h-96 overflow-y-auto border rounded p-4 bg-gray-50 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((m) => (
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

      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="flex-grow border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
