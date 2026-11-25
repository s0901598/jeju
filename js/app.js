const PITCH=226;
const CC=.32;   /* Day 頁:行程卡停靠的位置(占卡片區高度的比例),越小越靠上 */
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
/* 導航:用「地址」在 Naver Map 搜尋(和複製地址貼到 Naver 是同一個結果);不會自動把本頁換成 Google Map */
function navigate(lat,lon,name,addr){
  const q=(addr&&!/待填/.test(addr))?addr:name;
  const naver=`nmap://search?query=${encodeURIComponent(q)}&appname=io.github.s0901598.jeju`;
  const google=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  let left=false;const onHide=()=>{if(document.hidden)left=true};
  document.addEventListener('visibilitychange',onHide);
  setTimeout(()=>{document.removeEventListener('visibilitychange',onHide);if(!left&&!document.hidden)navFallback(google)},2000);
  location.href=naver;}
function navFallback(url){
  let b=document.getElementById('navfb');if(!b){b=document.createElement('div');b.id='navfb';document.body.appendChild(b)}
  b.innerHTML=`<span>沒有跳到 Naver Map?</span><a href="${url}" target="_blank" rel="noopener">改開 Google 地圖</a><button type="button" aria-label="關閉">✕</button>`;
  b.classList.add('on');b.querySelector('button').onclick=()=>b.classList.remove('on');setTimeout(()=>b.classList.remove('on'),9000)}
/* LINE 內建瀏覽器:提示改用 Safari 開啟 */
(()=>{if(!/\bLine\//i.test(navigator.userAgent)||/openExternalBrowser=1/.test(location.search))return;
  const bar=document.createElement('div');bar.id='lnbar';
  const u=location.origin+location.pathname+'?openExternalBrowser=1';
  bar.innerHTML=`<span>你在 LINE 裡開啟,部分功能(導航、複製)可能不順</span><a href="${u}">用 Safari 開啟</a><button type="button" aria-label="關閉">✕</button>`;
  bar.querySelector('button').onclick=()=>bar.remove();document.body.appendChild(bar)})();
document.addEventListener('click',async e=>{
  const c=e.target.closest('.ib.copy,.pnr-cp'),p=e.target.closest('.ib.play'),g=e.target.closest('a.go');
  if(c){e.stopPropagation();const t=c.dataset.copy;
    if(!t||/待填/.test(t)){toast('這個還沒填,沒有可複製的內容');return}
    toast(await copyText(t)?'已複製':'複製失敗,請長按文字手動複製')}
  else if(p){e.stopPropagation();speak(p.dataset.play,p)}
  else if(e.target.closest('.sp-tg')){e.stopPropagation();const b=e.target.closest('.sp-tg'),sec=b.parentElement,pop=sec.querySelector('.sp-pop'),open=pop.hidden;sec.closest('.spot').querySelectorAll('.sp-pop').forEach(p=>{p.hidden=true;p.parentElement.classList.remove('open')});if(open){pop.hidden=false;sec.classList.add('open')}sec.closest('.spot').classList.toggle('ex',open)}
  else if(e.target.closest('.sp-x')){e.stopPropagation();dismissSpot(e.target.closest('.spot'))}
  else if(e.target.closest('.sp-img img')){e.stopPropagation();if(window.__spotDragT&&performance.now()-window.__spotDragT<350)return;openLightbox(e.target.closest('.sp-img img'))}
  else if(g){e.preventDefault();e.stopPropagation();navigate(g.dataset.lat,g.dataset.lon,g.dataset.name,g.dataset.addr)}
},true);


/* 行程卡的上下翻動:由程式控制,不靠瀏覽器自己的捲動慣性。
   手指(或滑鼠)按住拖動時,畫面跟著手走;放開時最多只翻一張,不會衝到最後一張。 */
function cardPager(cards){
  const n=()=>cards.querySelectorAll('.card').length;
  const go=i=>cards.scrollTo({top:Math.max(0,Math.min(n()-1,i))*PITCH,behavior:'smooth'});
  let down=false,moved=false,sy=0,st=0,hist=[];
  cards.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;   // 手指觸控交給瀏覽器原生捲動(比較順);滑鼠才用程式拖動
    if(e.button!==0)return;if(e.target.closest('input,a'))return;
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
  /* 手指(iPhone):用瀏覽器原生捲動(最順),只在「慣性快要衝過一張以上」時才煞車,最多翻前後一張 */
  if(window.matchMedia&&matchMedia('(pointer:coarse)').matches){
    let base=0,mom=false,braked=false,idle=null,rt=null;
    cards.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;clearTimeout(rt);cards.style.overflowY='';cards.style.scrollBehavior='';
      base=Math.round(cards.scrollTop/PITCH);mom=false;braked=false},{passive:true});
    const lift=()=>{mom=true};
    cards.addEventListener('touchend',lift,{passive:true});cards.addEventListener('touchcancel',lift,{passive:true});
    cards.addEventListener('scroll',()=>{
      clearTimeout(idle);idle=setTimeout(()=>{mom=false;braked=false},180);
      if(!mom||braked)return;
      if(Math.abs(cards.scrollTop-base*PITCH)>PITCH*1.02){            // 放手後還要飛超過一張 → 煞車,停在前/後一張
        braked=true;const to=Math.max(0,Math.min(n()-1,base+(cards.scrollTop>base*PITCH?1:-1)));
        cards.style.overflowY='hidden';cards.scrollTo({top:to*PITCH,behavior:'smooth'});
        clearTimeout(rt);rt=setTimeout(()=>{cards.style.overflowY='';cards.style.scrollBehavior=''},450)}},{passive:true})}
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
const rowHTML=s=>`<div class="rrow" data-o="${OV.indexOf(s)}"><i class="rdot" style="background:${TYPE[s.ty][1]}">${TYPE[s.ty][2]}</i><span class="rnm">${s.name}</span><em class="rdy">${s.days.length?'D'+s.days.join('、'):'推薦行程'}</em></div>`;
const openOv=()=>openMapFull({title:'濟州島總覽 · '+(ovFilter==='all'?'全部':TYPE[ovFilter][0]),points:ovPts,route:false,badge:'type',regions:true,fit:'island'});
/* 關閉小卡:小卡往下滑出、壓黑的背景慢慢變亮,結束後才真的移除 */
function dismissSpot(el){if(!el||el.classList.contains('closing'))return;el.classList.add('closing');
  el.style.transition='transform .26s ease,opacity .26s ease';el.style.transform='translateY(110%)';el.style.opacity='0';
  ovJM&&ovJM.setActive&&ovJM.setActive(-1);setTimeout(()=>el.remove(),270)}
