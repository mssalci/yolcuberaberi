import Head from "next/head";

export default function Iletisim() {
  return (
    <>
      <Head>
        <title>İletişim | Yolcu Beraberi</title>
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-16 text-gray-800">
        <h1 className="text-3xl font-bold mb-6">İletişim</h1>

        <p className="mb-4">
          Yolcu Beraberi hakkında sorularınız, önerileriniz ya da iş birliği talepleriniz için bize aşağıdaki kanallar üzerinden ulaşabilirsiniz.
        </p>

        <div className="space-y-4">
         <p><strong>Adres:</strong> İstanbul, Türkiye</p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-2">Bize Mesaj Gönderin</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Adınız"
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Mesajınız"
              rows={5}
              className="w-full p-2 border rounded"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled
            >
              Gönder
            </button>
          </form>
         </div>
      </main>
    </>
  );
}
