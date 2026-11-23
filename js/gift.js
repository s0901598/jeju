/* 伴手禮頁:三個分頁(濟州必買 / Olive Young / Mood 盤子)。圖片放 img/gift/<id>.webp,沒有圖時先顯示 emoji */
(function(){
const G={
 buy:[
  {id:'juice',e:'🍊',bg:'#ffe3b8',zh:'石頭爺爺橘子汁',ko:'돌하르방 감귤주스',w:'超市、GS25、機場免稅店',tag:'Day 4 易買得'},
  {id:'choco',e:'🍫',bg:'#ffd9c9',zh:'FRUNACK 柑橘巧克力',ko:'프루낵 감귤 초콜릿',w:'超市、免稅店、特產店',tag:'Day 4 易買得'},
  {id:'mochiron',e:'😊',bg:'#fff0c7',zh:'Mochiron 達克瓦茲',ko:'모치론',w:'週二~五 10:00–18:00,週六到 17:00,日一公休',tag:'Day 4 牧官衙旁'},
  {id:'umu',e:'🍮',bg:'#e6f2d9',zh:'Umu 海藻布丁',ko:'우무 푸딩',w:'機場出境大廳 08:00–20:30',tag:'Day 4 機場'},
  {id:'tteok',e:'🍡',bg:'#fde0e6',zh:'濟羅軒穀物年糕',ko:'제라헌',w:'東門市場內 08:30–21:30',tag:'Day 4 東門市場'},
  {id:'mongle',e:'☁️',bg:'#dcebfb',zh:'mongle 雲朵餅乾',ko:'몽글',w:'機場附近伊湖洞店 09:00–18:00',tag:'要繞過去'},
  {id:'ramen',e:'🍜',bg:'#f1e1d0',zh:'黑豬肉泡麵',ko:'흑돼지 라면',w:'便利商店、紀念品店、免稅店',tag:'Day 4 易買得'},
  {id:'soju',e:'🍶',bg:'#dff0f6',zh:'漢拏山燒酒',ko:'한라산 소주',w:'便利商店、超市。酒類帶回台灣有限量,出發前確認',tag:'Day 4 易買得'}],
 oy:[
  {id:'oy-toner',e:'🧴',bg:'#d9edf7',zh:'Round Lab 1025 化妝水',ko:'라운드랩 1025 독도 토너',w:'溫和補水,韓國最暢銷'},
  {id:'oy-torriden',e:'💧',bg:'#d6e9fb',zh:'Torriden 玻尿酸精華',ko:'토리든 다이브인',w:'補水冠軍,面膜也熱門'},
  {id:'oy-aestura',e:'🧈',bg:'#fdebd3',zh:'AESTURA 365 乳霜',ko:'에스트라 아토베리어 365',w:'冬天乾燥肌救星'},
  {id:'oy-sun',e:'☀️',bg:'#fff3bf',zh:'Round Lab 白樺樹防曬',ko:'라운드랩 자작나무 선크림',w:'韓國國民防曬'},
  {id:'oy-lip',e:'💄',bg:'#fcdbe3',zh:'rom&nd 唇釉 · fwee 唇頰膏',ko:'롬앤 · 퓌',w:'彩妝熱銷第一名'},
  {id:'oy-hair',e:'🧖',bg:'#e8dcf5',zh:'UNOVE 護髮乳 EX',ko:'유노브 딥 데미지 트리트먼트',w:'受損、染燙後常買'},
  {id:'oy-body',e:'🧴',bg:'#dff2e6',zh:'ILLIYOON 身體乳液',ko:'일리윤 세라마이드',w:'乾肌急救,全家都能用'},
  {id:'oy-bagel',e:'🥯',bg:'#f6e4c8',zh:'Delight Project 貝果餅乾',ko:'딜라이트 프로젝트 베이글칩',w:'零食冠軍,送人自己都適合'}]
};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ph=(i,h)=>`<div class="gf-ph" style="background:${i.bg||'#f1e4d0'};${h?'height:'+h+'px;':''}"><span>${i.e}</span><img src="img/gift/${i.id}.webp" alt="" loading="lazy" onerror="this.remove()"></div>`;
const card=i=>`<div class="gf-c">${ph(i)}<div class="gf-t"><b>${esc(i.zh)}</b><small>${esc(i.ko)}</small><p>${esc(i.w)}</p>${i.tag?`<em>${esc(i.tag)}</em>`:''}</div></div>`;
const TABS=[
 {k:'buy',n:'濟州必買',h:()=>`<div class="gf-note">液體超過 100ml 不能手提上機,橘子汁等請放托運。</div><div class="gf-g">${G.buy.map(card).join('')}</div>`},
 {k:'oy',n:'Olive Young',h:()=>`<div class="gf-box"><b>🛍️ 行程上順路的 3 間分店</b><p>• 東門市場店 <small>관덕로 62-1</small> Day 4 東門市場旁<br>• 易買得新濟州店 1 樓 Day 4 E-mart 裡<br>• 탑동店 <small>탑동로 15-1</small> Day 3 BHC 附近</p></div><div class="gf-note">單筆滿 15,000 韓元可免稅,結帳帶護照。</div><div class="gf-g">${G.oy.map(card).join('')}</div>`},
 {k:'mood',n:'Mood 盤子',h:()=>`${ph({id:'mood',e:'🐚🍽️',bg:'linear-gradient(135deg,#f6efe4,#e7d9c5)'},150)}<div class="gf-box"><b>Mood Jeju <small style="display:inline">무드 제주</small></b><p>貝殼造型盤子、小叉子、線香、飾品等,貝殼盤是主角。<br>📍 <span class="gf-addr">제주시 남성로 89</span> <b>2 樓</b>(招牌隱密,找 2 樓入口)<br>🕐 11:00–18:00<br>🚶 Day 4 牧官衙走路約 12 分、東門市場約 15 分(直線距離估算)</p><a class="gf-go" href="https://map.naver.com/p/search/${encodeURIComponent('무드제주 남성로 89')}" target="_blank" rel="noopener">Naver 導航 ›</a></div><div class="gf-note">盤子易碎,請店家多包一層,放手提或衣物中間。</div><div class="gf-box"><b>順路的另一間:Planer House <small style="display:inline">플라네하우스</small></b><p>📍 관덕로11길 28 2 樓,賣帆布包等,Day 4 牧官衙旁走路約 5 分。營業時間沒查到,出發前確認。</p></div>`}
];
let cur=0;
function render(){
  const b=document.getElementById('gfBody');if(!b)return;
  b.innerHTML=`<div class="gf-seg">${TABS.map((t,i)=>`<button data-i="${i}" class="${i===cur?'on':''}">${t.n}</button>`).join('')}</div>${TABS[cur].h()}`;
}
document.addEventListener('click',e=>{const x=e.target.closest('.gf-seg button');if(!x)return;cur=+x.dataset.i;render();const p=document.getElementById('p-gift');if(p)p.scrollTop=0});
render();
})();