const closeSpot=()=>{const o=document.querySelector('.app > .spot:not(.closing)');if(!o)return false;dismissSpot(o);return true};
function showSpot(s){if(!s)return;document.querySelector('.app > .spot')?.remove();document.querySelector('.app').insertAdjacentHTML('beforeend',spotCard(s));const i=ovPts.indexOf(s);ovJM&&ovJM.setActive&&ovJM.setActive(i)}
let ovMode='list';
function renderOverview(){
  const pts=ovFilter==='all'?OV:OV.filter(s=>s.ty===ovFilter);
  const byR=(l,r)=>l.filter(s=>regionOf(s.lon,s.lat)===r);const sel=(ovMode==='list'&&ovRegion!=='全部')?ovRegion:'';const mp=sel?byR(pts,sel):pts;
  ovPts=mp;if(ovJM)ovJM.destroy();ovJM=JMap($('#ovHost'),{points:mp,route:false,badge:'type',interactive:true,small:true,fit:sel?'points':'island',regions:!sel});
  const rs2=$('#ovReset');rs2.classList.remove('on');ovJM.onTouched=t=>rs2.classList.toggle('on',t);ovJM.onTap=()=>{if(!closeSpot())openOv()};ovJM.onStop=i=>showSpot(ovPts[i]);closeSpot();
  const opts=['全部',...REG].map(r=>`<option value="${r}"${ovRegion===r?' selected':''}>${r==='全部'?'全部景點':r+'部'}(${r==='全部'?pts.length:byR(pts,r).length})</option>`).join('');
  const body=sel?(byR(pts,sel).map(rowHTML).join('')||'<div class="empty">這個區域沒有安排</div>')
    :REG.map(r=>{const l=byR(pts,r);return l.length?`<div class="rgp"><h4>${r}部 <small>${l.length}</small></h4>${l.map(rowHTML).join('')}</div>`:''}).join('')||'<div class="empty">沒有安排</div>';
  const nav=ovMode==='nav';
  $('#rgList').innerHTML=`<div class="ovbar"><label class="ovsel${nav?'':' on'}"><select id="ovRgSel" aria-label="區域">${opts}</select><span>▾</span></label><button type="button" class="ovnav${nav?' on':''}" id="ovNavBtn">🗺️ 路線規劃</button></div>${nav?routePanelHTML():`<div class="rows">${body}</div>`}`;
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
document.addEventListener('touchmove',e=>{const t=e.target;{const sc=t.closest&&t.closest('.fxc .fx-b');if(sc&&sc.scrollHeight>sc.clientHeight)return}if(t.closest&&(t.closest('.spot,.lbox')||((t.classList.contains('app')||t.classList.contains('mf'))&&document.querySelector('.spot'))))e.preventDefault()},{passive:false});
/* 點壓黑的背景也會關閉小卡 */
document.addEventListener('click',e=>{const t=e.target;if((t.classList.contains('app')||t.classList.contains('mf'))&&t.querySelector(':scope > .spot')){e.stopPropagation();dismissSpot(t.querySelector(':scope > .spot'))}},true);
{let el=null,x0=0,y0=0,dx=0,dy=0,t0=0,axis=null,tr=null,idx=0,n=1,w=1,moved=false;
 const setSlide=(i,anim)=>{tr.style.transition=anim?'transform .28s ease':'none';tr.style.transform=`translateX(${-i*100}%)`;
   const sp=tr.closest('.sp-img');sp.querySelectorAll('.sp-dots i').forEach((d,k)=>d.classList.toggle('on',k===i));const c=sp.querySelector('.sp-cnt');if(c)c.textContent=(i+1)+'/'+n};
 document.addEventListener('pointerdown',e=>{const s=e.target.closest('.spot');if(!s||e.target.closest('.ib,a.go,.sp-x,.sp-tg,.fxc input,.fxc select,.fxc button:not(.sp-x),.fxc .fx-b'))return;
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
/* 暫時關掉 Day 1~4 的地圖(排查滑動問題用)。要恢復,把下面這行改成 false 即可;總覽頁的地圖不受影響 */
const HIDE_DAY_MAP=false;
const HIDE_TIMELINE=false;   // 暫時隱藏時間軸(測試滑動順暢度);改成 false 就恢復
DAYS.forEach(d=>{
  const letters=d.stops.map((_,i)=>String.fromCharCode(65+i)).join(' → ');
  const pg=document.createElement('section');pg.className='pg day';pg.dataset.nav='Day '+d.n;
  pg.innerHTML=`
   <div class="dh"><h2>Day ${d.n}<small>${d.date} 週${d.wk} · ${d.title}</small></h2></div>
   <div class="body">
     <div class="tl"><div class="tlin">${d.stops.map((s,i)=>`<div class="tli${i===0?' on':''}${i===d.stops.length-1?' last':''}${d.stops[i+1]&&d.stops[i+1].dr?' hasdr':''}" data-i="${i}" style="--i:${i}"><span class="tm">${s.t}</span><span class="d"></span>${d.stops[i+1]&&d.stops[i+1].dr?`<span class="dr">${d.stops[i+1].dr}</span>`:''}</div>`).join('')}</div><div class="sp"></div></div>
     <div class="cards">${d.stops.map((s,i)=>{const [tn,tc]=TYPE[s.ty];return `<div class="card${i===0?' on':''}${s.ill?' hasill':''}" data-i="${i}">
        ${s.ill?`<div class="ill-bg" style="background-image:url(${s.ill})"></div>`:''}<div class="cb"><div class="r1"><span class="nm">${s.name}</span><span class="ty" style="background:${tc}">${tn}</span></div>
        <div class="ko"><span class="kt">${s.ko||'韓文待填'}</span>${s.ko?btn('copy',s.ko,'複製韓文名稱')+btn('play',s.ko,'播放韓文發音'):''}</div>
        <div class="ad"><span class="at">📍 ${s.addr}</span>${btn('copy',s.addr,'複製地址')}</div>
        <div class="ft"><span class="nt"><span class="lb">內容：</span>${s.note||'—'}</span><a class="go" href="#" data-lat="${s.lat}" data-lon="${s.lon}" data-name="${s.ko||s.name}" data-addr="${s.addr}">導航 ›</a></div></div></div>`}).join('')}<div class="sp"></div></div>
   </div>
   <div class="map"><div class="mhost"></div><span class="badge r">草案</span><button class="mreset" aria-label="回到全景">◎</button><span class="mexpand"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></span></div>`;
  pager.insertBefore(pg,infoPg);
  if(HIDE_DAY_MAP)pg.querySelector('.map').remove();
  if(HIDE_TIMELINE)pg.querySelector('.tl').remove();
  const jm=HIDE_DAY_MAP?{setActive(){},home(){}}:JMap(pg.querySelector('.mhost'),{points:d.stops,route:true,badge:'letter',interactive:true,small:true,active:0});pg._jm=jm;
  let curIdx=0;
  const openDay=sel=>openMapFull({title:`Day ${d.n} · ${letters}`,points:d.stops,route:true,badge:'letter',sel});
  if(!HIDE_DAY_MAP){
  jm.onTap=()=>openDay(curIdx);jm.onStop=i=>openDay(i);
  const rs=pg.querySelector('.mreset');jm.onTouched=t=>rs.classList.toggle('on',t);rs.onclick=e=>{e.stopPropagation();jm.home()};
  pg.querySelector('.mexpand').onclick=e=>{e.stopPropagation();openDay(curIdx)};
  }

  /* 時間軸 <-> 行程 雙向連動 */
  const tl=pg.querySelector('.tl'),cards=pg.querySelector('.cards');
  const CSS_TL=!!(window.CSS&&CSS.supports&&CSS.supports('animation-timeline','--x')&&CSS.supports('timeline-scope','--x'));   // 瀏覽器支援「CSS 捲動連動」:時間軸跟著行程卡走,不需要 JS
  if(tl){const setMax=()=>{const c1=cards.querySelector('.card'),CH=c1?c1.offsetHeight:212,H=cards.clientHeight,pad=Math.max(0,CC*H-CH/2),padb=Math.max(0,(1-CC)*H-CH/2);
      pg.style.setProperty('--pad',pad+'px');pg.style.setProperty('--padb',padb+'px');pg.style.setProperty('--spb',Math.max(0,H*(1-2*CC))+'px');            /* 上下各留半個畫面,讓第一張、最後一張也能停在正中間 */
      const M=Math.max(0,cards.scrollHeight-cards.clientHeight),N=d.stops.length;
      tl.style.setProperty('--tlmax',M+'px');
      /* 每一站「亮起」的捲動範圍:那一張停在正中間(捲動量 = 站序 × 一格高)前後各半格;最後一站到底都亮 */
      tl.querySelectorAll('.tli').forEach((t,i)=>{const a=i?(i-.5)*PITCH:0,e=i===N-1?M:(i+.5)*PITCH;
        t.classList.remove('nl');t.classList.toggle('lastlit',i===N-1);
        t.style.setProperty('--rs',a+'px');t.style.setProperty('--re',Math.max(e,a+1)+'px')})};setMax();addEventListener('resize',setMax);if(window.ResizeObserver)new ResizeObserver(setMax).observe(cards);
  if(CSS_TL)tl.classList.add('csstl')}
  let src=null,ts=0;
  const setActive=i=>{curIdx=i;jm.setActive(i);
    pg.querySelectorAll('.tli').forEach((e,k)=>e.classList.toggle('on',k===i));
    pg.querySelectorAll('.card').forEach((e,k)=>e.classList.toggle('on',k===i));
    pg.querySelectorAll('.mk').forEach((e,k)=>e.classList.toggle('on',k===i));};
  const link=(a,b)=>a.addEventListener('scroll',()=>{
    if(src&&src!==a&&performance.now()-ts<150)return;
    src=a;ts=performance.now();if(b)b.scrollTop=a.scrollTop;
    const ni=Math.max(0,Math.min(d.stops.length-1,Math.round(a.scrollTop/PITCH)));if(ni!==curIdx)setActive(ni);
    if(a.scrollTop>6)pg.classList.add('compact');else if(a.scrollTop<=1)pg.classList.remove('compact');},{passive:true});
  /* 手指(手機/平板):行程卡完全交給瀏覽器原生捲動 + CSS 吸附,不掛任何捲動程式(這樣最順);電腦才用程式處理滑鼠拖動、滾輪 */
  if(!matchMedia('(pointer:coarse)').matches){link(cards,CSS_TL?null:tl);cardPager(cards)}
  else if(tl&&!CSS_TL){let ft;cards.addEventListener('scroll',()=>{clearTimeout(ft);ft=setTimeout(()=>{tl.scrollTop=cards.scrollTop},120)},{passive:true})}   // 舊瀏覽器備案:停下來之後才讓時間軸跟上
  /* 地圖的「目前這站」:卡片經過畫面正中央時才換(只在換張的那一下執行,捲動中不跑程式) */
  let panT=0;   // 換站後等 0.15 秒再平移地圖(不跟手指滑動搶效能)
  if(!HIDE_DAY_MAP){const mp=pg.querySelector('.map');if(mp)mp.addEventListener('touchmove',e=>{if(e.cancelable)e.preventDefault()},{passive:false})}   // 在地圖上拖動時,頁面本身不能跟著動
  if(!HIDE_DAY_MAP&&window.IntersectionObserver){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const i=+en.target.dataset.i;if(i!==curIdx){setActive(i);clearTimeout(panT);panT=setTimeout(()=>jm.panTo&&jm.panTo(i),150)}}}),{root:cards,rootMargin:`-${(CC-.03)*100}% 0px -${(1-CC-.03)*100}% 0px`});cards.querySelectorAll('.card').forEach(c=>io.observe(c))}
  pg.querySelectorAll('.tli').forEach(e=>e.onclick=()=>cards.scrollTo({top:e.dataset.i*PITCH,behavior:'smooth'}));
  pg.querySelectorAll('.card').forEach(e=>e.onclick=()=>cards.scrollTo({top:e.dataset.i*PITCH,behavior:'smooth'}));
});
/* 行程卡尾端不再墊高:滑到最後一張就是到底,下面不留空白 */

