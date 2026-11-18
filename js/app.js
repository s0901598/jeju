const PITCH=132;
const $=s=>document.querySelector(s);
const pager=$('#pager'),navEl=$('#nav');
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};

/* ---------- 住宿頁 ---------- */
$('#stayList').innerHTML=STAYS.map(s=>`
  <div class="fc stay"><div class="head"><span class="pill">第 ${s.n} 晚</span><span class="dt">${s.date}</span><span class="rgchip">${s.region}部</span></div>
   <div class="nm">${s.name}</div>${s.ko?`<div class="ko">${s.ko}</div>`:''}
   <div class="ad" style="margin-top:4px">📍 ${s.addr}</div>
   <div class="kv"><span>入住</span><span>${s.ci}</span><span>退房</span><span>${s.co}</span><span>訂房代碼</span><span>${s.code}</span><span>房間</span><span>${s.room}</span></div>
   <span class="navbtn">導航 ›</span></div>`).join('');

/* ---------- 總覽頁 ---------- */
const OV=overviewPoints();
$('#ovMap').innerHTML=overviewSVG(OV);
$('#legend').innerHTML=Object.values(TYPE).map(([n,c,g])=>`<span><i style="background:${c}">${g}</i>${n}</span>`).join('');
$('#rgList').innerHTML=['東','南','西','北'].map(r=>{
  const list=OV.filter(s=>regionOf(...px(s.lon,s.lat))===r);
  return `<div class="rgc"><h4>${r}部 <small>${list.length} 個點</small></h4><div class="chips">${
    list.length?list.map(s=>`<span class="chip"><i style="background:${TYPE[s.ty][1]}">${s.ty==='airport'?'✈':TYPE[s.ty][2]}</i>${s.name}<em>D${s.days.join('、')}</em></span>`).join(''):'<span class="empty">這次沒有安排</span>'}</div></div>`}).join('');

/* ---------- 每日頁 ---------- */
const infoPg=$('#p-info');
DAYS.forEach(d=>{
  const letters=d.stops.map((_,i)=>String.fromCharCode(65+i)).join(' → ');
  const pg=document.createElement('section');pg.className='pg day';pg.dataset.nav='Day '+d.n;
  pg.innerHTML=`
   <div class="dh"><h2>Day ${d.n}<small>${d.date} 週${d.wk} · ${d.title}</small></h2><div class="rg">${d.rg.map(r=>`<i>${r}</i>`).join('')}</div></div>
   <div class="map">${mapSVG(d)}<span class="badge l">${letters}</span><span class="badge r">範例</span></div>
   <div class="body">
     <div class="tl">${d.stops.map((s,i)=>`<div class="tli${i===0?' on':''}${i===d.stops.length-1?' last':''}" data-i="${i}"><span class="tm">${s.t}</span><span class="d"></span>${s.dr?`<span class="dr">${s.dr}</span>`:''}</div>`).join('')}<div class="sp"></div></div>
     <div class="cards">${d.stops.map((s,i)=>{const [tn,tc]=TYPE[s.ty];return `<div class="card${i===0?' on':''}" data-i="${i}">
        <div class="badge-l">${String.fromCharCode(65+i)}</div>
        <div class="cb"><div class="r1"><span class="nm">${s.name}</span><span class="ty" style="background:${tc}">${tn}</span></div>
        <div class="ko">${s.ko||'&nbsp;'}</div><div class="ad">📍 ${s.addr}</div>
        <div class="ft"><span class="nt">${s.note||''}</span><span class="go">導航 ›</span></div></div></div>`}).join('')}<div class="sp"><div class="end">Day ${d.n} · 完</div></div></div>
   </div>`;
  pager.insertBefore(pg,infoPg);

  /* 時間軸 <-> 行程 雙向連動 */
  const tl=pg.querySelector('.tl'),cards=pg.querySelector('.cards');
  let src=null,ts=0;
  const setActive=i=>{
    pg.querySelectorAll('.tli').forEach((e,k)=>e.classList.toggle('on',k===i));
    pg.querySelectorAll('.card').forEach((e,k)=>e.classList.toggle('on',k===i));
    pg.querySelectorAll('.mk').forEach((e,k)=>e.classList.toggle('on',k===i));};
  const link=(a,b)=>a.addEventListener('scroll',()=>{
    if(src&&src!==a&&performance.now()-ts<150)return;
    src=a;ts=performance.now();b.scrollTop=a.scrollTop;
    setActive(Math.max(0,Math.min(d.stops.length-1,Math.round(a.scrollTop/PITCH))));},{passive:true});
  link(tl,cards);link(cards,tl);
  pg.querySelectorAll('.tli').forEach(e=>e.onclick=()=>tl.scrollTo({top:e.dataset.i*PITCH,behavior:'smooth'}));
  pg.querySelectorAll('.card').forEach(e=>e.onclick=()=>cards.scrollTo({top:e.dataset.i*PITCH,behavior:'smooth'}));
});
function fitSpacers(){document.querySelectorAll('.tl,.cards').forEach(l=>{l.querySelector('.sp').style.height=Math.max(0,l.clientHeight-PITCH)+'px'})}
fitSpacers();addEventListener('resize',fitSpacers);

/* ---------- 資訊頁:出發前清單(勾選會記在這支手機) ---------- */
const doneSet=new Set(JSON.parse(store.get('jeju-check')||'[]'));
$('#checklist').innerHTML=CHECKLIST.map((t,i)=>`<label class="ck"><input type="checkbox" data-i="${i}"${doneSet.has(i)?' checked':''}><span>${t}</span></label>`).join('');
$('#checklist').addEventListener('change',e=>{const i=+e.target.dataset.i;e.target.checked?doneSet.add(i):doneSet.delete(i);store.set('jeju-check',JSON.stringify([...doneSet]))});

