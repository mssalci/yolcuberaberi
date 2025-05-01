// pages/chat/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Head from "next/head";

export default function ChatPage() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "chats", id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await addDoc(collection(db, "chats", id, "messages"), {
      text: newMessage,
      sender: user.email,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <>
      <Head>
        <title>Mesajlaşma - Yolcu Beraberi</title>
      </Head>

      <main className="min-h-screen bg-gray-50 flex flex-col p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mesajlaşma</h1>

        <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg shadow border mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 p-2 rounded-md max-w-[80%] ${
                msg.sender === user?.email
                  ? "bg-blue-100 text-right ml-auto"
                  : "bg-gray-200 text-left"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {msg.sender === user?.email ? "Siz" : msg.sender}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 border rounded-full px-4 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
          >
            Gönder
          </button>
        </form>
      </main>
    </>
  );
}
