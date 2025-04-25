// pages/profile.js import { useEffect, useState } from "react"; import { auth, db } from "../firebase"; import { onAuthStateChanged, signOut } from "firebase/auth"; import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";

export default function Profile() { const [user, setUser] = useState(null); const [activeTab, setActiveTab] = useState("hesap"); const [taleplerim, setTaleplerim] = useState([]); const [verdigimTeklifler, setVerdigimTeklifler] = useState([]); const [eslesmeler, setEslesmeler] = useState([]);

useEffect(() => { const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { if (currentUser) { setUser(currentUser);

// Talepler const q = query(collection(db, "talepler"), where("uid", "==", currentUser.uid)); const taleplerSnapshot = await getDocs(q); setTaleplerim(taleplerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // Teklifler const teklifSnap = await getDocs( query(collection(db, "teklifler"), where("teklifVerenUid", "==", currentUser.uid)) ); const teklifler = []; const eslesenler = []; for (let teklifDoc of teklifSnap.docs) { const data = teklifDoc.data(); const talepDoc = await getDoc(doc(db, "talepler", data.talepId)); const teklifData = { id: teklifDoc.id, ...data, talep: talepDoc.exists() ? talepDoc.data() : null, }; teklifler.push(teklifData); if (data.durum === "kabul edildi") { eslesenler.push(teklifData); } } setVerdigimTeklifler(teklifler); setEslesmeler(eslesenler); } }); return () => unsubscribe(); 

}, []);

const handleLogout = async () => { await signOut(auth); };

if (!user) return <p style={{ padding: "2rem" }}>Giriş yapmalısınız.

; 

return ( <div style={{ padding: "2rem" }}> Profilim

<div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}> <button onClick={() => setActiveTab("hesap")}>Hesap Bilgileri</button> <button onClick={() => setActiveTab("talepler")}>Taleplerim</button> <button onClick={() => setActiveTab("teklifler")}>Verdiğim Teklifler</button> <button onClick={() => setActiveTab("eslesmeler")}>Eşleşmeler</button> </div> {activeTab === "hesap" && ( <div> <p><strong>Ad Soyad:</strong> (Güncelleme alanı eklenebilir)</p> <p><strong>E-posta:</strong> {user.email}</p> <p><strong>Ödeme Bilgileri:</strong> (IBAN, PayPal vs - Geliştirilebilir)</p> <button onClick={handleLogout}>Çıkış Yap</button> </div> )} {activeTab === "talepler" && ( <ul> {taleplerim.map((talep) => ( <li key={talep.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}> <strong>{talep.baslik}</strong><br /> {talep.aciklama}<br /> <em>Nereden:</em> {talep.nereden}<br /> <em>Tahmini Teslim Tarihi:</em> {talep.tahminiTarih || "-"} </li> ))} </ul> )} {activeTab === "teklifler" && ( <ul> {verdigimTeklifler.map((teklif) => ( <li key={teklif.id} style={{ border: "1px solid #aaa", padding: "1rem", marginBottom: "1rem" }}> <strong>Talep:</strong> {teklif.talep?.baslik || "Silinmiş talep"}<br /> <strong>Durum:</strong> {teklif.durum || "beklemede"} {teklif.durum === "karşı teklif" && teklif.mesaj && ( <div><em>Not:</em> {teklif.mesaj}</div> )} </li> ))} </ul> )} {activeTab === "eslesmeler" && ( <ul> {eslesmeler.map((tek) => ( <li key={tek.id} style={{ border: "1px solid green", padding: "1rem", marginBottom: "1rem" }}> <strong>Talep:</strong> {tek.talep?.baslik}<br /> <strong>Durum:</strong> ✅ Kabul Edildi </li> ))} </ul> )} </div> 

); }

