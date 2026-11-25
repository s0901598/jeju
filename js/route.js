/* 路線規劃(總覽頁「路線規劃」分頁):選 2~7 個點 → 一鍵用 Naver Map 開車路線帶入(起點、終點 + 最多 5 個中途點)
   地點只能從「本次行程 / 推薦行程」清單挑(需要座標);要新增地點請加進 js/data.js */
(function(){
const MAX=7,KEY='jeju-route';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pk=s=>s.name+'|'+s.lon+'|'+s.lat;
const places=()=>OV.filter(s=>!/待填/.test(s.addr)&&s.lat&&s.lon);
let stops=[null,null];
let inited=false;
function init(){if(inited)return;inited=true;try{const ks=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(ks)&&ks.length>=2&&ks.length<=MAX){const m=new Map(places().map(s=>[pk(s),s]));stops=ks.map(k=>m.get(k)||null)}}catch(e){}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(stops.map(s=>s?pk(s):'')))}catch(e){}};
const L=i=>String.fromCharCode(65+i);
const role=i=>i===0?'起點':i===stops.length-1?'終點':'中途點';
const kor=s=>s.ko||s.name;

function panelHTML(){
  init();
  const n=stops.length,rows=stops.map((s,i)=>`
   ${i?`<button type="button" class="rt-sw" data-sw="${i-1}" aria-label="互換 ${L(i-1)} 和 ${L(i)}">⇅ 互換 ${L(i-1)}↔${L(i)}</button>`:''}
   <div class="rt-row"><span class="rt-dot rt-c${Math.min(i,3)}">${L(i)}</span>
    <button type="button" class="rt-sel${s?'':' empty'}" data-pick="${i}">${s?`<span><b>${esc(s.name)}</b><small>${esc(s.ko||'')}</small></span>`:`<span>選擇${role(i)}</span>`}<i>▾</i></button>
    ${n>2?`<button type="button" class="rt-x" data-del="${i}" aria-label="移除 ${L(i)}">✕</button>`:''}</div>`).join('');
  const names=stops.filter(Boolean).map(s=>s.name);
  return `<div class="rt"><h4>🗺️ 路線規劃<small>自駕・用 Naver Map 開車路線</small></h4>${rows}
   ${n<MAX?`<button type="button" class="rt-add" data-add="1">＋ 新增中途點(還可加 ${MAX-n} 個)</button>`:`<div class="rt-add off">已達上限:起點、終點加 5 個中途點</div>`}
   <button type="button" class="rt-go" data-go="1">開啟 Naver 地圖導航 ›</button>
   <button type="button" class="rt-go2" data-copy="1">📋 複製韓文行程</button>
   <div class="rt-sum">${names.length>1?esc(names.join(' → ')):'選好起點和終點,就能帶進 Naver Map。'}</div>
   <div class="rt-note">是用座標把地點帶進 Naver;到了 Naver 如果位置怪怪的,請用卡片上的地址再搜尋一次。</div></div>`}

function render(){const el=document.getElementById('rtPanel');if(el)el.innerHTML=panelHTML()}
window.routePanelHTML=()=>`<div id="rtPanel">${panelHTML()}</div>`;

