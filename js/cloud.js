/* ============================================================
   Cloud-Sync (optional) — Firebase Auth + Firestore bridge
   ============================================================ */
let cloudUser=null, cloudReady=false, cloudBroken=false, pushT=null;
function schedulePush(){ if(cloudUser&&cloudReady&&window.cloud){ clearTimeout(pushT); pushT=setTimeout(pushCloudNow,1500);} }
async function pushCloudNow(){ if(!(cloudUser&&window.cloud))return; try{ store.updatedAt=Date.now(); await window.cloud.save(cloudUser.uid,{data:store,updatedAt:store.updatedAt}); }catch(e){} }
function mergeStores(a,b){
  const A=a||{},B=b||{}; const newer=((B.updatedAt||0)>=(A.updatedAt||0))?B:A; const m=blankStore();
  m.answered=Math.max(A.answered||0,B.answered||0); m.correct=Math.max(A.correct||0,B.correct||0);
  m.bestStreak=Math.max(A.bestStreak||0,B.bestStreak||0); m.streak=newer.streak||0; m.vstreak=Math.max(A.vstreak||0,B.vstreak||0);
  m.diff=newer.diff||"m";
  m.seen=Object.assign({},A.seen,B.seen); m.mistakes=Object.assign({},A.mistakes,B.mistakes); m.lessons=Object.assign({},A.lessons,B.lessons);
  m.examBest=Object.assign({},A.examBest); const be=B.examBest||{}; for(const k in be)m.examBest[k]=Math.max(m.examBest[k]||0,be[k]||0);
  ["e","m","h"].forEach(l=>{const ap=(A.perf&&A.perf[l])||{a:0,c:0},bp=(B.perf&&B.perf[l])||{a:0,c:0}; m.perf[l]={a:Math.max(ap.a||0,bp.a||0),c:Math.max(ap.c||0,bp.c||0)};});
  m.recent=(newer.recent&&newer.recent.e)?newer.recent:{e:[],m:[],h:[]};
  m.vocab=Object.assign({},A.vocab); const bv=B.vocab||{};
  for(const id in bv){ const x=bv[id],y=m.vocab[id];
    if(!y){m.vocab[id]=x;}
    else{ const keep=((x.box||0)>(y.box||0)||((x.box||0)===(y.box||0)&&(x.due||0)>(y.due||0)))?x:y;
      m.vocab[id]={box:keep.box||0,due:Math.max(x.due||0,y.due||0),seen:Math.max(x.seen||0,y.seen||0),correct:Math.max(x.correct||0,y.correct||0)};}
  }
  m.updatedAt=Math.max(A.updatedAt||0,B.updatedAt||0); return m;
}
window.onCloudReady=function(){ cloudReady=true; updateAuthUI(); };
window.onCloudError=function(){ cloudReady=true; cloudBroken=true; updateAuthUI(); };
window.onCloudUser=async function(u){
  cloudUser=u; updateAuthUI();
  if(u){ closeModal(); const b=$("authBtn"); if(b)b.classList.add("syncing");
    try{ const remote=await window.cloud.load(u.uid);
      if(remote&&remote.data){ store=mergeStores(store,remote.data); DIFF=store.diff||DIFF; }
      saveStoreLocal(); await pushCloudNow(); toast("Fortschritt synchronisiert ☁");
    }catch(e){ toast("Sync-Fehler – lokal gespeichert"); }
    if(b)b.classList.remove("syncing"); updateAuthUI(); refreshCurrent();
  }
};
function refreshCurrent(){ if(["view-quiz","view-vgame","view-exam","view-lesson","view-chat"].some(v=>$(v).classList.contains("on")))return; goHome(); }
function updateAuthUI(){ const b=$("authBtn"); if(!b)return;
  if(cloudUser){ const ini=(((cloudUser.email||cloudUser.name||"?").trim()[0])||"?").toUpperCase();
    b.innerHTML=`<span style="font-family:var(--font-display);font-weight:900;font-size:16px">${esc(ini)}</span>`;
    b.classList.add("signed"); b.title="Konto: "+(cloudUser.email||cloudUser.name||""); }
  else{ b.innerHTML=svgi("cloud"); b.classList.remove("signed"); b.title="Fortschritt geräteübergreifend speichern"; }
}
function openAuth(){
  if(cloudUser){ $("overlay").innerHTML=`<div class="modal"><div class="mi" style="background:var(--grass)">${svgi('cloud')}</div>
    <h2>Angemeldet</h2><p>Dein Fortschritt wird automatisch auf allen Geräten gespeichert.<br><b>${esc(cloudUser.email||cloudUser.name||'Konto')}</b></p>
    <div class="mbtns"><button class="btn ghost" onclick="doSignOut()">Abmelden</button><button class="btn" onclick="closeModal()">Fertig</button></div></div>`;
    $("overlay").style.display="grid"; return; }
  if(!cloudReady){ toast("Cloud lädt noch – kurz warten…"); return; }
  if(cloudBroken||!window.cloud){ toast("Cloud nicht verfügbar (offline?). Fortschritt bleibt lokal gespeichert."); return; }
  $("overlay").innerHTML=`<div class="modal"><div class="mi" style="background:var(--sky)">${svgi('cloud')}</div>
    <h2>Fortschritt speichern</h2><p>Optional: Melde dich an, um deinen Fortschritt auf <b>Handy und Laptop</b> zu synchronisieren. Ohne Anmeldung wird alles nur auf diesem Gerät gespeichert.</p>
    <div class="mbtns"><button class="btn authgoogle wide" onclick="doGoogle()">${svgi('google')} Mit Google anmelden</button></div>
    <div class="ordiv">— oder mit E-Mail —</div>
    <input class="answer" id="authEmail" type="email" autocomplete="email" placeholder="E-Mail">
    <input class="answer" id="authPw" type="password" autocomplete="current-password" placeholder="Passwort (min. 6 Zeichen)">
    <div id="authErr" style="color:var(--flame2);font-size:12.5px;margin-top:6px"></div>
    <div class="mbtns" style="margin-top:12px"><button class="btn" onclick="doEmail(false)">Anmelden</button><button class="btn ghost" onclick="doEmail(true)">Registrieren</button></div>
    <button class="btn ghost wide" style="margin-top:14px" onclick="closeModal()">Ohne Anmeldung weiter</button></div>`;
  $("overlay").style.display="grid";
}
async function doGoogle(){ authErr(""); try{ await window.cloud.signInGoogle(); }catch(e){ authErr(authMsg(e)); } }
async function doEmail(signup){ authErr(""); const em=(($("authEmail")||{}).value||"").trim(), pw=(($("authPw")||{}).value||"");
  if(!em||pw.length<6){ authErr("Bitte E-Mail und ein Passwort mit min. 6 Zeichen eingeben."); return; }
  try{ if(signup) await window.cloud.signUpEmail(em,pw); else await window.cloud.signInEmail(em,pw); }catch(e){ authErr(authMsg(e)); }
}
function authErr(m){ const el=$("authErr"); if(el)el.textContent=m; }
function authMsg(e){ const c=(e&&e.code)||"";
  if(c.indexOf("operation-not-allowed")>=0)return "Diese Anmeldeart ist noch nicht aktiviert (Firebase-Konsole → Authentication).";
  if(c.indexOf("popup")>=0)return "Popup-Problem – bitte erneut versuchen oder E-Mail nutzen.";
  if(c.indexOf("email-already-in-use")>=0)return "E-Mail ist schon registriert – bitte 'Anmelden'.";
  if(c.indexOf("invalid-credential")>=0||c.indexOf("wrong-password")>=0)return "E-Mail oder Passwort falsch.";
  if(c.indexOf("user-not-found")>=0)return "Kein Konto gefunden – bitte 'Registrieren'.";
  if(c.indexOf("invalid-email")>=0)return "Ungültige E-Mail-Adresse.";
  if(c.indexOf("weak-password")>=0)return "Passwort zu schwach (min. 6 Zeichen).";
  if(c.indexOf("network")>=0)return "Netzwerkfehler – bist du online?";
  return "Fehler: "+((e&&e.message)||c||"unbekannt");
}
function doSignOut(){ try{ if(window.cloud)window.cloud.signOutUser(); }catch(e){} cloudUser=null; updateAuthUI(); closeModal(); toast("Abgemeldet – Fortschritt bleibt auf diesem Gerät."); }

/* ---------- static nav labels ---------- */
$("nav-lernen").innerHTML=svgi('grad')+"<span>Lernen</span>";
$("nav-grammar").innerHTML=svgi('quiz')+"<span>Grammatik</span>";
$("nav-vocab").innerHTML=svgi('brain')+"<span>Vokabeln</span>";
$("nav-pruefung").innerHTML=svgi('doc')+"<span>Prüfung</span>";
$("themeBtn").innerHTML=(localStorage.getItem("db1_theme")||"light")==="dark"?svgi('sun'):svgi('moon');
$("q-close").innerHTML=svgi('x'); $("v-close").innerHTML=svgi('x');
$("mi-exam").innerHTML=svgi('exam'); $("mi-bolt").innerHTML=svgi('bolt'); $("mi-target").innerHTML=svgi('target');
updateAuthUI();
setTimeout(function(){ if(!cloudReady){ cloudReady=true; cloudBroken=true; updateAuthUI(); } }, 7000);
