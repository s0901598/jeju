/* ========== B 真實地圖引擎(OpenStreetMap + Leaflet,放大視窗裡按「看真實地圖」才載入) ========== */
let _leafP=null;
function loadLeaflet(){
  if(window.L)return Promise.resolve(window.L);
  if(_leafP)return _leafP;
  _leafP=new Promise((res,rej)=>{
    const l=document.createElement('link');l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l);
    const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload=()=>res(window.L);s.onerror=()=>{_leafP=null;rej(new Error('leaflet'))};document.head.appendChild(s)});
  return _leafP}
function LMap(host,o){
  const {points=[],route=false,badge='letter',sel=-1}=o,L=window.L;
  const ilon=x=>x/K_X+LON0,ilat=y=>LAT0-y/K_Y;
  const map=L.map(host,{zoomControl:false,attributionControl:true,zoomSnap:.25,fadeAnimation:false,keyboard:false,tap:false,boxZoom:false});
  map.attributionControl.setPrefix(false);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  /* 路線與箭頭 */
  const P=points.map(s=>[wx(s.lon),wy(s.lat)]);
  if(route&&P.length>1){
    const pts=[[ilat(P[0][1]),ilon(P[0][0])]],arrows=[];
    for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1],Ln=Math.hypot(dx,dy)||1,sg=(i%2?1:-1)*Ln*.2,cx=mx-dy/Ln*sg,cy=my+dx/Ln*sg;
      const bz=t=>[(1-t)*(1-t)*a[0]+2*(1-t)*t*cx+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*cy+t*t*b[1]];
      for(let k=1;k<=24;k++){const p=bz(k/24);pts.push([ilat(p[1]),ilon(p[0])])}
      const m=bz(.5),m1=bz(.46),m2=bz(.54);arrows.push({ll:[ilat(m[1]),ilon(m[0])],ang:Math.atan2(m2[1]-m1[1],m2[0]-m1[0])*180/Math.PI})}
    const lay=(cls,op)=>L.polyline(pts,{className:cls,lineCap:'round',lineJoin:'round',interactive:false,...op}).addTo(map);
    if(document.documentElement.dataset.theme!=='dark')lay('case',{color:'#fff',weight:9,opacity:.95});
    lay('glow',{color:'#ff6a00',weight:15,opacity:.32});lay('mid',{color:'#ff8a1f',weight:5.5,opacity:1});lay('core',{color:'#fff1d0',weight:2,opacity:1});lay('flow',{color:'#fff',weight:2.2,opacity:.9});
    arrows.forEach(a=>L.marker(a.ll,{interactive:false,icon:L.divIcon({className:'',iconSize:[18,18],html:`<div class="barr" style="transform:rotate(${a.ang}deg)"><svg width="16" height="16" viewBox="-8 -8 16 16"><path d="M-6,-6 L7,0 L-6,6 L-3,0Z" fill="#fff6e0" stroke="#e5600a" stroke-width="1.6" stroke-linejoin="round"/></svg></div>`})}).addTo(map))}
  /* 地標與行程點 */
  const items=[],names=new Set(points.map(s=>s.name));
  LANDMARKS.filter(l=>!names.has(l.n)).forEach(l=>{const [ic,c]=KIND[l.k];
    items.push({m:L.marker([l.lat,l.lon],{interactive:false,keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div class="blm" style="--c:${c}"><i>${ic}</i><span>${l.n}</span></div>`})}).addTo(map),lv:l.lv,r:11,stop:false})});
  const api={onStop:null};
  points.forEach((s,i)=>{const t=TYPE[s.ty]||TYPE.spot;
    const face=badge==='letter'?`<b>${String.fromCharCode(65+i)}</b>`:`<b style="background:${t[1]}">${s.ty==='airport'?'✈':t[2]}</b>`;
    const m=L.marker([s.lat,s.lon],{keyboard:false,icon:L.divIcon({className:'',iconSize:[0,0],html:`<div class="bsp${i===sel?' sel':''}">${face}<span>${s.name}</span></div>`})}).addTo(map);
    m.on('click',()=>api.onStop&&api.onStop(i));items.push({m,lv:0,r:14,stop:true})});
  /* 標籤自動避開(同 A) */
  const layout=()=>{if(!items.every(i=>i.m.getElement()))return;const z=map.getZoom(),sz=map.getSize(),placed=[],hit=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    const pos=it=>map.latLngToContainerPoint(it.m.getLatLng()),circ=it=>{const p=pos(it);return{x:p.x-it.r,y:p.y-it.r,w:2*it.r,h:2*it.r}};
    items.filter(i=>i.stop).forEach(i=>placed.push(circ(i)));
    const put=(it,must)=>{const el=it.m.getElement().firstChild,sp=el.querySelector('span'),p=pos(it),pw=sp.offsetWidth,ph=19,r=it.r;
      if(p.x<-60||p.y<-40||p.x>sz.x+60||p.y>sz.y+40){el.style.display='none';return}
      const cand=[[r+4,-ph/2],[-r-4-pw,-ph/2],[-pw/2,r+3],[-pw/2,-r-3-ph],[r,r],[-r-pw,r],[r,-r-ph],[-r-pw,-r-ph]];let best=null,bp=1e9;
      cand.forEach(([dx,dy])=>{const rc={x:p.x+dx,y:p.y+dy,w:pw,h:ph};let s2=0;if(rc.x<4||rc.x+pw>sz.x-4||rc.y<4||rc.y+ph>sz.y-4)s2+=60;placed.forEach(q=>s2+=hit(rc,q));if(s2<bp){bp=s2;best=[dx,dy,rc]}});
      if(!must&&bp>0){el.style.display='none';return}
      el.style.display='';sp.style.transform=`translate(${best[0]}px,${best[1]}px)`;placed.push(best[2]);if(!must)placed.push(circ(it))};
    items.filter(i=>i.stop).forEach(i=>put(i,true));
    [1,2,3].forEach(lv=>items.filter(i=>i.lv===lv).forEach(i=>{const ok=lv===1||(lv===2&&z>=10.5)||(lv===3&&z>=12);if(!ok){i.m.getElement().firstChild.style.display='none';return}put(i,false)}))};
  map.on('zoomend moveend resize',layout);
  const bounds=points.length?L.latLngBounds(points.map(s=>[s.lat,s.lon])).pad(.35):L.latLngBounds([[33.2,126.15],[33.57,126.96]]);
  const home=anim=>map.fitBounds(o.fit==='island'||!points.length?L.latLngBounds([[33.2,126.15],[33.57,126.96]]):bounds,{maxZoom:13,animate:!!anim,padding:[20,20]});
  map.setView([33.4,126.55],10);
  setTimeout(()=>{map.invalidateSize();home(false);if(o.zoomDelta)map.setZoom(map.getZoom()+o.zoomDelta,{animate:false});layout()},30);
  Object.assign(api,{zoom:d=>map.setZoom(map.getZoom()+d),home:()=>home(true),setActive:()=>{},
    focus:i=>map.flyTo([points[i].lat,points[i].lon],Math.max(map.getZoom(),13),{duration:.6}),destroy:()=>map.remove()});
  return api}
