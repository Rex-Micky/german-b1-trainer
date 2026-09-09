/* ============================================================
   LERNEN — Lernpfad A2 → B1
   ============================================================ */
Object.assign(ICON,{
 grad:`<svg viewBox="0 0 24 24" ${IP}><path d="M2 9l10-4 10 4-10 4z"/><path d="M6 11v5c0 1.2 2.7 2 6 2s6-.8 6-2v-5"/><path d="M22 9.5v4"/></svg>`,
 doc:`<svg viewBox="0 0 24 24" ${IP}><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><path d="M8 13h8M8 16.5h6"/></svg>`,
 play:`<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>`,
 pencil:`<svg viewBox="0 0 24 24" ${IP}><path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 17z"/><path d="M14 6l3 3"/></svg>`,
 mic:`<svg viewBox="0 0 24 24" ${IP}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/></svg>`,
 clock:`<svg viewBox="0 0 24 24" ${IP}><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>`,
 cloud:`<svg viewBox="0 0 24 24" ${IP}><path d="M6.5 19a4.5 4.5 0 0 1-.5-8.98 5.5 5.5 0 0 1 10.6-1.02A4 4 0 0 1 17.5 19z"/></svg>`,
 google:`<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.6-.05-1.2-.15-1.8H12v3.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.1z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"/></svg>`,
});
const LMODULES=[
 {id:"basis",name:"Basis · A2",col:"var(--grass)"},
 {id:"aufbau",name:"Aufbau · A2 → B1",col:"var(--sky)"},
 {id:"b1gram",name:"Grammatik · B1",col:"var(--flame)"},
 {id:"komm",name:"Wortschatz & Kommunikation",col:"var(--sun)"},
];
const LESSONS=[];
function ladd(module,arr){arr.forEach((o,i)=>{o.module=module;o.n=i+1;o.id=module+"-"+(i+1);LESSONS.push(o);});}
function renderTable(t){return `<table class="ltable"><thead><tr>${t.head.map(h=>`<th>${fmt(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map(c=>`<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function renderBlocks(bs){return bs.map(b=>{
  if(b.h)return `<h3 class="lh">${fmt(b.h)}</h3>`;
  if(b.p)return `<p class="lp">${fmt(b.p)}</p>`;
  if(b.tip)return `<div class="note"><b>Merke:</b> ${fmt(b.tip)}</div>`;
  if(b.tbl)return renderTable(b.tbl);
  if(b.ex)return `<div class="exbox">`+b.ex.map(e=>`<div class="exrow"><button class="speak inl" onclick="speak('${escJs(e[0])}',event)" title="Anhören">${svgi('speaker')}</button><div><div class="exde">${fmt(e[0])}</div>${e[1]?`<div class="exen">${esc(e[1])}</div>`:''}</div></div>`).join('')+`</div>`;
  return '';
}).join('');}
function lessDone(id){return store.lessons&&store.lessons[id];}
function renderLernen(){
  const done=LESSONS.filter(l=>lessDone(l.id)).length, tot=LESSONS.length, pct=tot?Math.round(done/tot*100):0;
  let html=`<div class="vhero"><div class="big">${pct}%</div><div class="vt"><h2>Dein Lernpfad A2 → B1</h2>
    <p>Lerne Schritt für Schritt Grammatik, Sätze und Wortschatz — mit Beispielen zum Anhören.</p></div>
    <div class="pill" style="background:transparent;color:var(--paper);border-color:var(--paper)">${done} / ${tot} Lektionen</div></div>`;
  LMODULES.forEach(m=>{const ls=LESSONS.filter(l=>l.module===m.id);
    html+=`<div class="eyebrow">${esc(m.name)}</div><div class="grid lessgrid">`;
    ls.forEach(l=>{const c=lessDone(l.id);
      html+=`<div class="tile" onclick="openLesson('${l.id}')"><div class="ab" style="background:${m.col}">${l.n}</div>
        <div class="tmeta"><div class="tname">${esc(l.title)}</div><div class="tsub">${l.blocks.length} Abschnitte${l.practice?' · mit Übung':''}${l.vocab?' · Vokabeln':''}</div></div>
        <div class="tbadge">${c?'<span style="color:var(--grass)">'+svgi('check')+'</span>':l.level}</div></div>`;});
    html+=`</div>`;});
  html+=`<div class="footer">${tot} Lektionen · von den Grundlagen bis B1</div>`;
  $("view-lernen").innerHTML=html;showView("lernen");
}
function nextLesson(id){const i=LESSONS.findIndex(l=>l.id===id);return i>=0&&i<LESSONS.length-1?LESSONS[i+1].id:null;}
function openLesson(id){const l=LESSONS.find(x=>x.id===id);if(!l)return;const m=LMODULES.find(x=>x.id===l.module);
  let foot=`<div class="row" style="margin-top:22px">`;
  foot+=`<button class="btn green" onclick="completeLesson('${id}')">${svgi('check')} Verstanden</button>`;
  if(l.practice)foot+=`<button class="btn" onclick="lessonPractice('${l.practice}')">Jetzt üben ${svgi('arrow')}</button>`;
  if(l.vocab)foot+=`<button class="btn sun" onclick="showSection('vocab')">Vokabeln üben ${svgi('arrow')}</button>`;
  const nx=nextLesson(id);if(nx)foot+=`<button class="btn ghost" onclick="openLesson('${nx}')">Nächste ${svgi('arrow')}</button>`;
  foot+=`</div>`;
  $("view-lesson").innerHTML=`<div class="quizhead"><button class="iconbtn" onclick="showSection('lernen')" title="Zurück">${svgi('x')}</button>
    <span class="lvbadge ${l.level==='A2'?'e':'m'}">${l.level}</span>
    <div style="flex:1;font-family:var(--font-mono);font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.name)}</div>
    ${lessDone(id)?'<span class="pill" style="color:var(--grass);border-color:var(--grass)">erledigt</span>':''}</div>
    <div class="card lesson"><div class="tagrow"><span class="tag">Lektion ${l.n}</span></div>
    <h2 class="ltitle">${esc(l.title)}</h2>${renderBlocks(l.blocks)}${foot}</div>`;
  showView("lesson");
}
function completeLesson(id){store.lessons=store.lessons||{};store.lessons[id]=true;saveStore();toast("Lektion abgeschlossen");const nx=nextLesson(id);if(nx)openLesson(nx);else renderLernen();}
function lessonPractice(topic){section="grammar";["lernen","grammar","vocab","pruefung"].forEach(s=>{const b=$("nav-"+s);if(b)b.classList.toggle("on",s==="grammar");});startTopic(topic);}
