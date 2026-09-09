/* ============================================================
   GESPRÄCH — AI conversation partner (local Ollama or Claude API)
   ============================================================ */
const CHAT_SYS=`Du bist ein freundlicher, geduldiger Gesprächspartner für jemanden, der Deutsch auf Niveau B1 lernt.
Regeln:
- Antworte IMMER auf Deutsch, in einfachen, natürlichen Sätzen (Niveau A2-B1).
- Halte Antworten KURZ: 1-3 Sätze. Stelle fast immer eine kleine Rückfrage, damit das Gespräch weiterläuft.
- Wenn die Person einen klaren Fehler macht, korrigiere ihn kurz und freundlich in Klammern, z. B. (Tipp: "ich bin gegangen"). Sei nicht streng und unterbrich den Gesprächsfluss nicht.
- Keine langen Texte, keine Aufzählungen, keine Emojis. Sprich wie ein echter Mensch im Alltag.
- Übersetze nur ins Englische, wenn ausdrücklich darum gebeten wird.`;
const SCENARIOS=[
 {id:"frei",   label:"Freies Gespräch", sys:"Führt ein lockeres, freies Gespräch über Alltagsthemen. Folge den Interessen der Person."},
 {id:"small",  label:"Small Talk",      sys:"Macht lockeren Small Talk: Wochenende, Wetter, Pläne, Hobbys."},
 {id:"cafe",   label:"Im Café",         sys:"Rollenspiel: Die Person ist Gast in einem Café, du bist die freundliche Bedienung. Nimm die Bestellung auf und plaudere ein wenig."},
 {id:"arzt",   label:"Beim Arzt",       sys:"Rollenspiel: Die Person ist Patient/in, du bist Ärztin/Arzt. Frag nach den Beschwerden und gib einfache Ratschläge."},
 {id:"reise",  label:"Reisen & Urlaub", sys:"Sprecht über Reisen, Urlaubspläne, Länder und Erlebnisse."},
 {id:"einkauf",label:"Einkaufen",       sys:"Rollenspiel: im Geschäft. Du bist Verkäufer/in, hilf beim Einkauf und frag nach Wünschen."},
 {id:"job",    label:"Arbeit & Alltag", sys:"Sprecht über Arbeit, Beruf, Tagesablauf und Alltag."},
];
const CLAUDE_MODELS=[["claude-haiku-4-5","Haiku 4.5 · schnell & günstig"],["claude-sonnet-5","Sonnet 5 · ausgewogen"],["claude-opus-5","Opus 5 · am stärksten"]];
let chat=null, chatRecog=null, chatRecording=false;

/* --- settings (localStorage only; the API key is NEVER synced to the cloud) --- */
function cGet(k,d){try{const v=localStorage.getItem(k);return v===null?d:v;}catch(e){return d;}}
function cSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function getProvider(){return cGet("db1_provider","local");}
function getOllamaUrl(){return (cGet("db1_ollamaUrl","http://localhost:11434")||"").replace(/\/+$/,"");}
function getOllamaModel(){return cGet("db1_ollamaModel","");}
function getClaudeKey(){return cGet("db1_key","");}
function getClaudeModel(){return cGet("db1_chatModel","claude-haiku-4-5");}
function getSpeakOn(){return cGet("db1_chatSpeak","1")!=="0";}
function providerReady(){return getProvider()==="local"?!!getOllamaModel():!!getClaudeKey();}
function shortModel(m){return (m||"").replace("claude-","").replace(/-/g," ");}
function providerLabel(){return getProvider()==="local"?("Lokal · "+(getOllamaModel()||"—")):("Claude · "+shortModel(getClaudeModel()));}

/* --- entry / lifecycle --- */
function openChat(scId){
  const sc=SCENARIOS.find(s=>s.id===scId)||SCENARIOS[0];
  chat={sc,topic:sc.label,sys:CHAT_SYS+"\n\nSituation: "+sc.sys,messages:[],busy:false,started:false,_shown:[]};
  section="vocab";
  if(!providerReady()){renderChatSetup();return;}
  renderChat(); primeChat();
}
function primeChat(){ if(!chat||chat.started)return; chat.started=true;
  chatTurn("(Beginne jetzt unser Gespräch: begrüße mich kurz auf Deutsch und stelle mir eine einfache Einstiegsfrage passend zur Situation.)",true); }
function chatNew(){ if(chat)openChat(chat.sc.id); }
function chatSwitch(scId){ if(chat&&chat.sc.id===scId)return; openChat(scId); }
function chatToggleSpeak(on){ cSet("db1_chatSpeak",on?"1":"0"); }

async function chatTurn(text,hidden){
  if(!chat||chat.busy)return;
  chat.messages.push({role:"user",content:text,hidden:!!hidden});
  chat.busy=true; renderChatBody();
  try{
    const reply=await chatComplete();
    chat.busy=false; chat.messages.push({role:"assistant",content:reply}); renderChatBody();
    if(getSpeakOn())speak(reply);
  }catch(e){
    chat.busy=false; chat.messages.push({role:"assistant",content:chatErrMsg(e),error:true}); renderChatBody();
  }
}
function chatSend(){
  const inp=$("chatInput"); if(!inp)return;
  const t=inp.value.trim(); if(!t||!chat||chat.busy)return;
  inp.value=""; inp.style.height="auto"; chatTurn(t,false);
}

/* --- provider calls --- */
async function chatComplete(){
  const msgs=chat.messages.map(m=>({role:m.role,content:m.content}));
  const local=getProvider()==="local";
  try{ return local?await ollamaComplete(msgs):await claudeComplete(msgs); }
  catch(e){ if(!e.provider)e.provider=local?"local":"claude"; throw e; }
}
async function ollamaComplete(msgs){
  // think:false -> reasoning models (Qwen3, R1 …) answer directly instead of
  // burning the token budget on a hidden <think> phase (would return empty content).
  const body={model:getOllamaModel(),stream:false,think:false,options:{temperature:0.7,num_predict:512},
    messages:[{role:"system",content:chat.sys},...msgs]};
  const res=await fetch(getOllamaUrl()+"/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok){const e=new Error("HTTP "+res.status);e.status=res.status;e.provider="local";throw e;}
  const data=await res.json();
  let txt=((data&&data.message&&data.message.content)||"").replace(/<think>[\s\S]*?<\/think>/gi,"").trim();
  return txt||"(keine Antwort vom lokalen Modell — versuch im ⚙ ein anderes Modell.)";
}
async function claudeComplete(msgs){
  const body={model:getClaudeModel(),max_tokens:400,system:chat.sys,messages:msgs};
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
    headers:{"content-type":"application/json","x-api-key":getClaudeKey(),
      "anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify(body)});
  if(!res.ok){let msg="HTTP "+res.status;try{const j=await res.json();if(j&&j.error&&j.error.message)msg=j.error.message;}catch(_){}
    const e=new Error(msg);e.status=res.status;e.provider="claude";throw e;}
  const data=await res.json();
  if(data.stop_reason==="refusal")return "Entschuldigung, darüber möchte ich nicht sprechen. Lass uns das Thema wechseln — erzähl mir etwas anderes!";
  return ((data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("")).trim()||"(keine Antwort)";
}
function chatErrMsg(e){
  const s=e&&e.status, p=e&&e.provider;
  if(p==="local"){
    if(!s)return "⚠️ Ich konnte dein lokales Ollama nicht erreichen. Läuft es? Und ist diese Seite in OLLAMA_ORIGINS erlaubt? Tippe auf das Zahnrad für Hilfe.";
    if(s===404)return "⚠️ Modell nicht gefunden. Wähle im Zahnrad ein installiertes Modell.";
    return "⚠️ Lokaler Fehler (HTTP "+s+"). Prüfe Ollama im Zahnrad.";
  }
  if(s===401)return "⚠️ API-Schlüssel ungültig. Bitte im Zahnrad prüfen.";
  if(s===429)return "⚠️ Zu viele Anfragen — kurz warten und noch einmal versuchen.";
  if(s===400)return "⚠️ Anfrage-Fehler: "+(e.message||"");
  if(s===529||s===503)return "⚠️ Server überlastet — bitte gleich noch einmal.";
  if(!s)return "⚠️ Keine Verbindung. Bist du online?";
  return "⚠️ Fehler (HTTP "+s+"). "+(e.message||"");
}

/* --- speech input (STT) --- */
function autosize(el){el.style.height="auto";el.style.height=Math.min(el.scrollHeight,120)+"px";}
function setMicUI(){const b=$("micBtn");if(b)b.classList.toggle("rec",chatRecording);const inp=$("chatInput");if(inp)inp.placeholder=chatRecording?"Ich höre zu…":"Schreib oder sprich auf Deutsch…";}
function chatMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast("Spracheingabe wird in diesem Browser nicht unterstützt.");return;}
  if(chatRecording){try{chatRecog&&chatRecog.stop();}catch(e){}return;}
  try{
    chatRecog=new SR(); chatRecog.lang="de-DE"; chatRecog.interimResults=true; chatRecog.maxAlternatives=1; chatRecog.continuous=false;
    chatRecording=true; setMicUI(); let finalT="";
    chatRecog.onresult=(ev)=>{let interim="";
      for(let i=ev.resultIndex;i<ev.results.length;i++){const r=ev.results[i];if(r.isFinal)finalT+=r[0].transcript;else interim+=r[0].transcript;}
      const inp=$("chatInput");if(inp){inp.value=(finalT+" "+interim).trim();autosize(inp);}};
    chatRecog.onerror=()=>{chatRecording=false;setMicUI();};
    chatRecog.onend=()=>{chatRecording=false;setMicUI();const inp=$("chatInput");if(inp&&inp.value.trim())chatSend();};
    chatRecog.start();
  }catch(e){chatRecording=false;setMicUI();toast("Mikrofon konnte nicht gestartet werden.");}
}

/* --- rendering --- */
function chatHeader(){
  return `<div class="chathead">
    <button class="iconbtn" onclick="showSection('vocab')" title="Zurück">${svgi('back')}</button>
    <div class="chatteel"><b>Gespräch</b><span>${esc(chat?chat.topic:"")}</span></div>
    <button class="iconbtn" onclick="chatNew()" title="Neues Gespräch">${svgi('bolt')}</button>
    <button class="iconbtn" onclick="renderChatSetup()" title="Einstellungen">${svgi('gear')}</button>
  </div>`;
}
function chatBar(){
  const chips=SCENARIOS.map(s=>`<button class="chip${chat&&chat.sc.id===s.id?' on':''}" onclick="chatSwitch('${s.id}')">${esc(s.label)}</button>`).join("");
  return `<div class="chatchips">${chips}</div>
  <div class="chatbar">
    <button class="micbtn" id="micBtn" onclick="chatMic()" title="Sprechen">${svgi('mic')}</button>
    <textarea id="chatInput" class="chatinput" rows="1" placeholder="Schreib oder sprich auf Deutsch…" oninput="autosize(this)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();chatSend();}"></textarea>
    <button class="sendbtn" onclick="chatSend()" title="Senden">${svgi('send')}</button>
  </div>
  <div class="chatfoot">
    <label class="speaktog"><input type="checkbox" id="speakTog" ${getSpeakOn()?'checked':''} onchange="chatToggleSpeak(this.checked)"> ${svgi('speaker')} Antworten vorlesen</label>
    <span class="provtag">${esc(providerLabel())}</span>
  </div>`;
}
function renderChat(){
  $("view-chat").innerHTML=chatHeader()+`<div class="chatmsgs" id="chatmsgs"></div>`+chatBar();
  renderChatBody(); showView("chat");
  const inp=$("chatInput"); if(inp)inp.focus();
}
function chatFmt(s){return esc(s).replace(/\n/g,"<br>");}
function renderChatBody(){
  const box=$("chatmsgs"); if(!box||!chat)return;
  const shown=chat.messages.filter(m=>!m.hidden); chat._shown=shown;
  let h="";
  if(!shown.length&&!chat.busy){
    h=`<div class="chatempty">${svgi('chat')}<p>Sag „Hallo" oder wähle unten ein Thema. Ich antworte auf einfachem Deutsch und helfe dir beim Reden.</p></div>`;
  }
  shown.forEach((m,i)=>{
    if(m.role==="user")h+=`<div class="crow u"><div class="cbub user">${chatFmt(m.content)}</div></div>`;
    else h+=`<div class="crow a"><div class="cbub ai${m.error?' err':''}">${chatFmt(m.content)}${m.error?'':`<button class="cbspeak" title="Vorlesen" onclick="speakBub(${i})">${svgi('speaker')}</button>`}</div></div>`;
  });
  if(chat.busy)h+=`<div class="crow a"><div class="cbub ai typing"><span></span><span></span><span></span></div></div>`;
  box.innerHTML=h; box.scrollTop=box.scrollHeight;
}
function speakBub(i){const m=chat&&chat._shown&&chat._shown[i]; if(m)speak(m.content);}

/* --- setup / settings screen --- */
function setProvider(p){cSet("db1_provider",p);renderChatSetup();}
function renderChatSetup(){
  const prov=getProvider();
  $("view-chat").innerHTML=chatHeader()+`<div class="chatsetup"><div class="setcard">
    <div class="eyebrow">Gesprächspartner</div>
    <h2 class="seth">Wie soll dein KI-Partner antworten?</h2>
    <p class="setp">Für ein echtes Gespräch braucht die App ein Sprachmodell. Wähle eine Quelle — bei „Lokal" bleibt alles auf deinem Rechner und ist kostenlos.</p>
    <div class="provseg">
      <button class="pv${prov==='local'?' on':''}" onclick="setProvider('local')">${svgi('cpu')} Lokal (Ollama)<small>kostenlos · privat</small></button>
      <button class="pv${prov==='claude'?' on':''}" onclick="setProvider('claude')">${svgi('brain')} Claude API<small>eigener Schlüssel</small></button>
    </div>
    ${prov==='local'?localSetup():claudeSetup()}
  </div></div>`;
  showView("chat");
  if(prov==='local')chatDetectOllama();
}
function localSetup(){
  return `<div class="setblock">
    <label class="setlab">Ollama-Adresse</label>
    <input class="setinput" id="ollamaUrl" value="${esc(getOllamaUrl())}" placeholder="http://localhost:11434">
    <p class="setmini">Am Handy erreichst du localhost nicht — nimm die LAN-IP deines PCs (z. B. <code>http://192.168.1.20:11434</code>) und starte Ollama mit <code>OLLAMA_HOST=0.0.0.0</code>.</p>
    <div class="row" style="margin:12px 0"><button class="btn dark" onclick="chatDetectOllama()">${svgi('bolt')} Verbindung prüfen</button><span id="ollamaStatus" class="setstat">…</span></div>
    <label class="setlab">Modell</label>
    <select class="setinput" id="ollamaModel"><option value="">— erst verbinden —</option></select>
    <div class="hintbox" id="ollamaHint" style="display:none"></div>
    <button class="btn sun wide" style="margin-top:16px" onclick="saveLocalSetup()">${svgi('check')} Speichern &amp; starten</button>
  </div>`;
}
function claudeSetup(){
  const cur=getClaudeModel();
  return `<div class="setblock">
    <label class="setlab">Claude API-Schlüssel</label>
    <input class="setinput" id="claudeKey" type="password" value="${esc(getClaudeKey())}" placeholder="sk-ant-…">
    <p class="setmini">Wird nur in diesem Browser gespeichert — nie hochgeladen, nie mit der Cloud synchronisiert. Schlüssel bekommst du auf <code>console.anthropic.com</code>.</p>
    <label class="setlab">Modell</label>
    <select class="setinput" id="claudeModel">${CLAUDE_MODELS.map(m=>`<option value="${m[0]}"${m[0]===cur?' selected':''}>${esc(m[1])}</option>`).join("")}</select>
    <button class="btn sun wide" style="margin-top:16px" onclick="saveClaudeSetup()">${svgi('check')} Speichern &amp; starten</button>
  </div>`;
}
async function chatDetectOllama(){
  const urlInp=$("ollamaUrl"); if(urlInp)cSet("db1_ollamaUrl",urlInp.value.trim().replace(/\/+$/,""));
  const stat=$("ollamaStatus"),sel=$("ollamaModel"),hint=$("ollamaHint");
  if(stat){stat.textContent="Suche…";stat.className="setstat";}
  try{
    const ctrl=new AbortController(),to=setTimeout(()=>ctrl.abort(),4000);
    const res=await fetch(getOllamaUrl()+"/api/tags",{signal:ctrl.signal}); clearTimeout(to);
    if(!res.ok)throw new Error("HTTP "+res.status);
    const data=await res.json(), models=(data.models||[]).map(m=>m.name);
    if(sel)sel.innerHTML=models.length?models.map(n=>`<option value="${esc(n)}"${n===getOllamaModel()?' selected':''}>${esc(n)}</option>`).join(""):`<option value="">— keine Modelle —</option>`;
    if(stat){stat.textContent=models.length?("✓ "+models.length+" Modell(e) gefunden"):"verbunden, aber keine Modelle";stat.className="setstat ok";}
    if(hint){if(!models.length){hint.style.display="block";hint.innerHTML="Lade zuerst ein Modell, z. B. <code>ollama pull llama3.1</code> — dann erneut prüfen.";}else hint.style.display="none";}
  }catch(e){
    if(stat){stat.textContent="✗ nicht erreichbar";stat.className="setstat bad";}
    if(sel)sel.innerHTML=`<option value="">— erst verbinden —</option>`;
    if(hint){hint.style.display="block";hint.innerHTML=`Ollama läuft nicht oder blockiert diese Seite. Einmalig erlauben:<br><code>setx OLLAMA_ORIGINS "*"</code><br>Danach Ollama neu starten (Tray-Icon → Quit, dann neu öffnen). Geprüfte Adresse: <code>${esc(getOllamaUrl())}</code><br><br>Tipp: Über die Online-Adresse blockiert Chrome lokale Verbindungen manchmal. Am zuverlässigsten für lokale Modelle: die App direkt auf diesem PC öffnen — oder auf dem Handy die Claude-Option nutzen.`;}
  }
}
function saveLocalSetup(){
  const url=$("ollamaUrl"),sel=$("ollamaModel");
  if(url)cSet("db1_ollamaUrl",url.value.trim().replace(/\/+$/,""));
  const m=sel?sel.value:""; if(!m){toast("Bitte zuerst verbinden und ein Modell wählen.");return;}
  cSet("db1_ollamaModel",m); cSet("db1_provider","local"); startChatAfterSetup();
}
function saveClaudeSetup(){
  const k=$("claudeKey"),sel=$("claudeModel"),key=k?k.value.trim():"";
  if(!key){toast("Bitte deinen Claude API-Schlüssel eingeben.");return;}
  cSet("db1_key",key); if(sel)cSet("db1_chatModel",sel.value); cSet("db1_provider","claude"); startChatAfterSetup();
}
function startChatAfterSetup(){
  if(!chat){openChat("frei");return;}
  renderChat(); if(!chat.started)primeChat();
}
