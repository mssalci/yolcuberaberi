// components/GirisUyari.js
export default function GirisUyari({ mesaj }) {
  return (
    <div className="text-center text-gray-700 bg-yellow-50 border border-yellow-300 p-6 rounded mb-10">
      <p className="mb-4">{mesaj}</p>
      <Link href="/giris" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block">
        Giriş Yap
      </Link>
    </div>
  );
}
