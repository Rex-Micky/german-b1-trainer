/* ============================================================
   Deutsch Trainer — engine v4 (grammar + vocab + editorial UI)
   ============================================================ */

/* ---------- SVG icon set (no emoji-as-icons) ---------- */
const IP='stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const ICON={
  book:`<svg viewBox="0 0 24 24" ${IP}><path d="M4 5a2 2 0 0 1 2-2h9v16H6a2 2 0 0 0-2 2z"/><path d="M15 3h3a1 1 0 0 1 1 1v15"/></svg>`,
  brain:`<svg viewBox="0 0 24 24" ${IP}><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5 3 3 0 0 0 2 4 3 3 0 0 0 5 1V4.5A2 2 0 0 0 9 4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5 3 3 0 0 1-2 4 3 3 0 0 1-5 1"/></svg>`,
  exam:`<svg viewBox="0 0 24 24" ${IP}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3"/><path d="M9 12l2 2 4-4"/></svg>`,
  bolt:`<svg viewBox="0 0 24 24" ${IP}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>`,
  target:`<svg viewBox="0 0 24 24" ${IP}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`,
  cards:`<svg viewBox="0 0 24 24" ${IP}><rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 6V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-2"/></svg>`,
  quiz:`<svg viewBox="0 0 24 24" ${IP}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"/><path d="M12 17h.01"/></svg>`,
  aa:`<svg viewBox="0 0 24 24" ${IP}><path d="M3 18 7 6l4 12"/><path d="M4.5 14h5"/><path d="M14 18l3-9 3 9"/><path d="M15 15h4"/></svg>`,
  memory:`<svg viewBox="0 0 24 24" ${IP}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  speaker:`<svg viewBox="0 0 24 24" ${IP}><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>`,
  check:`<svg viewBox="0 0 24 24" ${IP}><path d="M4 12l5 5L20 6"/></svg>`,
  x:`<svg viewBox="0 0 24 24" ${IP}><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24" ${IP}><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  sun:`<svg viewBox="0 0 24 24" ${IP}><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" ${IP}><path d="M21 12.8A8 8 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8z"/></svg>`,
  rocket:`<svg viewBox="0 0 24 24" ${IP}><path d="M5 15c-1 2-1 4-1 4s2 0 4-1M9 12a12 12 0 0 1 8-9c1 3 0 6-3 9-1.6 1.6-3 2.4-5 3l-2-2c.6-2 1.4-3.4 2-5z"/><circle cx="15" cy="9" r="1.3"/></svg>`,
  trophy:`<svg viewBox="0 0 24 24" ${IP}><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 20h6M10 16h4v4h-4z"/></svg>`,
  flame:`<svg viewBox="0 0 24 24" ${IP}><path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3 1 2 2 2 2 2 0-3 2-5 2-8z"/></svg>`,
  chat:`<svg viewBox="0 0 24 24" ${IP}><path d="M21 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-5.1A8 8 0 1 1 21 11.5z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>`,
  send:`<svg viewBox="0 0 24 24" ${IP}><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>`,
  mic:`<svg viewBox="0 0 24 24" ${IP}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M8 21h8"/></svg>`,
  gear:`<svg viewBox="0 0 24 24" ${IP}><circle cx="12" cy="12" r="3.2"/><path d="M19.5 12a7.5 7.5 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-2.2-1.3L14.4 2H9.6l-.4 2.6a7.5 7.5 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 2.2 1.3l.4 2.6h4.8l.4-2.6a7.5 7.5 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.07-.42.1-.86.1-1.3z"/></svg>`,
  cpu:`<svg viewBox="0 0 24 24" ${IP}><rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3"/></svg>`,
  back:`<svg viewBox="0 0 24 24" ${IP}><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`,
};
function svgi(n){return ICON[n]||''}

/* ---------- config ---------- */
const LV={e:{name:"Leicht",next:"m"},m:{name:"Mittel",next:"h"},h:{name:"Schwer",next:null}};
const PRACTICE_N=15, VOCAB_N=12;
const TILE_COLS=["var(--flame)","var(--sky)","var(--grass)","var(--sun)","var(--rose)","var(--ink)","var(--flame2)"];

const TOPICS=[
 {id:"perfekt",name:"Perfekt",ab:"Pf",blurb:"haben/sein + Partizip II"},
 {id:"praeteritum",name:"Präteritum",ab:"Pt",blurb:"war, hatte, ging, konnte"},
 {id:"kausal",name:"Kausal & Konzessiv",ab:"Ka",blurb:"weil, denn, deshalb, obwohl"},
 {id:"temporal",name:"Temporale Sätze",ab:"Te",blurb:"als, wenn, nachdem, bevor"},
 {id:"zweiteilig",name:"Zweiteilige Konnektoren",ab:"2×",blurb:"entweder…oder, je…desto"},
 {id:"wechsel",name:"Wechselpräpositionen",ab:"Wo",blurb:"Wo? Dativ / Wohin? Akkusativ"},
 {id:"praep",name:"Präposition + Fall",ab:"Pr",blurb:"Akkusativ / Dativ / Genitiv"},
 {id:"adjektiv",name:"Adjektivdeklination",ab:"Aj",blurb:"der gute / ein guter / guter"},
 {id:"komparativ",name:"Komparativ/Superlativ",ab:"Km",blurb:"besser, am besten, größer"},
 {id:"relativ",name:"Relativsätze",ab:"Rl",blurb:"der, den, dem, dessen, denen"},
 {id:"konjunktiv",name:"Konjunktiv II",ab:"K2",blurb:"wäre, hätte, könnte, würde"},
 {id:"passiv",name:"Passiv",ab:"Ps",blurb:"wird/wurde + Partizip II"},
 {id:"verbpraep",name:"Verben + Präposition",ab:"V+",blurb:"warten auf, denken an"},
 {id:"reflexiv",name:"Reflexive Verben",ab:"si",blurb:"sich freuen, mir/mich"},
 {id:"infinitiv",name:"Infinitiv mit zu",ab:"zu",blurb:"um…zu, ohne…zu, statt…zu"},
 {id:"modal",name:"Modalverben",ab:"Mv",blurb:"können, müssen, dürfen, sollen"},
 {id:"ndekl",name:"n-Deklination",ab:"nD",blurb:"den Jungen, dem Studenten"},
 {id:"wortstellung",name:"Wortstellung",ab:"TK",blurb:"TeKaMoLo, Verb an Position 2"},
 {id:"indirekt",name:"Indirekte Fragen",ab:"?",blurb:"ob, wann, wo … Verb am Ende"},
 {id:"futur",name:"Futur I",ab:"Fu",blurb:"werden + Infinitiv"},
 {id:"wortschatz",name:"Feste Wendungen",ab:"W!",blurb:"Angst haben, recht haben"},
];
TOPICS.forEach((t,i)=>t.col=TILE_COLS[i%TILE_COLS.length]);
const TOPIC_NOTE={};
const DATA=[];
function add(topic,note,arr){ if(note)TOPIC_NOTE[topic]=note; arr.forEach((q,i)=>{q.topic=topic;q.id=topic+"-"+(i+1);if(!q.lvl)q.lvl="m";DATA.push(q);}); }

