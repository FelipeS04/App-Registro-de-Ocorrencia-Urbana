import { initializeApp, getApp, getApps } from 'firebase/app';

import {
  initializeAuth,
  getAuth,
  getReactNativePersistence
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cole aqui os dados exibidos pelo Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyDso8ceg-rgdQ6Gm_43JFcGoDEgTAmMAho",
  authDomain: "ocorrencia-urbana.firebaseapp.com",
  projectId: "ocorrencia-urbana",
  storageBucket: "ocorrencia-urbana.firebasestorage.app",
  messagingSenderId: "555412587894",
  appId: "1:555412587894:web:86de1b2660b5b157b26657"
};

// Inicializa o Firebase.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Mantém a autenticação salva no dispositivo.
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

// Banco de dados online.
const db = getFirestore(app);

export { app, auth, db };