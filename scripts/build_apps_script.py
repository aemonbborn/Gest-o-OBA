from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'index.html').read_text()
s=s.replace('<link rel="manifest" href="manifest.webmanifest">','').replace('<link rel="icon" href="icon.svg">','')
s=s.replace('<link rel="stylesheet" href="style.css">','<style>'+(root/'style.css').read_text()+'</style>')
for name in ['monthly.js','professionals.js','calendar.js','replacements.js','app.js']:
 s=s.replace(f'<script defer src="{name}"></script>','')
 js=(root/name).read_text()
 if name=='app.js':js=js.replace("if('serviceWorker' in navigator)","if(false)")
 s=s.replace('</body>',f'<script>{js}</script></body>')
(root/'google-apps-script'/'App.html').write_text(s)