/* ---------- vocab data holders ---------- */
const VOCAB_THEMES=[];
const VOCAB=[];
function vtheme(id,name,ab){ VOCAB_THEMES.push({id,name,ab,col:TILE_COLS[VOCAB_THEMES.length%TILE_COLS.length]}); }
function vadd(theme,arr){ arr.forEach((v,i)=>{ v.theme=theme; v.id="v-"+theme+"-"+i; VOCAB.push(v); }); }

/* ---------- smart answer checking ---------- */
function fold(s){return String(s).toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss");}
function norm(s){return fold(String(s)).replace(/[.,!?;:„“”"'»«()\/]/g," ").replace(/\s+/g," ").trim();}
function judge(user,accept){
  const raw=String(user).trim(); if(!raw)return{ok:false,level:"empty"};
  for(const a of accept){if(raw===String(a).trim())return{ok:true,level:"exact",canonical:a};}
  const nu=norm(user);
  for(const a of accept){if(nu===norm(a))return{ok:true,level:"close",canonical:a};}
  return{ok:false,level:"wrong"};
}

/* ---------- persistence ---------- */
const KEY="deutschb1_v4";
function blankStore(){return{v:4,answered:0,correct:0,streak:0,bestStreak:0,mistakes:{},seen:{},diff:"m",
  perf:{e:{a:0,c:0},m:{a:0,c:0},h:{a:0,c:0}},recent:{e:[],m:[],h:[]},vocab:{},vstreak:0,lessons:{},examBest:{}};}
let store=loadStore(); let DIFF=store.diff||"m";
function loadStore(){
  try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===4)return Object.assign(blankStore(),s);}catch(e){}
  const b=blankStore();
  try{const o=JSON.parse(localStorage.getItem("deutschb1_v3"));
    if(o){b.answered=o.answered||0;b.correct=o.correct||0;b.streak=o.streak||0;b.bestStreak=o.bestStreak||0;
      b.mistakes=o.mistakes||{};b.seen=o.seen||{};b.diff=o.diff||"m";b.perf=o.perf||b.perf;b.recent=o.recent||b.recent;}
  }catch(e){}
  return b;
}
function saveStore(){store.diff=DIFF;try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){} schedulePush();}
function saveStoreLocal(){store.diff=DIFF;try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
function recordAnswer(q,ok){store.answered++;store.seen[q.id]=true;
  if(ok){store.correct++;store.streak++;if(store.streak>store.bestStreak)store.bestStreak=store.streak;delete store.mistakes[q.id];}
  else{store.streak=0;store.mistakes[q.id]=true;}}
function trackLevel(q,ok){ if(!session||!session.respectDiff){saveStore();return;}
  store.perf[DIFF].a++;if(ok)store.perf[DIFF].c++;
  const r=store.recent[DIFF];r.push(!!ok);if(r.length>15)r.shift();saveStore();}

/* ---------- utils ---------- */
function $(id){return document.getElementById(id)}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function fmt(s){return esc(s).replace(/_{2,}/g,'<span class="blank">＿＿＿</span>').replace(/\*(.+?)\*/g,'<b>$1</b>').replace(/\n/g,'<br>')}
function showView(name){document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));$('view-'+name).classList.add('on');window.scrollTo({top:0,behavior:'smooth'});}

/* ---------- speech ---------- */
let deVoice=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices();deVoice=vs.find(v=>/de(-|_)/i.test(v.lang))||vs.find(v=>/deutsch|german/i.test(v.name))||null;}catch(e){}}
if('speechSynthesis'in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function speak(text,ev){ if(ev)ev.stopPropagation();
  try{ if(!('speechSynthesis'in window))return; speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text); u.lang="de-DE"; if(deVoice)u.voice=deVoice; u.rate=.92; speechSynthesis.speak(u);
  }catch(e){}}

/* ---------- pools ---------- */
function poolFor(topicId){return DATA.filter(q=>(!topicId||q.topic===topicId)&&q.lvl===DIFF);}
function countAt(diff,topicId){return DATA.filter(q=>q.lvl===diff&&(!topicId||q.topic===topicId)).length;}
function draw(pool,n){return shuffle(pool).slice(0,Math.min(n,pool.length));}
