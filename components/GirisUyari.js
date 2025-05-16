// components/GirisUyari.js
import Link from "next/link";

export default function GirisUyari() {
  return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <p className="text-lg text-gray-700 mb-4">
        Bu sayfayı görüntülemek için giriş yapmalısınız.
      </p>
      <Link href="/giris" className="text-white bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">
        Giriş Yap
      </Link>
    </div>
  );
}
