// lib/handleTeklifKabulEt.js
import { doc, updateDoc, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const handleTeklifKabulEt = async (teklif, talep) => {
  try {
    await updateDoc(doc(db, "teklifler", teklif.id), { durum: "kabul edildi" });

    const eslesmeRef = await addDoc(collection(db, "eslesmeler"), {
      teklifId: teklif.id,
      talepId: talep.id,
      olusturmaZamani: serverTimestamp(),
      kullaniciId: teklif.kullaniciId,
      talepSahibiId: talep.kullaniciId,
    });

    return eslesmeRef.id;
  } catch (err) {
    console.error("Eşleşme oluşturulamadı:", err);
    throw err;
  }
};
