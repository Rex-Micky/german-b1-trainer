/* ---------- theme + keys ---------- */
function escJs(s){return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g," ");}
function toggleTheme(){const cur=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";
  setTheme(cur);try{localStorage.setItem("db1_theme",cur)}catch(e){}}
function setTheme(t){document.documentElement.setAttribute("data-theme",t);$("themeBtn").innerHTML=t==="dark"?svgi('sun'):svgi('moon');}
(function(){const t=localStorage.getItem("db1_theme")||"light";document.documentElement.setAttribute("data-theme",t);})();

document.addEventListener("keydown",e=>{
  if($("overlay").style.display!=="none"){if(e.key==="Escape")declineLevelUp();return;}
  if(e.key==="Enter"){
    if(section==="grammar"&&$("view-quiz").classList.contains("on")&&session){const q=session.list[session.idx];if(session.answers[q.id]){e.preventDefault();next();}}
  }
  if($("view-vgame").classList.contains("on")&&vsession&&vsession.mode==="cards"){
    if(e.key===" "||e.key==="Enter"){e.preventDefault();if(!vsession.flip)flipCard();}
    if(e.key==="1")rateCard(false); if(e.key==="2")rateCard(true);
  }
});
