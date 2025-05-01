// pages/tekliflerim.js
import { useState } from 'react';
import Head from 'next/head';

export default function Tekliflerim() {
  const [aktifSekme, setAktifSekme] = useState('verdigim');

  return (
    <>
      <Head>
        <title>Eşleşmeler - Yolcu Beraberi</title>
      </Head>

      <main className="bg-white text-gray-800 min-h-screen">
        <section className="py-12 px-4 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Eşleşmeler</h1>

          {/* Sekme Butonları */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setAktifSekme('verdigim')}
              className={`px-6 py-2 rounded-t-lg font-semibold ${
                aktifSekme === 'verdigim'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Teklif Ettiklerim
            </button>
            <button
              onClick={() => setAktifSekme('aldigim')}
              className={`px-6 py-2 rounded-t-lg font-semibold ml-2 ${
                aktifSekme === 'aldigim'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Talebime Gelen Teklifler
            </button>
          </div>

          {/* Sekme İçeriği */}
          <div className="bg-gray-100 p-6 rounded-b-lg shadow">
            {aktifSekme === 'verdigim' ? (
              <div>
                {/* Buraya verdiğiniz teklifleri listeleyecek component */}
                <p className="text-lg">Verdiğiniz tekliflerin listesi burada yer alacak.</p>
              </div>
            ) : (
              <div>
                {/* Buraya size gelen teklifleri listeleyecek component */}
                <p className="text-lg">Talebinize gelen teklifler burada yer alacak.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