/* ---------- 資訊頁:出發前清單(勾選會記在這支手機) ---------- */
const doneSet=new Set(JSON.parse(store.get('jeju-check')||'[]'));
const CK_IC={
 passport:['#dbe7f5','<rect x="9" y="5" width="22" height="30" rx="3" fill="#1f4b7a" stroke="#143555" stroke-width="1.5"/><circle cx="20" cy="17" r="5.5" stroke="#ffd58a" stroke-width="1.6"/><path d="M14.5 17h11M20 11.5c-2 2.5-2 8.5 0 11M20 11.5c2 2.5 2 8.5 0 11" stroke="#ffd58a" stroke-width="1.2"/><path d="M14 28h12" stroke="#ffd58a" stroke-width="1.8"/>'],
 arrival:['#fde3c4','<rect x="11" y="4" width="18" height="32" rx="4" fill="#fff" stroke="#16395a" stroke-width="1.8"/><g fill="#16395a"><rect x="14" y="10" width="5" height="5"/><rect x="21" y="10" width="5" height="5"/><rect x="14" y="17" width="5" height="5"/><rect x="22" y="19" width="3" height="3"/></g><circle cx="29" cy="29" r="6.5" fill="#2e9e5b"/><path d="M25.8 29l2.2 2.2 4-4.2" stroke="#fff" stroke-width="2"/>'],
 keta:['#e3f1dc','<path d="M20 5l12 4v9c0 8-5 13-12 17C13 31 8 26 8 18V9z" fill="#fff" stroke="#2e7d4a" stroke-width="1.8"/><path d="M14.5 19.5l4 4 7-8" stroke="#2e7d4a" stroke-width="2.4"/>'],
 esim:['#d6ecf6','<path d="M12 5h12l6 6v22a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="#fff" stroke="#1d6e93" stroke-width="1.8"/><rect x="15" y="17" width="10" height="10" rx="1.5" fill="#1d6e93"/><path d="M15 22h10M20 17v10" stroke="#fff" stroke-width="1"/>'],
 ins:['#f6dde3','<path d="M20 5l12 4v9c0 8-5 13-12 17C13 31 8 26 8 18V9z" fill="#fff" stroke="#c0405f" stroke-width="1.8"/><path d="M20 13v12M14 19h12" stroke="#c0405f" stroke-width="3"/>'],
 car:['#e9e4f7','<path d="M7 24l3-9a3 3 0 0 1 3-2h14a3 3 0 0 1 3 2l3 9v6H7z" fill="#fff" stroke="#5b46a8" stroke-width="1.8"/><path d="M11 20h18" stroke="#5b46a8" stroke-width="1.6"/><circle cx="13" cy="30" r="3" fill="#5b46a8"/><circle cx="27" cy="30" r="3" fill="#5b46a8"/>'],
 money:['#fff0c2','<rect x="5" y="9" width="24" height="16" rx="3" fill="#fff" stroke="#b07a00" stroke-width="1.8"/><path d="M5 15h24" stroke="#b07a00" stroke-width="3"/><circle cx="29" cy="27" r="7" fill="#ffc83d" stroke="#b07a00" stroke-width="1.6"/><path d="M25.8 24.5l1.6 5 1.6-3.5 1.6 3.5 1.6-5M25 27h8" stroke="#7a5200" stroke-width="1.2"/>'],
 bag:['#e0efe6','<rect x="8" y="12" width="24" height="21" rx="4" fill="#fff" stroke="#2e7d5a" stroke-width="1.8"/><path d="M15 12V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M14 18v10M26 18v10" stroke="#2e7d5a" stroke-width="1.8"/>']};
