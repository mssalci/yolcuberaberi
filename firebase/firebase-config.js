// firebase/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCk0Ib2BGW6wLEzYM9z5Ry6j7HdSNugP7c",
  authDomain: "yolcuberaberi-9e3c7.firebaseapp.com",
  projectId: "yolcuberaberi-9e3c7",
  storageBucket: "yolcuberaberi-9e3c7.firebasestorage.app",
  messagingSenderId: "877346669639",
  appId: "1:877346669639:web:4a91efc0cd7407defb5d62"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
