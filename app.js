const KEY="velour-v4";
const DB="velour-photo-db-v4";
const app=document.getElementById("app");
let state=JSON.parse(localStorage.getItem(KEY)||"null");
if(!state||!Array.isArray(state.cars)){
  state={cars:[{
    id:"1",name:"Mercedes-Benz G-Класс AMG",plate:"A 001 AA 01",price:"31 738 529 ₽",
    fines:[
      {id:"f1",name:"Штраф за превышение скорости",amount:500,date:"21.09.2026",paid:false},
      {id:"f2",name:"Штраф за превышение скорости",amount:500,date:"18.09.2026",paid:false}
    ]
  }]};
  save();
}
let idx=0,view="cars",pendingPhoto=null;

function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function plural(n){n=Math.abs(n)%100;const x=n%10;return n>10&&n<20?"машин":x===1?"машина":x>=2&&x<=4?"машины":"машин"}
function toast(msg){
 let e=document.querySelector(".toast");
 if(!e){e=document.createElement("div");e.className="toast";document.body.appendChild(e)}
 e.textContent=msg;e.classList.add("show");clearTimeout(window.__t);
 window.__t=setTimeout(()=>e.classList.remove("show"),1300);
}
function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore("photos");r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function putPhoto(id,file){const d=await openDB();return new Promise((ok,no)=>{const t=d.transaction("photos","readwrite");t.objectStore("photos").put(file,id);t.oncomplete=ok;t.onerror=()=>no(t.error)})}
async function getPhoto(id){try{const d=await openDB();return await new Promise((ok,no)=>{const r=d.transaction("photos").objectStore("photos").get(id);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>no(r.error)})}catch{return null}}
function fineHTML(f,cid){
 return `<div class="fine">
  <div class="ft"><div><div class="fn">${esc(f.name)}</div><div class="date">${esc(f.date)}</div></div><div class="money">${Number(f.amount).toLocaleString("ru-RU")} ₽</div></div>
  <button class="pay ${f.paid?"paid":""}" data-pay="${cid}:${f.id}">${f.paid?"Оплачено":"Оплатить"}</button>
 </div>`;
}
function carCard(c){
 return `<section class="car">
  <div class="name">${esc(c.name)}</div>
  <div class="plate">${esc(c.plate)}</div>
  <div class="price">${esc(c.price||"Цена не указана")}</div>
  <div class="photoBox" data-open="${c.id}"><img data-photo="${c.id}" src="car-default.png" alt=""></div>
  <div class="fh" data-open="${c.id}"><strong>Штрафы</strong><span class="badge ${c.fines.length?"red":"zero"}">${c.fines.length}</span></div>
  ${c.fines.length?c.fines.slice(0,2).map(f=>fineHTML(f,c.id)).join(""):'<div class="empty">Нет штрафов</div>'}
 </section>`;
}
function cars(){
 return `<div class="top"><div class="logo">Velour</div><div class="count">${state.cars.length} ${plural(state.cars.length)}</div></div>
 <div class="viewport"><div class="track" id="track">${state.cars.map(carCard).join("")}</div></div>
 <div class="dots">${state.cars.map((_,i)=>`<i class="dot ${i===idx?"on":""}"></i>`).join("")}</div>
 <button class="add" id="add">＋ Добавить машину</button>
 <div class="bottom"><button class="nav active">🚗 Машины</button><button class="nav" id="allFines">Штрафы</button></div>`;
}
function add(){
 return `<div class="head"><button class="back" id="back">‹</button><div class="title">Добавить машину</div></div>
 <div class="form">
  <label class="choose" id="choose">＋<br><span>Выберите фото машины</span></label>
  <input class="field" id="n" placeholder="Название / марка">
  <input class="field" id="p" placeholder="Гос. номер">
  <input class="field" id="price" placeholder="Цена автомобиля">
  <button class="save" id="saveCar">Сохранить</button>
 </div>`;
}
function detail(){
 const c=state.cars[idx];
 return `<div class="head"><button class="back" id="back">‹</button><div><div class="title">${esc(c.name)}</div><div class="plate">${esc(c.plate)}</div></div></div>
 <div class="card" style="padding:16px">
  <div class="photoBox"><img data-detail="${c.id}" src="car-default.png" alt=""></div>
  <div class="price detailPrice">${esc(c.price||"Цена не указана")}</div>
  <div class="fh"><strong>Штрафы</strong><span class="badge ${c.fines.length?"red":"zero"}">${c.fines.length}</span></div>
  ${c.fines.length?c.fines.map(f=>fineHTML(f,c.id)).join(""):'<div class="empty">Нет штрафов</div>'}
 </div>
 <button class="add" id="addFine">＋ Добавить штраф</button>`;
}
function render(){
 app.innerHTML=view==="cars"?cars():view==="add"?add():detail();
 if(view==="cars")afterCars();
 if(view==="add")afterAdd();
 if(view==="detail")afterDetail();
}
function attachPhotos(){
 state.cars.forEach(c=>getPhoto(c.id).then(f=>{
   if(!f)return;
   const u=URL.createObjectURL(f);
   document.querySelectorAll(`[data-photo="${c.id}"],[data-detail="${c.id}"]`).forEach(e=>e.src=u);
 }));
}
function afterCars(){
 const tr=document.getElementById("track");
 tr.style.transform=`translateX(-${idx*100}%)`;
 document.getElementById("add").onclick=()=>{view="add";pendingPhoto=null;render()};
 document.querySelectorAll("[data-pay]").forEach(b=>b.onclick=pay);
 document.querySelectorAll("[data-open]").forEach(e=>e.onclick=()=>{
   idx=state.cars.findIndex(c=>c.id===e.dataset.open);
   view="detail";render();
 });
 document.getElementById("allFines").onclick=()=>{
   idx=0;view="detail";render();
 };
 let x=0;
 tr.ontouchstart=e=>x=e.touches[0].clientX;
 tr.ontouchend=e=>{
   const d=e.changedTouches[0].clientX-x;
   if(Math.abs(d)>45){
     idx=Math.max(0,Math.min(state.cars.length-1,idx+(d<0?1:-1)));
     render();
   }
 };
 attachPhotos();
}
function afterAdd(){
 document.getElementById("back").onclick=()=>{view="cars";render()};
 const input=document.getElementById("photo");
 document.getElementById("choose").onclick=()=>input.click();
 input.onchange=e=>{
   pendingPhoto=e.target.files?.[0]||null;
   if(pendingPhoto)document.getElementById("choose").innerHTML=`✓<br><span>${esc(pendingPhoto.name)}</span>`;
 };
 document.getElementById("saveCar").onclick=async()=>{
   const makeId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
   const c={
     id:makeId(),
     name:document.getElementById("n").value.trim()||"Моя машина",
     plate:document.getElementById("p").value.trim()||"Без номера",
     price:document.getElementById("price").value.trim()||"Цена не указана",
     fines:[]
   };
   state.cars.push(c);idx=state.cars.length-1;save();
   if(pendingPhoto)await putPhoto(c.id,pendingPhoto);
   pendingPhoto=null;view="cars";render();toast("Машина добавлена");
 };
}
function afterDetail(){
 document.getElementById("back").onclick=()=>{view="cars";render()};
 document.querySelectorAll("[data-pay]").forEach(b=>b.onclick=pay);
 document.getElementById("addFine").onclick=()=>{
   const c=state.cars[idx];
   const name=prompt("Название штрафа","Штраф за превышение скорости");
   if(name===null)return;
   const amount=prompt("Сумма штрафа","500");
   if(amount===null)return;
   c.fines.push({id:Date.now().toString(36),name:name||"Штраф",amount:Number(amount)||0,date:new Date().toLocaleDateString("ru-RU"),paid:false});
   save();render();
 };
 getPhoto(state.cars[idx].id).then(f=>{
   if(f){const e=document.querySelector(`[data-detail="${state.cars[idx].id}"]`);if(e)e.src=URL.createObjectURL(f)}
 });
}
function pay(e){
 const [cid,fid]=e.currentTarget.dataset.pay.split(":");
 const c=state.cars.find(x=>x.id===cid);const f=c?.fines.find(x=>x.id===fid);
 if(!f)return;f.paid=true;save();render();toast("Штраф оплачен");
}
render();