const ckIcon=k=>{const c=CK_IC[k];return c?`<span class="ic" style="background:${c[0]}"><svg viewBox="0 0 40 40" width="30" height="30" fill="none" stroke-linecap="round" stroke-linejoin="round">${c[1]}</svg></span>`:''};
$('#checklist').innerHTML=CHECKLIST.map((it,i)=>`<label class="ck"><input type="checkbox" data-i="${i}"${doneSet.has(i)?' checked':''}>${ckIcon(it.k)}<span class="ckt"><b>${it.t}</b>${it.s?`<small>${it.s}</small>`:''}</span></label>`).join('');
$('#checklist').addEventListener('change',e=>{const i=+e.target.dataset.i;e.target.checked?doneSet.add(i):doneSet.delete(i);store.set('jeju-check',JSON.stringify([...doneSet]))});

/* ---------- 機票:輸入代碼(目前只有範例代碼,尚未加密) ---------- */
const codeIn=$('#code'),msg=$('#codeMsg'),slots=$('#slots'),relink=$('#relink');
const tix=$('#tix'),tkBox=$('.fc.ticket');
const escT=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* 沒有真的碼圖時,顯示範例用的假 QR / 條碼(不能掃)。真的碼圖放在加密資料 legs[].qr / bar */
function sampleQR(seed,n){n=n||25;let s=seed;const r=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;let d='';
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const f=(i<8&&j<8)||(i<8&&j>=n-8)||(j<8&&i>=n-8);if(!f&&r()<.48)d+=`M${i} ${j}h1v1h-1z`}
  [[0,0],[n-7,0],[0,n-7]].forEach(([x,y])=>{for(let i=0;i<7;i++)for(let j=0;j<7;j++)if(i==0||i==6||j==0||j==6||(i>1&&i<5&&j>1&&j<5))d+=`M${x+i} ${y+j}h1v1h-1z`});
  return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${d}" fill="#111"/></svg>`}
