/* 小卡的詳細資訊:營業時間(顯示「Day 幾那天」或「今天」,點開看整週)、特色關鍵字、菜單 / 票價 */
function spotInfo(s){
  const f=s.info;if(!f)return '';let o='';
  const price=p=>{if(!/^[0-9,]+$/.test(p))return p;const w=+p.replace(/,/g,''),t=w*KRW2TWD,r=t>=50?Math.round(t/5)*5:Math.round(t);return '₩'+p+'<small class="tw">約 NT$'+r+'</small>'};
  const nm=n=>ZH[n]?ZH[n]+' <small class="ko">'+n+'</small>':n;
  if(f.h){
    const d1=s.days&&s.days.length?s.days[0]:0,wk=d1?DAYS[d1-1].wk:'一二三四五六日日'[(new Date().getDay()+6)%7];
    const wi=WKS.indexOf(wk),lab=d1?`Day ${d1}(週${wk})`:`今天(週${wk})`,t=f.h[wi],off=t==='公休';
    o+=`<div class="sp-sec"><button class="sp-tg" data-tg="h"><span class="ic">🕒</span><span class="tx"><b>${lab}</b> <span class="${off?'off':''}">${t}</span></span><i>▾</i></button>
     <div class="sp-pop" hidden>${[...WKS].map((w,i)=>`<div class="${i===wi?'cur':''}"><span>週${w}</span><span class="${f.h[i]==='公休'?'off':''}">${f.h[i]}</span></div>`).join('')}<p>${f.hn||'時間取自 Naver(2026/11),春節期間可能調整'}</p></div></div>`}
  if(f.kw&&f.kw.length)o+=`<div class="sp-kw">${f.kw.map(k=>`<span>#${ZH[k]||k}${ZH[k]?` <small class="ko">${k}</small>`:''}</span>`).join('')}</div>`;
  if(f.m&&f.m.length)o+=`<div class="sp-sec"><button class="sp-tg" data-tg="m"><span class="ic">${f.ml==='票價'?'🎫':f.ml==='停車費'?'🅿️':'🍴'}</span><span class="tx"><b>${f.ml||'菜單'}</b> <span class="mm">${ZH[f.m[0][0]]||f.m[0][0]} ${price(f.m[0][1])}${f.m.length>1?' …':''}</span></span><i>▾</i></button>
     <div class="sp-pop" hidden>${f.m.map(([n,p])=>`<div><span>${nm(n)}</span><span>${price(p)}</span></div>`).join('')}</div></div>`;
  return o}

/* 地點小卡:點地圖上的點(或清單的列)時,從下方升起。照片、名稱、韓文、地址、複製、導航 */
function spotCard(s,cls){
  const im=s.imgs||(s.img?[s.img]:[]),t=TYPE[s.ty]||TYPE.spot,nt=(s.days&&s.days.length?'Day '+s.days.join('、')+(s.note?' · ':''):'')+(s.note||'');
  return `<div class="spot ${cls||''}"><button class="sp-x" aria-label="關閉">✕</button>
   <div class="sp-img"><span class="sp-em">${t[2]}</span>${im.length?`<div class="sp-track">${im.map(x=>`<img src="${x}" alt="" loading="lazy" style="object-position:${s.pos||'50% 40%'}" onerror="this.remove()">`).join('')}</div>`:''}${im.length>1?`<div class="sp-dots">${im.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div><span class="sp-cnt">1/${im.length}</span>`:''}<div class="r1"><span class="nm">${s.name}</span><span class="ty" style="background:${t[1]}">${t[0]}</span></div></div>
   <div class="sp-b">
    <div class="ko"><span class="kt">${s.ko||'韓文待填'}</span>${s.ko?btn('copy',s.ko,'複製韓文名稱')+btn('play',s.ko,'播放韓文發音'):''}</div>
    <div class="ad"><span class="at">📍 ${s.addr}</span>${btn('copy',s.addr,'複製地址')}</div>
    ${spotInfo(s)}
    <div class="ft"><span class="nt">${nt||'—'}</span><a class="go" href="#" data-lat="${s.lat}" data-lon="${s.lon}" data-name="${s.ko||s.name}" data-addr="${s.addr}">導航 ›</a></div></div></div>`}

/* ========== 放大的地圖視窗:縮放、拖動、點行程點看資訊、切換插畫地圖 / 真實地圖 ========== */
function openMapFull(o){
  const app=document.querySelector('.app'),f=document.createElement('div');f.className='mf';app.appendChild(f);
  const host=document.createElement('div');host.className='mf-host';f.appendChild(host);
  const pts=o.points,letter=o.badge==='letter';
  const face=i=>letter?String.fromCharCode(65+i):TYPE[pts[i].ty][2];
  f.insertAdjacentHTML('beforeend',`
   <div class="mf-bar"><button class="mf-round" data-a="x" aria-label="關閉">✕</button><div class="mf-ttl">${o.title}</div><button class="mf-mode" data-a="mode">看真實地圖</button></div>
   <div class="mf-zoom"><button class="mf-round" data-a="zi" aria-label="放大">＋</button><button class="mf-round" data-a="zo" aria-label="縮小">－</button><button class="mf-round" data-a="zh" aria-label="回到全景">◎</button></div>
   <div class="mf-chips">${pts.map((s,i)=>`<div class="mf-chp" data-i="${i}"><b style="${letter?'':'background:'+TYPE[s.ty][1]}">${face(i)}</b>${s.name}</div>`).join('')}</div>`);
  let mode='A',cur=null,sel=o.sel!=null?o.sel:-1,busy=false;
  const pop=i=>{sel=i;f.querySelector('.spot')?.remove();f.querySelectorAll('.mf-chp').forEach((c,k)=>c.classList.toggle('on',k===i));
    const s=pts[i];cur&&cur.setActive&&cur.setActive(i);
    f.insertAdjacentHTML('beforeend',spotCard(s,'in-mf'))};
  const pick=i=>{pop(i);cur.focus(i);const c=f.querySelector(`.mf-chp[data-i="${i}"]`);c&&c.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})};
  async function build(){
    if(cur){cur.destroy();cur=null}host.innerHTML='';
    const base={...o,interactive:true,sel};
    if(mode==='B'){
      try{await loadLeaflet();cur=LMap(host,{...base})}
      catch(e){toast('無法載入真實地圖,請確認網路');mode='A';f.querySelector('.mf-mode').textContent='看真實地圖'}}
    if(!cur)cur=JMap(host,{...base,zoomBias:letter?.9:1,active:sel});
    cur.onStop=pick;if(sel>=0)cur.setActive(sel)}
  f.addEventListener('click',async e=>{
    const b=e.target.closest('[data-a]'),c=e.target.closest('.mf-chp');
    if(c){pick(+c.dataset.i);return}
    if(!b)return;const a=b.dataset.a;
    if(a==='x'){cur&&cur.destroy();f.remove()}
    else if(a==='zi')cur.zoom(mode==='A'?1.6:1);else if(a==='zo')cur.zoom(mode==='A'?1/1.6:-1);else if(a==='zh')cur.home();
    else if(a==='mode'){if(busy)return;busy=true;mode=mode==='A'?'B':'A';b.textContent=mode==='A'?'看真實地圖':'看插畫地圖';if(mode==='B')b.textContent='載入中…';
      await build();b.textContent=mode==='A'?'看真實地圖':'看插畫地圖';busy=false}});
  build().then(()=>{if(sel>=0)pop(sel)})}
