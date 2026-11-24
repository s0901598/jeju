/* ========== A 插畫風地圖引擎(預設) ==========
   用真實海岸線畫的插畫地圖,可縮放、拖動;標籤自動避開;路線有霓虹閃爍與箭頭。
   用法:JMap(容器, {points, route, badge:'letter'|'type', interactive, fit:'points'|'island', regions, sel, active}) */
const NS='http://www.w3.org/2000/svg';
const K_X=929,K_Y=1110,LON0=126.0,LAT0=33.7;       // 1 單位 ≈ 100 公尺
const wx=lon=>(lon-LON0)*K_X,wy=lat=>(LAT0-lat)*K_Y;
const COASTW=JEJU_COAST.map(([lo,la])=>[wx(lo),wy(la)]);
const ISL='M'+COASTW.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join('L')+'Z';
const HX=wx(126.531),HY=wy(33.362),SLOPE=.6;
const ISLAND_BOX={x:[150,880],y:[145,565]};
function inPoly(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c}
/* 東南西北:以漢拿山為中心,用兩條斜線切成四區(島是東西長,斜率 0.6) */
function regionOf(lon,lat){const dx=wx(lon)-HX,dy=wy(lat)-HY;if(Math.abs(dy)>=SLOPE*Math.abs(dx))return dy<0?'北':'南';return dx>0?'東':'西'}
function overviewPoints(){const seen=new Map();
  DAYS.forEach(d=>d.stops.forEach(s=>{const k=s.name+s.lon+s.lat;if(!seen.has(k))seen.set(k,{...s,days:[d.n]});else seen.get(k).days.push(d.n)}));
  CANDIDATES.forEach(s=>{const k=s.name+s.lon+s.lat;if(!seen.has(k))seen.set(k,{...s,days:[]})});
  return [...seen.values()]}

/* 靜態風景:山丘、橘園、漢拿山(固定種子,每次長一樣) */
let sd=11;const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
const DECOR=(()=>{let o='',n=0,t=0;
  while(n<28&&t<3000){t++;const x=150+rnd()*740,y=140+rnd()*430;if(!inPoly(x,y,COASTW)||Math.hypot(x-HX,(y-HY)*1.3)<90)continue;
    const s=.7+rnd()*.9;o+=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})"><path d="M-10,2 Q0,-14 10,2Z" fill="var(--hill)"/><path d="M-3.5,-4 Q0,-10 3.5,-4" stroke="var(--hillhi)" stroke-width="1.5" fill="none" opacity=".8"/></g>`;n++}
  n=0;t=0;while(n<120&&t<5000){t++;const x=wx(126.27+rnd()*.64),y=wy(33.232+rnd()*.08);if(!inPoly(x,y,COASTW))continue;
    o+=`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})"><circle r="4.4" fill="var(--orchLeaf)" opacity=".85"/><circle r="2.5" cy="-.4" fill="var(--orch)"/></g>`;n++}
  return o})();
const MOUNTAIN=`<g transform="translate(${HX.toFixed(1)},${(HY+8).toFixed(1)}) scale(1.25)">
  <ellipse cy="14" rx="74" ry="10" fill="#000" opacity=".12"/>
  <path d="M-66,16 L-30,-12 L-13,-7 L0,-36 L15,-21 L26,-27 L66,16Z" fill="var(--mtn)"/>
  <path d="M0,-36 L15,-21 L26,-27 L66,16 L22,16 L8,-8Z" fill="var(--mtn2)" opacity=".75"/>
  <path d="M-11,-16 L0,-36 L15,-21 L10,-18 L5,-23 L0,-15 L-5,-20Z" fill="var(--snow)"/>
  <path d="M-30,-12 L-13,-7 L-22,8 L-40,4Z" fill="var(--hillhi)" opacity=".25"/></g>`;