function sampleBar(seed){let s=seed;const r=()=>(s=(s*1664525+1013904223)>>>0)/4294967296;let x=0,d='';
  while(x<200){const w=[1,1,2,3][Math.floor(r()*4)|0];if(r()<.55)d+=`<rect x="${x}" width="${w}" height="40"/>`;x+=w+[1,2][Math.floor(r()*2)|0]}
  return `<svg viewBox="0 0 200 40" preserveAspectRatio="none" shape-rendering="crispEdges" fill="#111">${d}</svg>`}
const tQR=(pi,li,n)=>{const l=TK.legs[li];return l.qr?`<img src="${l.qr}" alt="QR code">`:sampleQR(pi*7+li*13+5,n)};
const tBar=(pi,li)=>{const l=TK.legs[li];return l.bar?`<img src="${l.bar}" alt="條碼">`:sampleBar(pi*11+li*17+3)};
let TK=null,txPax=0;
function txRender(){
  const T=TK,P=T.pax[txPax];
  const PN=(T.pnr&&T.pnr.length)?`<div class="pnr"><h4>🎫 訂位代號 · 查詢開票狀態</h4><p class="s">到航空公司官網輸入「訂位代號 + 旅客英文姓名」,就能確認機票是否開票成功。</p><div class="who">${T.pax.map(escT).join('、')}</div>${T.pnr.map(r=>`<div class="row"><span class="al">${escT(r.al)}</span><span class="cd">${escT(r.code)}</span><button type="button" class="bt pnr-cp" data-copy="${escT(r.code)}">複製</button><a class="bt pgo" href="${escT(r.url)}" target="_blank" rel="noopener">查詢 ›</a></div>`).join('')}</div>`:'';
  tix.innerHTML=`<div class="tx-seg fl-seg">${T.pax.map((p,i)=>`<button type="button" data-p="${i}" class="${i===txPax?'on':''}"><b>${escT(p)}</b><small>旅客 ${i+1}</small></button>`).join('')}</div>
  <div class="tx-cnt">這組代碼共 ${T.pax.length} 位旅客,每人 ${T.legs.length} 張(去程、回程)</div>
  <div class="tx-tip">📱 登機前先打開這頁,把螢幕亮度調高,櫃檯或登機口出示 QR code 或條碼給機組人員掃描。</div>
  ${T.legs.map((l,i)=>`<div class="tb" data-l="${i}"><div class="tbh"><span>${l.tag} · ${l.from} → ${l.to}</span><span>${l.flt}</span></div>
   <div class="tbn"><small>PASSENGER</small><b>${escT(P)}</b></div>
   <div class="tbm"><div><b>${l.from}</b></div><div class="tbt">✈</div><div style="text-align:right"><b>${l.to}</b></div></div>
   <div class="tbd"><span class="tdd">${l.date}</span><span class="tdt">${l.time}</span></div><div class="tba">${l.air}</div>
   <div class="tbc"><div class="tbq">${tQR(txPax,i)}</div><div class="tbb">${tBar(txPax,i)}<small>條碼</small></div></div>
   <div class="tbs">點一下放大${l.qr?'':' · 目前是範例圖案,不能掃'}</div></div>`).join('')}`+PN;
}
function txOpen(li){
  const T=TK;let cur=li;
  const ov=document.createElement('div');ov.className='tx-full';
  const draw=()=>{const l=T.legs[cur];ov.innerHTML=`<div class="txf"><button class="txx" aria-label="關閉">✕</button>
   <div class="txk">${l.tag} · ${l.flt} ${l.air}${l.qr?'':' <em>範例</em>'}</div><h4>${l.from} → ${l.to}</h4>
   <small>PASSENGER</small><div class="txn">${escT(T.pax[txPax])}</div>
   <p>${l.date} · ${l.time} · ${l.note}</p>
   <div class="txq">${tQR(txPax,cur,25)}</div><div class="txb">${tBar(txPax,cur)}</div>
   <div class="txh">📱 請把螢幕亮度調到最亮</div>
   <div class="txnav"><button data-d="-1"${cur===0?' disabled':''}>‹ 上一張</button><span>${escT(T.pax[txPax])} · ${l.tag}</span><button data-d="1"${cur===T.legs.length-1?' disabled':''}>下一張 ›</button></div></div>`};
  draw();
  ov.addEventListener('click',e=>{
    if(e.target===ov||e.target.closest('.txx')){ov.remove();return}
    const b=e.target.closest('.txnav button');if(b&&!b.disabled){cur+=+b.dataset.d;draw()}});
  document.body.appendChild(ov);
}
tix.addEventListener('click',e=>{
  const s=e.target.closest('.tx-seg button');if(s){txPax=+s.dataset.p;txRender();return}
  const c=e.target.closest('.tb');if(c)txOpen(+c.dataset.l)});
