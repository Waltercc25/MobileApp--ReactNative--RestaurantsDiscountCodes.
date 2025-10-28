// Configuración específica para React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtEPN68cD9qwaU766SsLhn8DuLyDIfTxY",
  authDomain: "reactnative-miapp.firebaseapp.com",
  projectId: "reactnative-miapp",
  storageBucket: "reactnative-miapp.firebasestorage.app",
  messagingSenderId: "362829829401",
  appId: "1:362829829401:web:177b7167d9cb55fbe62188"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Si ya está inicializado, obtener la instancia existente
  auth = getAuth(app);
}

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export { auth };
export default app;
