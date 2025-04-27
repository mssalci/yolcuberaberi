import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

function ChatRoom() {
  const router = useRouter();
  const { chatId } = router.query;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!router.isReady || !chatId) return;

    // Örnek: chatId'ye göre mesajları çekmek için
    console.log("Aktif Chat ID:", chatId);
    // İstersen buraya veritabanı bağlantısı koyabilirsin
  }, [router.isReady, chatId]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages((prev) => [...prev, { text: newMessage, sender: "Me" }]);
    setNewMessage("");
  };

  if (!router.isReady) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chat Room: {chatId}</h1>
      
      <div style={{ marginBottom: "20px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Mesaj yaz..."
        style={{ padding: "10px", width: "80%" }}
      />
      <button onClick={handleSendMessage} style={{ padding: "10px 20px", marginLeft: "10px" }}>
        Gönder
      </button>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ChatRoom), { ssr: false });
