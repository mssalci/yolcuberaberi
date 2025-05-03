import { useRouter } from "next/router";
import { handleTeklifKabulEt } from "../../lib/handleTeklifKabulEt";

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

export default Taleplerim;