function lockSlots(){TK=null;slots.style.display='';tix.innerHTML='';slots.innerHTML='<div><b>🔒</b>旅客 1</div><div><b>🔒</b>旅客 2</div>';relink.style.display='none';tkBox.classList.remove('unlocked');const pgv=tkBox.closest('.pg');   // 內容變短後,捲動位置要馬上拉回有內容的地方(不用平滑捲動,避免手機上停在空白處)
  const fixScroll=()=>{if(!pgv)return;const mx=Math.max(0,pgv.scrollHeight-pgv.clientHeight),want=pgv.scrollTop+tkBox.getBoundingClientRect().top-pgv.getBoundingClientRect().top-70;pgv.scrollTo({top:Math.max(0,Math.min(mx,want)),behavior:'instant'})};
  fixScroll();requestAnimationFrame(fixScroll);setTimeout(fixScroll,120);setTimeout(()=>codeIn.focus({preventScroll:true}),150)}
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function tixDecrypt(code){
  if(!code||!window.TICKET_BLOBS||!window.crypto||!crypto.subtle)return null;
  const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(code.toUpperCase()),'PBKDF2',false,['deriveKey']);
  for(const b of TICKET_BLOBS){
    try{
      const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64d(b.s),iterations:600000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['decrypt']);
      const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(b.i)},key,b64d(b.c));
      return JSON.parse(new TextDecoder().decode(pt));
    }catch(e){}}
  return null;}
