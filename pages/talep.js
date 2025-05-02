import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Giris() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, sifre);
      router.push("/");
    } catch (error) {
      setHata("Giriş başarısız: " + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-800 py-20 px-4">
      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
          {hata && <p className="text-red-500 text-sm">{hata}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </main>
  );
}
