/* ============================================================
   PRÜFUNG — Modelltests (Format Goethe-Zertifikat B1)
   ============================================================ */
const EXAMS=[];
function exam(o){EXAMS.push(o);}
const EXLBL={lesen:"Lesen",hoeren:"Hören",schreiben:"Schreiben",sprechen:"Sprechen"};
function examAbbr(t){return{lesen:"Le",hoeren:"Hö",schreiben:"Sc",sprechen:"Sp"}[t]||"?";}
function examColor(t){return{lesen:"var(--sky)",hoeren:"var(--flame)",schreiben:"var(--grass)",sprechen:"var(--sun)"}[t]||"var(--ink)";}
let examS=null;
function renderPruefung(){
  let html=`<div class="vhero" style="background:var(--flame)"><div class="big" style="color:var(--paper)">B1</div>
    <div class="vt"><h2 style="color:var(--paper)">Prüfungssimulation</h2><p style="color:#ffe">Kompletter Modelltest im Format des Zertifikats B1: Lesen, Hören, Schreiben, Sprechen.</p></div></div>
    <div class="note">${svgi('play')} <b>Hören</b> wird von der Computerstimme vorgelesen (Kopfhörer empfohlen). <b>Lesen &amp; Hören</b> werden automatisch bewertet; für <b>Schreiben &amp; Sprechen</b> gibt es Musterlösung + Checkliste. Bestanden ab 60 %.</div>
    <div class="eyebrow">Modelltests</div>`;
  EXAMS.forEach(e=>{const best=store.examBest&&store.examBest[e.id];
    const auto=e.sections.filter(s=>s.items).reduce((n,s)=>n+s.items.length,0);
    html+=`<div class="mode c1" style="margin-bottom:11px" onclick="openExamOverview('${e.id}')"><div class="mi">${svgi('doc')}</div>
      <h3>${esc(e.title)}</h3><p>${esc(e.sub)}</p>
      <div class="mini"><span class="pill">${e.sections.length} Teile</span><span class="pill">${auto} Fragen</span>${best!=null?`<span class="pill" style="color:var(--grass);border-color:var(--grass)">Bestes: ${best}%</span>`:''}</div></div>`;});
  $("view-pruefung").innerHTML=html;showView("pruefung");
}
function openExamOverview(id){const e=EXAMS.find(x=>x.id===id);if(!e)return;
  let list=e.sections.map(s=>`<div class="tile"><div class="ab" style="background:${examColor(s.type)}">${examAbbr(s.type)}</div>
    <div class="tmeta"><div class="tname">${esc(s.title)}</div><div class="tsub">${esc(EXLBL[s.type])}${s.items?' · '+s.items.length+' Fragen':''}</div></div></div>`).join('');
  $("view-exam").innerHTML=`<div class="quizhead"><button class="iconbtn" onclick="showSection('pruefung')" title="Zurück">${svgi('x')}</button>
    <span class="lvbadge h">B1 Modelltest</span><div style="flex:1"></div></div>
    <div class="card"><h2 class="ltitle">${esc(e.title)}</h2><p class="lp" style="color:var(--ink2)">${esc(e.sub)}</p>
    <div class="grid" style="margin:14px 0">${list}</div>
    <button class="btn wide" onclick="startExamPaper('${id}')">${svgi('doc')} Prüfung starten</button></div>`;
  showView("exam");
}
function startExamPaper(id){const e=EXAMS.find(x=>x.id===id);if(!e)return;let gn=0;
  const screens=e.sections.map((s,si)=>{const sec=Object.assign({},s,{si});
    if(sec.items)sec.items.forEach(it=>{it._gn=++gn;});return sec;});
  examS={exam:e,screens,idx:0,answers:{},showT:false};renderExamScreen();}
