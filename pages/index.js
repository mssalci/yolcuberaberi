// pages/index.js import Link from 'next/link'; import { useAuth } from '../firebase/authContext';

export default function Home() { const { user } = useAuth();

return ( 

Yolcu Beraberi Platformu 

{user ? ( <> Taleplerim Tekliflerim Profilim </> ) : ( <> Giriş Yap Kayıt Ol </> )} 

); } 
