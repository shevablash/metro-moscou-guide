
/* CONFIGURATION DES 8 STATIONS */
const STATIONS = [
 {id:1,nameFr:"Rimskaïa",nameRu:"Римская",descriptionFr:"Découvrez cette station emblématique du métro de Moscou.",x:68.7,y:51.5,videoUrl:""},
 {id:2,nameFr:"Dostoïevskaïa",nameRu:"Достоевская",descriptionFr:"Une nouvelle étape de notre voyage souterrain.",x:31,y:35,videoUrl:""},
 {id:3,nameFr:"Krasnyé Vorota",nameRu:"Красные ворота",descriptionFr:"Poursuivez votre découverte du métro moscovite.",x:43,y:24,videoUrl:""},
 {id:4,nameFr:"Komsomolskaïa",nameRu:"Комсомольская",descriptionFr:"L'histoire et l'architecture se rencontrent ici.",x:56,y:42,videoUrl:""},
 {id:5,nameFr:"Smolenskaïa",nameRu:"Смоленская",descriptionFr:"Explorez une autre facette du métro de Moscou.",x:69,y:30,videoUrl:""},
 {id:6,nameFr:"Arbatskaïa",nameRu:"Арбатская",descriptionFr:"Continuez votre itinéraire à travers la ville.",x:77,y:54,videoUrl:""},
 {id:7,nameFr:"Maïakovskaïa",nameRu:"Маяковская",descriptionFr:"Encore une étape avant la fin du voyage.",x:58,y:70,videoUrl:""},
 {id:8,nameFr:"Slavianski Boulevard",nameRu:"Славянский бульвар",descriptionFr:"La dernière étape de votre voyage dans le métro de Moscou.",x:34,y:76,videoUrl:""}
];

const $=id=>document.getElementById(id);
const viewport=document.querySelector(".map-viewport");
const canvas=$("mapCanvas");
const video=$("video");

let completed=0;
let opened=null;
let previousFocus=null;
let cameraTimer=null;

function save(){
  // Прогресс хранится только до перезагрузки страницы.
}

/* CAMERA */


function moveCamera(index, zoom=2.5){
 const station=STATIONS[index];
 if(!station || !viewport || !canvas)return;

 clearTimeout(cameraTimer);

 requestAnimationFrame(()=>{
  const vr=viewport.getBoundingClientRect();
  const w=canvas.offsetWidth;
  const h=canvas.offsetHeight;

  if(!w || !h || !vr.width || !vr.height)return;

  // Исходное положение карты по центру окна.
  const baseLeft=(vr.width-w)/2;
  const baseTop=(vr.height-h)/2;

  const targetX=station.x/100*w;
  const targetY=station.y/100*h;

  let dx=vr.width/2-baseLeft-w/2-zoom*(targetX-w/2);
  let dy=vr.height/2-baseTop-h/2-zoom*(targetY-h/2);

  const minX=vr.width-baseLeft-w/2*(1+zoom);
  const maxX=-baseLeft-w/2*(1-zoom);
  const minY=vr.height-baseTop-h/2*(1+zoom);
  const maxY=-baseTop-h/2*(1-zoom);

  dx=Math.max(minX,Math.min(maxX,dx));
  dy=Math.max(minY,Math.min(maxY,dy));

  canvas.style.setProperty("--camera-x",dx+"px");
  canvas.style.setProperty("--camera-y",dy+"px");
  canvas.style.setProperty("--camera-zoom",zoom);
  canvas.classList.add("camera-active");
 });
}


function resetCamera(){
 clearTimeout(cameraTimer);
 canvas.style.setProperty("--camera-x","0px");
 canvas.style.setProperty("--camera-y","0px");
 canvas.style.setProperty("--camera-zoom","1");
 canvas.classList.remove("camera-active");
}

/* ROUTE */

function drawRoute(){
 const svg=$("route");
 svg.innerHTML="";

 if(completed<1)return;

 const pts=STATIONS
  .slice(0,Math.min(completed+1,STATIONS.length))
  .map(s=>`${s.x*10},${s.y*6}`)
  .join(" ");

 const line=document.createElementNS(
  "http://www.w3.org/2000/svg","polyline"
 );

 line.setAttribute("points",pts);
 svg.appendChild(line);
}

