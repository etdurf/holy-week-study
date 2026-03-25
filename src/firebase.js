import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDaRPAtAECuaplJOlXoq1Cml1q2stm45ak",
  authDomain: "holy-week-study.firebaseapp.com",
  databaseURL: "https://holy-week-study-default-rtdb.firebaseio.com",
  projectId: "holy-week-study",
  storageBucket: "holy-week-study.firebasestorage.app",
  messagingSenderId: "888598533072",
  appId: "1:888598533072:web:29e860395be7ee17829fd5"
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { db, ref, onValue, set }