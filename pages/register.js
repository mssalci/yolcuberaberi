import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/router";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "../firebase/firebaseConfig"; // kendi config dosyanı import et

function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const auth = getAuth(firebaseApp);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/login"); // kayıt başarılı, login sayfasına yönlendir
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Kayıt Ol</h1>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column" }}>
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
          Kayıt Ol
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
export default dynamic(() => Promise.resolve(RegisterPage), { ssr: false });
