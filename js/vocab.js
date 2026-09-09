/* ============================================================
   VOCAB — spaced repetition + games
   ============================================================ */
const SRS_DAYS=[0,1,2,4,7,15]; const DAY=864e5;
function vGet(id){return store.vocab[id]||(store.vocab[id]={box:0,due:0,seen:0,correct:0});}
function vDue(w){const p=store.vocab[w.id];return !p||p.due<=Date.now();}
function vResult(w,ok){const p=vGet(w.id);p.seen++;if(ok){p.correct++;p.box=Math.min(5,p.box+1);}else{p.box=Math.max(0,p.box-1);}
  p.due=Date.now()+SRS_DAYS[p.box]*DAY; saveStore();}
function vStats(theme){const list=theme?VOCAB.filter(w=>w.theme===theme):VOCAB;
  let seen=0,master=0,due=0;list.forEach(w=>{const p=store.vocab[w.id];if(p&&p.seen)seen++;if(p&&p.box>=4)master++;if(vDue(w))due++;});
  return{total:list.length,seen,master,due};}
function vDrawList(theme){ // prioritise due + unseen, fill with rest
  let pool=theme?VOCAB.filter(w=>w.theme===theme):VOCAB.slice();
  const due=shuffle(pool.filter(w=>vDue(w))), rest=shuffle(pool.filter(w=>!vDue(w)));
  return due.concat(rest).slice(0,VOCAB_N);
}
function deWord(w){return (w.art?w.art+" ":"")+w.w;}

let vmode="cards"; let vsession=null;
function setVMode(m){vmode=m;renderVocabHome();}
function renderVocabHome(){
  const st=vStats(null);
  const mNames={cards:"Karteikarten",quiz:"Quiz",article:"Artikel",memory:"Memory"};
  const games=[["cards","cards","Karten","flip & merken"],["quiz","quiz","Quiz","de ↔ en"],["article","aa","Artikel","der/die/das"],["memory","memory","Memory","paare finden"]];
  let gsel=games.map(g=>`<div class="gsel${vmode===g[0]?' on':''}" onclick="setVMode('${g[0]}')"><div class="gi">${svgi(g[1])}</div><b>${g[2]}</b><span>${g[3]}</span></div>`).join("");
  let grid="";
  VOCAB_THEMES.forEach(t=>{const s=vStats(t.id);const pct=s.total?Math.round(s.master/s.total*100):0;
    grid+=`<div class="tile" onclick="startVocab('${t.id}')"><div class="ab" style="background:${t.col}">${esc(t.ab)}</div>
      <div class="tmeta"><div class="tname">${esc(t.name)}</div><div class="tsub">${s.master} von ${s.total} gemeistert${s.due?` · ${s.due} fällig`:''}</div>
      <div class="tbar"><i style="width:${pct}%"></i></div></div><div class="tbadge">${s.total}<br>Wörter</div></div>`;});
  $("view-vocab").innerHTML=`
    <div class="vhero"><div class="big">${st.due}</div><div class="vt"><h2>Wörter heute fällig</h2>
      <p>Wiederholung im richtigen Moment = du vergisst sie nicht mehr.</p></div>
      <button class="btn sun" onclick="startVocab(null,'cards',true)">${svgi('cards')} Fällige üben</button></div>
    <div class="stats"><div class="stat g"><div class="n">${st.seen}</div><div class="l">Gelernt</div></div>
      <div class="stat s"><div class="n">${st.master}</div><div class="l">Gemeistert</div></div>
      <div class="stat f"><div class="n">${st.total}</div><div class="l">Wörter</div></div>
      <div class="stat"><div class="n">${VOCAB_THEMES.length}</div><div class="l">Themen</div></div></div>
    <div class="convcard"><div class="cc-ic">${svgi('chat')}</div>
      <div class="cc-tx"><h3>Gespräch mit KI</h3><p>Sprich oder schreib frei auf Deutsch — dein KI-Partner versteht dich und antwortet auf B1-Niveau, mit sanften Korrekturen. Läuft lokal (Ollama) oder mit Claude.</p></div>
      <div class="cc-go"><button class="btn" onclick="openChat('frei')">${svgi('mic')} Losreden</button></div></div>
    <div class="convchips">${SCENARIOS.filter(s=>s.id!=='frei').map(s=>`<button class="chip" onclick="openChat('${s.id}')">${esc(s.label)}</button>`).join("")}</div>
    <div class="eyebrow">Spielmodus — <span style="color:var(--ink)">${mNames[vmode]}</span></div>
    <div class="gamesel">${gsel}</div>
    <div class="eyebrow">Thema wählen</div>
    <div class="row" style="margin-bottom:10px"><button class="btn dark wide" onclick="startVocab(null)">${svgi('brain')} Alle Themen gemischt</button></div>
    <div class="grid">${grid}</div>
    <div class="footer">${VOCAB.length} Vokabeln · Karteikarten mit Aussprache 🔊 · lokal gespeichert</div>`;
  showView("vocab");
}
function startVocab(theme,forceMode,dueOnly){
  const m=forceMode||vmode;
  let list;
  if(dueOnly){list=VOCAB.filter(vDue);list=shuffle(list).slice(0,VOCAB_N*2); if(!list.length){toast("Keine fälligen Wörter – super!");return;}}
  else list=vDrawList(theme);
  if(m==="article"){const nl=list.filter(w=>w.art);if(nl.length<4){list=shuffle(VOCAB.filter(w=>w.art)).slice(0,VOCAB_N);}else list=nl;}
  if(!list.length){toast("Keine Vokabeln gefunden");return;}
  vsession={mode:m,theme,list,idx:0,score:0,flip:false};
  const tn=theme?(VOCAB_THEMES.find(t=>t.id===theme)||{}).name:(dueOnly?"Fällige Wörter":"Alle Themen");
  $("vBadge").textContent=({cards:"Karten",quiz:"Quiz",article:"Artikel",memory:"Memory"}[m])+" · "+tn;
  renderVCurrent();
}
function vProgress(){const s=vsession;$("vbar").style.width=(s.idx/s.list.length*100)+"%";$("vcount").textContent=Math.min(s.idx+1,s.list.length)+" / "+s.list.length;}

