/* ========== 放大的地圖視窗:縮放、拖動、點行程點看資訊、切換插畫地圖 / 真實地圖 ========== */
function openMapFull(o){
  const app=document.querySelector('.app'),f=document.createElement('div');f.className='mf';app.appendChild(f);
  const host=document.createElement('div');host.className='mf-host';f.appendChild(host);
  const pts=o.points,letter=o.badge==='letter';
  const face=i=>letter?String.fromCharCode(65+i):(pts[i].ty==='airport'?'✈':TYPE[pts[i].ty][2]);
  f.insertAdjacentHTML('beforeend',`
   <div class="mf-bar"><button class="mf-round" data-a="x" aria-label="關閉">✕</button><div class="mf-ttl">${o.title}</div><button class="mf-mode" data-a="mode">看真實地圖</button></div>
   <div class="mf-zoom"><button class="mf-round" data-a="zi" aria-label="放大">＋</button><button class="mf-round" data-a="zo" aria-label="縮小">－</button><button class="mf-round" data-a="zh" aria-label="回到全景">◎</button></div>
   <div class="mf-chips">${pts.map((s,i)=>`<div class="mf-chp" data-i="${i}"><b style="${letter?'':'background:'+TYPE[s.ty][1]}">${face(i)}</b>${s.name}</div>`).join('')}</div>`);
  let mode='A',cur=null,sel=o.sel!=null?o.sel:-1,busy=false;
  const pop=i=>{sel=i;f.querySelector('.mf-pop')?.remove();f.querySelectorAll('.mf-chp').forEach((c,k)=>c.classList.toggle('on',k===i));
    const s=pts[i];cur&&cur.setActive&&cur.setActive(i);
    f.insertAdjacentHTML('beforeend',`<div class="mf-pop"><div class="bd" style="${letter?'':'background:'+TYPE[s.ty][1]}">${face(i)}</div><div class="tx"><div class="nm">${s.name}</div><div class="ko">${s.ko||s.note||''}</div></div><a class="go" href="#" data-lat="${s.lat}" data-lon="${s.lon}" data-name="${s.ko||s.name}">導航 ›</a></div>`)};
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
