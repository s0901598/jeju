/* 伴手禮頁:三個分頁(濟州必買 / Olive Young / Mood 盤子)。圖片放 img/gift/<id>.webp,沒有圖時先顯示 emoji */
(function(){
const G={
 buy:[
  {id:'juice',s:'橘子味最順口 · 超市、機場',e:'🍊',bg:'#ffe3b8',zh:'石頭爺爺橘子汁',ko:'돌하르방 감귤주스',w:'超市、GS25、LOTTE Mart、東門市場、機場免稅店',rec:['橘子味:天惠香柑橘果汁、漢拏峰柑橘果汁,最順口,第一次買先選這個','青橘味:比較酸,不愛酸的先試喝再買'],tag:'Day 4 易買得'},
  {id:'choco',s:'12 入約 ₩8,000',e:'🍫',bg:'#ffd9c9',zh:'FRUNACK 柑橘巧克力',ko:'프루낵 감귤 초콜릿',w:'超市、免稅店、特產店',rec:['白巧克力款:最常見,12 入約 ₩8,000'],tag:'Day 4 易買得'},
  {id:'mochiron',s:'週二~五 10:00–18:00',e:'😊',bg:'#fff0c7',zh:'Mochiron 達克瓦茲',ko:'모치론',w:'週二~五 10:00–18:00,週六到 17:00,日一公休',tag:'Day 4 牧官衙旁'},
  {id:'umu',s:'機場出境 08:00–20:30',e:'🍮',bg:'#e6f2d9',zh:'Umu 海藻布丁',ko:'우무 푸딩',w:'機場出境大廳 08:00–20:30',rec:['卡士達:最穩的基本款','抹茶','巧克力','機場店另有限定口味(現場看)','放久會變稀,建議當天吃'],tag:'Day 4 機場'},
  {id:'tteok',s:'東門市場 08:30–21:30',e:'🍡',bg:'#fde0e6',zh:'濟羅軒穀物年糕',ko:'제라헌',w:'東門市場內 08:30–21:30',tag:'Day 4 東門市場'},
  {id:'mongle',s:'伊湖洞店 09:00–18:00',e:'☁️',bg:'#dcebfb',zh:'mongle 雲朵餅乾',ko:'몽글',w:'機場附近伊湖洞店 09:00–18:00',tag:'要繞過去'},
  {id:'ramen',s:'便利商店、免稅店',e:'🍜',bg:'#f1e1d0',zh:'黑豬肉泡麵',ko:'흑돼지 라면',w:'便利商店、紀念品店、免稅店',tag:'Day 4 易買得'},
  {id:'soju',s:'便利商店、超市',e:'🍶',bg:'#dff0f6',zh:'漢拏山燒酒',ko:'한라산 소주',w:'便利商店、超市。酒類帶回台灣有限量,出發前確認',rec:['漢拏山 17:17 度:較順口(한라산 17:17)','漢拏山 21:21 度:原味、較烈(한라산 21:21)'],tag:'Day 4 易買得'},
  {id:'starbucks',s:'₩30,000~76,000',e:'☕',bg:'#dff0e6',zh:'濟州限定星巴克杯',ko:'',w:'₩30,000~76,000 · 濟州各星巴克門市',tag:'市區 / 機場'},
  {id:'kakao',s:'機場 JDC 免稅店 2 樓',e:'🧸',bg:'#fff0c7',zh:'Kakao Friends 濟州限定',ko:'',w:'機場 JDC 免稅店 2 樓 · 鑰匙圈 ₩14,000 起、玩偶 ₩25,000~32,000',tag:'Day 4 機場'},
  {id:'hallacookie',s:'8 入禮盒約 ₩13,000',e:'🍪',bg:'#f1e1d0',zh:'HALLA COOKIE 漢拏山餅乾',ko:'한라산과자점',w:'西歸浦世界盃路 105 號 · 8 入禮盒約 ₩13,000',tag:'西歸浦'},
  {id:'pbaguette',s:'機場限定,約 ₩16,000',e:'🥜',bg:'#f6e4c8',zh:'Paris Baguette 濟州心意夾心餅(花生款)',ko:'제주마음샌드',w:'只在濟州機場 Paris Baguette 與機場租車中心分店買得到,約 ₩16,000;限購數量不一,早點買',rec:['花生口味(濟州牛島花生醬 + 奶油)','牛島限定的夾心餅這次沒去牛島,這個是本島替代方案'],tag:'Day 4 機場'},
  {id:'gwajeul',s:'濟州傳統韓果',e:'🍊',bg:'#ffe3b8',zh:'柑橘油蜜果',ko:'신효 귤향과즐 · 제주전통한과',w:'濟州傳統韓果,用濟州柑橘做,包裝上有橘子圖案。購買地點還沒查到,看到再買',rec:['找透明包裝、寫著「귤향과즐」(柑橘香韓果)的那款'],tag:'傳統零食'},
  {id:'osulloc',s:'200g 約 ₩8,500 起',e:'🍵',bg:'#e0efe6',zh:"O'sulloc 抹茶醬",ko:'',w:'機場免稅店、超市 · 200g 約 ₩8,500~12,000',tag:'Day 4 易買得'},
  {id:'abebe',s:'東門市場旁,單顆 ₩2,900 起',e:'🍩',bg:'#ffe3b8',zh:'ABEBE BAKERY 甜甜圈',ko:'아베베 베이커리',w:'東門市場 12 號出口旁(동문로6길 4) · 10:00–21:00 · 單顆 ₩2,900~4,500。想吃!',rec:['牛島花生奶油甜甜圈:招牌(우도 땅콩 크림 도넛)','山房山地瓜奶油甜甜圈(산방산 고구마 크림 도넛)','朝天小米年糕紅豆麵包(조천 오메기 단팥빵)','賜來里奶油大栗子麵包(사려니 크림 왕밤빵)'],tag:'Day 4 東門市場'}],
 oy:[
  {id:'oy-toner',e:'🧴',bg:'#d9edf7',zh:'Round Lab 1025 化妝水',ko:'라운드랩 1025 독도 토너',w:'溫和補水,韓國最暢銷'},
  {id:'oy-torriden',e:'💧',bg:'#d6e9fb',zh:'Torriden 玻尿酸精華',ko:'토리든 다이브인',w:'補水冠軍,面膜也熱門'},
  {id:'oy-aestura',e:'🧈',bg:'#fdebd3',zh:'AESTURA 365 乳霜',ko:'에스트라 아토베리어 365',w:'冬天乾燥肌救星'},
  {id:'oy-sun',e:'☀️',bg:'#fff3bf',zh:'Round Lab 白樺樹防曬',ko:'라운드랩 자작나무 선크림',w:'韓國國民防曬'},
  {id:'oy-lip',e:'💄',bg:'#fcdbe3',zh:'rom&nd 唇釉 · fwee 唇頰膏',ko:'롬앤 · 퓌',w:'彩妝熱銷第一名'},
  {id:'oy-hair',e:'🧖',bg:'#e8dcf5',zh:'UNOVE 護髮乳 EX',ko:'유노브 딥 데미지 트리트먼트',w:'受損、染燙後常買'},
  {id:'oy-body',e:'🧴',bg:'#dff2e6',zh:'ILLIYOON 身體乳液',ko:'일리윤 세라마이드',w:'乾肌急救,全家都能用'},
  {id:'oy-bagel',e:'🥯',bg:'#f6e4c8',zh:'Delight Project 貝果餅乾',ko:'딜라이트 프로젝트 베이글칩',w:'零食冠軍,送人自己都適合'}],
 jj:[
  {id:'jj-hand',e:'🍊',bg:'#ffe3b8',zh:'橘子護手霜',ko:'센티드 핸드크림',w:'柑橘 / 青橘兩種香味 · ₩7,900(折扣時約 ₩5,900)'},
  {id:'jj-lip',e:'💋',bg:'#fcdbe3',zh:'橘子護唇膏',ko:'모이스처라이징 립밤',w:'柑橘 / 青橘 · ₩8,900'},
  {id:'jj-ball',e:'🛁',bg:'#dff2e6',zh:'橘子洗澡球',ko:'제주 감귤 샤워볼',w:'₩5,500(折扣時約 ₩4,900)'},
  {id:'jj-spray',e:'🌿',bg:'#e0efe6',zh:'偏柏清潔噴霧',ko:'편백 클린 스프레이',w:'90ml ₩10,900 / 160ml ₩17,000,常有折扣'},
  {id:'jj-bubble',e:'🫧',bg:'#d9edf7',zh:'泡泡浴球',ko:'제주 버블 배쓰밤',w:'₩10,900(折扣時約 ₩7,900)'},
  {id:'jj-sachet',e:'🌸',bg:'#f6dde3',zh:'香氛包',ko:'센티드 샤쉐',w:'柑橘 / 青橘 · ₩6,000(折扣時約 ₩4,800)'},
  {id:'jj-umb',e:'☂️',bg:'#e9e4f7',zh:'UV 晴雨傘',ko:'UV 양우산',w:'₩14,900'},
  {id:'jj-chip',e:'🥜',bg:'#f6e4c8',zh:'牛島花生貝果脆片',ko:'우도 땅콩 베이글칩',w:'₩2,700,常有 2+1'}],
};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ph=(i,h)=>`<div class="gf-ph" style="background:${i.bg||'#f1e4d0'};${h?'height:'+h+'px;':''}"><span>${i.e}</span><img src="img/gift/${i.id}.webp" alt="" loading="lazy" onerror="this.remove()"></div>`;
const card=i=>`<div class="gf-c">${ph(i)}<div class="gf-t"><b>${esc(i.zh)}</b><small>${esc(i.ko)}</small><p>${esc(i.s||i.w)}</p>${i.tag?`<em>${esc(i.tag)}</em>`:''}<button type="button" class="gf-recbtn${i.rec?'':' plain'}" data-id="${i.id}">點擊查看</button></div></div>`;
const TABS=[
 {k:'buy',n:'濟州必買',h:()=>`<div class="gf-note">液體超過 100ml 不能手提上機,橘子汁等請放托運。</div><div class="gf-g">${G.buy.map(card).join('')}</div>`},
 {k:'oy',n:'Olive Young',h:()=>`<div class="gf-box"><b>🛍️ 行程上順路的 3 間分店</b><p>• 東門市場店 <small>관덕로 62-1</small> Day 4 東門市場旁<br>• 易買得新濟州店 1 樓 Day 4 E-mart 裡<br>• 탑동店 <small>탑동로 15-1</small> Day 3 BHC 附近</p></div><div class="gf-note">單筆滿 15,000 韓元可免稅,結帳帶護照。</div><div class="gf-h">🍊 濟州限定<small>全韓 1,300 多間裡,只有濟州 13 間分店才買得到(品牌 Round Around 라운드어라운드)。價格取自 Olive Young 官網與韓國部落格(2026),含折扣,現場為準。</small></div><div class="gf-g">${G.jj.map(card).join('')}</div><div class="gf-h">一般熱銷</div><div class="gf-g">${G.oy.map(card).join('')}</div>`},
 {k:'mood',n:'Mood 盤子',h:()=>`${ph({id:'mood',e:'🐚🍽️',bg:'linear-gradient(135deg,#f6efe4,#e7d9c5)'},150)}<div class="gf-box"><b>Mood Jeju <small style="display:inline">무드 제주</small></b><p>貝殼造型盤子、小叉子、線香、飾品等,貝殼盤是主角。<br>📍 <span class="gf-addr">제주시 남성로 89</span> <b>2 樓</b>(招牌隱密,找 2 樓入口)<br>🕐 11:00–18:00<br>🚶 Day 4 牧官衙走路約 12 分、東門市場約 15 分(直線距離估算)</p><a class="gf-go" href="https://map.naver.com/p/search/${encodeURIComponent('무드제주 남성로 89')}" target="_blank" rel="noopener">Naver 導航 ›</a></div><div class="gf-note">盤子易碎,請店家多包一層,放手提或衣物中間。</div><div class="gf-box"><b>順路的另一間:Planer House <small style="display:inline">플라네하우스</small></b><p>📍 관덕로11길 28 2 樓,賣帆布包等,Day 4 牧官衙旁走路約 5 分。營業時間沒查到,出發前確認。</p></div>`}
];
let cur=0;
function render(){
  const b=document.getElementById('gfBody');if(!b)return;
  b.innerHTML=`<div class="gf-seg">${TABS.map((t,i)=>`<button data-i="${i}" class="${i===cur?'on':''}">${t.n}</button>`).join('')}</div>${TABS[cur].h()}`;
}
/* 「推薦品項」按鈕 → 彈窗 */
const ALL=()=>[...G.buy,...G.jj,...G.oy];
document.addEventListener('click',e=>{
  const b=e.target.closest('.gf-recbtn');
  if(b){const i=ALL().find(x=>x.id===b.dataset.id);if(!i)return;
    const ov=document.createElement('div');ov.className='gf-pop';
    ov.innerHTML=`<div class="gf-pb"><button class="gf-px" aria-label="關閉">✕</button><div class="gf-pt">${ph(i,110)}<div><b>${esc(i.zh)}</b><small>${esc(i.ko)}</small></div></div><h4>📍 哪裡買 / 資訊</h4><p class="gf-pw">${esc(i.w)}</p>${i.tag?`<p class="gf-ptag">${esc(i.tag)}</p>`:''}${i.rec?`<h4>👍 推薦品項</h4><ul>${i.rec.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`:''}</div>`;
    ov.onclick=ev=>{if(ev.target===ov||ev.target.closest('.gf-px'))ov.remove()};document.body.appendChild(ov);return}
});
document.addEventListener('click',e=>{const x=e.target.closest('.gf-seg button');if(!x)return;cur=+x.dataset.i;render();const p=document.getElementById('p-gift');if(p)p.scrollTop=0});
render();
})();