/* ---- flashcards ---- */
function renderVCard(){const s=vsession,w=s.list[s.idx];s.flip=false;vProgress();
  const artcls=w.art?({der:"der",die:"die",das:"das"}[w.art]):"";
  const front=`<div class="fc-face fc-front"><button class="speak" onclick="speak('${escJs(deWord(w))}',event)" title="Anhören">${svgi('speaker')}</button>
    ${w.art?`<span class="fc-art ${artcls}">${w.art}</span>`:'<span class="fc-art" style="background:var(--ink)">'+esc(w.pos||'Wort')+'</span>'}
    <div class="fc-word">${esc(w.w)}</div>${w.pl?`<div class="fc-pl">Plural: die ${esc(w.pl)}</div>`:''}
    <div class="fc-tip">Tippen zum Umdrehen</div></div>`;
  const back=`<div class="fc-face fc-back"><button class="speak" onclick="speak('${escJs(w.ex||deWord(w))}',event)" title="Anhören">${svgi('speaker')}</button>
    <div class="fc-en">${esc(w.en)}</div>${w.ex?`<div class="fc-ex">„${esc(w.ex)}“</div>`:''}<div class="fc-tip">Wusstest du es?</div></div>`;
  $("vhost").innerHTML=`<div class="flashwrap"><div class="flashcard" id="flashcard" onclick="flipCard()"><div class="fc-inner">${front}${back}</div></div>
    <div class="rate"><button class="btn ghost" onclick="rateCard(false)">${svgi('x')} Nochmal</button><button class="btn green" onclick="rateCard(true)">${svgi('check')} Gewusst</button></div>
    <div class="footer" style="margin-top:14px">Tipp: erst raten, dann umdrehen</div></div>`;
  showView("vgame");}
function flipCard(){vsession.flip=!vsession.flip;$("flashcard").classList.toggle("flip",vsession.flip);}
function rateCard(ok){const s=vsession,w=s.list[s.idx];vResult(w,ok);if(ok)s.score++;vAdvance();}

