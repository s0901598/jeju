/* 匯率計算機:頂端 💱 鈕 → 底部升起的小卡(沿用 .spot 的下滑關閉、壓黑背景)。
   匯率為寫死的中間價(1 單位 = 多少台幣),出發前請更新 FX_DATE 與 FX_TWD */
const FX_DATE='2026/11/19';
const FX_TWD={TWD:1,KRW:0.024782,USD:32.9955,JPY:0.207035,CNY:4.949414,HKD:4.205846,EUR:36.208219,GBP:43.372247,SGD:25.592951,THB:0.971491,AUD:22.058705};
const FX_LIST=[['KRW','🇰🇷','韓元'],['TWD','🇹🇼','台幣'],['USD','🇺🇸','美元'],['JPY','🇯🇵','日圓'],['CNY','🇨🇳','人民幣'],['HKD','🇭🇰','港幣'],['EUR','🇪🇺','歐元'],['GBP','🇬🇧','英鎊'],['SGD','🇸🇬','新加坡幣'],['THB','🇹🇭','泰銖'],['AUD','🇦🇺','澳幣']];
const FX_SYM={KRW:'₩',TWD:'NT$',USD:'US$',JPY:'¥',CNY:'CN¥',HKD:'HK$',EUR:'€',GBP:'£',SGD:'S$',THB:'฿',AUD:'A$'};
const fxName=c=>FX_LIST.find(x=>x[0]===c)[2];
const fxComma=v=>{const [i,d]=String(v).split('.');return (i||'').replace(/\B(?=(\d{3})+(?!\d))/g,',')+(d!==undefined?'.'+d:'')};
const fxSt={from:'KRW',to:'TWD',amt:'10000',expr:'10000',just:true};
/* 小算盤:支援 + − × ÷(先乘除後加減),不用 eval */
const fxOps={'+':1,'−':1,'×':2,'÷':2};
function fxTok(ex){const r=ex.match(/\d+\.?\d*|\.\d+|[+−×÷]/g)||[],t=[];
  for(let i=0;i<r.length;i++){const k=r[i];
    if(k==='−'&&(!t.length||fxOps[t[t.length-1]])&&i+1<r.length&&!fxOps[r[i+1]]){t.push('-'+r[++i])}else t.push(k)}
  return t}
function fxEval(ex){
  const t=fxTok(ex);while(t.length&&fxOps[t[t.length-1]])t.pop();   // 結尾是運算符就先忽略
  if(!t.length)return 0;
  const out=[],st=[];
  for(const k of t){if(fxOps[k]){while(st.length&&fxOps[st[st.length-1]]>=fxOps[k])out.push(st.pop());st.push(k)}else out.push(k)}
  while(st.length)out.push(st.pop());
  const v=[];
  for(const k of out){if(fxOps[k]){const b=v.pop(),a=v.pop();v.push(k==='+'?a+b:k==='−'?a-b:k==='×'?a*b:(b===0?NaN:a/b))}else v.push(parseFloat(k))}
  return v.pop()}
const fxNum=n=>{const neg=n[0]==='-'?'−':'',m=neg?n.slice(1):n,[i,d]=m.split('.');return neg+fxComma(i||'0')+(d!==undefined?'.'+d:'')};
const fxShow=ex=>fxTok(ex).map(k=>fxOps[k]?' '+k+' ':fxNum(k)).join('').trim();
function fxKey(k){
  let e=fxSt.expr;const last=e.slice(-1),num=(e.match(/[\d.]+$/)||[''])[0];
  if(k==='AC'){e='';fxSt.just=false}
  else if(k==='⌫'){e=e.slice(0,-1);fxSt.just=false}
  else if(k==='±'){const m=e.match(/(−?)([\d.]+)$/);
    if(!m){if(!e||fxOps[last])e+='−';else if(last==='−'&&(e.length===1||fxOps[e.slice(-2,-1)]))e=e.slice(0,-1)}
    else{const before=e.slice(0,e.length-m[0].length),un=m[1]&&(!before||fxOps[before.slice(-1)]);
      if(un)e=before+m[2];else e=e.slice(0,e.length-m[2].length)+'−'+m[2]}
    fxSt.just=false}
  else if(k==='%'){if(num){const v=parseFloat(num)/100;e=e.slice(0,e.length-num.length)+String(+v.toPrecision(12));fxSt.just=false}}
  else if(k==='='){const v=fxEval(e);if(isFinite(v)){e=String(Math.round(v*100)/100).replace('-','−');fxSt.just=true}}
  else if(fxOps[k]){if(!e){e='0'+k}else if(fxOps[last])e=e.slice(0,-1)+k;else e+=k;fxSt.just=false}
  else{   // 數字、00、.
    if(fxSt.just&&!fxOps[last]){e='';fxSt.just=false}
    const num2=(e.match(/[\d.]+$/)||[''])[0];
    if(k==='.'){if(num2.includes('.'))return;if(!num2)e+='0'}
    if(k==='00'&&!num2)k='0';
    if(num2==='0'&&k!=='.'&&k!=='00')e=e.slice(0,-1);
    if(num2==='0'&&k==='00')return;
    if(num2.replace('.','').length>=12)return;
    e+=k}
  fxSt.expr=e;fxUpdate()}
