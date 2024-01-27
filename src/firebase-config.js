import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCz00G2itCIFIQxrxuLivqX5_JqHKQSa8E",
  authDomain: "aceuni-dbc87.firebaseapp.com",
  projectId: "aceuni-dbc87",
  storageBucket: "aceuni-dbc87.appspot.com",
  messagingSenderId: "37587862389",
  appId: "1:37587862389:web:0919fe4e3c299d12cac93c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);