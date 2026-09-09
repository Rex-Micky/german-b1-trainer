/* ============================================================
   Sections / nav
   ============================================================ */
let section="lernen";
function showSection(sec){ closeModal();
  section=sec;
  ["lernen","grammar","vocab","pruefung"].forEach(s=>{const b=$("nav-"+s);if(b)b.classList.toggle("on",s===sec);});
  if(sec==="grammar")renderHome();
  else if(sec==="vocab")renderVocabHome();
  else if(sec==="pruefung")renderPruefung();
  else renderLernen();
}
function goHome(){ closeModal();
  if(section==="vocab")renderVocabHome();
  else if(section==="pruefung")renderPruefung();
  else if(section==="grammar")renderHome();
  else renderLernen();
}
