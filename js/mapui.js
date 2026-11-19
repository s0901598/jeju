/* 地點小卡:點地圖上的點(或清單的列)時,從下方升起。照片、名稱、韓文、地址、複製、導航 */
function spotCard(s,cls){
  const t=TYPE[s.ty]||TYPE.spot,nt=(s.days&&s.days.length?'Day '+s.days.join('、')+(s.note?' · ':''):'')+(s.note||'');
  return `<div class="spot ${cls||''}"><button class="sp-x" aria-label="關閉">✕</button>
   <div class="sp-img"><span class="sp-em">${t[2]}</span>${s.img?`<img src="${s.img}" alt="" loading="lazy" style="object-position:${s.pos||'50% 40%'}" onerror="this.remove()">`:''}</div>
   <div class="sp-b"><div class="r1"><span class="nm">${s.name}</span><span class="ty" style="background:${t[1]}">${t[0]}</span></div>
    <div class="ko"><span class="kt">${s.ko||'韓文待填'}</span>${s.ko?btn('copy',s.ko,'複製韓文名稱')+btn('play',s.ko,'播放韓文發音'):''}</div>
    <div class="ad"><span class="at">📍 ${s.addr}</span>${btn('copy',s.addr,'複製地址')}</div>
    <div class="ft"><span class="nt">${nt||'—'}</span><a class="go" href="#" data-lat="${s.lat}" data-lon="${s.lon}" data-name="${s.ko||s.name}">導航 ›</a></div></div></div>`}

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
