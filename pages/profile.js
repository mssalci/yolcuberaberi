import { useEffect, useState } from "react"; import { useRouter } from "next/router"; import { auth, db } from "../firebase"; import { onAuthStateChanged, signOut } from "firebase/auth"; import { collection, query, where, getDocs, getDoc, doc, updateDoc } from "firebase/firestore"; export default function Profile() { const router = useRouter(); const [user, setUser] = useState(null); const [userName, setUserName] = useState(""); const [iban, setIban] = useState(""); const [paypal, setPaypal] = useState(""); const [activeTab, setActiveTab] = useState("hesap"); const [taleplerim, setTaleplerim] = useState([]); const [verdigimTeklifler, setVerdigimTeklifler] = useState([]); const [eslesmeler, setEslesmeler] = useState([]); useEffect(() => { const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { if (currentUser) { setUser(currentUser); const savedName = localStorage.getItem("userName"); const savedIban = localStorage.getItem("iban"); const savedPaypal = localStorage.getItem("paypal"); if (savedName && savedIban && savedPaypal) { setUserName(savedName); setIban(savedIban); setPaypal(savedPaypal); } else { const userRef = doc(db, "users", currentUser.uid); const userSnap = await getDoc(userRef); if (userSnap.exists()) { const data = userSnap.data(); setUserName(data.name || ""); setIban(data.iban || ""); setPaypal(data.paypal || ""); localStorage.setItem("userName", data.name || ""); localStorage.setItem("iban", data.iban || ""); localStorage.setItem("paypal", data.paypal || ""); } } const q = query(collection(db, "talepler"), where("uid", "==", currentUser.uid)); const taleplerSnapshot = await getDocs(q); setTaleplerim(taleplerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); const teklifSnap = await getDocs( query(collection(db, "teklifler"), where("teklifVerenUid", "==", currentUser.uid)) ); const teklifler = []; const eslesenler = []; for (let teklifDoc of teklifSnap.docs) { const data = teklifDoc.data(); const talepDoc = await getDoc(doc(db, "talepler", data.talepId)); const teklifData = { id: teklifDoc.id, ...data, talep: talepDoc.exists() ? talepDoc.data() : null, }; teklifler.push(teklifData); if (data.durum === "kabul edildi") { eslesenler.push(teklifData); } } const gelenTekliflerSnap = await getDocs( query(collection(db, "teklifler"), where("durum", "==", "kabul edildi")) ); for (let teklifDoc of gelenTekliflerSnap.docs) { const data = teklifDoc.data(); const talepDoc = await getDoc(doc(db, "talepler", data.talepId)); if (talepDoc.exists() && talepDoc.data().uid === currentUser.uid) { eslesenler.push({ id: teklifDoc.id, ...data, talep: talepDoc.data(), }); } } setVerdigimTeklifler(teklifler); setEslesmeler(eslesenler); } }); return () => unsubscribe(); }, []); const handleLogout = async () => { await signOut(auth); }; const handleSaveInfo = async () => { if (user) { await updateDoc(doc(db, "users", user.uid), { name: userName, iban, paypal, }); localStorage.setItem("userName", userName); localStorage.setItem("iban", iban); localStorage.setItem("paypal", paypal); alert("Bilgileriniz güncellendi."); } }; const startChat = (uid1, uid2) => { const chatId = [uid1, uid2].sort().join("_"); router.push(`/chat/${chatId}`); }; if (!user) return 

Giriş yapmalısınız.

; return ( 

Profilim 

setActiveTab("hesap")}>Hesap Bilgileri setActiveTab("talepler")}>Taleplerim setActiveTab("teklifler")}>Verdiğim Teklifler setActiveTab("eslesmeler")}>Eşleşmeler 

{activeTab === "hesap" && ( 

Ad Soyad:
setUserName(e.target.value)} /> 

IBAN:
setIban(e.target.value)} /> 

PayPal:
setPaypal(e.target.value)} /> 

Kaydet 

E-posta: {user.email}

Çıkış Yap 

)} {activeTab === "talepler" && ( {taleplerim.map((talep) => ( {talep.baslik}
{talep.aciklama}
Nereden: {talep.nereden}
Teslim Tarihi: {talep.tahminiTarih || "-"} ))} )} {activeTab === "teklifler" && ( {verdigimTeklifler.map((teklif) => ( Talep: {teklif.talep?.baslik || "Silinmiş talep"}
Durum: {teklif.durum || "beklemede"} {teklif.durum === "karşı teklif" && teklif.mesaj && ( 

Not: {teklif.mesaj}

)} ))} )} {activeTab === "eslesmeler" && ( {eslesmeler.map((tek) => ( Talep: {tek.talep?.baslik}
Durum: ✅ Kabul Edildi
startChat(user.uid, tek.teklifVerenUid)}>Mesajlaş ))} )} 

); } 
