
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.replace("/en");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/en/profil");
    } catch (error) {
      setError("Login failed: " + error.message);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Yolcu Beraberi</title>
        <meta
          name="description"
          content="Log in to your account, manage requests and submit offers."
        />
        <meta property="og:title" content="Login" />
        <meta
          property="og:description"
          content="Access your Yolcu Beraberi account."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://www.yolcuberaberi.com.tr/en/giris"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Log In</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
        </form>
      </div>
    </>
  );
}