/* ---------- 機票:輸入代碼(目前只有範例代碼,尚未加密) ---------- */
const codeIn=$('#code'),msg=$('#codeMsg'),slots=$('#slots'),relink=$('#relink');
function lockSlots(){slots.innerHTML='<div><b>🔒</b>旅客 1</div><div><b>🔒</b>旅客 2</div>';relink.style.display='none'}
function tryCode(code,silent){
  code=(code||'').trim().toUpperCase();
  if(code===DEMO_CODE){
    slots.innerHTML=[1,2].map(n=>`<div class="open"><b>旅客 ${n}</b>電子機票(範例)<br>正式版會顯示機票圖檔</div>`).join('');
    msg.textContent='';store.set('jeju-code',code);relink.style.display='block';return true;}
  if(!silent)msg.textContent=code?'找不到這組代碼,請再確認':'請先輸入代碼';
  return false;}
$('#codeBtn').onclick=()=>tryCode(codeIn.value);
codeIn.addEventListener('keydown',e=>{if(e.key==='Enter')tryCode(codeIn.value)});
relink.onclick=()=>{store.del('jeju-code');codeIn.value='';msg.textContent='';lockSlots()};
lockSlots();{const saved=store.get('jeju-code');if(saved){codeIn.value=saved;tryCode(saved,true)}}

/* ---------- 頁籤 + 翻頁橘子 ---------- */
const pages=[...pager.children];
pages.forEach((p,i)=>{
  const t=document.createElement('div');t.className='tab'+(i===0?' on':'');t.textContent=p.dataset.nav;
  t.onclick=()=>pager.scrollTo({left:i*pager.clientWidth});navEl.appendChild(t);});
let cur=0,quiet=true;
pager.addEventListener('scroll',()=>{
  const i=Math.round(pager.scrollLeft/pager.clientWidth);if(i===cur)return;const back=i<cur;cur=i;
  [...navEl.children].forEach((t,k)=>t.classList.toggle('on',k===i));
  navEl.classList.toggle('off',i===0);
  const on=navEl.children[i];if(on)navEl.scrollTo({left:on.offsetLeft-navEl.clientWidth/2+on.offsetWidth/2,behavior:'smooth'});
  if(!quiet){const r=$('#roll');r.classList.remove('go','back');void r.getBoundingClientRect();if(back)r.classList.add('back');r.classList.add('go');}
},{passive:true});
navEl.classList.add('off');

/* 電腦用:方向鍵、滑鼠拖曳也能翻頁(手機本來就能用手指滑) */
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;
  if(e.key==='ArrowRight')pager.scrollBy({left:pager.clientWidth});if(e.key==='ArrowLeft')pager.scrollBy({left:-pager.clientWidth})});
{let sx=0,sy=0,sl=0,drag=false,armed=false;
  pager.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.target.closest('input,button,label'))return;armed=true;drag=false;sx=e.clientX;sy=e.clientY;sl=pager.scrollLeft});
  addEventListener('pointermove',e=>{if(!armed)return;const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!drag&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag=true;pager.style.scrollSnapType='none';pager.style.scrollBehavior='auto'}
    if(drag)pager.scrollLeft=sl-dx});
  addEventListener('pointerup',e=>{if(!armed)return;armed=false;if(!drag)return;drag=false;
    const w=pager.clientWidth,dx=e.clientX-sx;let i=Math.round(sl/w);if(Math.abs(dx)>w*0.18)i+=dx<0?1:-1;
    i=Math.max(0,Math.min(pages.length-1,i));pager.style.scrollSnapType='';pager.style.scrollBehavior='';pager.scrollTo({left:i*w,behavior:'smooth'})});}

/* 測試用:?p=頁序&i=第幾個行程&drive=cards|timeline */
const q=new URLSearchParams(location.search);
if(q.get('p')){const st=document.createElement('style');st.textContent='*{transition:none!important}';document.head.appendChild(st);setTimeout(()=>{
  const n=+q.get('p');pager.style.scrollBehavior='auto';pager.scrollLeft=n*pager.clientWidth;
  const pg=pages[n],i=+q.get('i')||0,tgt=pg.querySelector(q.get('drive')==='timeline'?'.tl':'.cards');
  if(tgt){tgt.style.scrollBehavior='auto';tgt.scrollTop=i*PITCH}
  setTimeout(()=>{pager.style.scrollBehavior='';quiet=false},400);},60)}else{setTimeout(()=>quiet=false,400)}

/* ---------- 深淺色切換(預設淺色,選擇會記在這支手機) ---------- */
{const root=document.documentElement,meta=document.querySelector('meta[name=theme-color]');
 const apply=t=>{root.setAttribute('data-theme',t);if(meta)meta.content=t==='dark'?'#0b1e30':'#fff1da'};
 apply(root.getAttribute('data-theme')||'light');
 $('#themeBtn').onclick=()=>{const t=root.getAttribute('data-theme')==='dark'?'light':'dark';apply(t);store.set('jeju-theme',t)};
 /* 星空:固定種子,每次都長一樣 */
 let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;let o='';
 for(let i=0;i<90;i++){const y=rnd()*470,r=.5+rnd()*1.2,op=(.35+rnd()*.6).toFixed(2);
   o+=`<circle cx="${(rnd()*390).toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" style="--o:${op};animation-delay:${(rnd()*3).toFixed(1)}s" opacity="${op}"/>`}
 const st=document.getElementById('stars');if(st)st.innerHTML=o;}
