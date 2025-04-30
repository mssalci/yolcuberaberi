import { useEffect, useState } from 'react'; import { useRouter } from 'next/router'; import { getAuth, signOut } from 'firebase/auth'; import Link from 'next/link'; import { FileText, PlusCircle, LogOut } from 'lucide-react';

export default function HomePage() { const auth = getAuth(); const router = useRouter(); const [user, setUser] = useState(null);

useEffect(() => { const unsubscribe = auth.onAuthStateChanged(currentUser => { if (!currentUser) { router.push('/login'); } else { setUser(currentUser); } }); return () => unsubscribe(); }, []);

const handleLogout = async () => { await signOut(auth); router.push('/login'); };

return ( 

{/* Sol Menü */} 

Yolcu Beraberi Tüm Talepler Tekliflerim Talep Oluştur 

Çıkış Yap {/* Ana İçerik */} <main className="flex-1 bg-gray-50 p-8 overflow-y-auto"> <h1 className="text-3xl font-bold mb-4 text-gray-800">Hoş Geldiniz!</h1> <p className="text-gray-700">Soldaki menüden talepleri görüntüleyebilir, yeni talepler oluşturabilir veya tekliflerinizi yönetebilirsiniz.</p> </main> </div> 

); }

