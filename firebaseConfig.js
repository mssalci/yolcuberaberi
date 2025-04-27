// /firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "senin-apiKey-buraya",
  authDomain: "senin-authDomain-buraya",
  projectId: "senin-projectId-buraya",
  storageBucket: "senin-storageBucket-buraya",
  messagingSenderId: "senin-messagingSenderId-buraya",
  appId: "senin-appId-buraya"
};

// Uygulamayı başlat
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
