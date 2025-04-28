// firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCk0Ib2BGW6wLEzYM9z5Ry6j7HdSNugP7c",
  authDomain: "yolcuberaberi-9e3c7.firebaseapp.com",
  projectId: "yolcuberaberi-9e3c7",
  storageBucket: "yolcuberaberi-9e3c7.appspot.com",
  messagingSenderId: "877346669639",
  appId: "1:877346669639:android:8caa171a53755b00fb5d62"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
