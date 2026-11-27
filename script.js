/* CONFIGURATION DES 8 STATIONS
   Remplacez les noms temporaires, les coordonnées x/y et les URL vidéo ci-dessous.
   x/y = pourcentages de la carte (0-100), mesurés depuis le coin supérieur gauche.
   videoUrl = URL directe du fichier MP4 (laisser "" pour afficher la zone vidéo à venir).
   COORDONNÉES ET NOMS ACTUELS : TEMPORAIRES, À REMPLACER AVANT PUBLICATION FINALE.
*/
const STATIONS = [
 {id:1,nameFr:"Station 1",nameRu:"Станция 1",descriptionFr:"Découvrez cette station emblématique du métro de Moscou.",x:18,y:22,videoUrl:""},
 {id:2,nameFr:"Station 2",nameRu:"Станция 2",descriptionFr:"Une nouvelle étape de notre voyage souterrain.",x:31,y:35,videoUrl:""},
 {id:3,nameFr:"Station 3",nameRu:"Станция 3",descriptionFr:"Poursuivez votre découverte du métro moscovite.",x:43,y:24,videoUrl:""},
 {id:4,nameFr:"Station 4",nameRu:"Станция 4",descriptionFr:"L'histoire et l'architecture se rencontrent ici.",x:56,y:42,videoUrl:""},
 {id:5,nameFr:"Station 5",nameRu:"Станция 5",descriptionFr:"Explorez une autre facette du métro de Moscou.",x:69,y:30,videoUrl:""},
 {id:6,nameFr:"Station 6",nameRu:"Станция 6",descriptionFr:"Continuez votre itinéraire à travers la ville.",x:77,y:54,videoUrl:""},
 {id:7,nameFr:"Station 7",nameRu:"Станция 7",descriptionFr:"Encore une étape avant la fin du voyage.",x:58,y:70,videoUrl:""},
 {id:8,nameFr:"Station 8",nameRu:"Станция 8",descriptionFr:"La dernière étape de votre voyage dans le métro de Moscou.",x:34,y:76,videoUrl:""}
];
const KEY="moscowMetroGuideProgress_v1", $=id=>document.getElementById(id);
let completed=0, opened=null, previousFocus=null;
try{completed=Math.max(0,Math.min(8,Number(localStorage.getItem(KEY)||0)||0));}catch(e){}
const video=$("video");
function save(){try{localStorage.setItem(KEY,String(completed));}catch(e){}}
function drawRoute(){const svg=$("route");svg.innerHTML="";if(completed<1)return;const pts=STATIONS.slice(0,Math.min(completed+1,STATIONS.length)).map(s=>`${s.x*10},${s.y*6}`).join(" ");const line=document.createElementNS("http://www.w3.org/2000/svg","polyline");line.setAttribute("points",pts);svg.appendChild(line);}
function render(){const layer=$("markers");layer.innerHTML="";STATIONS.forEach((s,i)=>{const b=document.createElement("button"),state=i<completed?"done":i===completed?"active":"locked";b.className=`marker ${state}`;b.style.left=s.x+"%";b.style.top=s.y+"%";b.textContent=i<completed?"✓":s.id;b.title=s.nameFr;b.setAttribute("aria-label",`${s.id}. ${s.nameFr}`);b.disabled=i>completed;if(i<=completed)b.onclick=()=>openStation(i);layer.appendChild(b);});drawRoute();$("stepLabel").textContent=completed===8?"VOYAGE TERMINÉ":`ÉTAPE ${String(completed+1).padStart(2,"0")} / 08`;$("percent").textContent=Math.round(completed/8*100)+" %";$("fill").style.width=completed/8*100+"%";}
function openStation(i){if(i>completed)return;opened=i;previousFocus=document.activeElement;const s=STATIONS[i];$("modalStep").textContent=`ÉTAPE ${String(i+1).padStart(2,"0")} / 08`;$("modalTitle").textContent=s.nameFr;$("modalRussian").textContent=s.nameRu;$("modalDescription").textContent=s.descriptionFr;$("videoStatus").textContent=i<completed?"Vous avez déjà terminé cette étape. Vous pouvez revoir la vidéo.":"Regardez la vidéo jusqu’à la fin pour débloquer la suite.";$("complete").hidden=i<completed||!!s.videoUrl;$("placeholder").hidden=!!s.videoUrl;video.hidden=!s.videoUrl;video.pause();video.removeAttribute("src");video.load();if(s.videoUrl){video.src=s.videoUrl;video.load();}$("modal").classList.add("open");$("modal").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";$("close").focus();}
function closeModal(){ $("modal").classList.remove("open");$("modal").setAttribute("aria-hidden","true");video.pause();document.body.style.overflow="";if(previousFocus)previousFocus.focus(); }
function finishStep(){if(opened===null||opened!==completed)return;completed=Math.min(8,completed+1);save();closeModal();render();if(completed===8)setTimeout(()=>{$("finish").classList.add("open");$("finish").setAttribute("aria-hidden","false");},450);}
video.addEventListener("ended",()=>{if(opened===completed)finishStep();});$("complete").onclick=finishStep;$("close").onclick=closeModal;$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal();});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("modal").classList.contains("open"))closeModal();});
function goMap(){$("mapScene").scrollIntoView({behavior:"smooth"});}$("start").onclick=goMap;$("scrollHint").onclick=goMap;
function reset(){if(!confirm("Recommencer le voyage depuis la première station ?"))return;completed=0;save();$("finish").classList.remove("open");$("finish").setAttribute("aria-hidden","true");render();}
$("reset").onclick=reset;$("replay").onclick=()=>{completed=0;save();$("finish").classList.remove("open");$("finish").setAttribute("aria-hidden","true");render();$("intro").scrollIntoView({behavior:"smooth"});};render();
