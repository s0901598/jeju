/* ========== 地圖(簡化的濟州島,經緯度投影) ========== */
const W=360,H=230;
const px=(lon,lat)=>[(lon-126.08)/0.94*W,(33.62-lat)/0.50*H];
const COAST=[[126.15,33.30],[126.17,33.35],[126.23,33.42],[126.30,33.47],[126.40,33.51],[126.50,33.52],[126.60,33.53],[126.70,33.55],[126.80,33.55],[126.88,33.52],[126.93,33.47],[126.95,33.43],[126.91,33.39],[126.85,33.33],[126.78,33.28],[126.70,33.25],[126.60,33.23],[126.50,33.23],[126.40,33.23],[126.31,33.22],[126.22,33.23],[126.16,33.26]].map(p=>px(...p));
const f=n=>n.toFixed(1);
function splineClosed(pts){const n=pts.length;let d=`M${f(pts[0][0])},${f(pts[0][1])}`;
  for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    d+=`C${f(p1[0]+(p2[0]-p0[0])/6)},${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)},${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])},${f(p2[1])}`;}
  return d+'Z';}
const ISLAND=splineClosed(COAST);
const [HX,HY]=px(126.53,33.36),[UX,UY]=px(126.952,33.503);

/* 點太近時互相推開(至少 minD px),避免疊在一起 */
function spread(P,minD){
  for(let i=1;i<P.length;i++)for(let j=0;j<i;j++){let dx=P[i][0]-P[j][0],dy=P[i][1]-P[j][1],dist=Math.hypot(dx,dy);
    if(dist<minD){if(dist<.1){dx=1;dy=.3;dist=1.04}const k=minD/dist;P[i]=[P[j][0]+dx*k,P[j][1]+dy*k]}}
  return P;}

function routeD(P){let d=`M${f(P[0][0])},${f(P[0][1])}`;
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
    const s=(i%2?1:-1)*len*0.2;d+=`Q${f(mx-dy/len*s)},${f(my+dx/len*s)} ${f(b[0])},${f(b[1])}`;}
  return d;}
function arrowsSVG(P){let o='';
  for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
    if(len<20)continue;
    const sg=(i%2?1:-1)*len*0.2,cx=mx-dy/len*sg,cy=my+dx/len*sg;
    const x=.25*a[0]+.5*cx+.25*b[0],y=.25*a[1]+.5*cy+.25*b[1],ang=Math.atan2(dy,dx)*180/Math.PI;
    o+=`<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)}) scale(1.35)"><path d="M-4,-4.2 L4.6,0 L-4,4.2 L-2,0Z" fill="#fff6e0" stroke="#e5600a" stroke-width="1.2" stroke-linejoin="round"/></g>`;}
  return o;}

/* 島的底圖(每日地圖與總覽共用) */
function baseMap(){return `
    <rect width="${W}" height="${H}" fill="url(#sea)"/>
    <g stroke="#7fb4d0" stroke-width=".8" fill="none" opacity=".16"><path d="M0,30 Q45,24 90,30 T180,30 T270,30 T360,30"/><path d="M0,200 Q60,193 120,200 T240,200 T360,200"/><path d="M0,226 Q50,220 100,226 T200,226 T300,226"/></g>
    <path d="${ISLAND}" fill="#6fd0e8" opacity=".35" filter="url(#coast)"/>
    <path d="${ISLAND}" fill="url(#land)" stroke="rgba(255,255,255,.35)" stroke-width="1"/>
    <circle cx="${f(UX)}" cy="${f(UY)}" r="5" fill="url(#land)" stroke="rgba(255,255,255,.3)"/>
    <ellipse cx="${f(HX)}" cy="${f(HY)}" rx="64" ry="34" fill="url(#halla)"/>
    <g fill="none" stroke="#cfeedd" opacity=".18"><ellipse cx="${f(HX)}" cy="${f(HY)}" rx="52" ry="26"/><ellipse cx="${f(HX)}" cy="${f(HY)}" rx="36" ry="17"/><ellipse cx="${f(HX)}" cy="${f(HY)}" rx="19" ry="8"/></g>
    <text x="${f(HX)}" y="${f(HY+3)}" text-anchor="middle" font-size="8" fill="#e6f6ec" opacity=".7" letter-spacing="1">▲ 漢拿山</text>`;}

