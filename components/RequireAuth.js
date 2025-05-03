// components/RequireAuth.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import Loading from "../components/Loading";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        router.replace("/giris");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return < Loading />;

  return authenticated ? children : <div></div>;
}
