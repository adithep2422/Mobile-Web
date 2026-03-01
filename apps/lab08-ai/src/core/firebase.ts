import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD14IAFZYdaSp4Y4vOHn5nCk3LATjo9JTo",
  authDomain: "ionic-expense-916b6.firebaseapp.com",
  projectId: "ionic-expense-916b6",
  appId: "1:108489441792:web:8c9a7b0e5c8d2f1b9e4c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { app };