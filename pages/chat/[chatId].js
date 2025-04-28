import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ChatPage() {
  const router = useRouter();
  const { chatId } = router.query;
  const [user, setUser] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!chatId) return;

    const fetchChatData = async () => {
      const chatDocRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatDocRef);
      if (chatSnap.exists()) {
        setChat(chatSnap.data());
      }

      const messagesQuery = query(collection(db, "messages"), where("chatId", "==", chatId));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesList = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesList);
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchChatData();
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    await addDoc(collection(db, "messages"), {
      chatId: chatId,
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
    // Mesajı hemen eklemek için fetch tekrar çalıştırılabilir ya da real-time dinleme kurulabilir.
  };

  if (!chat) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.senderId}</strong>: {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}
