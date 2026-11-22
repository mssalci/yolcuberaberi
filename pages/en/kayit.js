import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isRegistering) {
        router.push("/en");
      }
    });

    return () => unsubscribe();
  }, [isRegistering, router]);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError(null);
    setIsRegistering(true);
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName.trim(),
      });

      await setDoc(doc(db, "kullanicilar", user.uid), {
        uid: user.uid,
        email: user.email,
        adSoyad: fullName.trim(),
        iban: "",
      });

      auth.languageCode = "en";

      await sendEmailVerification(user);

      alert(
        "Registration successful! A verification email has been sent. Please check your inbox and spam folder."
      );

      router.push("/en/profil");

    } catch (err) {
      console.error("Registration error:", err.code, err.message);

      setError(
        `Registration failed (${err.code || "unknown"}): ${err.message}`
      );

      setIsRegistering(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register | Yolcu Beraberi</title>
        <meta
          name="description"
          content="Create a new Yolcu Beraberi account."
        />
        <meta property="og:title" content="Register" />
        <meta
          property="og:description"
          content="Sign up to join Yolcu Beraberi."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://www.yolcuberaberi.com.tr/en/kayit"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </Head>

      <div className="max-w-md mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Register</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
          />

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
            <p className="text-red-500 text-sm break-words">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </>
  );
}
