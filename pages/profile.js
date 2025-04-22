// pages/profile.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) return <p>Yükleniyor...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Profil Bilgileri</h1>
      <p><strong>Ad:</strong> {profileData.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}
