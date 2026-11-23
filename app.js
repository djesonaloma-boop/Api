// GENESIX - logique front partagée
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export const firebaseConfig = {
  apiKey: "AIzaSyA24pBo8mBWiZssPtep--MMBdB7c8_Lu4U",
  authDomain: "starlink-investit.firebaseapp.com",
  databaseURL: "https://starlink-investit-default-rtdb.firebaseio.com",
  projectId: "starlink-investit",
  storageBucket: "starlink-investit.firebasestorage.app",
  messagingSenderId: "807081599583",
  appId: "1:807081599583:web:e00ec3959bc4acdae031ea"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export function requireAuth(cb){
  onAuthStateChanged(auth, (u)=>{ if(!u) location.href="login.html"; else cb(u); });
}
export function logout(){ signOut(auth).then(()=> location.href="login.html"); }