let tryBusy=false;
async function tryCode(code,silent){
  code=(code||'').trim();
  if(tryBusy)return false;
  if(!code){if(!silent)msg.textContent='請先輸入代碼';return false}
  if(!(window.crypto&&crypto.subtle)){if(!silent)msg.textContent='這個瀏覽器不支援解鎖,請改用最新版 Safari 或 Chrome';return false}
  tryBusy=true;if(!silent)msg.textContent='解鎖中…';
  const T=await tixDecrypt(code);tryBusy=false;
  if(T){TK=T;tkBox.classList.add('unlocked');slots.style.display='none';txPax=0;txRender();msg.textContent='';codeIn.value='';relink.style.display='block';return true}   // 不把代碼存在手機裡:每次打開都要重新輸入並按「查看」
  if(!silent)msg.textContent='找不到這組代碼,請再確認';
  return false;}
$('#codeBtn').onclick=()=>tryCode(codeIn.value);
codeIn.addEventListener('keydown',e=>{if(e.key==='Enter')tryCode(codeIn.value)});
relink.onclick=()=>{store.del('jeju-code');codeIn.value='';msg.textContent='';lockSlots()};
/* 看不到的頁面、正在滑動的頁面,暫停地圖路線與時間軸的循環動畫(它們每一格畫面都在重新排版,會跟捲動搶效能) */
{const pgs=[...pager.children].filter(q=>q.classList.contains('pg'));
 const mark=()=>{const i=Math.round(pager.scrollLeft/(pager.clientWidth||1));pgs.forEach((q,k)=>q.classList.toggle('off',k!==i))};
 mark();addEventListener('resize',mark);
 let pt;pager.addEventListener('scroll',()=>{document.body.classList.add('pscroll');clearTimeout(pt);pt=setTimeout(()=>{document.body.classList.remove('pscroll');mark()},150)},{passive:true});
 }

