// pages/chat/[chatId].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ChatRoom() {
  const router = useRouter();
  const { chatId } = router.query;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgList);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage,
        senderUid: currentUser.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mesajlaşma</h1>
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "0.5rem", background: msg.senderUid === currentUser?.uid ? "#dcf8c6" : "#f1f1f1", padding: "0.5rem", borderRadius: "8px" }}>
            <strong>{msg.senderUid === currentUser?.uid ? "Ben" : "Karşı taraf"}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: "1rem" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın"
          style={{ flex: 1 }}
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}
