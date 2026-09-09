import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
try{
  const app = initializeApp({
    apiKey:"AIzaSyDjap_yLSsTk7xaOtj3gTekwstHcC_vP_8",
    authDomain:"rex-deutsch-b1-trainer.firebaseapp.com",
    projectId:"rex-deutsch-b1-trainer",
    storageBucket:"rex-deutsch-b1-trainer.firebasestorage.app",
    messagingSenderId:"737808923552",
    appId:"1:737808923552:web:140c1e7dbc318724ae82c5"
  });
  const auth=getAuth(app), db=getFirestore(app);
  try{ await setPersistence(auth, browserLocalPersistence); }catch(e){}
  window.cloud={
    signInGoogle: async ()=>{ const p=new GoogleAuthProvider();
      try{ await signInWithPopup(auth,p); }
      catch(e){ if(["auth/popup-blocked","auth/cancelled-popup-request","auth/popup-closed-by-user","auth/operation-not-supported-in-environment"].indexOf(e.code)>=0){ await signInWithRedirect(auth,p); } else throw e; } },
    signInEmail: (e,p)=>signInWithEmailAndPassword(auth,e,p),
    signUpEmail: (e,p)=>createUserWithEmailAndPassword(auth,e,p),
    signOutUser: ()=>signOut(auth),
    save: (uid,data)=>setDoc(doc(db,"users",uid),data),
    load: async (uid)=>{ const s=await getDoc(doc(db,"users",uid)); return s.exists()?s.data():null; }
  };
  try{ await getRedirectResult(auth); }catch(e){}
  onAuthStateChanged(auth,(u)=>{ if(window.onCloudUser) window.onCloudUser(u?{uid:u.uid,email:u.email,name:u.displayName}:null); });
  if(window.onCloudReady) window.onCloudReady();
}catch(e){ if(window.onCloudError) window.onCloudError(String((e&&e.message)||e)); }
