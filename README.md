# jeju

2027/02/08–02/11 濟州島四天三夜家族旅遊行程表(網頁版,手機翻頁)。

## 結構
- `index.html` + `css/style.css` + `js/data.js` `js/map.js` `js/app.js`:整合版(封面 → 機票 → 住宿 → 總覽 → Day 1–4 → 資訊,左右滑動翻頁)
- 目前內容都是範例,正式行程填在 `js/data.js`
- `prototype/light5.html`:淺色封面 + 航班頁原型(已定案)
- `prototype/day.html`:每日頁原型(地圖霓虹路線 + 時間軸 ↔ 行程卡同步 + 橘子翻頁動畫)
- `css/` `js/` `data/` `icons/`:正式版放這裡(待整合)

## 待做
機票代碼加密(現在只有範例代碼 DEMO)、深色模式、離線快取(PWA)、開 GitHub Pages