/* 航班日期頁籤:切換 2/7~2/10 與 2/8~2/11 */
document.querySelectorAll('#flSeg button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#flSeg button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-selected',x===b)});
  $('#flA').hidden=b.dataset.g!=='a';$('#flB').hidden=b.dataset.g!=='b';
});
lockSlots();store.del('jeju-code');   // 清掉舊版存在手機裡的代碼,不再自動解鎖

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
/* 任何一頁只要完全離開畫面(不管是滑走、點頁籤跳過去、還是一次跳好幾頁),就立刻回到最上方,下次看到都是從頭開始 */
{const seen=new Set();const io=new IntersectionObserver(es=>es.forEach(en=>{const pg=en.target;
  if(en.isIntersecting){seen.add(pg)}else if(seen.has(pg)){seen.delete(pg);resetPage(pg)}}),{root:pager,threshold:0});
 pages.forEach(pg=>{if(pg.classList.contains('pg'))io.observe(pg)})}

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
/* 封面:點一下也可以翻到下一頁(滑動原本就可以;手指有移動就不算點) */
{const cv=document.querySelector('.cover');if(cv){let dx0=0,dy0=0;
  cv.addEventListener('pointerdown',e=>{dx0=e.clientX;dy0=e.clientY});
  cv.addEventListener('click',e=>{if(e.target.closest('button,a,input,select'))return;if(Math.hypot(e.clientX-dx0,e.clientY-dy0)>8)return;pager.scrollTo({left:pager.clientWidth,behavior:'smooth'})})}}
{const cv=document.querySelector('.cover');const fit=()=>{if(!cv)return;const s=Math.max(cv.clientWidth/390,cv.clientHeight/844);cv.style.setProperty('--cs',s.toFixed(3))};
 fit();addEventListener('resize',fit);if(window.ResizeObserver)new ResizeObserver(fit).observe(cv)}

$('#rgList').addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b)return;ovRegion=b.dataset.r;renderOverview()});

$('#rgList').addEventListener('change',e=>{if(e.target.id==='ovRgSel'){ovRegion=e.target.value;ovMode='list';renderOverview()}});
$('#rgList').addEventListener('click',e=>{if(e.target.closest('#ovNavBtn')&&ovMode!=='nav'){ovMode='nav';renderOverview()}});
