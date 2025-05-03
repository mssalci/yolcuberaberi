import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { auth, db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function Tekliflerim() {
  const [activeTab, setActiveTab] = useState('ettiklerim');
  const [teklifEttiklerim, setTeklifEttiklerim] = useState([]);
  const [talebimeGelenler, setTalebimeGelenler] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const q1 = query(collection(db, 'teklifler'), where('teklifVeren', '==', user.uid));
      const snapshot1 = await getDocs(q1);
      setTeklifEttiklerim(snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const taleplerSnapshot = await getDocs(query(collection(db, 'talepler'), where('talepSahibi', '==', user.uid)));
      const talepIDs = taleplerSnapshot.docs.map(doc => doc.id);

      if (talepIDs.length > 0) {
        const q2 = query(collection(db, 'teklifler'), where('talepID', 'in', talepIDs));
        const snapshot2 = await getDocs(q2);
        setTalebimeGelenler(snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    fetchData();
  }, [user]);

  return (
    <>
<Head>
        <title>Eşleşmeler | Yolcu Beraberi</title>
        <meta
          name="description"
          content="Teklif verdiğiniz ya da talebinize gelen tekliflerle eşleşmeleri yönetin."
        />
        <meta property="og:title" content="Eşleşmeler" />
        <meta property="og:description" content="Yolcular ve talepler arasında bağlantı kurun, süreci takip edin." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yolcuberaberi.com.tr/tekliflerim" />
            <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563eb" />
      </Head>

      <main className="bg-white text-gray-800 min-h-screen p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Eşleşmelerim</h1>

        <div className="flex gap-4 justify-center mb-8">
          <button
            className={`py-2 px-6 rounded-full ${
              activeTab === 'ettiklerim' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('ettiklerim')}
          >
            Teklif Ettiklerim
          </button>
          <button
            className={`py-2 px-6 rounded-full ${
              activeTab === 'gelenler' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('gelenler')}
          >
            Talebime Gelen Teklifler
          </button>
        </div>

        {activeTab === 'ettiklerim' && (
          <div className="grid md:grid-cols-2 gap-6">
            {teklifEttiklerim.length === 0 ? (
              <p>Henüz teklif verdiğiniz bir talep yok.</p>
            ) : (
              teklifEttiklerim.map(teklif => (
                <div key={teklif.id} className="border p-4 rounded-lg shadow-sm space-y-2">
                  <h3 className="font-bold text-lg">Talep: {teklif.urunAdi || 'Ürün adı yok'}</h3>
                  <p className="text-sm text-gray-700">Not: {teklif.mesaj || 'Mesaj yok'}</p>
                  <div className="flex gap-4 mt-2">
                    <Link
                      href={`/teklif/${teklif.id}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Detayları Gör
                    </Link>
                    <Link
                      href={`/chat/${teklif.id}`}
                      className="text-green-600 underline hover:text-green-800"
                    >
                      Mesajlaş
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'gelenler' && (
          <div className="grid md:grid-cols-2 gap-6">
            {talebimeGelenler.length === 0 ? (
              <p>Henüz taleplerinize gelen bir teklif yok.</p>
            ) : (
              talebimeGelenler.map(teklif => (
                <div key={teklif.id} className="border p-4 rounded-lg shadow-sm space-y-2">
                  <h3 className="font-bold text-lg">Teklif Sahibi: {teklif.teklifVeren || 'Bilinmiyor'}</h3>
                  <p className="text-sm text-gray-700">Mesaj: {teklif.mesaj || 'Mesaj yok'}</p>
                  <div className="flex gap-4 mt-2">
                    <Link
                      href={`/teklif/${teklif.id}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Detayları Gör
                    </Link>
                    <Link
                      href={`/chat/${teklif.id}`}
                      className="text-green-600 underline hover:text-green-800"
                    >
                      Mesajlaş
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
