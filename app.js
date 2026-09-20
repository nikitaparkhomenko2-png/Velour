const defaults={name:"Mercedes-Benz G-Класс AMG",plate:"A 001 AA 01",fines:"0",price:"31 738 529 ₽",priceLabel:"Цена Mercedes-Benz G-Класс AMG",fuel:"55 л",fuelPercent:"78%"};
const saved=JSON.parse(localStorage.getItem("velour-data")||"null")||JSON.parse(localStorage.getItem("autoglass-data")||"null")||defaults;
document.querySelectorAll("[data-key]").forEach(el=>{const k=el.dataset.key;el.textContent=saved[k]??defaults[k];el.addEventListener("blur",()=>{saved[k]=el.textContent.trim();localStorage.setItem("velour-data",JSON.stringify(saved));if(k==="fuelPercent")updateFuel(el.textContent);if(k==="fines")renderFines()});el.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();el.blur()}})});
const fines=document.querySelector('[data-key="fines"]');
function updateFines(){const n=parseInt(fines.textContent.replace(/\D/g,""),10)||0;fines.style.color=n>0?"#ff4d57":"#fff"}updateFines();fines.addEventListener("input",()=>{updateFines();renderFines()});
function updateFuel(v){let n=parseInt(String(v).replace(/\D/g,""),10)||0;n=Math.max(0,Math.min(100,n));document.getElementById("fuelFill").style.width=n+"%"}updateFuel(saved.fuelPercent);

const finesOpen=document.getElementById("finesOpen"),modal=document.getElementById("finesModal"),list=document.getElementById("fineList"),total=document.getElementById("fineTotal"),subtitle=document.getElementById("finesSubtitle"),pay=document.getElementById("payAll");
function count(){return Math.max(0,parseInt(fines.textContent.replace(/\D/g,""),10)||0)}
function renderFines(){const n=count();list.innerHTML="";subtitle.textContent=n===0?"Штрафов нет":`${n} ${n===1?"штраф":"штрафа"}`;total.textContent=(n*500).toLocaleString("ru-RU")+" ₽";for(let i=1;i<=n;i++){const x=document.createElement("div");x.className="fine-item";x.innerHTML=`<div class="fine-item-left"><div class="fine-reason">Превышение скорости</div><div class="fine-date">Штраф №${i}</div></div><div class="fine-price">500 ₽</div>`;list.appendChild(x)}}
function openFines(){renderFines();modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeFines(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow=""}
finesOpen.addEventListener("click",e=>{if(e.target.closest(".fine-count"))return;openFines()});
document.querySelectorAll("[data-close-fines]").forEach(x=>x.addEventListener("click",closeFines));
pay.addEventListener("click",()=>{if(!count()){toast("Штрафов нет");return}saved.fines="0";fines.textContent="0";localStorage.setItem("velour-data",JSON.stringify(saved));updateFines();renderFines();toast("Все штрафы оплачены")});

const img=document.getElementById("carImage"),input=document.getElementById("photoInput");img.src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Mercedes-Benz_G-Class.jpg";
const DB="VelourDB",STORE="photos",KEY="car";
function db(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function getPhoto(){try{const d=await db();return await new Promise((res,rej)=>{const r=d.transaction(STORE).objectStore(STORE).get(KEY);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}catch(e){return null}}
async function putPhoto(f){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(STORE,"readwrite");t.objectStore(STORE).put(f,KEY);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
getPhoto().then(f=>{if(f)img.src=URL.createObjectURL(f)});
input.addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;try{await putPhoto(f);img.src=URL.createObjectURL(f);toast("Фото установлено")}catch(x){toast("Ошибка сохранения")}input.value=""});
function toast(m){const t=document.getElementById("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1300)}
window.addEventListener("beforeunload",()=>localStorage.setItem("velour-data",JSON.stringify(saved)));