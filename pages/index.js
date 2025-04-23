// pages/index.js
import Link from "next/link";
import SEO from "../components/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Yolcu Beraberi | Yurt Dışından Ucuza Ürün Getir"
        description="Yurt dışından gelen yolcularla ürünlerinizi getirtin, kazançlı alışverişin tadını çıkarın!"
        url="https://www.yolcuberaberi.com.tr"
      />
      <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Yolcu Beraberi</h1>
        <h2 style={{ fontSize: '1.5rem', color: '#666' }}>
          Yurtdışından alışveriş artık daha kolay ve ekonomik
        </h2>
        <p style={{ marginTop: '1rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Yurtdışından parça veya eşya getirmek isteyenlerle, yurtdışından gelen yolcuları buluşturan güvenli İLK ve TEK platform.
          <br /><br />
          Yolcu taşıdığı üründen gelir elde ederken, talep sahibi de düşük maliyetle ürününe kavuşur.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <h3>Neden Yolcuberaberi?</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ Yüksek gümrük ve kargo maliyetlerinden kurtulun</li>
            <li>✅ Yolculardan yardım alın, ürününüzü hızlıca teslim alın</li>
            <li>✅ Yolcular için kolay kazanç imkânı</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>Nasıl Çalışır?</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>1️⃣ Talebinizi oluşturun</li>
            <li>2️⃣ Uygun yolcu ile eşleşin</li>
            <li>3️⃣ Ürününüz güvenle size ulaşsın</li>
          </ol>
        </div>

        <div style={{ marginTop: '2.5rem' }}>
          <Link href="/talep">
            <button style={{
              padding: '1rem 2rem',
              backgroundColor: '#0070f3',
              color: 'white',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              Talep Oluştur
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
