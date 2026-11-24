// pages/eslesmeler/tekliflerim.js
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
import GirisUyari from "../../components/GirisUyari";

export default function Tekliflerim() {
  const [eslesmeler, setEslesmeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [user, setUser] = useState(null);
  const [kontrolEdildi, setKontrolEdildi] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
      setKontrolEdildi(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEslesmeler = async () => {
      if (!user) return;
      setYukleniyor(true);

      try {
        // Kullanıcının verdiği teklifler
        const tekliflerSnap = await getDocs(
          query(collection(db, "teklifler"), where("teklifVerenId", "==", user.uid))
        );

        const eslesmelerArr = [];

        for (const teklifDoc of tekliflerSnap.docs) {
          const teklifData = teklifDoc.data();

          const esSnap = await getDocs(
            query(collection(db, "eslesmeler"), where("teklifId", "==", teklifDoc.id))
          );

          for (const esDoc of esSnap.docs) {
            const esData = esDoc.data();

            const talepDoc = esData.talepId
              ? await getDoc(doc(db, "talepler", esData.talepId))
              : null;

            eslesmelerArr.push({
              id: esDoc.id,
              tip: esData.talepId ? "talep" : "bilinmiyor",
              talep: talepDoc?.exists() ? { id: talepDoc.id, ...talepDoc.data() } : null,
              teklif: { id: teklifDoc.id, ...teklifData },
            });
          }
        }

        setEslesmeler(eslesmelerArr);
      } catch (error) {
        console.error("Eşleşmeler alınırken hata:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    fetchEslesmeler();
  }, [user]);

  const eslesmeSil = async (eslesmeId, teklifId) => {
  if (
    !confirm(
      "Bu eşleşmeyi, mesajlarını ve ilişkili teklif verisini silmek istediğinize emin misiniz?"
    )
  ) {
    return;
  }

  try {
    // Önce eşleşmenin sohbet mesajlarını bul.
    const mesajlarQuery = collection(
      db,
      "chat",
      eslesmeId,
      "messages"
    );

    const mesajlarSnap = await getDocs(mesajlarQuery);

    // Mesajları sil.
    for (const mesajDoc of mesajlarSnap.docs) {
      await deleteDoc(mesajDoc.ref);
    }

    // Ardından eşleşmeyi sil.
    await deleteDoc(doc(db, "eslesmeler", eslesmeId));

    // Son olarak teklifi sil.
    if (teklifId) {
      await deleteDoc(doc(db, "teklifler", teklifId));
    }

    setEslesmeler((prev) =>
      prev.filter((e) => e.id !== eslesmeId)
    );

    alert("Eşleşme, mesajları ve teklif silindi.");
  } catch (err) {
    console.error("Silme hatası:", err);
    alert("Silme işlemi sırasında hata oluştu.");
  }
};
