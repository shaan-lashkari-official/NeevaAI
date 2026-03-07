import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAn2Z_JYjrf08rNkrwk-KdVW2NYWaCK1VM",
  authDomain: "neeva-ai-4b521.firebaseapp.com",
  projectId: "neeva-ai-4b521",
  storageBucket: "neeva-ai-4b521.firebasestorage.app",
  messagingSenderId: "593466284457",
  appId: "1:593466284457:web:79511c171295e0febb8cb8",
  measurementId: "G-P4T4SF8WM4",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
