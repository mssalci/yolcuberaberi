export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

export default function ChatRoom() {
  const router = useRouter();
  const { chatId } = router.query;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!router.isReady || !chatId) return;

    const fetchChatData = async () => {
      try {
        const chatDocRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatDocRef);
        if (chatSnap.exists()) {
          setChat(chatSnap.data());
        }

        const messagesQuery = query(
          collection(db, "messages"),
          where("chatId", "==", chatId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesList = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(messagesList);
      } catch (error) {
        console.error("Chat verileri çekilemedi:", error);
      }
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
  }, [router.isReady, chatId]);

  if (!user || !chat) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <h1>Chat Başlığı: {chat.title || "Başlıksız"}</h1>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.senderName}</strong>: {message.text}
          </div>
        ))}
      </div>
    </div>
  );
}
