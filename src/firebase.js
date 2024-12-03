// Import Firebase funkcí
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Vaše Firebase konfigurace
const firebaseConfig = {
    apiKey: "AIzaSyDXFRXNK-ll-S7RAwWFrtp8SGKcQUiDEGY",
    authDomain: "pilltracker-1f471.firebaseapp.com",
    projectId: "pilltracker-1f471",
    storageBucket: "pilltracker-1f471.appspot.com",
    messagingSenderId: "783786517556",
    appId: "1:783786517556:web:06b4cee0aad26aab801661",
};

// Inicializace Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth
export const auth = getAuth(app);