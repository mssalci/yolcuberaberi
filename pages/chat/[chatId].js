'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const dynamic = 'force-dynamic';

export default function ChatRoom() {
  const router = useRouter();
  const { chatId } = router.query;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!router.isReady || !chatId) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push('/login');
      }
    });

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, [router.isReady, chatId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email,
    });

    setNewMessage('');
  };

  if (!router.isReady || !chatId) {
    return <div>Loading chat...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chat Room</h2>
      <div style={{ maxHeight: '300px', overflowY: 'scroll', border: '1px solid #ccc', marginBottom: '10px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '5px' }}>
            <strong>{msg.displayName}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Write a message..."
        style={{ width: '80%', marginRight: '10px' }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