const REGIONS=(()=>{const L=(sx,sy)=>`<line x1="${HX}" y1="${HY}" x2="${HX+sx*600}" y2="${HY+sy*600*SLOPE}" stroke="#fff" stroke-width="1.6" stroke-dasharray="6 7" opacity=".55" vector-effect="non-scaling-stroke"/>`;
  const T=(t,x,y)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="64" font-weight="900" fill="var(--wm)" opacity=".55" letter-spacing="8" style="font-family:'Songti TC',serif">${t}</text>`;
  return L(1,-1)+L(1,1)+L(-1,-1)+L(-1,1)+T('北',HX-20,HY-120)+T('南',HX-20,HY+150)+T('東',HX+300,HY+22)+T('西',HX-300,HY+22)})();

let uid=0;
function JMap(host,o){
  const {points=[],route=false,badge='letter',interactive=false,small=false,fit='points',regions=false,zoomBias=1}=o;
  const id='m'+(++uid),svg=document.createElementNS(NS,'svg');svg.setAttribute('class','jm');host.prepend(svg);
  const P=points.map(s=>[wx(s.lon),wy(s.lat)]);
  /* 路線(弧線)+ 箭頭 */
  let d='',arrows='',segs='',SEG=[];
  if(route&&P.length>1){d=`M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
    for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,sg=(i%2?1:-1)*L*.2,cx=mx-dy/L*sg,cy=my+dx/L*sg;
      d+=`Q${cx.toFixed(1)},${cy.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`;SEG.push([a,[cx,cy],b]);
      segs+=`<path class="road" d="M${a[0].toFixed(1)},${a[1].toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}" fill="none" vector-effect="non-scaling-stroke"/><path class="seg" d="M${a[0].toFixed(1)},${a[1].toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}" fill="none" vector-effect="non-scaling-stroke"/>`;
      const x=.25*a[0]+.5*cx+.25*b[0],y=.25*a[1]+.5*cy+.25*b[1],ang=Math.atan2(dy,dx)*180/Math.PI;
      arrows+=`<g class="jk" data-x="${x.toFixed(1)}" data-y="${y.toFixed(1)}" data-rot="${ang.toFixed(1)}"><path d="M-6,-6 L7,0 L-6,6 L-3,0Z" fill="#fff6e0" stroke="#e5600a" stroke-width="1.6" stroke-linejoin="round"/></g>`}}
  const names=new Set(points.map(s=>s.name));
  const lms=LANDMARKS.filter(l=>!route&&!names.has(l.n)).map(l=>{const [ic,c]=KIND[l.k],w=l.n.length*12+14;
    return `<g class="jk jlm" data-x="${wx(l.lon).toFixed(1)}" data-y="${wy(l.lat).toFixed(1)}" data-lv="${l.lv}" data-pw="${w}" data-r="11"><g class="jp"><rect width="${w}" height="19" rx="9.5"/><text x="${w/2}" y="13.5" text-anchor="middle" font-size="11.5">${l.n}</text></g>
      <circle r="10.5" fill="#fff" stroke="${c}" stroke-width="2.2"/><text y="4.2" text-anchor="middle" font-size="11">${ic}</text></g>`}).join('');
  const stops=points.map((s,i)=>{const w=s.name.length*12+14,t=TYPE[s.ty]||TYPE.spot;
    const fc='#1f4b7a';   // 每日地圖:所有景點同一個顏色(深藍),用編號區分
    const face=badge==='letter'
      ?`<g class="jf"><circle r="9" fill="${fc}" stroke="#fff" stroke-width="2"/></g>`
      :`<circle r="12" fill="${t[1]}" stroke="#fff" stroke-width="2.2"/><text y="4.6" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${t[2]}</text>`;
    return `<g class="jk jstop${i===o.active?' on':''}" data-i="${i}" data-x="${P[i][0].toFixed(1)}" data-y="${P[i][1].toFixed(1)}" data-pw="${w}" data-r="11">
     <line class="jl" x1="0" y1="0" x2="0" y2="0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" display="none"/><circle class="jd" r="3.2" fill="#ff8a1f" stroke="#fff" stroke-width="1.6" display="none"/>
     <g class="jo"><circle class="jring" r="19" fill="none" stroke="${fc}" stroke-width="3"/>
     <g class="jp"><rect width="${w}" height="19" rx="9.5"/><text x="${w/2}" y="13.5" text-anchor="middle" font-size="11.5">${s.name}</text></g>${face}</g></g>`}).join('');
  svg.innerHTML=`<defs>
    <linearGradient id="${id}sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sea1)"/><stop offset="1" stop-color="var(--sea2)"/></linearGradient>
    <linearGradient id="${id}land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--land1)"/><stop offset="1" stop-color="var(--land2)"/></linearGradient>
    <radialGradient id="${id}h" gradientUnits="userSpaceOnUse" cx="${HX}" cy="${HY}" r="230"><stop offset="0" stop-color="var(--hillhi)" stop-opacity=".85"/><stop offset="1" stop-color="var(--hillhi)" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}og" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffd27a"/><stop offset=".5" stop-color="#ff8f1c"/><stop offset="1" stop-color="#d45a00"/></radialGradient>
    <filter id="${id}g1" filterUnits="userSpaceOnUse" x="-5000" y="-5000" width="12000" height="12000"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="${id}g2" filterUnits="userSpaceOnUse" x="-5000" y="-5000" width="12000" height="12000"><feGaussianBlur stdDeviation="1.6"/></filter>
    <clipPath id="${id}clip"><path d="${ISL}"/></clipPath></defs>
   <rect x="-4000" y="-4000" width="9000" height="9000" fill="url(#${id}sea)"/>
   <path d="${ISL}" fill="none" stroke="var(--shore)" stroke-width="26" opacity=".25" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
   <path d="${ISL}" fill="none" stroke="var(--shore)" stroke-width="11" opacity=".35" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
   <path d="${ISL}" fill="url(#${id}land)" stroke="var(--shore)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
   <g clip-path="url(#${id}clip)"><circle cx="${HX}" cy="${HY}" r="230" fill="url(#${id}h)"/>
     <g fill="none" stroke="var(--contour)" stroke-width="1.4" vector-effect="non-scaling-stroke"><ellipse cx="${HX}" cy="${HY}" rx="150" ry="95"/><ellipse cx="${HX}" cy="${HY}" rx="105" ry="64"/><ellipse cx="${HX}" cy="${HY}" rx="62" ry="36"/></g>${DECOR}${regions?REGIONS:''}</g>
   <ellipse cx="${wx(126.952)}" cy="${wy(33.503)}" rx="13" ry="9" fill="url(#${id}land)" stroke="var(--shore)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
   ${MOUNTAIN}
   ${segs}
   <g>${lms}</g><g>${stops}</g>${route&&SEG.length?`<g class=\"jk jcar\" data-x=\"0\" data-y=\"0\" data-rot=\"0\"><g class=\"jcb\" transform=\"scale(.83)\"><ellipse cx=\"1\" cy=\"11\" rx=\"10\" ry=\"3\" fill=\"rgba(0,0,0,.25)\"/><circle r=\"12\" fill=\"#ff9a1f\"/><path d=\"M-6,-5 Q-1,-9 5,-6\" stroke=\"#ffd48a\" stroke-width=\"2.2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M0,-12 Q2,-19 9,-17 Q7,-11 0,-12Z\" fill=\"#3fa34d\"/><circle cx=\"-4\" cy=\"1\" r=\"1.4\" fill=\"#fff\" opacity=\".6\"/></g></g>`:''}`;
  const car=svg.querySelector('.jcar');const mks=[...svg.querySelectorAll('.jk')],lmEls=[...svg.querySelectorAll('.jlm')],stopEls=[...svg.querySelectorAll('.jstop')];
  const W=()=>host.clientWidth,H=()=>host.clientHeight;
  /* 視角:先框住當天的點(或整座島) */
  const fitView=()=>{let bx,by,minW=140,minH=90,k1=1.38,k2=1.5;
    if(fit==='island'||!P.length){bx=ISLAND_BOX.x;by=ISLAND_BOX.y;minW=0;minH=0;k1=1.04;k2=1.08}
    else{bx=[Math.min(...P.map(p=>p[0])),Math.max(...P.map(p=>p[0]))];by=[Math.min(...P.map(p=>p[1])),Math.max(...P.map(p=>p[1]))]}
    const bw=Math.max(bx[1]-bx[0],minW)*k1,bh=Math.max(by[1]-by[0],minH)*k2;
    return{cx:(bx[0]+bx[1])/2,cy:(by[0]+by[1])/2,ppu:Math.min(W()/bw,H()/bh,3.4)}};
  let v={cx:0,cy:0,ppu:1},touched=false,basePpu=1;
  let carU=o.active||0,carTk=0;
  const carAt=u=>{if(!car||!SEG.length)return;const si=Math.max(0,Math.min(SEG.length-1,Math.floor(u))),tt=Math.max(0,Math.min(1,u-si)),[A,C,B]=SEG[si],w=1-tt,
    x=w*w*A[0]+2*w*tt*C[0]+tt*tt*B[0],y=w*w*A[1]+2*w*tt*C[1]+tt*tt*B[1];
    /* 圓點靠太近會被推開(ox,oy,螢幕像素),橘子要跟著去顯示出來的圓點位置,才會貼合 */
    const g0=stopEls[si],g1=stopEls[si+1]||g0,ox=((+g0.dataset.ox||0)*w+(+g1.dataset.ox||0)*tt)/v.ppu,oy=((+g0.dataset.oy||0)*w+(+g1.dataset.oy||0)*tt)/v.ppu;car.dataset.x=x+ox;car.dataset.y=y+oy;car.dataset.y=y;car.setAttribute('transform',`translate(${(x+ox).toFixed(1)},${(y+oy).toFixed(1)}) scale(${(1/v.ppu).toFixed(4)})`)};
  carAt(carU);const MINP=.3,MAXP=9;
  const setTouched=t=>{if(touched!==t){touched=t;if(api&&api.onTouched)api.onTouched(t)}};
  function apply(full=true){const w=W(),h=H();if(w<10||h<10)return;
    v.cx=Math.max(ISLAND_BOX.x[0]-80,Math.min(ISLAND_BOX.x[1]+80,v.cx));v.cy=Math.max(ISLAND_BOX.y[0]-80,Math.min(ISLAND_BOX.y[1]+80,v.cy));
    const vw=w/v.ppu,vh=h/v.ppu,inv=1/v.ppu;
    svg.setAttribute('viewBox',`${v.cx-vw/2} ${v.cy-vh/2} ${vw} ${vh}`);
    const f1=svg.querySelector(`#${id}g1 feGaussianBlur`),f2=svg.querySelector(`#${id}g2 feGaussianBlur`);if(f1){f1.setAttribute('stdDeviation',7/v.ppu);f2.setAttribute('stdDeviation',1.6/v.ppu)}
    mks.forEach(g=>g.setAttribute('transform',`translate(${g.dataset.x},${g.dataset.y}) rotate(${g.dataset.rot||0}) scale(${inv})`));
    if(full===false)return;   // 拖動中只移動畫面,不重排標籤(手指停下來才排)
    /* 標籤自動避開:先排行程點,再依重要程度排地標;放不下的地標就先隱藏 */
    const sx=g=>(+g.dataset.x-v.cx)*v.ppu+w/2+(+g.dataset.ox||0),sy=g=>(+g.dataset.y-v.cy)*v.ppu+h/2+(+g.dataset.oy||0),placed=[];
    /* 每日地圖:徽章靠太近就推開(約 34px),用細線連回真正位置;總覽地圖不動 */
    if(route){const bx=stopEls.map(g=>(+g.dataset.x-v.cx)*v.ppu+w/2),by=stopEls.map(g=>(+g.dataset.y-v.cy)*v.ppu+h/2),qx=bx.slice(),qy=by.slice(),MD=0;
     for(let it=0;it<40;it++){let mv=false;for(let i=0;i<qx.length;i++)for(let j=i+1;j<qx.length;j++){let dx=qx[j]-qx[i],dy=qy[j]-qy[i],d=Math.hypot(dx,dy);
       if(d<MD){if(d<.5){dx=Math.cos(i*2.4+j);dy=Math.sin(i*2.4+j);d=1}const k=(MD-d)/2/d;qx[i]-=dx*k;qy[i]-=dy*k;qx[j]+=dx*k;qy[j]+=dy*k;mv=true}}if(!mv)break}
     stopEls.forEach((g,i)=>{const ox=qx[i]-bx[i],oy=qy[i]-by[i],mv=Math.hypot(ox,oy)>1.5;g.dataset.ox=mv?ox:0;g.dataset.oy=mv?oy:0;
       const jo=g.querySelector('.jo'),ln=g.querySelector('.jl'),dt=g.querySelector('.jd');
       jo.setAttribute('transform',mv?`translate(${ox},${oy})`:'');
       ln.setAttribute('display',mv?'':'none');dt.setAttribute('display',mv?'':'none');if(mv){ln.setAttribute('x2',ox);ln.setAttribute('y2',oy)}});carAt(carU)}
    const hit=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    const circ=g=>{const r=+g.dataset.r;return{x:sx(g)-r,y:sy(g)-r,w:2*r,h:2*r}};
    stopEls.forEach(g=>placed.push(circ(g)));
    const put=(g,must)=>{const pw=+g.dataset.pw,r=+g.dataset.r,x=sx(g),y=sy(g),ph=19,pl=g.querySelector('.jp');
      if(x<-60||y<-40||x>w+60||y>h+40){g.style.display='none';return}
      const cand=[[r+4,-ph/2],[-r-4-pw,-ph/2],[-pw/2,r+3],[-pw/2,-r-3-ph],[r,r],[-r-pw,r],[r,-r-ph],[-r-pw,-r-ph]];let best=null,bp=1e9;
      cand.forEach(([dx,dy])=>{const rc={x:x+dx,y:y+dy,w:pw,h:ph};let p=0;if(rc.x<4||rc.x+pw>w-4||rc.y<4||rc.y+ph>h-4)p+=60;placed.forEach(q=>p+=hit(rc,q));if(p<bp){bp=p;best=[dx,dy,rc]}});
      if(!must&&bp>0){g.style.display='none';return}
      if(must&&declutter&&bp>0&&!g.classList.contains('on')){g.style.display='';pl.style.display='none';return}
      pl.style.display='';g.style.display='';pl.setAttribute('transform',`translate(${best[0]},${best[1]})`);placed.push(best[2]);if(!must)placed.push(circ(g))};
    stopEls.forEach(g=>put(g,true));
    [1,2,3].forEach(lv=>lmEls.filter(g=>+g.dataset.lv===lv).forEach(g=>{const ok=lv===1||(lv===2&&v.ppu>=.9)||(lv===3&&v.ppu>=1.7);if(!ok){g.style.display='none';return}put(g,false)}))}
  let raf=0,needFull=false,idleT=0;
  const sched=full=>{needFull=needFull||full;if(!raf)raf=requestAnimationFrame(()=>{raf=0;const f=needFull;needFull=false;apply(f)});if(!full){clearTimeout(idleT);idleT=setTimeout(()=>apply(true),140)}};
  const declutter=route?points.length>5:points.length>12;
  const refit=()=>{v=fitView();v.ppu*=zoomBias;basePpu=v.ppu;apply()};
  const ro=new ResizeObserver(()=>{if(!touched)refit();else apply()});ro.observe(host);refit();
  const zoomAt=(px,py,f)=>{setTouched(true);const w=W(),h=H(),X=v.cx+(px-w/2)/v.ppu,Y=v.cy+(py-h/2)/v.ppu;v.ppu=Math.max(MINP,Math.min(MAXP,v.ppu*f));v.cx=X-(px-w/2)/v.ppu;v.cy=Y-(py-h/2)/v.ppu;sched(true)};
  let flying=0;
  const fly=(t,ms=450)=>{const a={...v},t0=performance.now(),tk=++flying;(function s(n){if(tk!==flying)return;const k=Math.min(1,(n-t0)/ms),e=(1-Math.cos(Math.PI*k))/2;v.cx=a.cx+(t.cx-a.cx)*e;v.cy=a.cy+(t.cy-a.cy)*e;v.ppu=a.ppu*Math.pow(t.ppu/a.ppu,e);apply(k>=1);if(k<1)requestAnimationFrame(s)})(t0)};
  const api={zoom:f=>zoomAt(W()/2,H()/2,f),home:()=>{const t=fitView();t.ppu*=zoomBias;basePpu=t.ppu;fly(t);setTouched(false)},
    focus:i=>fly({cx:P[i][0],cy:P[i][1],ppu:Math.max(v.ppu,2.6)}),onStop:null,onTap:null,onTouched:null,
    setActive:i=>{api.setActive0(i);api.driveTo(i)},
    /* 地圖移到第 i 站(保持目前縮放,至少放大到能看清楚附近) */
    panTo:i=>{if(!P[i])return;fly({cx:P[i][0],cy:P[i][1],ppu:Math.max(v.ppu,Math.min(basePpu*1.8,3.4))},520)},
    /* 橘子沿著道路滾到第 i 站(只在換站時動 0.3~0.9 秒) */
    driveTo:i=>{if(!car||!SEG.length)return;const from=carU,to=i;if(from===to)return;const t0=performance.now(),dur=Math.min(900,320+140*Math.abs(to-from)),tk=++carTk;
      (function st(n){if(tk!==carTk)return;const k=Math.min(1,(n-t0)/dur),e=(1-Math.cos(Math.PI*k))/2;carU=from+(to-from)*e;carAt(carU);if(k<1)requestAnimationFrame(st)})(t0)},
    setActive0:i=>stopEls.forEach(g=>{const on=+g.dataset.i===i;g.classList.toggle('on',on);if(on){g.parentNode.appendChild(g);const p=g.querySelector('.jp');if(p)p.style.display=''}}),
    destroy:()=>{carTk++;ro.disconnect();flying++;cancelAnimationFrame(raf);clearTimeout(idleT);svg.remove()}};
  if(interactive){
    const ptr=new Map();let moved=0,downEl=null,start=[0,0],mode='';
    svg.addEventListener('pointerdown',e=>{try{svg.setPointerCapture(e.pointerId)}catch(_){}ptr.set(e.pointerId,[e.clientX,e.clientY]);if(ptr.size===1){moved=0;mode='';start=[e.clientX,e.clientY]}else mode='map';downEl=document.elementFromPoint(e.clientX,e.clientY);flying++});
    svg.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;const o2=ptr.get(e.pointerId),n=[e.clientX,e.clientY];
      if(ptr.size===1){
        const dx=n[0]-o2[0],dy=n[1]-o2[1],tdx=n[0]-start[0],tdy=n[1]-start[1];moved+=Math.abs(dx)+Math.abs(dy);
        if(!mode&&Math.hypot(tdx,tdy)>8){
          const zoomedIn=v.ppu>basePpu*1.04;
          mode=(small&&fit==='island'&&!zoomedIn&&Math.abs(tdy)>Math.abs(tdx)*1.2)?'page':'map';
          if(mode==='map'){setTouched(true);v.cx-=tdx/v.ppu;v.cy-=tdy/v.ppu;sched(false)}
          else{const pe=host.closest('.pg');if(pe)pe.scrollTop-=tdy}
        }else if(mode==='map'){v.cx-=dx/v.ppu;v.cy-=dy/v.ppu;sched(false)}
        else if(mode==='page'){const pe=host.closest('.pg');if(pe)pe.scrollTop-=dy}
        ptr.set(e.pointerId,n)}
      else if(ptr.size===2){const ids=[...ptr.keys()],a=ptr.get(ids[0]),b=ptr.get(ids[1]),d0=Math.hypot(a[0]-b[0],a[1]-b[1]);ptr.set(e.pointerId,n);
        const a2=ptr.get(ids[0]),b2=ptr.get(ids[1]),d1=Math.hypot(a2[0]-b2[0],a2[1]-b2[1]),r=host.getBoundingClientRect();moved+=9;
        if(d0>0)zoomAt((a2[0]+b2[0])/2-r.left,(a2[1]+b2[1])/2-r.top,d1/d0)}});
    const up=e=>{if(ptr.has(e.pointerId)&&moved<6&&ptr.size===1){const st=downEl&&downEl.closest&&downEl.closest('.jstop');if(st&&api.onStop)api.onStop(+st.dataset.i);else if(!st&&api.onTap)api.onTap()}ptr.delete(e.pointerId);if(!ptr.size){if(mode==='map'){clearTimeout(idleT);apply(true)}mode=''}};
    svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
    if(!small){svg.addEventListener('wheel',e=>{e.preventDefault();const r=host.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-e.deltaY*.0018))},{passive:false});
    svg.addEventListener('dblclick',e=>{const r=host.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,1.8)})}}
  return api}
