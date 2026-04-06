import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

import { Platform } from "react-native";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAHD8Pq_E6P3-OsGFKT1XeGadZRgjdI0WI",
  authDomain: "discipline-9caa8.firebaseapp.com",
  projectId: "discipline-9caa8",
  storageBucket: "discipline-9caa8.firebasestorage.app",
  messagingSenderId: "843560920662",
  appId: "1:843560920662:web:cd28a60678ca6c56937df7",
  measurementId: "G-3QBM376BFD"
};

const app = initializeApp(firebaseConfig);

export const db = Platform.OS === 'web'
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  : initializeFirestore(app, { localCache: persistentLocalCache({}) });

const persistence = Platform.OS === 'web' 
  ? browserLocalPersistence 
  : getReactNativePersistence(AsyncStorage);

export const auth = initializeAuth(app, {
  persistence: persistence
});