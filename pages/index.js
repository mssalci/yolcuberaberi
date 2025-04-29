// pages/index.js
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Ana Sayfa</h1>
      <p className="mb-6 text-gray-700">
        Yurt dışından getirilmesini istediğiniz ürünler için talep oluşturabilir,
        yurt dışından gelen yolcuların tekliflerini görebilirsiniz.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/talep-olustur" className="block p-6 border rounded-xl hover:shadow-lg bg-white">
          <h2 className="text-xl font-semibold">Talep Oluştur</h2>
          <p className="text-gray-600">İhtiyacınız olan ürünü yurt dışından getirtin.</p>
        </Link>
        <Link href="/talepler" className="block p-6 border rounded-xl hover:shadow-lg bg-white">
          <h2 className="text-xl font-semibold">Talepleri Görüntüle</h2>
          <p className="text-gray-600">Diğer kullanıcıların ihtiyaçlarını inceleyin ve teklif verin.</p>
        </Link>
      </div>
    </div>
  );
}
