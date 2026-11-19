/* 匯率計算機:頂端 💱 鈕 → 底部升起的小卡(沿用 .spot 的下滑關閉、壓黑背景)。
   匯率為寫死的中間價(1 單位 = 多少台幣),出發前請更新 FX_DATE 與 FX_TWD */
const FX_DATE='2026/11/19';
const FX_TWD={TWD:1,KRW:0.024782,USD:32.9955,JPY:0.207035,CNY:4.949414,HKD:4.205846,EUR:36.208219,GBP:43.372247,SGD:25.592951,THB:0.971491,AUD:22.058705};
const FX_LIST=[['KRW','🇰🇷','韓元'],['TWD','🇹🇼','台幣'],['USD','🇺🇸','美元'],['JPY','🇯🇵','日圓'],['CNY','🇨🇳','人民幣'],['HKD','🇭🇰','港幣'],['EUR','🇪🇺','歐元'],['GBP','🇬🇧','英鎊'],['SGD','🇸🇬','新加坡幣'],['THB','🇹🇭','泰銖'],['AUD','🇦🇺','澳幣']];
const FX_SYM={KRW:'₩',TWD:'NT$',USD:'US$',JPY:'¥',CNY:'CN¥',HKD:'HK$',EUR:'€',GBP:'£',SGD:'S$',THB:'฿',AUD:'A$'};
const fxName=c=>FX_LIST.find(x=>x[0]===c)[2];
const fxComma=v=>{const [i,d]=String(v).split('.');return (i||'').replace(/\B(?=(\d{3})+(?!\d))/g,',')+(d!==undefined?'.'+d:'')};
const fxSt={from:'KRW',to:'TWD',amt:'10000'};
const fxConv=(a,f,t)=>a*FX_TWD[f]/FX_TWD[t];
const fxFmt=(n,c)=>{if(!isFinite(n))return '—';const d=n>=1000||c==='KRW'||c==='JPY'?0:n>=10?1:2;return n.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:0})};
const fxOpts=sel=>FX_LIST.map(([c,f,n])=>`<option value="${c}" ${c===sel?'selected':''}>${f} ${c} ${n}</option>`).join('');
function fxCard(){
  return `<div class="spot fxc"><button class="sp-x" aria-label="關閉">✕</button>
   <div class="fx-h"><b>💱 匯率計算機</b><span>匯率更新:${FX_DATE}(中間價,實際換匯會有差)</span></div>
   <div class="fx-b">
    <div class="fx-r"><input id="fxAmt" type="text" inputmode="decimal" autocomplete="off" value="${fxComma(fxSt.amt)}"><select id="fxFrom">${fxOpts(fxSt.from)}</select></div>
    <button class="fx-sw" id="fxSw" aria-label="對調">⇅</button>
    <div class="fx-r out"><output id="fxOut"></output><select id="fxTo">${fxOpts(fxSt.to)}</select></div>
    <div class="fx-rate" id="fxRate"></div>
    <div class="fx-q" id="fxQ"></div>
    <div class="fx-all" id="fxAll"></div>
   </div></div>`}
const fxR=n=>n>=100?Math.round(n).toLocaleString('en-US'):n>=1?n.toFixed(n>=10?1:2):n.toPrecision(3);
function fxUpdate(){
  const a=parseFloat(fxSt.amt||'')||0,{from:f,to:t}=fxSt;
  document.getElementById('fxOut').textContent=fxFmt(fxConv(a,f,t),t);
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
  $('fxAmt').oninput=e=>{let v=e.target.value.replace(/[^0-9.]/g,'');const k=v.indexOf('.');if(k>=0)v=v.slice(0,k+1)+v.slice(k+1).replace(/\./g,'');fxSt.amt=v;e.target.value=fxComma(v);fxUpdate()};
  $('fxFrom').onchange=e=>{fxSt.from=e.target.value;fxUpdate()};
  $('fxTo').onchange=e=>{fxSt.to=e.target.value;fxUpdate()};
  $('fxSw').onclick=()=>{[fxSt.from,fxSt.to]=[fxSt.to,fxSt.from];$('fxFrom').value=fxSt.from;$('fxTo').value=fxSt.to;fxUpdate()};
  $('fxQ').onclick=e=>{const b=e.target.closest('button');if(!b)return;fxSt.amt=b.dataset.v;$('fxAmt').value=fxComma(fxSt.amt);fxUpdate()};
  fxUpdate()}
document.getElementById('fxBtn').onclick=e=>{e.stopPropagation();document.querySelector('.app > .spot.fxc:not(.closing)')?closeSpot():openFx()};
