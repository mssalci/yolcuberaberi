import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";

export default function Tekliflerim() {
  const [teklifler, setTeklifler] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTeklifler = async (user) => {
      const q = query(collection(db, "teklifler"), where("kullaniciId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const tekliflerList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTeklifler(tekliflerList);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTeklifler(user);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Tekliflerim</h1>
      <ul>
        {teklifler.map((teklif) => (
          <li key={teklif.id}>{teklif.detay}</li>
        ))}
      </ul>
    </div>
  );
}
