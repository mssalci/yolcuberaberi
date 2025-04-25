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
  }, [router]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgList);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");

    try {
      await addDoc(messagesRef, {
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
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Mesajlaşma</h2>

      <div
        style={{
          height: "60vh",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1rem",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: "0.5rem",
              background: msg.senderUid === currentUser?.uid ? "#dcf8c6" : "#e4e6eb",
              padding: "0.6rem 1rem",
              borderRadius: "12px",
              alignSelf: msg.senderUid === currentUser?.uid ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}
          >
            <strong>{msg.senderUid === currentUser?.uid ? "Ben" : "Karşı taraf"}</strong>: {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın"
          style={{
            flex: "1 1 auto",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Gönder</button>
      </form>
    </div>
  );
}
