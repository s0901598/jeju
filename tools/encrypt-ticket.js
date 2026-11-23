#!/usr/bin/env node
/* 把 tools/private/tickets.json(明文,不進 git)加密成 js/ticket.enc.js(進 git、可公開)。
   用法:node tools/encrypt-ticket.js
   tickets.json 格式:[{"code":"代碼","data":{pax:[姓名...],legs:[{tag,from,to,date,flt,air,time,note,qr?,bar?}]}}]
   qr / bar 可以放圖檔的 data:image/...;base64 網址,圖會跟著一起被加密。
   加密:PBKDF2-SHA256(60 萬次)→ AES-256-GCM。代碼不分大小寫。換密碼 = 改 code 後重跑,再 push。
   ⚠ 加密檔在公開網站上,任何人都能下載後離線猜代碼:代碼太短(例如 0000)等於沒保護,正式用請換成 10 字以上英數混合。 */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const src=path.join(__dirname,'private','tickets.json');
const list=JSON.parse(fs.readFileSync(src,'utf8'));
const blobs=list.map(({code,data})=>{
  const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12);
  const key=crypto.pbkdf2Sync(String(code).trim().toUpperCase(),salt,600000,32,'sha256');
  const c=crypto.createCipheriv('aes-256-gcm',key,iv);
  const ct=Buffer.concat([c.update(JSON.stringify(data),'utf8'),c.final(),c.getAuthTag()]);
  return {s:salt.toString('base64'),i:iv.toString('base64'),c:ct.toString('base64')};
});
fs.writeFileSync(path.join(root,'js','ticket.enc.js'),'/* 加密後的電子機票(由 tools/encrypt-ticket.js 產生,不要手改) */\nwindow.TICKET_BLOBS='+JSON.stringify(blobs)+';\n');
console.log('已加密',blobs.length,'組 → js/ticket.enc.js');