/* 選地點:底部彈出清單,可搜尋中文/韓文 */
function openPicker(idx){
  const all=places();document.querySelector('.rt-pop')?.remove();
  const ov=document.createElement('div');ov.className='rt-pop';
  const item=s=>`<button type="button" class="rt-it" data-k="${esc(pk(s))}"><i style="background:${TYPE[s.ty][1]}">${TYPE[s.ty][2]}</i><span><b>${esc(s.name)}</b><small>${esc(s.ko||s.addr)}</small></span><em>${s.days.length?'D'+s.days.join('、'):'推薦行程'}</em></button>`;
  const list=q=>{q=q.trim().toLowerCase();const f=q?all.filter(s=>(s.name+' '+(s.ko||'')+' '+s.addr).toLowerCase().includes(q)):all;
    const a=f.filter(s=>s.days.length),b=f.filter(s=>!s.days.length);
    return (a.length?`<div class="rt-g">本次行程</div>`+a.map(item).join(''):'')+(b.length?`<div class="rt-g">推薦行程(還沒排進去)</div>`+b.map(item).join(''):'')||'<div class="rt-empty">找不到。新地點請跟我說,我幫妳加進清單。</div>'};
  ov.innerHTML=`<div class="rt-sheet"><div class="rt-sh"><b>選擇${role(idx)}</b><button type="button" class="rt-close" aria-label="關閉">✕</button></div>
    <input type="search" class="rt-q" placeholder="輸入中文或韓文搜尋" autocomplete="off"><div class="rt-list">${list('')}</div></div>`;
  document.body.appendChild(ov);
  const lst=ov.querySelector('.rt-list'),q=ov.querySelector('.rt-q');
  q.oninput=()=>{lst.innerHTML=list(q.value)};
  ov.onclick=e=>{
    if(e.target===ov||e.target.closest('.rt-close')){ov.remove();return}
    const b=e.target.closest('.rt-it');if(!b)return;
    const s=all.find(x=>pk(x)===b.dataset.k);if(s){stops[idx]=s;save();render()}ov.remove()}}

window.routeURL=routeURL;function routeURL(){
  const v=stops,a=v[0],z=v[v.length-1],enc=encodeURIComponent;
  let u=`nmap://route/car?slat=${a.lat}&slng=${a.lon}&sname=${enc(kor(a))}&dlat=${z.lat}&dlng=${z.lon}&dname=${enc(kor(z))}`;
  v.slice(1,-1).forEach((m,i)=>{u+=`&v${i+1}lat=${m.lat}&v${i+1}lng=${m.lon}&v${i+1}name=${enc(kor(m))}`});
  return u+'&appname=io.github.s0901598.jeju'}
const koText=()=>stops.filter(Boolean).map((s,i)=>`${L(i)}. ${kor(s)}\n${s.addr}`).join('\n\n');

function fallback(){
  let b=document.getElementById('navfb');if(!b){b=document.createElement('div');b.id='navfb';document.body.appendChild(b)}
  b.innerHTML=`<span>沒有跳到 Naver Map?請確認手機有裝 Naver Map</span><button type="button" class="nf-copy">複製韓文行程</button><button type="button" aria-label="關閉">✕</button>`;
  b.classList.add('on');
  b.querySelector('.nf-copy').onclick=async()=>{toast(await copyText(koText())?'已複製韓文行程':'複製失敗')};
  b.querySelector('button[aria-label]').onclick=()=>b.classList.remove('on');setTimeout(()=>b.classList.remove('on'),12000)}

document.addEventListener('click',async e=>{
  const root=e.target.closest('#rtPanel');if(!root)return;
  const t=e.target.closest('[data-pick],[data-del],[data-sw],[data-add],[data-go],[data-copy]');if(!t)return;
  const d=t.dataset;
  if(d.pick!==undefined)openPicker(+d.pick);
  else if(d.del!==undefined){stops.splice(+d.del,1);while(stops.length<2)stops.push(null);save();render()}
  else if(d.sw!==undefined){const i=+d.sw;[stops[i],stops[i+1]]=[stops[i+1],stops[i]];save();render()}
  else if(d.add!==undefined){if(stops.length<MAX){stops.splice(stops.length-1,0,null);save();render()}}
  else if(d.copy!==undefined){if(stops.filter(Boolean).length<1){toast('還沒選地點');return}toast(await copyText(koText())?'已複製韓文行程':'複製失敗,請長按文字手動複製')}
  else if(d.go!==undefined){
    if(stops.some(s=>!s)){toast('還有地點沒選,請選好或按 ✕ 移除');return}
    if(stops.length<2){toast('至少要有起點和終點');return}
    let left=false;const onHide=()=>{if(document.hidden)left=true};document.addEventListener('visibilitychange',onHide);
    setTimeout(()=>{document.removeEventListener('visibilitychange',onHide);if(!left&&!document.hidden)fallback()},2000);
    location.href=routeURL()}
});
})();
