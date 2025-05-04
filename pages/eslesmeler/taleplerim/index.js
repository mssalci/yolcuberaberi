import { useRouter } from "next/router";
import { handleTeklifKabulEt } from "../../lib/handleTeklifKabulEt";
import { db, collection, getDocs } from "../../firebase/firebaseConfig.js";

const Taleplerim = ({ teklifler, talepler }) => {
  const router = useRouter();

  const handleKabulEt = async (teklif, talep) => {
    try {
      const eslesmeId = await handleTeklifKabulEt(teklif, talep);
      router.push(`/eslesmeler/${eslesmeId}`);
    } catch (error) {
      console.error("Eşleşme oluşturulamadı:", error);
      alert("Eşleşme sırasında bir hata oluştu.");
    }
  };

  return (
    <div>
      <h1>Taleplerim</h1>
      {talepler.map((talep) => (
        <div key={talep.id}>
          <h2>{talep.baslik}</h2>
          {teklifler
            .filter((teklif) => teklif.talepId === talep.id)
            .map((teklif) => (
              <div key={teklif.id}>
                <p>Teklif veren: {teklif.kullaniciId}</p>
                <p>Durum: {teklif.durum}</p>
                {teklif.durum === "beklemede" && (
                  <button onClick={() => handleKabulEt(teklif, talep)}>
                    Teklifi Kabul Et
                  </button>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export async function getServerSideProps(context) {
  try {
    const taleplerSnapshot = await getDocs(collection(db, "talepler"));
    const tekliflerSnapshot = await getDocs(collection(db, "teklifler"));

    const talepler = taleplerSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const teklifler = tekliflerSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      props: {
        talepler,
        teklifler,
      },
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return {
      props: {
        talepler: [],
        teklifler: [],
      },
    };
  }
}

export default Taleplerim;
