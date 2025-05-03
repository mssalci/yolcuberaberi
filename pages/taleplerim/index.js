import { useRouter } from "next/router";
import { doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// teklif ve talep verilerini props olarak aldığını varsayıyoruz
const handleTeklifKabulEt = async (teklif, talep) => {
  try {
    // Teklifin durumunu güncelle (örn. "kabul edildi")
    await updateDoc(doc(db, "teklifler", teklif.id), { durum: "kabul edildi" });

    // Eşleşme oluştur
    const eslesmeRef = await addDoc(collection(db, "eslesmeler"), {
      teklifId: teklif.id,
      talepId: talep.id,
      olusturmaZamani: serverTimestamp(),
      kullaniciId: teklif.kullaniciId, // teklif veren
      talepSahibiId: talep.kullaniciId, // talep sahibi
    });

    // Yönlendirme
    router.push(`/eslesmeler/${eslesmeRef.id}`);
  } catch (err) {
    console.error("Eşleşme oluşturulamadı:", err);
  }
};
