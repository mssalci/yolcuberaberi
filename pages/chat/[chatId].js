// /pages/chat/[chatId].js

export const dynamic = 'force-dynamic'; // Sayfanın dinamik olduğunu belirtir

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ChatRoom() {
  const router = useRouter();
  const { chatId } = router.query;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push('/login');
      }
    });

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt"));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(loadedMessages);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, [chatId, router]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: newMessage,
      createdAt: serverTimestamp(),
      userId: currentUser.uid,
      userEmail: currentUser.email
    });

    setNewMessage("");
  };

  if (!chatId) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chat Room: {chatId}</h1>
      <div style={{ marginBottom: "20px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "10px" }}>
            <strong>{msg.userEmail}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Mesajınızı yazın"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ width: "80%", marginRight: "10px" }}
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}
