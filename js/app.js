const PITCH=226;
const $=s=>document.querySelector(s);
const pager=$('#pager'),navEl=$('#nav'),tabsEl=$('#tabs');
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};


/* ---------- 小工具:提示、複製、發音、導航 ---------- */
const ICON={
 copy:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>',
 play:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9.5v5h3.6L12.5 19V5L7.6 9.5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const btn=(k,v,t)=>`<button class="ib ${k}" data-${k}="${esc(v)}" title="${t}" aria-label="${t}">${ICON[k]}</button>`;
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),1600)}
async function copyText(txt){
  try{await navigator.clipboard.writeText(txt);return true}catch(e){}
  try{const ta=document.createElement('textarea');ta.value=txt;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch(e){return false}}
let curAudio=null;
function speak(txt,el){
  if(curAudio){curAudio.pause();curAudio=null;document.querySelectorAll('.ib.busy').forEach(b=>b.classList.remove('busy'))}
  const fallback=()=>{
    if(!('speechSynthesis' in window)){toast('這支手機無法播放發音');return}
    const u=new SpeechSynthesisUtterance(txt);u.lang='ko-KR';u.rate=.85;
    const v=speechSynthesis.getVoices().find(v=>/^ko/i.test(v.lang));if(v)u.voice=v;
    speechSynthesis.cancel();speechSynthesis.speak(u)};
  const src=typeof AUDIO!=='undefined'&&AUDIO[txt];
  if(!src){fallback();return}
  const au=new Audio(src);curAudio=au;el.classList.add('busy');
  au.onended=au.onpause=()=>el.classList.remove('busy');
  au.play().catch(()=>{el.classList.remove('busy');fallback()});}
/* 導航:先試 Naver Map app,沒開起來就改開 Google Map */
function navigate(lat,lon,name){
  const naver=`nmap://place?lat=${lat}&lng=${lon}&name=${encodeURIComponent(name)}&appname=io.github.s0901598.jeju`;
  const google=`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  let left=false;const onHide=()=>{if(document.hidden)left=true};
  document.addEventListener('visibilitychange',onHide);addEventListener('pagehide',()=>left=true,{once:true});
  setTimeout(()=>{document.removeEventListener('visibilitychange',onHide);if(!left&&!document.hidden)location.href=google},1800);
  location.href=naver;}
document.addEventListener('click',async e=>{
  const c=e.target.closest('.ib.copy'),p=e.target.closest('.ib.play'),g=e.target.closest('a.go');
  if(c){e.stopPropagation();const t=c.dataset.copy;
    if(!t||/待填/.test(t)){toast('這個還沒填,沒有可複製的內容');return}
    toast(await copyText(t)?'已複製':'複製失敗,請長按文字手動複製')}
  else if(p){e.stopPropagation();speak(p.dataset.play,p)}
  else if(e.target.closest('.sp-tg')){e.stopPropagation();const b=e.target.closest('.sp-tg'),sec=b.parentElement,pop=sec.querySelector('.sp-pop'),open=pop.hidden;sec.closest('.spot').querySelectorAll('.sp-pop').forEach(p=>{p.hidden=true;p.parentElement.classList.remove('open')});if(open){pop.hidden=false;sec.classList.add('open')}sec.closest('.spot').classList.toggle('ex',open)}
  else if(e.target.closest('.sp-x')){e.stopPropagation();dismissSpot(e.target.closest('.spot'))}
  else if(e.target.closest('.sp-img img')){e.stopPropagation();if(window.__spotDragT&&performance.now()-window.__spotDragT<350)return;openLightbox(e.target.closest('.sp-img img'))}
  else if(g){e.preventDefault();e.stopPropagation();navigate(g.dataset.lat,g.dataset.lon,g.dataset.name)}
},true);


/* 行程卡的上下翻動:由程式控制,不靠瀏覽器自己的捲動慣性。
   手指(或滑鼠)按住拖動時,畫面跟著手走;放開時最多只翻一張,不會衝到最後一張。 */
function cardPager(cards){
  const n=()=>cards.querySelectorAll('.card').length;
  const go=i=>cards.scrollTo({top:Math.max(0,Math.min(n()-1,i))*PITCH,behavior:'smooth'});
  let down=false,moved=false,sy=0,st=0,hist=[];
  cards.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;if(e.target.closest('input,a'))return;
    down=true;moved=false;sy=e.clientY;st=cards.scrollTop;hist=[[performance.now(),e.clientY]]});
  cards.addEventListener('pointermove',e=>{if(!down)return;const dy=e.clientY-sy;
    if(!moved&&Math.abs(dy)>6){moved=true;cards.classList.add('dragging');try{cards.setPointerCapture(e.pointerId)}catch(_){}}
    if(moved){cards.style.scrollBehavior='auto';cards.scrollTop=st-dy;hist.push([performance.now(),e.clientY]);if(hist.length>5)hist.shift()}});
  const end=e=>{if(!down)return;down=false;cards.classList.remove('dragging');cards.style.scrollBehavior='';
    if(!moved)return;
    const a=hist[0],b=hist[hist.length-1],dt=Math.max(1,b[0]-a[0]),v=(b[1]-a[1])/dt;   // 向上滑 v 為負
    const start=Math.round(st/PITCH);
    let idx;
    if(e&&e.type==='pointercancel')idx=Math.round(cards.scrollTop/PITCH);
    else if(Math.abs(v)>0.35)idx=start+(v<0?1:-1);                 // 快速一滑:只翻一張
    else idx=Math.round(cards.scrollTop/PITCH);                    // 慢慢拖:停在最近的一張
    go(idx)};
  cards.addEventListener('pointerup',end);cards.addEventListener('pointercancel',end);
  cards.addEventListener('click',e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false}},true);
  /* 電腦滾輪 / 觸控板:一次滾動手勢只翻一張 */
  let lock=false,lt=0;
  cards.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;e.preventDefault();
    clearTimeout(lt);lt=setTimeout(()=>lock=false,160);if(lock||Math.abs(e.deltaY)<4)return;lock=true;
    go(Math.round(cards.scrollTop/PITCH)+(e.deltaY>0?1:-1))},{passive:false})}

/* ---------- 住宿頁 ---------- */
$('#stayList').innerHTML=STAYS.map(s=>`
  <div class="fc stay"><div class="head"><span class="pill">第 ${s.n} 晚</span><span class="dt">${s.date}</span><span class="rgchip">${s.region}部</span></div>
   <div class="nm">${s.name}</div>${s.ko?`<div class="ko">${s.ko}</div>`:''}
   <div class="ad" style="margin-top:4px">📍 ${s.addr}</div>
   <div class="kv"><span>入住</span><span>${s.ci}</span><span>退房</span><span>${s.co}</span><span>訂房代碼</span><span>${s.code}</span><span>房間</span><span>${s.room}</span></div>
   <span class="navbtn">導航 ›</span></div>`).join('');

/* ---------- 總覽頁:分類篩選(全部 / 機場 / 景點 / 美食 / 住宿) ---------- */
const cv=k=>{const c=TYPE[k][1],n=parseInt(c.slice(1),16);return `--c:${c};--rgb:${n>>16},${(n>>8)&255},${n&255}`};
const OV=overviewPoints();let ovFilter='all',ovRegion='全部',ovJM=null,ovPts=OV;
const REG=['東','南','西','北'];
const rowHTML=s=>`<div class="rrow" data-o="${OV.indexOf(s)}"><i class="rdot" style="background:${TYPE[s.ty][1]}">${TYPE[s.ty][2]}</i><span class="rnm">${s.name}</span><em class="rdy">${s.days.length?'D'+s.days.join('、'):'候選'}</em></div>`;
const openOv=()=>openMapFull({title:'濟州島總覽 · '+(ovFilter==='all'?'全部':TYPE[ovFilter][0]),points:ovPts,route:false,badge:'type',regions:true,fit:'island'});
/* 關閉小卡:小卡往下滑出、壓黑的背景慢慢變亮,結束後才真的移除 */
function dismissSpot(el){if(!el||el.classList.contains('closing'))return;el.classList.add('closing');
  el.style.transition='transform .26s ease,opacity .26s ease';el.style.transform='translateY(110%)';el.style.opacity='0';
  ovJM&&ovJM.setActive&&ovJM.setActive(-1);setTimeout(()=>el.remove(),270)}
const closeSpot=()=>{const o=document.querySelector('.app > .spot:not(.closing)');if(!o)return false;dismissSpot(o);return true};
function showSpot(s){if(!s)return;document.querySelector('.app > .spot')?.remove();document.querySelector('.app').insertAdjacentHTML('beforeend',spotCard(s));const i=ovPts.indexOf(s);ovJM&&ovJM.setActive&&ovJM.setActive(i)}
function renderOverview(){
  const pts=ovFilter==='all'?OV:OV.filter(s=>s.ty===ovFilter);
  const byR=(l,r)=>l.filter(s=>regionOf(s.lon,s.lat)===r);const sel=ovRegion!=='全部'?ovRegion:'';const mp=sel?byR(pts,sel):pts;
  ovPts=mp;if(ovJM)ovJM.destroy();ovJM=JMap($('#ovHost'),{points:mp,route:false,badge:'type',interactive:true,small:true,fit:sel?'points':'island',regions:!sel});
  const rs2=$('#ovReset');rs2.classList.remove('on');ovJM.onTouched=t=>rs2.classList.toggle('on',t);ovJM.onTap=()=>{if(!closeSpot())openOv()};ovJM.onStop=i=>showSpot(ovPts[i]);closeSpot();
  const tabs=['全部',...REG].map(r=>`<button data-r="${r}" class="${ovRegion===r?'on':''}">${r==='全部'?'全部':r+'部'}<em>${r==='全部'?pts.length:byR(pts,r).length}</em></button>`).join('');
  const body=sel?(byR(pts,sel).map(rowHTML).join('')||'<div class="empty">這個區域沒有安排</div>')
    :REG.map(r=>{const l=byR(pts,r);return l.length?`<div class="rgp"><h4>${r}部 <small>${l.length}</small></h4>${l.map(rowHTML).join('')}</div>`:''}).join('')||'<div class="empty">沒有安排</div>';
  $('#rgList').innerHTML=`<div class="seg">${tabs}</div><div class="rows">${body}</div>`;
  $('#filters').innerHTML=`<button class="fpill all${ovFilter==='all'?' on':''}" data-f="all" style="--c:#ee6a0a;--rgb:238,106,10">全部<em>${OV.length}</em></button>`+
    Object.entries(TYPE).map(([k,[n,c,g]])=>`<button class="fpill${ovFilter===k?' on':''}" data-f="${k}" style="${cv(k)}"><i>${g}</i>${n}<em>${OV.filter(s=>s.ty===k).length}</em></button>`).join('');}
$('#rgList').addEventListener('click',e=>{const r=e.target.closest('.rrow');if(r)showSpot(OV[+r.dataset.o])});
/* 放大看照片:多張時可左右滑動換張,點一下或往下滑關閉 */
function openLightbox(im){
  const tr=im.closest('.sp-track'),imgs=[...tr.children],urls=imgs.map(x=>x.src),n=urls.length;let idx=Math.max(0,imgs.indexOf(im));
  const lb=document.createElement('div');lb.className='lbox';
  lb.innerHTML=`<div class="lb-track">${urls.map(u=>`<img src="${u}" alt="">`).join('')}</div>${n>1?`<span class="lb-cnt"></span>`:''}<span class="lb-hint">${n>1?'左右滑動換張 · 點一下關閉':'點一下關閉'}</span>`;
  document.querySelector('.app').appendChild(lb);
  const t=lb.querySelector('.lb-track'),cnt=lb.querySelector('.lb-cnt');
  const show=(anim)=>{t.style.transition=anim?'transform .28s ease':'none';t.style.transform=`translateX(${-idx*100}%)`;if(cnt)cnt.textContent=(idx+1)+' / '+n};
  show(false);
  let x0=0,y0=0,dx=0,dy=0,axis=null,down=false,moved=false;
  lb.addEventListener('pointerdown',e=>{down=true;x0=e.clientX;y0=e.clientY;dx=dy=0;axis=null;moved=false});
  lb.addEventListener('pointermove',e=>{if(!down)return;dx=e.clientX-x0;dy=e.clientY-y0;
    if(!axis&&(Math.abs(dx)>8||Math.abs(dy)>8))axis=(n>1&&Math.abs(dx)>Math.abs(dy))?'x':'y';
    if(axis)moved=true;
    if(axis==='x'){let o=dx;if((idx===0&&dx>0)||(idx===n-1&&dx<0))o=dx*.35;t.style.transition='none';t.style.transform=`translateX(calc(${-idx*100}% + ${o}px))`}
    else if(axis==='y'){const d=Math.max(0,dy);t.style.transform=`translateX(${-idx*100}%) translateY(${d}px)`;lb.style.background=`rgba(0,0,0,${.9-Math.min(.6,d/400)})`}});
  const end=()=>{if(!down)return;down=false;
    if(axis==='x'){if(dx<-40)idx=Math.min(n-1,idx+1);else if(dx>40)idx=Math.max(0,idx-1);show(true)}
    else if(axis==='y'){if(dy>80){close()}else{lb.style.background='';show(true)}}};
  const close=()=>{const sp=document.querySelector('.spot .sp-track');if(sp&&n>1){sp.dataset.i=idx;sp.style.transition='none';sp.style.transform=`translateX(${-idx*100}%)`;const s=sp.closest('.sp-img');s.querySelectorAll('.sp-dots i').forEach((d,k)=>d.classList.toggle('on',k===idx));const c=s.querySelector('.sp-cnt');if(c)c.textContent=(idx+1)+'/'+n}
    lb.remove()};
  lb.addEventListener('pointerup',end);lb.addEventListener('pointercancel',end);
  lb.addEventListener('click',()=>{if(!moved)close();moved=false});
  window.__spotDragT=performance.now();
}
/* 小卡往下滑可以關閉(iPhone Safari 對 touch-action 支援不完整,所以另外用 touchmove 擋住背後頁面的捲動) */
document.addEventListener('touchmove',e=>{const t=e.target;if(t.closest&&(t.closest('.spot,.lbox')||((t.classList.contains('app')||t.classList.contains('mf'))&&document.querySelector('.spot'))))e.preventDefault()},{passive:false});
/* 點壓黑的背景也會關閉小卡 */
document.addEventListener('click',e=>{const t=e.target;if((t.classList.contains('app')||t.classList.contains('mf'))&&t.querySelector(':scope > .spot')){e.stopPropagation();dismissSpot(t.querySelector(':scope > .spot'))}},true);
{let el=null,x0=0,y0=0,dx=0,dy=0,t0=0,axis=null,tr=null,idx=0,n=1,w=1,moved=false;
 const setSlide=(i,anim)=>{tr.style.transition=anim?'transform .28s ease':'none';tr.style.transform=`translateX(${-i*100}%)`;
   const sp=tr.closest('.sp-img');sp.querySelectorAll('.sp-dots i').forEach((d,k)=>d.classList.toggle('on',k===i));const c=sp.querySelector('.sp-cnt');if(c)c.textContent=(i+1)+'/'+n};
 document.addEventListener('pointerdown',e=>{const s=e.target.closest('.spot');if(!s||e.target.closest('.ib,a.go,.sp-x,.sp-tg'))return;
   el=s;x0=e.clientX;y0=e.clientY;dx=dy=0;t0=performance.now();axis=null;moved=false;el.style.animation='none';el.style.transition='none';
   tr=e.target.closest('.sp-img')?el.querySelector('.sp-track'):null;if(tr){n=tr.children.length;idx=+tr.dataset.i||0;w=tr.clientWidth||1;if(n<2)tr=null}});
 document.addEventListener('pointermove',e=>{if(!el)return;dx=e.clientX-x0;dy=e.clientY-y0;
   if(!axis&&(Math.abs(dx)>8||Math.abs(dy)>8)){axis=(tr&&Math.abs(dx)>Math.abs(dy))?'x':'y'}
   if(axis)moved=true;
   if(axis==='x'){let o=dx;if((idx===0&&dx>0)||(idx===n-1&&dx<0))o=dx*.35;tr.style.transition='none';tr.style.transform=`translateX(calc(${-idx*100}% + ${o}px))`}
   else if(axis==='y'){const d=Math.max(0,dy);el.style.transform=`translateY(${d}px)`;el.style.opacity=String(1-Math.min(.6,d/400))}});
 const end=()=>{if(!el)return;const s=el,v=Math.max(0,dy)/Math.max(1,performance.now()-t0);el=null;
   if(moved){window.__spotDragT=performance.now()}
   if(axis==='x'){let i=idx;if(dx<-40||dx<-w*.2)i=Math.min(n-1,idx+1);else if(dx>40||dx>w*.2)i=Math.max(0,idx-1);tr.dataset.i=i;setSlide(i,true);return}
   s.style.transition='transform .2s,opacity .2s';
   if(axis==='y'&&(dy>70||(dy>25&&v>.5))){dismissSpot(s)}else{s.style.transform='';s.style.opacity=''}};
 document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end)}
pager.addEventListener('scroll',()=>closeSpot(),{passive:true});
$('#filters').addEventListener('click',e=>{const b=e.target.closest('.fpill');if(!b)return;ovFilter=b.dataset.f;renderOverview()});
renderOverview();
$('#ovMap .mexpand').onclick=e=>{e.stopPropagation();openOv()};$('#ovReset').onclick=e=>{e.stopPropagation();ovJM&&ovJM.home()};

/* ---------- 每日頁 ---------- */
const infoPg=$('#p-info');
DAYS.forEach(d=>{
  const letters=d.stops.map((_,i)=>String.fromCharCode(65+i)).join(' → ');
  const pg=document.createElement('section');pg.className='pg day';pg.dataset.nav='Day '+d.n;
  pg.innerHTML=`
   <div class="dh"><h2>Day ${d.n}<small>${d.date} 週${d.wk} · ${d.title}</small></h2></div>
   <div class="map"><div class="mhost"></div><span class="badge r">範例</span><button class="mreset" aria-label="回到全景">◎</button><span class="mexpand"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span></div>
   <div class="body">
     <div class="tl">${d.stops.map((s,i)=>`<div class="tli${i===0?' on':''}${i===d.stops.length-1?' last':''}${d.stops[i+1]&&d.stops[i+1].dr?' hasdr':''}" data-i="${i}"><span class="tm">${s.t}</span><span class="d"></span>${d.stops[i+1]&&d.stops[i+1].dr?`<span class="dr">${d.stops[i+1].dr}</span>`:''}</div>`).join('')}<div class="sp"></div></div>
     <div class="cards">${d.stops.map((s,i)=>{const [tn,tc]=TYPE[s.ty];return `<div class="card${i===0?' on':''}" data-i="${i}">
        <div class="cb"><div class="r1"><span class="nm">${s.name}</span><span class="ty" style="background:${tc}">${tn}</span></div>
        <div class="ko"><span class="kt">${s.ko||'韓文待填'}</span>${s.ko?btn('copy',s.ko,'複製韓文名稱')+btn('play',s.ko,'播放韓文發音'):''}</div>
        <div class="ad"><span class="at">📍 ${s.addr}</span>${btn('copy',s.addr,'複製地址')}</div>
        <div class="ft"><span class="nt"><span class="lb">內容：</span>${s.note||'—'}</span><a class="go" href="#" data-lat="${s.lat}" data-lon="${s.lon}" data-name="${s.ko||s.name}">導航 ›</a></div></div></div>`}).join('')}<div class="sp"></div></div>
   </div>`;
  pager.insertBefore(pg,infoPg);
  const jm=JMap(pg.querySelector('.mhost'),{points:d.stops,route:true,badge:'letter',interactive:true,small:true,active:0});pg._jm=jm;
  let curIdx=0;
  const openDay=sel=>openMapFull({title:`Day ${d.n} · ${letters}`,points:d.stops,route:true,badge:'letter',sel});
  jm.onTap=()=>openDay(curIdx);jm.onStop=i=>openDay(i);
  const rs=pg.querySelector('.mreset');jm.onTouched=t=>rs.classList.toggle('on',t);rs.onclick=e=>{e.stopPropagation();jm.home()};
  pg.querySelector('.mexpand').onclick=e=>{e.stopPropagation();openDay(curIdx)};

  /* 時間軸 <-> 行程 雙向連動 */
  const tl=pg.querySelector('.tl'),cards=pg.querySelector('.cards');
  let src=null,ts=0;
  const setActive=i=>{curIdx=i;jm.setActive(i);
    pg.querySelectorAll('.tli').forEach((e,k)=>e.classList.toggle('on',k===i));
    pg.querySelectorAll('.card').forEach((e,k)=>e.classList.toggle('on',k===i));
    pg.querySelectorAll('.mk').forEach((e,k)=>e.classList.toggle('on',k===i));};
  const link=(a,b)=>a.addEventListener('scroll',()=>{
    if(src&&src!==a&&performance.now()-ts<150)return;
    src=a;ts=performance.now();b.scrollTop=a.scrollTop;
    setActive(Math.max(0,Math.min(d.stops.length-1,Math.round(a.scrollTop/PITCH))));
    if(a.scrollTop>6)pg.classList.add('compact');else if(a.scrollTop<=1)pg.classList.remove('compact');},{passive:true});
  link(cards,tl);   // 時間軸只跟著行程卡走,自己不能被拖動
  cardPager(cards);
  pg.querySelectorAll('.tli').forEach(e=>e.onclick=()=>cards.scrollTo({top:e.dataset.i*PITCH,behavior:'smooth'}));
  pg.querySelectorAll('.card').forEach(e=>e.onclick=()=>cards.scrollTo({top:e.dataset.i*PITCH,behavior:'smooth'}));
});
function fitSpacers(){document.querySelectorAll('.tl,.cards').forEach(l=>{l.querySelector('.sp').style.height=Math.max(0,l.clientHeight-PITCH)+'px'})}
fitSpacers();addEventListener('resize',fitSpacers);
if(window.ResizeObserver){const ro2=new ResizeObserver(fitSpacers);document.querySelectorAll('.cards').forEach(e=>ro2.observe(e))}

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
  t.onclick=()=>pager.scrollTo({left:i*pager.clientWidth});tabsEl.appendChild(t);});
let cur=0,quiet=true;
function resetPage(pg){if(pg._jm)pg._jm.home();pg.scrollTop=0;pg.classList.remove('compact');pg.querySelectorAll('.tl,.cards').forEach(e=>{e.style.scrollBehavior='auto';e.scrollTop=0;e.style.scrollBehavior=''});pg.querySelectorAll('.tli,.card,.mk').forEach((e,k)=>{});}
pager.addEventListener('scroll',()=>{
  const i=Math.round(pager.scrollLeft/pager.clientWidth);if(i===cur)return;const prevI=cur;cur=i;setTimeout(()=>resetPage(pages[prevI]),350);
  [...tabsEl.children].forEach((t,k)=>t.classList.toggle('on',k===i));
  navEl.classList.toggle('off',i===0);
  const on=tabsEl.children[i];if(on)tabsEl.scrollTo({left:on.offsetLeft-tabsEl.clientWidth/2+on.offsetWidth/2,behavior:'smooth'});
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
  if(q.get('compact'))pg.classList.add('compact');
  if(q.get('open'))setTimeout(()=>{const m=pg.querySelector('.map,.ovmap');m&&m.click();if(q.get('pick'))setTimeout(()=>{const c=document.querySelector(`.mf-chp[data-i="${q.get('pick')}"]`);c&&c.click()},300);if(q.get('mode')==='B')setTimeout(()=>document.querySelector('.mf-mode')?.click(),500)},150);
  if(q.get('st')&&tgt)tgt.scrollTop=+q.get('st');
  if(q.get('sy'))pg.scrollTop=+q.get('sy');
  if(q.get('spot'))setTimeout(()=>showSpot(ovPts[+q.get('spot')]),400);
  if(q.get('f')){const b=document.querySelector(`.fpill[data-f="${q.get('f')}"]`);if(b)b.click()}
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

/* 封面文字位置:依螢幕大小跟著背景圖縮放 */
{const cv=document.querySelector('.cover');const fit=()=>{if(!cv)return;const s=Math.max(cv.clientWidth/390,cv.clientHeight/844);cv.style.setProperty('--cs',s.toFixed(3))};
 fit();addEventListener('resize',fit);if(window.ResizeObserver)new ResizeObserver(fit).observe(cv)}

$('#rgList').addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b)return;ovRegion=b.dataset.r;renderOverview()});
