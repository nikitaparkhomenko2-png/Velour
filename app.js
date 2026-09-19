const defaults = {
  name:"Mercedes-Benz G-Класс AMG",
  plate:"A 001 AA 01",
  fines:"0",
  price:"31 738 529 ₽",
  priceLabel:"Цена Mercedes-Benz G-Класс AMG",
  fuel:"55 л",
  fuelPercent:"78%",
  expenses:"Нет трат в мае"
};

const remoteCar = "https://upload.wikimedia.org/wikipedia/commons/f/fe/Mercedes-Benz_G-Class.jpg";
const saved = JSON.parse(localStorage.getItem("autoglass-data") || "null") || defaults;
const imageKey = "autoglass-photo";
const DB_NAME = "AutoGlassDB";
const STORE_NAME = "photos";

function openPhotoDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function savePhoto(file){
  const db = await openPhotoDB();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(STORE_NAME,"readwrite");
    tx.objectStore(STORE_NAME).put(file,imageKey);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadPhoto(){
  try{
    const db = await openPhotoDB();
    return await new Promise((resolve,reject)=>{
      const req = db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).get(imageKey);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }catch(e){ return null; }
}

const img = document.getElementById("carImage");
const dots = document.getElementById("dots");
const photoInput = document.getElementById("photoInput");

img.src = "https://upload.wikimedia.org/wikipedia/commons/f/fe/Mercedes-Benz_G-Class.jpg";

for(let i=0;i<5;i++){
  const d=document.createElement("span");
  d.className="dot"+(i===0?" active":"");
  dots.appendChild(d);
}

function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg;
  t.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast=setTimeout(()=>t.classList.remove("show"),1300);
}

loadPhoto().then(file=>{
  if(file) img.src=URL.createObjectURL(file);
});

photoInput.addEventListener("change", async e=>{
  const file=e.target.files && e.target.files[0];
  if(!file) return;
  try{
    await savePhoto(file);
    img.src=URL.createObjectURL(file);
    img.style.opacity="1";
    toast("Фото автомобиля установлено");
  }catch(err){
    console.error(err);
    toast("Не удалось сохранить фото");
  }
  photoInput.value="";
});

// Tapping the fine count only puts the caret there; no edit badges or pencils.
document.querySelector('[data-key="fines"]').addEventListener("click",e=>e.stopPropagation());

// Small horizontal photo carousel feel: tap the car image to advance the indicator.
let activeDot=0;
document.querySelector(".photo-touch").addEventListener("dblclick",()=>{
  activeDot=(activeDot+1)%5;
  document.querySelectorAll(".dot").forEach((d,i)=>d.classList.toggle("active",i===activeDot));
});