/* ---- vocab MC quiz ---- */
function renderVQuiz(){const s=vsession,w=s.list[s.idx];vProgress();
  const de2en=(s.idx%2===0);
  const prompt=de2en?deWord(w):w.en, answer=de2en?w.en:deWord(w);
  const distract=shuffle(VOCAB.filter(x=>x.id!==w.id)).slice(0,3).map(x=>de2en?x.en:deWord(x));
  const opts=shuffle([answer,...distract]);
  s.answer=answer; s.answered=false;
  let h=`<div class="card"><div class="tagrow"><span class="tag">${de2en?'Deutsch → Englisch':'Englisch → Deutsch'}</span><span class="qtype">Vokabelquiz</span></div>
    <div class="qtext" style="text-align:center;padding:8px 0">${esc(prompt)} ${de2en?`<button class="speak" style="position:static;display:inline-grid;vertical-align:middle" onclick="speak('${escJs(deWord(w))}',event)">${svgi('speaker')}</button>`:''}</div>
    <div class="options" id="vopts">`;
  opts.forEach((o,i)=>{h+=`<button class="opt" data-val="${esc(o)}" onclick="pickV(this)"><span class="key">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`;});
  h+=`</div><div id="vfeedback"></div><div class="quizfoot"><span class="kbd">Wähle die richtige Übersetzung</span><div class="row" id="vfoot"></div></div></div>`;
  $("vhost").innerHTML=h;showView("vgame");}
function pickV(btn){const s=vsession;if(s.answered)return;s.answered=true;const w=s.list[s.idx];
  const val=btn.getAttribute("data-val"),ok=norm(val)===norm(s.answer);vResult(w,ok);if(ok)s.score++;
  document.querySelectorAll("#vopts .opt").forEach(o=>{o.disabled=true;const ov=o.getAttribute("data-val");if(norm(ov)===norm(s.answer))o.classList.add("correct");else if(o===btn)o.classList.add("wrong");});
  $("vfeedback").innerHTML=`<div class="feedback ${ok?'ok':'no'}"><div class="fhead">${ok?'Richtig':'Nicht ganz'}</div>
    <div class="sol">${esc(deWord(w))} = <b class="right">${esc(w.en)}</b></div>${w.ex?`<div class="exp">„${esc(w.ex)}“</div>`:''}</div>`;
  const b=document.createElement("button");b.className="btn dark";const last=s.idx===s.list.length-1;b.innerHTML=(last?"Auswerten":"Weiter")+" "+svgi('arrow');b.onclick=vAdvance;$("vfoot").appendChild(b);}

/* ---- article game ---- */
function renderArticle(){const s=vsession,w=s.list[s.idx];vProgress();s.answered=false;
  $("vhost").innerHTML=`<div class="card"><div class="tagrow"><span class="tag">der · die · das</span><span class="qtype">Artikel-Duell</span></div>
    <div class="artq"><div class="w">${esc(w.w)}</div><div class="h">Welcher Artikel? ${w.pl?`(Plural: die ${esc(w.pl)})`:''}</div></div>
    <div class="artbtns" id="artbtns">
      <button class="artbtn der" data-a="der" onclick="pickArt(this)">der</button>
      <button class="artbtn die" data-a="die" onclick="pickArt(this)">die</button>
      <button class="artbtn das" data-a="das" onclick="pickArt(this)">das</button></div>
    <div id="vfeedback"></div><div class="quizfoot"><span class="kbd">Farbe = Merkhilfe: blau der · rot die · grün das</span><div class="row" id="vfoot"></div></div></div>`;
  showView("vgame");}
function pickArt(btn){const s=vsession;if(s.answered)return;s.answered=true;const w=s.list[s.idx];
  const val=btn.getAttribute("data-a"),ok=val===w.art;vResult(w,ok);if(ok)s.score++;
  document.querySelectorAll("#artbtns .artbtn").forEach(b=>{b.disabled=true;const a=b.getAttribute("data-a");if(a===w.art)b.classList.add("rightpick");else b.classList.add("dim");});
  $("vfeedback").innerHTML=`<div class="feedback ${ok?'ok':'no'}"><div class="fhead">${ok?'Richtig':'Falsch'}</div>
    <div class="sol">Es heißt <b class="right">${esc(w.art)} ${esc(w.w)}</b> — ${esc(w.en)}</div>${w.ex?`<div class="exp">„${esc(w.ex)}“</div>`:''}</div>`;
  const b=document.createElement("button");b.className="btn dark";const last=s.idx===s.list.length-1;b.innerHTML=(last?"Auswerten":"Weiter")+" "+svgi('arrow');b.onclick=vAdvance;$("vfoot").appendChild(b);}

