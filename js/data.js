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
 jusang:{ty:'spot',name:'柱狀節理帶',ko:'주상절리대',addr:'제주특별자치도 서귀포시 이어도로 36-30',lon:126.4261,lat:33.2380,img:'img/jusang.jpg'},
 sanbang:{ty:'spot',name:'山房山',ko:'산방산',addr:'제주특별자치도 서귀포시 안덕면 사계리',lon:126.3134,lat:33.2416,img:'img/sanbang.jpg'},
 yongdu:{ty:'spot',name:'龍頭岩',ko:'용두암',addr:'제주특별자치도 제주시 용두암길 15',lon:126.5117,lat:33.5161,img:'img/yongdu.jpg'},
 haejigae:{ty:'food',name:'Haejigae 日落咖啡廳',ko:'해지개',addr:'제주특별자치도 제주시 애월읍 애월북서길 52',lon:126.3090,lat:33.4642,img:'img/haejigae.jpg',pos:'50% 18%'},
 jamae:{ty:'food',name:'姐妹麵條(黑豬肉麵)',ko:'자매국수',addr:'제주특별자치도 제주시 항골남길 46',lon:126.4592,lat:33.4986,img:'img/jamae.jpg'},
 woljip:{ty:'food',name:'月高家黑豬肉',ko:'월고집',addr:'제주특별자치도 제주시 구좌읍 월정1길 16-1',lon:126.7911,lat:33.5533,img:'img/woljip.jpg'},
 malhouse:{ty:'spot',name:'海邊小馬燈塔',ko:'이호테우 말등대',addr:'제주특별자치도 제주시 이호일동 375-43',lon:126.4521,lat:33.5019,img:'img/malhouse.jpg'},
 bhc:{ty:'food',name:'BHC 炸雞(탑동店)',ko:'BHC치킨 제주탑동점',addr:'제주특별자치도 제주시 중앙로 20',lon:126.5246,lat:33.5167,img:'img/bhc.jpg'},
 bagel:{ty:'food',name:'倫敦貝果博物館',ko:'런던베이글뮤지엄 제주',addr:'제주특별자치도 제주시 구좌읍 동복로 85',lon:126.7154,lat:33.5535,img:'img/bagel.jpg'},
 camellia:{ty:'spot',name:'Camelia Forest 山茶花森林',ko:'카멜리아힐',addr:'제주특별자치도 서귀포시 안덕면 병악로 166',lon:126.3684,lat:33.2901,img:'img/camellia.jpg'},
 sorang:{ty:'food',name:'韓牛燒肉 소랑해',ko:'소랑해 신제주 본점',addr:'제주특별자치도 제주시 수덕9길 86-4 1층',lon:126.4699,lat:33.4831,img:'img/sorang.jpg'},
 udo:{ty:'spot',name:'牛島(天津港)',ko:'우도 천진항',addr:'제주특별자치도 제주시 우도면 연평리 1737-15',lon:126.9503,lat:33.4919,img:'img/udo.jpg'},
 hill1100:{ty:'spot',name:'1100 高地(賞雪)',ko:'1100고지습지',addr:'제주특별자치도 서귀포시 1100로 1555',lon:126.4621,lat:33.3579,img:'img/hill1100.jpg'},
 halla:{ty:'spot',name:'漢拏山(城板岳登山口)',ko:'성판악탐방안내소',addr:'제주특별자치도 제주시 조천읍 516로 1865',lon:126.6191,lat:33.3850,img:'img/halla.jpg'},
 rainbow:{ty:'spot',name:'道頭彩虹海岸道路',ko:'도두동 무지개해안도로',addr:'제주특별자치도 제주시 도두일동 1734',lon:126.4715,lat:33.5091,img:'img/rainbow.jpg'},
 dodu:{ty:'spot',name:'道頭峰',ko:'도두봉',addr:'제주특별자치도 제주시 도두항길 4-17',lon:126.4683,lat:33.5080,img:'img/dodu.jpg'},
 blackpork:{ty:'food',name:'黑豬肉一條街',ko:'흑돼지거리',addr:'제주특별자치도 제주시 건입동',lon:126.5268,lat:33.5158,img:'img/blackpork.jpg',pos:'50% 35%'},
 woojin:{ty:'food',name:'解酒湯(友珍)',ko:'우진해장국',addr:'제주특별자치도 제주시 서사로 11',lon:126.5199,lat:33.5115,img:'img/woojin.jpg'},
 tteok:{ty:'food',name:'老奶奶橘子麻糬(偶來市場內)',ko:'할머니떡집 오메기떡',addr:'제주특별자치도 서귀포시 중앙로42번길 24',lon:126.5642,lat:33.2486,img:'img/tteok.jpg'},
 daewon:{ty:'food',name:'鮑魚海鮮鍋(大元家)',ko:'대원가',addr:'제주특별자치도 제주시 도남로16길 15',lon:126.5269,lat:33.4915,img:'img/daewon.jpg'}
};
/* 營業時間 / 特色關鍵字 / 菜單與價格(來源:Naver 地圖,2026/11 查詢;春節期間可能不同,出發前請再確認) */
const WKS='一二三四五六日';
const hrs=(all,over={})=>[...WKS].map(w=>over[w]||all);
const NOTE_H='時間取自 Naver(2026/11),春節期間可能調整';
const INFO={
 haejigae:{h:hrs('09:00–21:00'),kw:['베이커리','한옥','오션뷰','디저트'],m:[['에스프레소','7,500'],['아메리카노','9,000'],['카라멜 마끼아또','9,500'],['바닐라라떼','9,500']]},
 jamae:{h:hrs('09:00–18:00(休息 14:30–16:10)',{三:'公休'}),kw:['고기국수','비빔국수','돔베고기'],m:[['고기국수','10,000'],['비빔국수','10,000'],['돔베고기 소','19,000'],['돔베고기 대','36,000'],['물만두','10,000']]},
 woljip:{h:hrs('11:00–22:00'),hn:'Naver 目前顯示部分日期休息,請出發前確認',kw:['월정리','흑돼지','김녕'],m:[['제주산 흑돼지 근고기 600g','66,000'],['제주산 백돼지 근고기 600g','54,000'],['꽃멜젓 볶음밥','9,000'],['해물 된장찌개','8,000']]},
 olle:{h:hrs('07:00–21:00'),kw:['수산물','농산물','옥돔','자리돔']},
 bhc:{h:hrs('12:00–24:00'),kw:['맵소킹','뿌링클','치즈볼','콤보']},
 bagel:{h:hrs('08:00–18:00'),kw:['베이글','베이글샌드위치','수프'],m:[['플레인 베이글','3,800'],['바질 베이글','4,700'],['블랙올리브 베이글','4,700'],['치즈허니 베이글','5,300']]},
 camellia:{h:hrs('08:30–18:30'),kw:['동백수목원','동백축제','인생샷','힐링명소'],ml:'票價',m:[['성인','12,000'],['청소년','10,000'],['어린이','9,000'],['군인/경로','10,000']]},
 sorang:{h:hrs('17:00–23:00',{日:'公休'}),kw:['신제주한우','육회','제주공항한우'],m:[['투플 등심 150g','35,000'],['투플 안심 150g','35,000'],['살치살 150g','42,000'],['소랑해 육회','20,000'],['한우곰탕','10,000']]},
 seongsan:{h:hrs('06:00–18:00'),ml:'票價',m:[['성인(개인)','5,000'],['청소년·군인(개인)','2,500'],['어린이(개인)','2,500']]},
 seopji:{ml:'停車費',m:[['소형 일반 30분 이내','1,000'],['15분 초과 시마다','500'],['당일 최대','3,000']]},
 yongdu:{ml:'費用',m:[['이용요금','免費']]},
 dongmun:{h:hrs('08:00–21:00'),kw:['전통시장','동문시장','야시장']},
 woojin:{h:hrs('06:00–22:00'),kw:['고사리육개장','사골해장국','녹두빈대떡','몸국'],m:[['고사리육개장','11,000'],['사골해장국','11,000'],['몸국','11,000'],['녹두빈대떡','17,000']]},
 daewon:{h:hrs('09:00–21:00(休息 15:00–16:30)',{三:'公休'}),kw:['해물탕','갈치조림','전복'],m:[['활전복해물탕(소)','58,000'],['제주생갈치조림(중)','65,000'],['활전복뚝배기','16,000'],['전복죽','17,000']]},
 cheonjiyeon:{h:hrs('09:00–22:00'),ml:'票價',m:[['어른(개인)','2,000'],['청소년(13~24세)','1,000'],['어린이(7~12세)','1,000']]},
 tteok:{h:hrs('08:00–21:00',{二:'15:00–20:00'}),kw:['제주오메기떡','감귤모찌','제주떡집'],m:[['오메기떡 6개','5,000'],['오메기떡 11개(4종류)','10,000'],['감귤모찌 1팩','5,000']]},
 sanbang:{h:hrs('09:00–18:00'),kw:['종상화산'],ml:'票價',m:[['어른(개인)','1,000'],['청소년','500'],['어린이','500']]},
 jusang:{h:hrs('09:00–18:00'),ml:'票價',m:[['어른(개인)','2,000'],['청소년(13~24세)','1,000'],['어린이(7~12세)','1,000']]}
};
Object.entries(INFO).forEach(([k,v])=>{P[k].info=v});
const MORE={"airport":1,"bagel":3,"blackpork":1,"camellia":2,"cheonjiyeon":1,"daewon":1,"dodu":1,"dongmun":3,"haejigae":3,"halla":1,"hill1100":3,"jusang":3,"malhouse":2,"olle":3,"rainbow":2,"sanbang":2,"seongsan":2,"seopji":3,"sorang":2,"tteok":2,"woljip":3,"woojin":2,"yongdu":2};
Object.entries(MORE).forEach(([k,n])=>{P[k].imgs=[P[k].img,...Array.from({length:n},(_,i)=>`img/${k}_${i+2}.jpg`)]});
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
DAYS.forEach(d=>d.stops.forEach(s=>{s.days=[d.n]}));
/* 還沒排進行程、但想放在總覽地圖上的地點(Alice 蒐集 + 熱門推薦) */
const CANDIDATES=['haejigae','jamae','woljip','malhouse','bhc','bagel','camellia','sorang','udo','hill1100','halla','rainbow','dodu','blackpork','woojin','daewon','tteok'].map(k=>S(k,{note:'推薦行程'}));

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
