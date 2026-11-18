#!/usr/bin/env python3
"""幫 index.html 裡的 css/js 連結加上版本號(?v=時間),每次上線前執行一次。
作用:瀏覽器每次都會抓最新的檔案,不會出現「新網頁配舊樣式」的情況。
要拿掉版本號:python3 tools/stamp.py --remove"""
import re, sys, time, pathlib
p = pathlib.Path(__file__).resolve().parent.parent / 'index.html'
h = p.read_text(encoding='utf-8')
pat = re.compile(r'((?:href|src)="(?:css|js)/[^"?]+)(?:\?v=\d+)?"')
if '--remove' in sys.argv:
    h2 = pat.sub(r'\1"', h); msg = '已拿掉版本號'
else:
    v = time.strftime('%Y%m%d%H%M'); h2 = pat.sub(lambda m: f'{m.group(1)}?v={v}"', h); msg = f'已加上版本號 v={v}'
p.write_text(h2, encoding='utf-8'); print(msg)
