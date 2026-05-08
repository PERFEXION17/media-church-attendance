// 1. Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDX0N_u-lkcnvQy03mOvZO_uWvfHQxdc_0",
  authDomain: "media-church-student-hub.firebaseapp.com",
  projectId: "media-church-student-hub",
  storageBucket: "media-church-student-hub.firebasestorage.app",
  messagingSenderId: "58638852641",
  appId: "1:58638852641:web:25ed342ef1054f0101b960",
};

// 2. Initialize Firebase using the global 'firebase' object
// (This object is provided by the -compat.js scripts in your HTML)
firebase.initializeApp(firebaseConfig);

// 3. Initialize the specific tools we need
const db = firebase.firestore();
const auth = firebase.auth();
