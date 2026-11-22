// firebase/firebaseConfig.js

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCk0Ib2BGW6wLEzYM9z5Ry6j7HdSNugP7c",
  authDomain: "yolcuberaberi-9e3c7.firebaseapp.com",
  projectId: "yolcuberaberi-9e3c7",
  storageBucket: "yolcuberaberi-9e3c7.firebasestorage.app",
  messagingSenderId: "877346669639",
  appId: "1:877346669639:web:e39ddce5d01cfd06fb5d62",
  measurementId: "G-JXMW577W04"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
