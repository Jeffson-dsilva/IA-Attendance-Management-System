// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJ69mdOBNu-R_cxTA6z_7kQftiGnq_mn4",
  authDomain: "ia-attendance.firebaseapp.com",
  projectId: "ia-attendance",
  storageBucket: "ia-attendance.appspot.com",
  messagingSenderId: "54801682275",
  appId: "1:54801682275:web:4f6d1f545f744edcbe4d56",
  measurementId: "G-6DCY63ZX8Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage};
