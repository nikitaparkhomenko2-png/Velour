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

document.querySelectorAll("[data-key]").forEach(el=>{
  const key=el.dataset.key;
  el.textContent = saved[key] ?? defaults[key];
  el.addEventListener("blur",()=>saveText(el,key));
  el.addEventListener("keydown",e=>{
    if(e.key==="Enter"){e.preventDefault();el.blur();}
  });
  el.addEventListener("paste",e=>{
    e.preventDefault();
    document.execCommand("insertText",false,(e.clipboardData||window.clipboardData).getData("text"));
  });
});

function saveText(el,key){
  saved[key]=el.textContent.trim();
  localStorage.setItem("autoglass-data",JSON.stringify(saved));
  if(key==="fuelPercent") updateFuel(el.textContent);
}
function updateFuel(value){
  let n=parseInt(value.replace(/\D/g,""),10);
  if(Number.isNaN(n)) n=0;
  n=Math.max(0,Math.min(100,n));
  document.getElementById("fuelFill").style.width=n+"%";
}
updateFuel(saved.fuelPercent);

const img=document.getElementById("carImage");
const dots=document.getElementById("dots");
const photoInput=document.getElementById("photoInput");
const localPhoto=localStorage.getItem(imageKey);
img.src=localPhoto || remoteCar;

for(let i=0;i<5;i++){
  const d=document.createElement("span");
  d.className="dot"+(i===0?" active":"");
  dots.appendChild(d);
}
function toast(msg){
  const t=document.getElementById("toast");
  t.textContent=msg;t.classList.add("show");
  clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),1300);
}
document.querySelector(".photo-touch").addEventListener("click",()=>{
  photoInput.click();
});
photoInput.addEventListener("change",e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    localStorage.setItem(imageKey,reader.result);
    img.src=reader.result;
    toast("Фото автомобиля обновлено");
  };
  reader.readAsDataURL(file);
});

document.querySelectorAll(".quick-item").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const a=btn.dataset.action;
    if(a==="fuel"){
      document.querySelector(".fuel-card").scrollIntoView({behavior:"smooth",block:"center"});
      setTimeout(()=>document.querySelector('[data-key="fuel"]').focus(),350);
    }else if(a==="parking") toast("Парковки");
    else if(a==="transponder") toast("Транспондер");
    else toast("Сервис");
  });
});

// Tapping the fine count only puts the caret there; no edit badges or pencils.
document.querySelector('[data-key="fines"]').addEventListener("click",e=>e.stopPropagation());

// Small horizontal photo carousel feel: tap the car image to advance the indicator.
let activeDot=0;
document.querySelector(".photo-touch").addEventListener("dblclick",()=>{
  activeDot=(activeDot+1)%5;
  document.querySelectorAll(".dot").forEach((d,i)=>d.classList.toggle("active",i===activeDot));
});