/* 每日地圖:A→B→C 霓虹路線 */
function mapSVG(day){
  const P=spread(day.stops.map(s=>px(s.lon,s.lat)),19);
  const d=routeD(P);
  let mk='';
  day.stops.forEach((s,i)=>{const [x,y]=P[i],L=String.fromCharCode(65+i),w=s.name.length*9.6+10;
    let lx=x,ly=y,anchor='middle',side=s.lab;
    if(side==='r'&&x+15+w>W-6)side='l'; if(side==='l'&&x-15-w<6)side='r';
    if(side==='u'){ly=y-17}else if(side==='d'){ly=y+23}else if(side==='r'){lx=x+15;ly=y+3.5;anchor='start'}else{lx=x-15;ly=y+3.5;anchor='end'}
    if(anchor==='middle')lx=Math.min(W-w/2-4,Math.max(w/2+4,lx));
    const rx=anchor==='middle'?lx-w/2:anchor==='start'?lx-4:lx-w+4;
    mk+=`<g class="mk${i===0?' on':''}" data-i="${i}">
      <circle class="ring" cx="${f(x)}" cy="${f(y)}" r="10" fill="none" stroke="#ff9a3a" stroke-width="2"/>
      <circle class="dot" cx="${f(x)}" cy="${f(y)}" r="9" fill="#0d2a42" stroke="#ffb06a" stroke-width="2"/>
      <text x="${f(x)}" y="${f(y+3.6)}" text-anchor="middle" font-size="10" font-weight="800" fill="#ffe6c4">${L}</text>
      <g class="lab"><rect x="${f(rx)}" y="${f(ly-9)}" width="${f(w)}" height="13" rx="6.5" fill="rgba(8,28,45,.72)"/>
      <text x="${f(anchor==='middle'?lx:anchor==='start'?lx+1:lx-1)}" y="${f(ly+0.8)}" text-anchor="${anchor}" font-size="9" fill="#fff">${s.name}</text></g></g>`;});
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${baseMap()}
    <path class="glow" d="${d}" fill="none" stroke="#ff6a00" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity=".6" filter="url(#gl)"/>
    <path class="mid" d="${d}" fill="none" stroke="#ff8a1f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".95" filter="url(#gl2)"/>
    <path class="core" d="${d}" fill="none" stroke="#fff1d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="flow" d="${d}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
    ${arrowsSVG(P)}
    ${mk}</svg>`;}

/* ===== 總覽:東南西北分區 ===== */
/* 以漢拿山為中心,用兩條斜線把島切成 北 / 東 / 南 / 西(島是東西長,所以斜率取 0.6) */
const SLOPE=0.6;
function regionOf(x,y){const dx=x-HX,dy=y-HY;
  if(Math.abs(dy)>=SLOPE*Math.abs(dx))return dy<0?'北':'南';
  return dx>0?'東':'西';}
function overviewPoints(){
  const seen=new Map();
  DAYS.forEach(d=>d.stops.forEach(s=>{const k=s.name+s.lon+s.lat;
    if(!seen.has(k))seen.set(k,{...s,days:[d.n]});else seen.get(k).days.push(d.n);}));
  return [...seen.values()];}
function overviewSVG(pts){
  const P=spread(pts.map(s=>px(s.lon,s.lat)),17);
  const ray=(sx,sy)=>`<line x1="${f(HX)}" y1="${f(HY)}" x2="${f(HX+sx*220)}" y2="${f(HY+sy*220*SLOPE)}" stroke="#ffd9a0" stroke-width="1" stroke-dasharray="4 5" opacity=".5"/>`;
  const wm=(t,x,y)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" opacity=".13" letter-spacing="4" style="font-family:'Songti TC',serif">${t}</text>`;
  /* 標籤自動避開:每個點試 右/左/上/下/斜上/斜下,挑和已放標籤、圓點重疊最少的 */
  const R=7.5,LH=12,placed=[];
  const hit=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const dots=P.map(([x,y])=>({x:x-R,y:y-R,w:2*R,h:2*R}));
  let mk='',lbl='';
  pts.forEach((s,i)=>{const [x,y]=P[i],w=s.name.length*8.2+8;
    const cand=[[x+R+2,y-LH/2,'start'],[x-R-2-w,y-LH/2,'end'],[x-w/2,y-R-LH-1,'mid'],[x-w/2,y+R+1,'mid'],
                [x+R,y-R-LH,'start'],[x-R-w,y-R-LH,'end'],[x+R,y+R,'start'],[x-R-w,y+R,'end'],[x-w/2,y-R-2*LH-2,'mid'],[x-w/2,y+R+LH+2,'mid']];
    let best=null,bp=1e9;
    cand.forEach(([rx,ry])=>{const r={x:rx,y:ry,w,h:LH};
      let p=0;if(rx<3||rx+w>W-3||ry<3||ry+LH>H-3)p+=5000;
      placed.forEach(o=>p+=hit(r,o)*3);dots.forEach((o,k)=>{if(k!==i)p+=hit(r,o)*3});
      if(p<bp){bp=p;best={x:rx,y:ry}}});
    placed.push({x:best.x,y:best.y,w,h:LH});
    lbl+=`<g><rect x="${f(best.x)}" y="${f(best.y)}" width="${f(w)}" height="${LH}" rx="6" fill="rgba(8,28,45,.72)"/>
      <text x="${f(best.x+w/2)}" y="${f(best.y+8.6)}" text-anchor="middle" font-size="8" fill="#fff">${s.name}</text></g>`;
    const [tn,tc,g]=TYPE[s.ty];
    mk+=`<g><circle cx="${f(x)}" cy="${f(y)}" r="${R}" fill="${tc}" stroke="#fff" stroke-width="1.4"/>
      <text x="${f(x)}" y="${f(y+3)}" text-anchor="middle" font-size="8.5" font-weight="800" fill="#fff">${s.ty==='airport'?'✈':g}</text></g>`;});
  mk=lbl+mk;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${baseMap()}
    ${ray(1,-1)}${ray(1,1)}${ray(-1,-1)}${ray(-1,1)}
    ${wm('北',172,74)}${wm('南',172,168)}${wm('東',304,128)}${wm('西',52,128)}
    ${mk}</svg>`;}
