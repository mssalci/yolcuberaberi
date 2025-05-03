import { useRouter } from "next/router";
import { doc, updateDoc, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const handleTeklifKabulEt = async (teklif, talep) => {
  const router = useRouter(); // Router burada tanımlanmalı

  try {
    // Teklifin durumunu güncelle
    await updateDoc(doc(db, "teklifler", teklif.id), { durum: "kabul edildi" });

    // Eşleşme oluştur
    const eslesmeRef = await addDoc(collection(db, "eslesmeler"), {
      teklifId: teklif.id,
      talepId: talep.id,
      olusturmaZamani: serverTimestamp(),
      kullaniciId: teklif.kullaniciId,     // Teklif veren
      talepSahibiId: talep.kullaniciId,   // Talep sahibi
    });

    // Eşleşme sayfasına yönlendir
    router.push(`/eslesmeler/${eslesmeRef.id}`);
  } catch (err) {
    console.error("Eşleşme oluşturulamadı:", err);
  }
};

export default handleTeklifKabulEt;
