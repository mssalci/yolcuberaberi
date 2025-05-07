import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

export default function TeklifDetay() {
  const router = useRouter();
  const { id } = router.query;

  const [teklif, setTeklif] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchTeklif = async () => {
      const docRef = doc(db, 'teklifler', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTeklif(docSnap.data());
      } else {
        console.log('Teklif bulunamadı');
      }

      setLoading(false);
    };

    fetchTeklif();
  }, [id]);

  if (loading) return <p className="p-6">Yükleniyor...</p>;
  if (!teklif) return <p className="p-6">Teklif bulunamadı.</p>;

  return (
    <>
      <Head>
        <title>Teklif Detayı - Yolcu Beraberi</title>
      </Head>

      <main className="bg-white min-h-screen p-6 max-w-3xl mx-auto text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Teklif Detayları</h1>

        <div className="space-y-4 border p-6 rounded-lg shadow-sm">
          <p><strong>Ürün Adı:</strong> {teklif.urunAdi || 'Belirtilmemiş'}</p>
          <p><strong>Mesaj:</strong> {teklif.mesaj || 'Yok'}</p>
          <p><strong>Teklif Veren:</strong> {teklif.teklifVeren || 'Bilinmiyor'}</p>
          <p><strong>Bütçe:</strong> {teklif.bütçe ? `${teklif.bütçe} USD` : 'Belirtilmemiş'}</p>
          <p><strong>Durum:</strong> {teklif.durum || 'Beklemede'}</p>
        </div>
      </main>
    </>
  );
}
