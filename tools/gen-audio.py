#!/usr/bin/env python3
"""讀 js/data.js 裡所有韓文名稱(ko:'...'),用 macOS 內建韓文語音 Yuna 錄成 audio/*.m4a,
並產生 js/audio-map.js(韓文 → 音檔)。行程改了之後重跑一次即可。"""
import re, subprocess, hashlib, json, pathlib, tempfile
root = pathlib.Path(__file__).resolve().parent.parent
data = (root/'js/data.js').read_text(encoding='utf-8')
names = sorted(set(re.findall(r"ko:'([^']+)'", data)))
out = root/'audio'; out.mkdir(exist_ok=True)
amap = {}
for n in names:
    h = hashlib.sha1(n.encode()).hexdigest()[:10]
    f = out/f'{h}.m4a'
    if not f.exists():
        with tempfile.TemporaryDirectory() as t:
            a = pathlib.Path(t)/'x.aiff'
            subprocess.run(['say','-v','Yuna','-r','150','-o',str(a),n],check=True)
            subprocess.run(['afconvert','-f','m4af','-d','aac','-b','48000',str(a),str(f)],check=True)
    amap[n] = f'audio/{h}.m4a'
(root/'js/audio-map.js').write_text('/* 由 tools/gen-audio.py 產生,請勿手改 */\nconst AUDIO='+json.dumps(amap,ensure_ascii=False,indent=1)+';\n',encoding='utf-8')
print(len(amap),'個韓文名稱已錄音')
