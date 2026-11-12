const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),X=require('../report-xlsx.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'relatorio-xlsx-')),file=path.join(dir,'relatorio.xlsx');
try{fs.writeFileSync(file,X.workbook([{name:'Resumo',rows:[['Campo','Valor'],['Origem','Planilha conectada'],['Nome','José & <Teste>']]},{name:'Plantões',rows:[['Data','Matrícula','Nome','Horas','Texto'],[{date:'2026-11-12'},'0007','Ána Teste',12,'=SUM(1,2)']]}]));const python=cp.spawnSync('python3',['-c',`import sys,zipfile,datetime
import openpyxl
p=sys.argv[1]
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 assert '[Content_Types].xml' in z.namelist()
w=openpyxl.load_workbook(p,data_only=False)
assert w.sheetnames==['Resumo','Plantões']
s=w['Plantões']
assert s['A2'].value==datetime.datetime(2026,11,12)
assert s['B2'].value=='0007'
assert s['C2'].value=='Ána Teste'
assert s['D2'].value==12
assert s['E2'].value=='=SUM(1,2)' and s['E2'].data_type=='s'
assert s.freeze_panes=='A2'
assert s.auto_filter.ref=='A1:E2'
assert w['Resumo']['B3'].value=='José & <Teste>'
print('XLSX lido pelo openpyxl: datas, zeros à esquerda, números, acentos, texto literal e filtro válidos.')`,file],{encoding:'utf8'});assert.equal(python.status,0,python.stdout+python.stderr);process.stdout.write(python.stdout);assert.throws(()=>X.workbook([{name:'Invalido/'}]),/Nome/);assert.throws(()=>X.workbook([{name:'Resumo',rows:[['A']]},{name:'resumo',rows:[['A']]}]),/Nome/);console.log('PASS: XLSX real sem dependências de navegador, pacote ZIP íntegro e nenhum dado transformado em fórmula.');}finally{fs.rmSync(dir,{recursive:true,force:true});}
