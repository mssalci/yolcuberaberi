import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "../firebase/firebaseConfig"; // kendi firebaseConfig dosyanı import et

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth(firebaseApp);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // giriş başarılı, ana sayfaya yönlendir
    } catch (err) {
      setError(err.message); // hata varsa ekrana yaz
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Giriş Yap</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column" }}>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: "10px", padding: "10px" }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: "10px", padding: "10px" }}
        />
        <button type="submit" style={{ padding: "10px" }}>
          Giriş Yap
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// Build hatası almamak için SSR kapalı!
export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });
