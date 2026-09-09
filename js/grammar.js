/* ============================================================
   GRAMMAR
   ============================================================ */
let session=null;
function setDiff(l){DIFF=l;saveStore();renderHome();}
function renderHome(){
  document.querySelectorAll("#diffSeg button").forEach(b=>b.classList.toggle("on",b.getAttribute("data-l")===DIFF));
  const total=countAt(DIFF);
  $("diffHint").innerHTML=`<b>${LV[DIFF].name}</b> · <b>${total}</b> Fragen`+(LV[DIFF].next?` · alles richtig? Der Trainer schlägt automatisch <b>${LV[LV[DIFF].next].name}</b> vor.`:` · höchste Stufe.`);
  $("s-answered").textContent=store.answered; $("s-correct").textContent=store.correct;
  $("s-acc").textContent=store.answered?Math.round(store.correct/store.answered*100)+"%":"–";
  $("s-streak").textContent=store.streak; $("qTotal").textContent=DATA.length;
  $("mistakeCount").textContent=Object.keys(store.mistakes).length+" offen";
  const grid=$("topicGrid");grid.innerHTML="";
  TOPICS.forEach(t=>{
    const n=countAt(DIFF,t.id), all=DATA.filter(q=>q.topic===t.id), done=all.filter(q=>store.seen[q.id]).length;
    const pct=all.length?Math.round(done/all.length*100):0;
    const el=document.createElement("div");el.className="tile"+(n===0?" empty":"");
    if(n>0)el.onclick=()=>startTopic(t.id);
    el.innerHTML=`<div class="ab" style="background:${t.col}">${esc(t.ab)}</div>
      <div class="tmeta"><div class="tname">${esc(t.name)}</div><div class="tsub">${esc(t.blurb)}</div>
      <div class="tbar"><i style="width:${pct}%"></i></div></div>
      <div class="tbadge">${n}<br>${LV[DIFF].name}</div>`;
    grid.appendChild(el);
  });
  showView("home");
}
function startTopic(id){let pool=poolFor(id);if(pool.length===0){pool=DATA.filter(q=>q.topic===id);toast("Keine Fragen auf dieser Stufe – zeige alle");}
  session={mode:"practice",respectDiff:true,list:draw(pool,PRACTICE_N),idx:0,answers:{},score:0,topic:id,suggested:false};renderQuiz();}
function startRandom(){let pool=poolFor(null);if(!pool.length)pool=DATA.slice();
  session={mode:"practice",respectDiff:true,list:draw(pool,PRACTICE_N),idx:0,answers:{},score:0,topic:null,suggested:false};renderQuiz();}
function startExam(n){let pool=poolFor(null);if(pool.length<n)pool=DATA.slice();
  const byT={};shuffle(pool).forEach(q=>(byT[q.topic]=byT[q.topic]||[]).push(q));
  const ps=Object.values(byT);let pick=[],i=0;
  while(pick.length<n){let added=false;for(const p of ps){if(p[i]){pick.push(p[i]);added=true;if(pick.length>=n)break;}}if(!added)break;i++;}
  session={mode:"exam",respectDiff:true,list:shuffle(pick).slice(0,n),idx:0,answers:{},score:0,topic:null,suggested:false};renderQuiz();}
function startMistakes(){const qs=DATA.filter(q=>store.mistakes[q.id]);if(!qs.length){toast("Super – keine offenen Fehler!");return;}
  session={mode:"practice",respectDiff:false,list:shuffle(qs).slice(0,PRACTICE_N),idx:0,answers:{},score:0,topic:null,suggested:false};renderQuiz();}

function renderQuiz(){
  const s=session,q=s.list[s.idx];
  $("pbar").style.width=(s.idx/s.list.length*100)+"%"; $("qcount").textContent=(s.idx+1)+" / "+s.list.length;
  const b=$("lvBadge");b.className="lvbadge "+q.lvl;b.textContent=LV[q.lvl].name;
  const nH=$("topicNote"); nH.innerHTML=(s.mode==="practice"&&s.topic&&TOPIC_NOTE[q.topic])?`<div class="note"><b>Merke:</b> ${fmt(TOPIC_NOTE[q.topic])}</div>`:"";
  const tName=(TOPICS.find(t=>t.id===q.topic)||{}).name||"";
  const tl={mc:"Multiple Choice",fill:"Eintragen",transform:"Umformen"}[q.type]||"";
  const prev=s.answers[q.id];
  let h=`<div class="card"><div class="tagrow"><span class="tag">${esc(tName)}</span><span class="qtype">${tl}</span></div>
    <div class="qtext">${fmt(q.q)}</div>${q.hint?`<div class="qhint">${fmt(q.hint)}</div>`:""}`;
  if(q.type==="mc"){const opts=q._opts||(q._opts=shuffle(q.options));h+=`<div class="options" id="opts">`;
    opts.forEach((o,i)=>{h+=`<button class="opt" data-val="${esc(o)}" onclick="pickMC(this)"><span class="key">${String.fromCharCode(65+i)}</span><span>${fmt(o)}</span></button>`;});h+=`</div>`;
  }else{const val=prev?esc(prev.value):"";h+=`<div style="margin-top:18px"><input class="answer" id="answerInput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Antwort eingeben…" value="${val}" onkeydown="if(event.key==='Enter')submitFill()"></div>`;}
  h+=`<div id="feedback"></div><div class="quizfoot"><span class="kbd">${q.type==='mc'?'Klicke eine Option':'<b>Enter</b> zum Prüfen'}</span><div class="row" id="footBtns"></div></div></div>`;
  $("qhost").innerHTML=h; renderFootButtons(); showView("quiz");
  if(q.type!=="mc"){const inp=$("answerInput");if(inp&&!prev)setTimeout(()=>inp.focus(),60);}
  if(prev)restoreAnswered();
}
function renderFootButtons(){const s=session,q=s.list[s.idx],host=$("footBtns");host.innerHTML="";const answered=!!s.answers[q.id];
  if(q.type!=="mc"&&!answered){const b=document.createElement("button");b.className="btn";b.textContent="Prüfen";b.onclick=submitFill;host.appendChild(b);}
  if(answered||s.mode==="exam"){const last=s.idx===s.list.length-1;const b=document.createElement("button");b.className="btn dark";
    b.innerHTML=(last?(s.mode==="exam"?"Auswerten":"Fertig"):"Weiter")+" "+svgi('arrow');b.onclick=next;
    if(s.mode==="exam"&&!answered&&q.type!=="mc")b.onclick=()=>{storeExamFill();next();};host.appendChild(b);}}
function afterAnswer(q,ok){recordAnswer(q,ok);trackLevel(q,ok);if(session.mode!=="exam")maybeSuggestLevelUp();}
function pickMC(btn){const s=session,q=s.list[s.idx];if(s.answers[q.id])return;
  const val=btn.getAttribute("data-val"),ok=norm(val)===norm(q.answer);s.answers[q.id]={value:val,ok};if(ok)s.score++;afterAnswer(q,ok);
  if(s.mode==="exam"){document.querySelectorAll("#opts .opt").forEach(o=>{o.disabled=true;if(norm(o.getAttribute("data-val"))===norm(val))o.classList.add("picked");});renderFootButtons();return;}
  document.querySelectorAll("#opts .opt").forEach(o=>{o.disabled=true;const ov=o.getAttribute("data-val");if(norm(ov)===norm(q.answer))o.classList.add("correct");else if(o===btn)o.classList.add("wrong");});
  showFeedback(ok,q,val);renderFootButtons();}
function submitFill(){const s=session,q=s.list[s.idx];if(s.answers[q.id])return;const inp=$("answerInput"),val=inp.value;const res=judge(val,q.accept);
  s.answers[q.id]={value:val,ok:res.ok,level:res.level};if(res.ok)s.score++;afterAnswer(q,res.ok);
  inp.classList.add(res.ok?"correct":"wrong");inp.disabled=true;showFeedback(res.ok,q,val,res);renderFootButtons();}
function storeExamFill(){const s=session,q=s.list[s.idx];if(s.answers[q.id])return;const inp=$("answerInput"),val=inp?inp.value:"";const res=judge(val,q.accept);
  s.answers[q.id]={value:val,ok:res.ok,level:res.level};if(res.ok)s.score++;afterAnswer(q,res.ok);}
function showFeedback(ok,q,val,res){const canon=q.type==="mc"?q.answer:q.accept[0];let ns="";
  if(ok&&res&&res.level==="close")ns=`<div class="sol" style="color:var(--muted)">Standardschreibweise: <b style="color:var(--ink)">${esc(res.canonical)}</b></div>`;
  const sol=ok?ns:`<div class="sol">Richtig: <b class="right">${esc(canon)}</b>${(q.accept&&q.accept.length>1)?` <span style="color:var(--muted)">(auch: ${q.accept.slice(1).map(esc).join(", ")})</span>`:""}</div>`;
  $("feedback").innerHTML=`<div class="feedback ${ok?'ok':'no'}"><div class="fhead">${ok?'Richtig':'Nicht ganz'}</div>${sol}${q.explain?`<div class="exp"><b>Warum:</b> ${fmt(q.explain)}</div>`:""}</div>`;}
function restoreAnswered(){const s=session,q=s.list[s.idx],a=s.answers[q.id];
  if(q.type==="mc"){document.querySelectorAll("#opts .opt").forEach(o=>{o.disabled=true;const ov=o.getAttribute("data-val");
    if(s.mode!=="exam"){if(norm(ov)===norm(q.answer))o.classList.add("correct");else if(norm(ov)===norm(a.value))o.classList.add("wrong");}else if(norm(ov)===norm(a.value))o.classList.add("picked");});}
  else{const inp=$("answerInput");if(inp){inp.disabled=true;if(s.mode!=="exam")inp.classList.add(a.ok?"correct":"wrong");}}
  if(s.mode!=="exam")showFeedback(a.ok,q,a.value,{level:a.level});renderFootButtons();}
function next(){const s=session;if(s.idx<s.list.length-1){s.idx++;renderQuiz();}else renderResult();}

function maybeSuggestLevelUp(){const s=session;if(s.suggested||!s.respectDiff)return;const nx=LV[DIFF].next;if(!nx)return;
  const r=store.recent[DIFF];if(r.length>=10){const c=r.filter(Boolean).length;if(c/r.length>=0.9){s.suggested=true;showLevelUpModal(c,r.length,nx);}}}
function showLevelUpModal(c,t,nx){$("overlay").innerHTML=`<div class="modal"><div class="mi">${svgi('rocket')}</div>
  <h2>Stark, weiter so!</h2><p>Du hast <b>${c} von ${t}</b> Fragen auf Stufe <b>${LV[DIFF].name}</b> richtig.<br>Auf <b>${LV[nx].name}</b> hochstufen?</p>
  <div class="mbtns"><button class="btn" onclick="acceptLevelUp('${nx}')">Ja, hochstufen</button><button class="btn ghost" onclick="declineLevelUp()">Später</button></div></div>`;
  $("overlay").style.display="grid";}
function acceptLevelUp(nx){store.recent[DIFF]=[];DIFF=nx;saveStore();closeModal();const b=$("lvBadge");b.className="lvbadge "+DIFF;b.textContent=LV[DIFF].name;toast("Neue Stufe: "+LV[DIFF].name);}
function declineLevelUp(){store.recent[DIFF]=[];saveStore();closeModal();}
function closeModal(){const o=$("overlay");o.style.display="none";o.innerHTML="";}
let toastT=null;
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),2500);}

function renderResult(){const s=session,total=s.list.length,correct=s.score,pct=Math.round(correct/total*100);
  let vd,em;if(pct>=90){vd="Ausgezeichnet!";em='trophy';}else if(pct>=75){vd="Sehr gut!";em='flame';}else if(pct>=60){vd="Bestanden.";em='check';}else if(pct>=40){vd="Weiter üben!";em='brain';}else{vd="Nicht aufgeben!";em='book';}
  let up="";const nx=LV[DIFF].next;
  if(s.respectDiff&&nx&&total>=6&&pct>=85)up=`<div class="levelup"><h3>Bereit für mehr?</h3><p>Auf Stufe <b>${LV[DIFF].name}</b> warst du top (${pct}%). Probier die nächste Stufe.</p><button class="btn" onclick="resultLevelUp('${nx}')">Auf ${LV[nx].name} hochstufen ${svgi('arrow')}</button></div>`;
  const toRev=s.list.filter(q=>!s.answers[q.id]||!s.answers[q.id].ok);let rev="";
  if(toRev.length){rev=`<div class="rev"><div class="eyebrow" style="margin-top:6px">Zu wiederholen (${toRev.length})</div>`;
    toRev.forEach(q=>{const a=s.answers[q.id],canon=q.type==="mc"?q.answer:q.accept[0];
      rev+=`<div class="revitem"><div class="rq">${fmt(q.q)}</div><div class="ra"><span class="yours">Du: ${a&&a.value?esc(a.value):"(leer)"}</span> · <span class="right">Richtig: ${esc(canon)}</span></div>${q.explain?`<div class="rexp">${fmt(q.explain)}</div>`:""}</div>`;});rev+=`</div>`;}
  $("view-result").innerHTML=`<div class="result"><div class="rico" style="width:60px;height:60px;margin:6px auto;border:var(--bd);border-radius:15px;display:grid;place-items:center;background:var(--flame);color:#fff">${svgi(em)}</div>
    <div class="ring" style="--p:${pct}"><div class="inner"><div class="pct">${pct}%</div><div class="sub">${correct} / ${total} RICHTIG</div></div></div>
    <div class="verdict">${vd}</div><p style="color:var(--muted);font-family:var(--font-mono);font-size:12px;margin:2px 0 18px">${s.mode==="exam"?"PRÜFUNG":"ÜBUNG"} · SERIE ${store.streak}</p>
    <div class="row" style="justify-content:center"><button class="btn dark" onclick="goHome()">Startseite</button><button class="btn ghost" onclick="repeatSession()">Neue Runde</button></div>${up}${rev}</div>`;
  showView("result");}
function resultLevelUp(nx){store.recent[DIFF]=[];DIFF=nx;saveStore();toast("Neue Stufe: "+LV[DIFF].name);renderHome();}
function repeatSession(){const m=session.mode,topic=session.topic,n=session.list.length,r=session.respectDiff;
  if(m==="exam")startExam(n);else if(!r)startMistakes();else if(topic)startTopic(topic);else startRandom();}
