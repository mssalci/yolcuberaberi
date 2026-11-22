
// pages/en/chat/[chatId].js

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chat", chatId, "messages"),
      orderBy("zaman", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!user || !message.trim()) return;

    try {
      await addDoc(collection(db, "chat", chatId, "messages"), {
        mesaj: message.trim(),
        gonderenId: user.uid,
        zaman: serverTimestamp(),
      });

      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err.message);
    }
  };

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
                m.gonderenId === auth.currentUser?.uid
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
