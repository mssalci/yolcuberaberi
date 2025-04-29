// firebase/firebaseConfig.js

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCk0Ib2BGW6wLEzYM9z5Ry6j7HdSNugP7c",
  authDomain: "yolcuberaberi-9e3c7.firebaseapp.com",
  projectId: "yolcuberaberi-9e3c7",
  storageBucket: "yolcuberaberi-9e3c7.appspot.com",
  messagingSenderId: "877346669639",
  appId: "1:877346669639:android:8caa171a53755b00fb5d62"
};

// Firebase'i tekrar tekrar initialize etmeyi önle
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