/* ---- memory / matching ---- */
function renderMatch(){const s=vsession;const pairs=s.list.slice(0,5);s.pairs=pairs;s.matched=0;s.sel=null;s.total=pairs.length;
  const cards=[];pairs.forEach(w=>{cards.push({k:w.id,t:deWord(w),de:true,w});cards.push({k:w.id,t:w.en,de:false,w});});
  s.cards=shuffle(cards);vProgressMatch();
  let h=`<div class="card"><div class="tagrow"><span class="tag">Memory</span><span class="qtype">Paare finden</span></div>
    <p style="color:var(--ink2);font-size:13.5px;margin:0 0 14px">Tippe ein deutsches Wort und seine englische Bedeutung.</p><div class="matchgrid" id="mgrid">`;
  s.cards.forEach((c,i)=>{h+=`<div class="mtile ${c.de?'de':''}" data-i="${i}" onclick="pickMatch(${i})">${esc(c.t)}</div>`;});
  h+=`</div></div>`;$("vhost").innerHTML=h;showView("vgame");}
function vProgressMatch(){const s=vsession;$("vbar").style.width=((s.matched||0)/s.total*100)+"%";$("vcount").textContent=(s.matched||0)+" / "+s.total;}
function pickMatch(i){const s=vsession,c=s.cards[i],el=document.querySelector(`#mgrid .mtile[data-i="${i}"]`);
  if(el.classList.contains("gone")||el.classList.contains("sel"))return;
  if(s.sel===null){s.sel=i;el.classList.add("sel");return;}
  const j=s.sel,c2=s.cards[j],el2=document.querySelector(`#mgrid .mtile[data-i="${j}"]`);s.sel=null;el2.classList.remove("sel");
  if(c.k===c2.k&&i!==j){el.classList.add("gone");el2.classList.add("gone");s.matched++;vResult(c.w,true);vProgressMatch();
    if(s.matched>=s.total){s.score=s.total;setTimeout(()=>renderVResult(),450);}}
  else{el.classList.add("sel","miss");setTimeout(()=>{el.classList.remove("sel","miss");},400);}}

/* ---- shared vocab flow ---- */
function renderVCurrent(){const m=vsession.mode;if(m==="cards")renderVCard();else if(m==="quiz")renderVQuiz();else if(m==="article")renderArticle();else renderMatch();}
function vAdvance(){const s=vsession;if(s.idx<s.list.length-1){s.idx++;renderVCurrent();}else renderVResult();}
function startVocabCurrent(){renderVCurrent();}
function renderVResult(){const s=vsession,total=s.mode==="memory"?s.total:s.list.length,correct=s.score,pct=Math.round(correct/total*100);
  store.vstreak=(store.vstreak||0)+1;saveStore();
  let vd,em;if(pct>=90){vd="Perfekt!";em='trophy';}else if(pct>=70){vd="Klasse!";em='flame';}else if(pct>=50){vd="Gut gemacht!";em='check';}else{vd="Dranbleiben!";em='brain';}
  const st=vStats(s.theme);
  $("view-vresult").innerHTML=`<div class="result"><div class="rico" style="width:60px;height:60px;margin:6px auto;border:var(--bd);border-radius:15px;display:grid;place-items:center;background:var(--sun);color:#3a2a00">${svgi(em)}</div>
    <div class="ring" style="--p:${pct};background:conic-gradient(var(--sun) calc(${pct}*1%),var(--paper2) 0)"><div class="inner"><div class="pct">${pct}%</div><div class="sub">${correct} / ${total}</div></div></div>
    <div class="verdict">${vd}</div><p style="color:var(--muted);font-family:var(--font-mono);font-size:12px;margin:2px 0 8px">${st.master} von ${st.total} Wörtern gemeistert</p>
    <p style="color:var(--ink2);font-size:13px;max-width:420px;margin:0 auto 18px">Die Wörter kommen im richtigen Abstand automatisch zur Wiederholung wieder — so bleiben sie hängen.</p>
    <div class="row" style="justify-content:center"><button class="btn dark" onclick="showSection('vocab')">Zur Übersicht</button><button class="btn sun" onclick="repeatVocab()">Neue Runde</button></div></div>`;
  showView("vresult");}
function repeatVocab(){startVocab(vsession.theme);}