function examItemsHTML(s){return s.items.map((it,ii)=>{const id=s.si+"-"+ii,chosen=examS.answers[id];
  return `<div class="exq"><div class="qn">Aufgabe ${it._gn}</div><div style="font-weight:600;font-size:15px">${fmt(it.q)}</div><div class="options">`+
    it.options.map((o,oi)=>`<button class="opt${chosen===o?' picked':''}" onclick="examPickMC('${id}','${escJs(o)}',this)"><span class="key">${String.fromCharCode(65+oi)}</span><span>${fmt(o)}</span></button>`).join('')+`</div></div>`;
}).join('');}
function renderExamScreen(){const s=examS.screens[examS.idx],idx=examS.idx,len=examS.screens.length,last=idx===len-1;
  let body="";
  if(s.type==="lesen"){ body=(s.text?`<div class="extext">${fmt(s.text)}</div>`:"")+
    (s.ads?s.ads.map(a=>`<div class="extext ad"><span class="adk">${esc(a.k)}</span>  ${fmt(a.t)}</div>`).join(''):"")+examItemsHTML(s);
  } else if(s.type==="hoeren"){ body=`<div class="row" style="margin-bottom:12px"><button class="play" onclick="examPlay()">${svgi('play')} Hörtext abspielen</button>
      <button class="btn ghost" onclick="examStop()">Stopp</button></div>
      <p class="lp" style="color:var(--muted);font-size:13px">Du kannst den Text mehrmals anhören.</p>`+examItemsHTML(s)+
      `<div style="margin-top:8px"><button class="btn ghost" onclick="examToggleT()">${examS.showT?'Transkript verbergen':'Transkript zeigen'}</button>${examS.showT?`<div class="extext" style="margin-top:10px">${fmt(s.transcript||s.script)}</div>`:''}</div>`;
  } else if(s.type==="schreiben"){ body=`<div class="extext">${fmt(s.situation)}</div><p class="lp">Schreiben Sie zu allen Punkten (ca. ${s.minWords} Wörter):</p>
      <ul class="taskpoints">${s.points.map(p=>`<li>${fmt(p)}</li>`).join('')}</ul>
      <textarea class="write" id="writeArea" placeholder="Schreiben Sie hier …" oninput="wcount()">${esc(examS.answers['w'+s.si]||'')}</textarea>
      <div class="wcount" id="wc">0 Wörter</div>
      <button class="btn green" style="margin-top:12px" onclick="examShowModel()">${svgi('check')} Musterlösung &amp; Checkliste</button><div id="modelHost"></div>`;
  } else if(s.type==="sprechen"){ body=`<div class="extext">${fmt(s.prompt)}</div>
      ${s.structure?`<p class="lp">So kannst du es aufbauen:</p><ul class="taskpoints">${s.structure.map(p=>`<li>${fmt(p)}</li>`).join('')}</ul>`:''}
      <div class="row"><button class="play" onclick="examSpeakModel()">${svgi('speaker')} Musterantwort anhören</button>
      <button class="btn ghost" onclick="examShowModel()">Musterantwort lesen</button></div><div id="modelHost"></div>`;
  }
  $("view-exam").innerHTML=`<div class="quizhead"><button class="iconbtn" onclick="quitExam()" title="Beenden">${svgi('x')}</button>
    <span class="lvbadge" style="background:${examColor(s.type)};color:#fff">${esc(EXLBL[s.type])}</span>
    <div class="prog"><i style="width:${idx/len*100}%"></i></div><div class="qcount">${idx+1} / ${len}</div></div>
    <div class="card"><div class="tagrow"><span class="tag">${esc(s.title)}</span><span class="qtype">${esc(EXLBL[s.type])}</span></div>
    <p class="lp" style="color:var(--ink2)">${fmt(s.instr)}</p>${body}
    <div class="quizfoot" style="margin-top:20px"><div>${idx>0?`<button class="btn ghost" onclick="examPrev()">Zurück</button>`:'<span></span>'}</div>
    <button class="btn dark" onclick="examNext()">${last?'Auswerten':'Weiter'} ${svgi('arrow')}</button></div></div>`;
  showView("exam");
  if(s.type==="schreiben")wcount();
}
function examPickMC(id,val,btn){examS.answers[id]=val;const box=btn.closest('.options');if(box)box.querySelectorAll('.opt').forEach(o=>o.classList.remove('picked'));btn.classList.add('picked');}
function examPlay(){const s=examS.screens[examS.idx];if(s&&s.script)speak(s.script);}
function examStop(){try{speechSynthesis.cancel();}catch(e){}}
function examToggleT(){examS.showT=!examS.showT;renderExamScreen();}
function examSpeakModel(){const s=examS.screens[examS.idx];if(s&&s.model)speak(s.model);}
function wcount(){const ta=$("writeArea");if(!ta)return;const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;const w=$("wc");if(w)w.textContent=n+" Wörter";examS.answers['w'+examS.screens[examS.idx].si]=ta.value;}
function examShowModel(){const s=examS.screens[examS.idx],host=$("modelHost");if(!host)return;
  let cl="";
  if(s.type==="schreiben")cl=`<h4 style="margin-top:14px">Selbstkontrolle</h4><ul class="checklist">${
    ['Ich habe alle Leitpunkte behandelt','Anrede und Gruß sind vorhanden','ungefähr '+s.minWords+' Wörter','Verben richtig konjugiert und am Satzende / Position 2'].map(x=>`<li onclick="this.classList.toggle('on')"><span class="cb">${svgi('check')}</span><span>${x}</span></li>`).join('')}</ul>`;
  host.innerHTML=`<div class="modelbox"><h4>Musterlösung</h4>${fmt(s.model)}${cl}</div>`;
}
function examPrev(){if(examS.idx>0){examS.idx--;examStop();examS.showT=false;renderExamScreen();}}
function examNext(){examStop();if(examS.idx<examS.screens.length-1){examS.idx++;examS.showT=false;renderExamScreen();}else gradeExam();}
function gradeExam(){const e=examS.exam;let auto=0,ok=0;const byMod={lesen:{t:0,c:0},hoeren:{t:0,c:0}};
  e.sections.forEach((s,si)=>{if(s.type==="lesen"||s.type==="hoeren"){s.items.forEach((it,ii)=>{const id=si+"-"+ii;auto++;byMod[s.type].t++;
    if(examS.answers[id]&&norm(examS.answers[id])===norm(it.answer)){ok++;byMod[s.type].c++;}});}});
  const pct=auto?Math.round(ok/auto*100):0;
  store.examBest=store.examBest||{};store.examBest[e.id]=Math.max(store.examBest[e.id]||0,pct);saveStore();
  renderExamResult(pct,ok,auto,byMod);
}
function renderExamResult(pct,ok,auto,byMod){const e=examS.exam,pass=pct>=60;
  let mods="";["lesen","hoeren"].forEach(t=>{const m=byMod[t];if(!m.t)return;const mp=Math.round(m.c/m.t*100);
    mods+=`<div class="modres ${mp>=60?'pass':'fail'}"><span class="ml">${EXLBL[t]}</span><span class="mp">${m.c} / ${m.t} · ${mp}%</span></div>`;});
  const hasWrite=e.sections.some(s=>s.type==="schreiben"||s.type==="sprechen");
  let rev=`<div class="rev"><div class="eyebrow" style="margin-top:6px">Auflösung Lesen &amp; Hören</div>`;
  e.sections.forEach((s,si)=>{if(s.type!=="lesen"&&s.type!=="hoeren")return;
    s.items.forEach((it,ii)=>{const id=si+"-"+ii,your=examS.answers[id],good=your&&norm(your)===norm(it.answer);
      rev+=`<div class="revitem ${good?'ok':''}"><div class="rq">${it._gn}. ${fmt(it.q)}</div>
        <div class="ra"><span class="${good?'right':'yours'}">Du: ${your?esc(your):'(leer)'}</span> · <span class="right">Richtig: ${esc(it.answer)}</span></div>
        ${it.explain&&!good?`<div class="rexp">${fmt(it.explain)}</div>`:''}</div>`;});});
  rev+=`</div>`;
  $("view-examresult").innerHTML=`<div class="result"><div class="rico" style="width:60px;height:60px;margin:6px auto;border:var(--bd);border-radius:15px;display:grid;place-items:center;background:${pass?'var(--grass)':'var(--flame)'};color:#fff">${svgi(pass?'trophy':'brain')}</div>
    <div class="ring" style="--p:${pct};background:conic-gradient(${pass?'var(--grass)':'var(--flame)'} calc(${pct}*1%),var(--paper2) 0)"><div class="inner"><div class="pct">${pct}%</div><div class="sub">LESEN + HÖREN</div></div></div>
    <div class="verdict">${pass?'Bestanden! 🎉':'Noch nicht bestanden'}</div>
    <p style="color:var(--muted);font-family:var(--font-mono);font-size:12px;margin:2px 0 16px">${ok} / ${auto} automatisch bewertete Fragen richtig</p>
    <div style="max-width:460px;margin:0 auto 16px">${mods}</div>
    ${hasWrite?`<p style="color:var(--ink2);font-size:13.5px;max-width:460px;margin:0 auto 16px">Schreiben &amp; Sprechen bewertest du selbst mit der Musterlösung &amp; Checkliste — vergleiche deine Antwort ehrlich.</p>`:''}
    <div class="row" style="justify-content:center"><button class="btn dark" onclick="showSection('pruefung')">Zu den Tests</button><button class="btn" onclick="openExamOverview('${e.id}')">Nochmal</button></div>
    ${rev}</div>`;
  showView("examresult");
}
function quitExam(){examStop();renderPruefung();}
