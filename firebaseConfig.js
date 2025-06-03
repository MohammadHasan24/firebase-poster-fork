// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // if you're using storage

const firebaseConfig = {
  apiKey: "AIzaSyA4WGIWPFccAgZiqiDjDMPwbeQT8PFnIQo",
  authDomain: "hanashi-beta.firebaseapp.com",
  projectId: "hanashi-beta",
  storageBucket: "hanashi-beta.firebasestorage.app", 
  messagingSenderId: "428591119484",
  appId: "1:428591119484:web:b40803b47bf70ba1fc5df9",
  measurementId: "G-XXND8L5ES7", // not needed unless you're using Analytics
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // if using images in future

export { db, storage };