const fxConv=(a,f,t)=>a*FX_TWD[f]/FX_TWD[t];
const fxFmt=(n,c)=>{if(!isFinite(n))return '—';const d=n>=1000||c==='KRW'||c==='JPY'?0:n>=10?1:2;return n.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:0})};
const fxOpts=sel=>FX_LIST.map(([c,f,n])=>`<option value="${c}" ${c===sel?'selected':''}>${f} ${c} ${n}</option>`).join('');
function fxCard(){
  return `<div class="spot fxc"><button class="sp-x" aria-label="關閉">✕</button>
   <div class="fx-h"><b>💱 匯率計算機</b><span>匯率更新:${FX_DATE}(中間價,實際換匯會有差)</span></div>
   <div class="fx-b">
    <div class="fx-r in" id="fxIn" role="button" tabindex="0" aria-label="點一下輸入金額"><div class="fx-d"><div class="fx-ex" id="fxEx"></div><output id="fxAmt"></output></div><select id="fxFrom">${fxOpts(fxSt.from)}</select></div>
    <button class="fx-sw" id="fxSw" aria-label="對調">⇅</button>
    <div class="fx-r out"><output id="fxOut"></output><select id="fxTo">${fxOpts(fxSt.to)}</select></div>
    <div class="fx-rate" id="fxRate"></div>
    <div class="fx-q" id="fxQ"></div>
    <div class="fx-all" id="fxAll"></div>
   </div>
   <div class="fx-padw" id="fxPadW"><div class="fx-padh"><span>🧮 小算盤</span><button type="button" id="fxDone">完成 ▾</button></div>
    <div class="fx-pad" id="fxPad">${[['AC','fn'],['±','fn'],['%','fn'],['÷','op'],['7'],['8'],['9'],['×','op'],['4'],['5'],['6'],['−','op'],['1'],['2'],['3'],['+','op'],['⌫','ic'],['0'],['.'],['=','op']].map(([k,c])=>`<button type="button" data-k="${k}" class="${c||''}">${k}</button>`).join('')}</div></div></div></div>`}
const fxR=n=>n>=100?Math.round(n).toLocaleString('en-US'):n>=1?n.toFixed(n>=10?1:2):n.toPrecision(3);
function fxUpdate(){
  const v=fxEval(fxSt.expr),a=isFinite(v)?v:0,{from:f,to:t}=fxSt,hasOp=fxTok(fxSt.expr).some(k=>fxOps[k]);fxSt.amt=String(a);
  document.getElementById('fxEx').textContent=hasOp?fxShow(fxSt.expr):'';
  {const ex=document.getElementById('fxEx');ex.scrollLeft=ex.scrollWidth}
  document.getElementById('fxAmt').textContent=!isFinite(v)?'—':hasOp?fxFmt(a,f):(fxShow(fxSt.expr)||'0');
  document.getElementById('fxOut').textContent=isFinite(v)?fxFmt(fxConv(a,f,t),t):'—';
  const r=fxConv(1,f,t),r2=fxConv(1,t,f);
  document.getElementById('fxRate').innerHTML=`1 ${f} ≈ <b>${fxR(r)}</b> ${t}<br>1 ${t} ≈ <b>${fxR(r2)}</b> ${f}`;
  const base=f==='TWD'?[100,500,1000,3000,5000]:f==='KRW'?[1000,5000,10000,30000,50000]:[1,10,50,100,500],sf=FX_SYM[f],st=FX_SYM[t];
  const q=document.getElementById('fxQ');q.dataset.t=`常用金額速查(${fxName(f)} → ${fxName(t)})`;
  q.innerHTML=base.map(v=>`<button data-v="${v}"><b>${sf}${fxFmt(v,f)}</b><span>${st}${fxFmt(fxConv(v,f,t),t)}</span></button>`).join('');
  const others=FX_LIST.filter(([c])=>c!==f&&c!==t);
  document.getElementById('fxAll').innerHTML=`<h4>${sf}${fxFmt(a,f)} ${fxName(f)},換成其他貨幣是多少?</h4>`+others.map(([c,fl,n])=>`<div class="r"><span>${fl}</span><span class="n">${n}<small>${c}</small></span><b>${FX_SYM[c]}${fxFmt(fxConv(a,f,c),c)}</b></div>`).join('')}
function openFx(){
  if(typeof closeSpot==='function')closeSpot();
  document.querySelector('.app > .spot')?.remove();
  const app=document.querySelector('.app');app.insertAdjacentHTML('beforeend',fxCard());
  const $=id=>document.getElementById(id);
  const sp=document.querySelector('.app > .spot.fxc');
  const openPad=()=>{sp.classList.add('padopen');$('fxIn').classList.add('act');const b=sp.querySelector('.fx-b');if(b)b.scrollTop=0};
  const closePad=()=>{sp.classList.remove('padopen');$('fxIn').classList.remove('act')};
  $('fxIn').addEventListener('click',e=>{if(e.target.closest('select'))return;openPad()});
  $('fxIn').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPad()}});
  $('fxDone').onclick=closePad;
  const press=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.k==='close'){closePad();return}fxKey(b.dataset.k)};
  $('fxPad').onclick=press;
  $('fxFrom').onchange=e=>{fxSt.from=e.target.value;fxUpdate()};
  $('fxTo').onchange=e=>{fxSt.to=e.target.value;fxUpdate()};
  $('fxSw').onclick=()=>{[fxSt.from,fxSt.to]=[fxSt.to,fxSt.from];$('fxFrom').value=fxSt.from;$('fxTo').value=fxSt.to;fxUpdate()};
  $('fxQ').onclick=e=>{const b=e.target.closest('button');if(!b)return;fxSt.expr=b.dataset.v;fxSt.just=true;fxUpdate()};
  fxUpdate()}
document.getElementById('fxBtn').onclick=e=>{e.stopPropagation();document.querySelector('.app > .spot.fxc:not(.closing)')?closeSpot():openFx()};
