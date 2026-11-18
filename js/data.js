/* ========== 範例資料(之後換成 Alice 的正式行程) ========== */
const TYPE={airport:['機場','#2f9e6b','機'],spot:['景點','#1c8fb5','景'],food:['美食','#e5532b','食'],stay:['住宿','#7a6fd6','宿']};
const DAYS=[
 {n:1,date:'02.08',wk:'一',title:'抵達濟州',rg:['北'],stops:[
  {t:'14:30',ty:'airport',name:'濟州國際機場',ko:'제주국제공항',addr:'地址待填',lon:126.493,lat:33.507,note:'抵達、領行李',lab:'l'},
  {t:'16:00',ty:'stay',name:'飯店(待填)',ko:'',addr:'地址待填',lon:126.52,lat:33.49,note:'Check-in',dr:'車程 20 分',lab:'d'},
  {t:'18:00',ty:'food',name:'東門市場',ko:'동문시장',addr:'地址待填',lon:126.5278,lat:33.5128,note:'晚餐、逛夜市',dr:'車程 10 分',lab:'r'}]},
 {n:2,date:'02.09',wk:'二',title:'東部海岸',rg:['東','南'],stops:[
  {t:'09:00',ty:'spot',name:'城山日出峰',ko:'성산일출봉',addr:'地址待填',lon:126.9425,lat:33.458,note:'登頂看海景',lab:'u'},
  {t:'11:30',ty:'spot',name:'涉地可支',ko:'섭지코지',addr:'地址待填',lon:126.9305,lat:33.4242,note:'海岸散步',dr:'車程 25 分',lab:'r'},
  {t:'12:30',ty:'food',name:'午餐(待填)',ko:'',addr:'地址待填',lon:126.8346,lat:33.3256,note:'表善一帶',dr:'車程 20 分',lab:'d'},
  {t:'15:30',ty:'food',name:'每日올레市場',ko:'매일올레시장',addr:'地址待填',lon:126.5649,lat:33.2487,note:'點心、伴手禮',dr:'車程 45 分',lab:'d'},
  {t:'18:00',ty:'stay',name:'飯店(待填)',ko:'',addr:'地址待填',lon:126.53,lat:33.255,note:'西歸浦',dr:'車程 5 分',lab:'u'}]},
 {n:3,date:'02.10',wk:'三',title:'南西海岸',rg:['南','西'],stops:[
  {t:'09:30',ty:'spot',name:'天地淵瀑布',ko:'천지연폭포',addr:'地址待填',lon:126.5545,lat:33.2468,note:'',lab:'d'},
  {t:'11:00',ty:'spot',name:'柱狀節理帶',ko:'주상절리대',addr:'地址待填',lon:126.4256,lat:33.2377,note:'中文區',dr:'車程 25 分',lab:'u'},
  {t:'14:00',ty:'spot',name:'山房山',ko:'산방산',addr:'地址待填',lon:126.314,lat:33.233,note:'',dr:'車程 20 分',lab:'d'},
  {t:'16:30',ty:'food',name:'涯月咖啡(待填)',ko:'',addr:'地址待填',lon:126.3113,lat:33.463,note:'看夕陽',dr:'車程 40 分',lab:'u'},
  {t:'19:00',ty:'stay',name:'飯店(待填)',ko:'',addr:'地址待填',lon:126.52,lat:33.49,note:'',dr:'車程 35 分',lab:'r'}]},
 {n:4,date:'02.11',wk:'四',title:'返程',rg:['北'],stops:[
  {t:'10:00',ty:'spot',name:'龍頭岩',ko:'용두암',addr:'地址待填',lon:126.5114,lat:33.516,note:'',lab:'u'},
  {t:'12:00',ty:'food',name:'午餐 / 購物(待填)',ko:'',addr:'地址待填',lon:126.49,lat:33.489,note:'',dr:'車程 10 分',lab:'d'},
  {t:'14:00',ty:'airport',name:'濟州國際機場',ko:'제주국제공항',addr:'地址待填',lon:126.493,lat:33.507,note:'辦理登機',dr:'車程 10 分',lab:'l'}]}
];

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
