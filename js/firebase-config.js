// Firebase (compat SDK) — loaded after the firebase-app / auth / firestore scripts
const firebaseConfig = {
  apiKey: "AIzaSyCcKX264X2Ot-eTJdJ1VfwxH7nRe9xAjQc",
  authDomain: "school-website1.firebaseapp.com",
  projectId: "school-website1",
  storageBucket: "school-website1.firebasestorage.app",
  messagingSenderId: "190958816774",
  appId: "1:190958816774:web:45b69acb3092295d917d87",
  measurementId: "G-YC3C1LNZ9D"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
