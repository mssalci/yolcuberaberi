// pages/tekliflerim.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
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
      // Kullanıcının yaptığı teklifler
      const q1 = query(collection(db, 'teklifler'), where('teklifVeren', '==', user.uid));
      const snapshot1 = await getDocs(q1);
      setTeklifEttiklerim(snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Kullanıcının taleplerine gelen teklifler
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
        <title>Tekliflerim - Yolcu Beraberi</title>
      </Head>

      <main className="bg-white text-gray-800 min-h-screen p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Eşleşmelerim</h1>

        {/* Tabs */}
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

        {/* Tab İçerikleri */}
        {activeTab === 'ettiklerim' && (
          <div className="grid md:grid-cols-2 gap-6">
            {teklifEttiklerim.length === 0 ? (
              <p>Henüz teklif verdiğiniz bir talep yok.</p>
            ) : (
              teklifEttiklerim.map(teklif => (
                <div key={teklif.id} className="border p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold mb-1">Talep: {teklif.urunAdi || 'Ürün adı yok'}</h3>
                  <p className="text-sm">Not: {teklif.mesaj || 'Mesaj yok'}</p>
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
                <div key={teklif.id} className="border p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold mb-1">Teklif Sahibi: {teklif.teklifVeren || 'Bilinmiyor'}</h3>
                  <p className="text-sm">Mesaj: {teklif.mesaj || 'Mesaj yok'}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}