/* STATIONS */

function render(){
 const layer=$("markers");
 layer.innerHTML="";

 STATIONS.forEach((s,i)=>{
  const b=document.createElement("button");
  const state=i<completed?"done":i===completed?"active":"locked";

  b.className=`marker ${state}`;
  b.style.left=s.x+"%";
  b.style.top=s.y+"%";
  const label=document.createElement("span");
  label.textContent=i<completed?"✓":s.id;
  b.appendChild(label);
  b.title=s.nameFr;
  b.setAttribute("aria-label",`${s.id}. ${s.nameFr}`);
  b.disabled=i>completed;

  if(i<=completed)b.onclick=()=>openStation(i);

  layer.appendChild(b);
 });

 drawRoute();

 $("stepLabel").textContent=
  completed===8
   ?"VOYAGE TERMINÉ"
   :`ÉTAPE ${String(completed+1).padStart(2,"0")} / 08`;

 $("percent").textContent=Math.round(completed/8*100)+" %";
 $("fill").style.width=completed/8*100+"%";
}

/* VIDEO MODAL */

function openStation(i){
 if(i>completed)return;

 opened=i;
 previousFocus=document.activeElement;

 moveCamera(i);

 const s=STATIONS[i];

 $("modalStep").textContent=`ÉTAPE ${String(i+1).padStart(2,"0")} / 08`;
 $("modalTitle").textContent=s.nameFr;
 $("modalRussian").textContent=s.nameRu;
 $("modalDescription").textContent=s.descriptionFr;

 $("videoStatus").textContent=
  i<completed
   ?"Vous avez déjà terminé cette étape. Vous pouvez revoir la vidéo."
   :"Regardez la vidéo jusqu’à la fin pour débloquer la suite.";

 $("complete").hidden=i<completed||!!s.videoUrl;
 $("placeholder").hidden=!!s.videoUrl;
 video.hidden=!s.videoUrl;

 video.pause();
 video.removeAttribute("src");
 video.load();

 if(s.videoUrl){
  video.src=s.videoUrl;
  video.load();
 }

 $("modal").classList.add("open");
 $("modal").setAttribute("aria-hidden","false");
 document.body.style.overflow="hidden";
 $("close").focus();
}

function closeModal(){
 $("modal").classList.remove("open");
 $("modal").setAttribute("aria-hidden","true");

 video.pause();
 document.body.style.overflow="";

 if(previousFocus)previousFocus.focus();
}

function finishStep(){
 if(opened===null||opened!==completed)return;

 completed=Math.min(8,completed+1);
 save();

 closeModal();
 render();

 if(completed===8){
  resetCamera();

  cameraTimer=setTimeout(()=>{
   $("finish").classList.add("open");
   $("finish").setAttribute("aria-hidden","false");
  },1100);
 }else{
  // La caméra accompagne le voyage vers la station suivante.
  moveCamera(completed);
 }
}

/* EVENTS */

video.addEventListener("ended",()=>{
 if(opened===completed)finishStep();
});

$("complete").onclick=finishStep;
$("close").onclick=closeModal;

$("modal").addEventListener("click",e=>{
 if(e.target===$("modal"))closeModal();
});

document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&$("modal").classList.contains("open")){
  closeModal();
 }
});

function goMap(){
 $("mapScene").scrollIntoView({behavior:"smooth"});

 cameraTimer=setTimeout(()=>{
  if(completed<8)moveCamera(completed);
  else resetCamera();
 },650);
}

$("start").onclick=goMap;
$("scrollHint").onclick=goMap;

/* RESET AND REPLAY */

function reset(){
 if(!confirm("Recommencer le voyage depuis la première station ?"))return;

 completed=0;
 save();

 $("finish").classList.remove("open");
 $("finish").setAttribute("aria-hidden","true");

 resetCamera();
 render();
}

$("reset").onclick=reset;

$("replay").onclick=()=>{
 completed=0;
 save();

 $("finish").classList.remove("open");
 $("finish").setAttribute("aria-hidden","true");

 resetCamera();
 render();

 $("intro").scrollIntoView({behavior:"smooth"});
};

render();

/* Responsive camera recalculation */
window.addEventListener("resize",()=>{
 if(opened!==null){
  moveCamera(opened);
 }
});
