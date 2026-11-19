/* ========== 範例資料(之後換成 Alice 的正式行程) ========== */
const TYPE={airport:['機場','#2f9e6b','✈️'],spot:['景點','#1c8fb5','📷'],food:['美食','#e5532b','🍜'],stay:['住宿','#7a6fd6','🛏️']};

/* 地點資料庫:名稱 / 韓文 / 地址 / 座標(來源:Naver 地圖)/ 照片(img/ 資料夾,縮圖) */
const P={
 airport:{ty:'airport',name:'濟州國際機場',ko:'제주국제공항',addr:'제주특별자치도 제주시 공항로 2',lon:126.4930,lat:33.5069,img:'img/airport.jpg'},
 dongmun:{ty:'food',name:'東門市場',ko:'동문재래시장',addr:'제주특별자치도 제주시 관덕로14길 20',lon:126.5267,lat:33.5123,img:'img/dongmun.jpg'},
 olle:{ty:'food',name:'西歸浦每日偶來市場',ko:'서귀포매일올레시장',addr:'제주특별자치도 서귀포시 중앙로62번길 18',lon:126.5634,lat:33.2498,img:'img/olle.jpg'},
 seongsan:{ty:'spot',name:'城山日出峰',ko:'성산일출봉',addr:'제주특별자치도 서귀포시 성산읍 일출로 284-12',lon:126.9408,lat:33.4589,img:'img/seongsan.jpg'},
 seopji:{ty:'spot',name:'涉地可支',ko:'섭지코지',addr:'제주특별자치도 서귀포시 성산읍 섭지코지로',lon:126.9308,lat:33.4238,img:'img/seopji.jpg'},
 cheonjiyeon:{ty:'spot',name:'天地淵瀑布',ko:'천지연폭포',addr:'제주특별자치도 서귀포시 천지동 666-2',lon:126.5544,lat:33.2470,img:'img/cheonjiyeon.jpg'},
 jusang:{ty:'spot',name:'柱狀節理帶',ko:'주상절리대',addr:'제주특별자치도 서귀포시 이어도로 36-30',lon:126.4256,lat:33.2377},
 sanbang:{ty:'spot',name:'山房山',ko:'산방산',addr:'제주특별자치도 서귀포시 안덕면 사계리',lon:126.3134,lat:33.2416},
 yongdu:{ty:'spot',name:'龍頭岩',ko:'용두암',addr:'제주특별자치도 제주시 용두암길 15',lon:126.5117,lat:33.5161,img:'img/yongdu.jpg'},
 haejigae:{ty:'food',name:'Haejigae 日落咖啡廳',ko:'해지개',addr:'제주특별자치도 제주시 애월읍 애월북서길 52',lon:126.3090,lat:33.4642,img:'img/haejigae.jpg'},
 jamae:{ty:'food',name:'姐妹麵條(黑豬肉麵)',ko:'자매국수',addr:'제주특별자치도 제주시 항골남길 46',lon:126.4592,lat:33.4986,img:'img/jamae.jpg'},
 woljip:{ty:'food',name:'月高家黑豬肉',ko:'월고집',addr:'제주특별자치도 제주시 구좌읍 월정1길 16-1',lon:126.7911,lat:33.5533,img:'img/woljip.jpg'},
 malhouse:{ty:'spot',name:'海邊小馬燈塔',ko:'이호테우 말등대',addr:'제주특별자치도 제주시 이호일동 375-43',lon:126.4521,lat:33.5019,img:'img/malhouse.jpg'},
 bhc:{ty:'food',name:'BHC 炸雞(탑동店)',ko:'BHC치킨 제주탑동점',addr:'제주특별자치도 제주시 중앙로 20',lon:126.5246,lat:33.5167,img:'img/bhc.jpg'},
 bagel:{ty:'food',name:'倫敦貝果博物館',ko:'런던베이글뮤지엄 제주',addr:'제주특별자치도 제주시 구좌읍 동복로 85',lon:126.7154,lat:33.5535,img:'img/bagel.jpg'},
 camellia:{ty:'spot',name:'Camelia Forest 山茶花森林',ko:'카멜리아힐',addr:'제주특별자치도 서귀포시 안덕면 병악로 166',lon:126.3684,lat:33.2901,img:'img/camellia.jpg'},
 sorang:{ty:'food',name:'韓牛燒肉 소랑해',ko:'소랑해 신제주 본점',addr:'제주특별자치도 제주시 수덕9길 86-4 1층',lon:126.4699,lat:33.4831,img:'img/sorang.jpg'},
 udo:{ty:'spot',name:'牛島(天津港)',ko:'우도 천진항',addr:'제주특별자치도 제주시 우도면 연평리 1737-15',lon:126.9503,lat:33.4919},
 hill1100:{ty:'spot',name:'1100 高地(賞雪)',ko:'1100고지 휴게소',addr:'제주특별자치도 서귀포시 1100로(地址待確認)',lon:126.4620,lat:33.3622},
 halla:{ty:'spot',name:'漢拏山(城板岳登山口)',ko:'성판악탐방안내소',addr:'제주특별자치도 제주시 조천읍 516로 1865',lon:126.6191,lat:33.3850},
 rainbow:{ty:'spot',name:'道頭彩虹海岸道路',ko:'도두동 무지개해안도로',addr:'제주특별자치도 제주시 도두일동 1734',lon:126.4715,lat:33.5091,img:'img/rainbow.jpg'},
 dodu:{ty:'spot',name:'道頭峰',ko:'도두봉',addr:'제주특별자치도 제주시 도두항길 4-17',lon:126.4683,lat:33.5080},
 blackpork:{ty:'food',name:'黑豬肉一條街',ko:'흑돼지거리',addr:'제주특별자치도 제주시 건입동',lon:126.5268,lat:33.5158},
 woojin:{ty:'food',name:'解酒湯(友珍)',ko:'우진해장국',addr:'제주특별자치도 제주시 서사로 11',lon:126.5199,lat:33.5115,img:'img/woojin.jpg'},
 daewon:{ty:'food',name:'鮑魚海鮮鍋(大元家)',ko:'대원가',addr:'제주특별자치도 제주시 도남로16길 15',lon:126.5269,lat:33.4915,img:'img/daewon.jpg'}
};
const S=(k,o)=>({...P[k],...o});
const DAYS=[
 {n:1,date:'02.08',wk:'一',title:'抵達濟州',rg:['北'],stops:[
  S('airport',{t:'14:30',note:'抵達、領行李',lab:'l'}),
  {t:'16:00',ty:'stay',name:'飯店(待填)',ko:'',addr:'地址待填',lon:126.52,lat:33.49,note:'Check-in',dr:'車程20分',lab:'d'},
  S('dongmun',{t:'18:00',note:'晚餐、逛夜市',dr:'車程10分',lab:'r'})]},
 {n:2,date:'02.09',wk:'二',title:'東部海岸',rg:['東','南'],stops:[
  S('seongsan',{t:'09:00',note:'登頂看海景',lab:'u'}),
  S('seopji',{t:'11:30',note:'海岸散步',dr:'車程25分',lab:'r'}),
  {t:'12:30',ty:'food',name:'午餐(待填)',ko:'',addr:'地址待填',lon:126.8346,lat:33.3256,note:'表善一帶',dr:'車程20分',lab:'d'},
  S('olle',{t:'15:30',note:'點心、伴手禮',dr:'車程45分',lab:'d'}),
  {t:'18:00',ty:'stay',name:'飯店(待填)',ko:'',addr:'地址待填',lon:126.53,lat:33.255,note:'西歸浦',dr:'車程5分',lab:'u'}]},
 {n:3,date:'02.10',wk:'三',title:'南西海岸',rg:['南','西'],stops:[
  S('cheonjiyeon',{t:'09:30',note:'',lab:'d'}),
  S('jusang',{t:'11:00',note:'中文區',dr:'車程25分',lab:'u'}),
  S('sanbang',{t:'14:00',note:'',dr:'車程20分',lab:'d'}),
  {t:'16:30',ty:'food',name:'涯月咖啡(待填)',ko:'',addr:'地址待填',lon:126.3113,lat:33.463,note:'看夕陽',dr:'車程40分',lab:'u'},
  {t:'19:00',ty:'stay',name:'飯店(待填)',ko:'',addr:'地址待填',lon:126.52,lat:33.49,note:'',dr:'車程35分',lab:'r'}]},
 {n:4,date:'02.11',wk:'四',title:'返程',rg:['北'],stops:[
  S('yongdu',{t:'10:00',note:'',lab:'u'}),
  {t:'12:00',ty:'food',name:'午餐 / 購物(待填)',ko:'',addr:'地址待填',lon:126.49,lat:33.489,note:'',dr:'車程10分',lab:'d'},
  S('airport',{t:'14:00',note:'辦理登機',dr:'車程10分',lab:'l'})]}
];
/* 還沒排進行程、但想放在總覽地圖上的地點(Alice 蒐集 + 熱門推薦) */
const CANDIDATES=['haejigae','jamae','woljip','malhouse','bhc','bagel','camellia','sorang','udo','hill1100','halla','rainbow','dodu','blackpork','woojin','daewon'].map(k=>S(k,{note:'候選地點(尚未排進行程)'}));

/* 住宿(三晚,範例) */
const STAYS=[
 {n:1,date:'02.08 → 02.09',region:'北',name:'飯店(待填)',ko:'',addr:'地址待填',ci:'--:--',co:'--:--',code:'--',room:'房間分配待填'},
 {n:2,date:'02.09 → 02.10',region:'南',name:'飯店(待填)',ko:'',addr:'地址待填',ci:'--:--',co:'--:--',code:'--',room:'房間分配待填'},
 {n:3,date:'02.10 → 02.11',region:'北',name:'飯店(待填)',ko:'',addr:'地址待填',ci:'--:--',co:'--:--',code:'--',room:'房間分配待填'}
];

/* 電子機票:目前只有範例代碼 DEMO。正式版會改成「用代碼解密的加密檔」 */
const DEMO_CODE='DEMO';

/* 出發前確認清單 */
const CHECKLIST=['護照效期(6 個月以上)','入境申請(是否需要 K-ETA / 電子入境卡)','網路(eSIM / 漫遊)','旅遊保險','租車與國際駕照(若要自駕)','韓元現金與信用卡','行李重量與托運規定'];
