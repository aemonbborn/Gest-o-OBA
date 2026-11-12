/** Execute configurarGestao uma vez no editor da planilha. Publique executando como o usuário que acessa. */
function configurarGestao(){const sheet=SpreadsheetApp.getActiveSpreadsheet();if(!sheet)throw Error('Abra o Apps Script por Extensões na planilha.');PropertiesService.getScriptProperties().setProperty('GESTAO_SPREADSHEET_ID',sheet.getId());}
function doGet(){return HtmlService.createHtmlOutputFromFile('App').setTitle('Gestão Emergência Adulto');}
function livro_(){const id=PropertiesService.getScriptProperties().getProperty('GESTAO_SPREADSHEET_ID');if(!id)throw Error('Execute configurarGestao no editor da planilha antes de usar.');return SpreadsheetApp.openById(id);}
function norm_(v){return String(v||'').trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();}
const MONTHS_={JAN:1,FEV:2,MAR:3,ABRIL:4,MAIO:5,JUN:6,JUL:7,AGT:8,SET:9,OUT:10,NOV:11,DEZ:12};
const CODES_=['M','T','MT','N','9C','MN','TN','MTN'];
const INTEGRATION_VERSION_='lote-4';
const REMOVAL_VERSION_='lista-1';
const EDIT_VERSION_='turno-1';
const PERFORMANCE_VERSION_='rapido-1';
const WORKSPACE_VERSION_='gestao-2';
function getIntegrationInfo(){return {version:INTEGRATION_VERSION_,removalVersion:REMOVAL_VERSION_,editVersion:EDIT_VERSION_,performanceVersion:PERFORMANCE_VERSION_,workspaceVersion:WORKSPACE_VERSION_,reportsVersion:'relatorios-1'};}
function listMonthlySheets(){return livro_().getSheets().map(s=>s.getName()).filter(n=>MONTHS_[n]);}
function grade_(name,withFormulas=false,book=null){if(!MONTHS_[name])throw Error('Selecione uma aba mensal válida.');const s=(book||livro_()).getSheetByName(name);if(!s)throw Error('Aba não encontrada.');const data=s.getDataRange(),values=data.getDisplayValues(),formulas=withFormulas?data.getFormulas():null;let year=null;for(const row of values.slice(0,12)){for(const cell of row){const match=String(cell).match(/\b(20\d{2})\b/);if(match)year=Number(match[1]);}}if(!year)throw Error('O título desta aba precisa conter o ano, por exemplo OUTUBRO DE 2026.');
const blocks=[];for(let i=0;i<values.length;i++){const row=values[i];if(norm_(row[0])==='MAT'&&norm_(row[1])==='NOME'&&norm_(row[2])==='COOPERATIVA'&&norm_(row[3])==='MOTIVO'&&norm_(row[4])==='POR QUEM'){let category=null,headingRow=null;for(let k=i-1;k>=Math.max(0,i-5);k--){const heading=norm_(values[k][0]);if(heading.includes('ENFERMEIROS')){category='ENFERMEIRO';headingRow=k+1;break;}if(heading.includes('TECNICOS')){category='TÉCNICO DE ENFERMAGEM';headingRow=k+1;break;}}if(!category)throw Error('Não foi possível identificar a função do bloco na linha '+(i+1));blocks.push({header:i+1,start:i+2,end:values.length,category,heading:headingRow});}}
if(!blocks.length)throw Error('Cabeçalhos da grade não reconhecidos.');for(let i=0;i<blocks.length-1;i++)blocks[i].end=blocks[i+1].heading-1;
for(const b of blocks)for(let row=b.start;row<=b.end;row++)if((values[row-1]||[]).slice(0,5).some(v=>/^(TOTAL(?:IZACAO)?(?:\s|$)|SUBTOTAL(?:\s|$)|RESUMO(?:\s|$)|OBSERVAC(?:AO|OES)(?:\s|:|$))/.test(norm_(v)))){b.end=row-1;break;}
const month=year+'-'+String(MONTHS_[name]).padStart(2,'0'),days=new Date(Date.UTC(year,MONTHS_[name],0)).getUTCDate();let validatedHeader=null;for(const b of blocks){const headers=values[b.header-2]||[];const dayHeaders=headers.slice(5,5+days);const complete=Array.from({length:days},(_,i)=>Number(dayHeaders[i])===i+1).every(Boolean);const empty=Array.from({length:days},(_,i)=>!String(dayHeaders[i]||'').trim()).every(Boolean);if(complete){validatedHeader=b.header-1;}else if(empty&&validatedHeader){b.inheritedDayHeader=validatedHeader;}else{throw Error('Dias fora do layout esperado no bloco '+b.category+' (linha '+(b.header-1)+'). Os dias devem ser numerados de 1 a '+days+', ou ficar vazios para usar o cabeçalho validado do bloco acima.');}}
return {s,values,blocks,month,days,name,formulas};}
function readMonthlySheet(name){return snapshot_(grade_(name));}
function snapshot_(g){const records=[];for(const b of g.blocks)for(let row=b.start;row<=b.end;row++){const values=g.values[row-1]||[],meta=values.slice(0,5);if(!meta[1])continue;for(let day=1;day<=g.days;day++){const code=values[day+4];if(code)records.push({row,date:g.month+'-'+String(day).padStart(2,'0'),code,meta,category:b.category});}}return {sheet:g.name,month:g.month,records};}
function dayFor_(g,date){if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!date.startsWith(g.month+'-'))throw Error('A data não corresponde ao mês/ano da aba.');const day=Number(date.slice(-2));if(day<1||day>g.days)throw Error('Linha ou dia fora da grade.');return day;}
function cell_(g,row,date){const day=dayFor_(g,date);if(!Number.isInteger(row)||!g.blocks.some(b=>row>=b.start&&row<=b.end))throw Error('Linha ou dia fora da grade.');return g.s.getRange(row,day+5);}

// Reutiliza a leitura feita sob bloqueio; aplica apenas escritas já confirmadas.
function mutationResult_(g,changes){
 for(const c of changes){if(c.newMeta)g.values[c.row-1].splice(0,5,...c.newMeta);g.values[c.row-1][Number(c.date.slice(-2))+4]=c.code;}
 return {ok:true,count:changes.length,snapshot:resultSnapshot_(g)};
}
function resultSnapshot_(g){
 // Plantões ou metadados calculados podem depender da célula alterada.
 for(const b of g.blocks)for(let row=b.start;row<=b.end;row++)if(g.formulas&&g.formulas[row-1].slice(0,5+g.days).some(Boolean))return readMonthlySheet(g.name);
 return snapshot_(g);
}

function formulaAt_(g,row,col){return g.formulas?g.formulas[row-1][col-1]:g.s.getRange(row,col).getFormula();}

function assertShiftAvailable_(g,row,date,code,meta){const b=g.blocks.find(b=>row>=b.start&&row<=b.end);const day=Number(date.slice(-2));const atoms={M:['M'],T:['T'],MT:['M','T'],N:['N'],'9C':['M','T'],MN:['M','N'],TN:['T','N'],MTN:['M','T','N']};for(let r=b.start;r<=b.end;r++){const v=g.values[r-1],other=v[day+4];if(r===row||!other||!sameProfessional_(meta,v))continue;if(!atoms[other])throw Error('Existe um turno especial neste dia em outra linha. Confira a planilha antes de inserir.');if(atoms[code].some(a=>atoms[other].includes(a)))throw Error('O profissional já tem um turno sobreposto neste dia em outra linha. Recarregue e confira o calendário.');}}
function sameProfessional_(a,b){const ar=norm_(a[0]),br=norm_(b[0]);return norm_(a[1])===norm_(b[1])&&norm_(a[2])===norm_(b[2])&&(ar===br||!ar||ar==='-'||!br||br==='-');}
function planMonthlyInsertion(p){return planInsertion_(grade_(p.sheet),p);}
function planInsertion_(g,p){
 if(!CODES_.includes(p.code)||!Array.isArray(p.meta)||p.meta.length!==5||p.meta.some((v,i)=>typeof v!=='string'||v.length>240||/[\t\r\n]/.test(v)||(/^\s*[=+@-]/.test(v)&&!(i===0&&v==='-')))||!p.meta[1]||!p.meta[2]||!p.meta[3])throw Error('Confira os dados do plantão.');
 const b=g.blocks.find(b=>b.category===p.category);if(!b)throw Error('Bloco da função não encontrado.');
 let empty=null;const targets=[];for(let row=b.start;row<=b.end;row++){const meta=g.values[row-1].slice(0,5);if(sameProfessional_(meta,p.meta)&&norm_(meta[3])===norm_(p.meta[3])&&norm_(meta[4])===norm_(p.meta[4]))targets.push(row);else if(!empty&&meta.slice(1).every(v=>!v)&&(!meta[0]||meta[0]==='-')&&g.values[row-1].slice(5,5+g.days).every(v=>!v))empty=row;}
 const day=dayFor_(g,p.date);
 const reusable=targets.find(row=>!g.values[row-1][day+4]&&!formulaAt_(g,row,day+5));
 if(!reusable&&targets.some(row=>!g.values[row-1][day+4]&&formulaAt_(g,row,day+5)))throw Error('Este dia contém fórmula na linha existente. Confira antes de inserir.');
 const row=reusable||empty;
 const newMeta=reusable?null:targets.length?g.values[targets[0]-1].slice(0,5):p.meta;
 // A nova linha só recebe um turno que não se sobreponha aos já registrados.
 if(!row){const error=Error('Não há linha vazia neste bloco. Atualize a integração para criar linhas automaticamente.');error.code='NO_SPACE';throw error;}
 assertShiftAvailable_(g,row,p.date,p.code,reusable?g.values[row-1].slice(0,5):newMeta);
 const meta=g.values[row-1].slice(0,5);if(g.values[row-1][day+4]||formulaAt_(g,row,day+5))throw Error('Este dia já está preenchido ou contém fórmula na linha existente. Confira antes de inserir.');
 return {sheet:p.sheet,row,date:p.date,expected:'',expectedMeta:meta,code:p.code,newMeta,category:p.category};
}
function changeMonthlyShift(p){const lock=LockService.getScriptLock();lock.waitLock(15000);try{const g=grade_(p.sheet,!!p.fast);if(p.code!==''&&!CODES_.includes(p.code))throw Error('Turno não reconhecido.');const cell=cell_(g,p.row,p.date);const meta=g.values[p.row-1].slice(0,5);if(!Array.isArray(p.expectedMeta)||p.expectedMeta.length!==5||meta.some((v,i)=>v!==p.expectedMeta[i])||g.values[p.row-1][Number(p.date.slice(-2))+4]!==p.expected)throw Error('A planilha mudou desde a conferência. Recarregue antes de alterar.');if(formulaAt_(g,p.row,Number(p.date.slice(-2))+5))throw Error('Esta célula contém fórmula e não será alterada.');if(p.code&&p.expected)throw Error('Não é permitido sobrescrever um plantão existente.');if(!p.code&&!p.expected)throw Error('A célula já está vazia.');if(p.code)assertShiftAvailable_(g,p.row,p.date,p.code,p.newMeta||meta);if(p.newMeta){const plan=planInsertion_(g,{sheet:p.sheet,date:p.date,code:p.code,meta:p.newMeta,category:p.category});if(plan.row!==p.row)throw Error('A linha disponível mudou; confira novamente.');for(let i=0;i<5;i++){const range=g.s.getRange(p.row,i+1);if(range.getFormula())throw Error('A linha contém fórmula nos dados cadastrais.');}g.s.getRange(p.row,1,1,5).setNumberFormat('@').setValues([p.newMeta]);}if(p.code)cell.setValue(p.code);else cell.clearContent();SpreadsheetApp.flush();return p.fast?mutationResult_(g,[p]):{ok:true,snapshot:readMonthlySheet(p.sheet)};}finally{lock.releaseLock();}}

/** Altera somente o turno de uma célula existente; os metadados nunca são escritos. */
function updateMonthlyShift(p){
 if(!p||!MONTHS_[p.sheet]||!Number.isInteger(p.row)||typeof p.expected!=='string'||!p.expected||!CODES_.includes(p.code)||!Array.isArray(p.expectedMeta)||p.expectedMeta.length!==5||p.expectedMeta.some(v=>typeof v!=='string')||!['ENFERMEIRO','TÉCNICO DE ENFERMAGEM'].includes(p.category)||p.newMeta)throw Error('Confira o plantão e escolha um turno válido.');
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const g=grade_(p.sheet,!!p.fast),cell=cell_(g,p.row,p.date),meta=g.values[p.row-1].slice(0,5),category=g.blocks.find(b=>p.row>=b.start&&p.row<=b.end).category;
  if(category!==p.category||meta.some((v,i)=>v!==p.expectedMeta[i])||g.values[p.row-1][Number(p.date.slice(-2))+4]!==p.expected)throw Error('O plantão mudou desde a conferência. Atualize o calendário e abra o plantão novamente.');
  if(formulaAt_(g,p.row,Number(p.date.slice(-2))+5))throw Error('Esta célula contém fórmula e não será alterada.');
  if(p.code===p.expected)throw Error('Escolha um turno diferente do atual.');
  assertShiftAvailable_(g,p.row,p.date,p.code,meta);
  try{cell.setValue(p.code);SpreadsheetApp.flush();}catch(e){throw Error('Não foi possível confirmar a alteração. Atualize o calendário e confira o turno antes de tentar novamente. '+e.message);}
  return p.fast?mutationResult_(g,[p]):{ok:true,snapshot:readMonthlySheet(p.sheet)};
 }finally{lock.releaseLock();}
}

function getReplacementNames(){const sheet=livro_().getSheetByName('DADOS');if(!sheet)throw Error('Aba DADOS não encontrada para a lista POR QUEM.');const header=norm_(sheet.getRange(2,31).getDisplayValue());if(!['PROFISSIONAL DE ENFERMAGEM','NOME','POR QUEM'].includes(header))throw Error('O cabeçalho DADOS!AE2 não corresponde à lista POR QUEM.');const count=Math.max(0,sheet.getLastRow()-2);if(!count)return [];const values=sheet.getRange(3,31,count,1).getDisplayValues();const names=[],seen={};for(const row of values){const name=String(row[0]||'').trim().replace(/\s+/g,' '),key=norm_(name);if(name&&name.length<=120&&!seen[key]){seen[key]=true;names.push(name);}}return names.sort((a,b)=>a.localeCompare(b,'pt-BR'));}
function planMonthlyInsertions(p){const plan=batchPlan_(grade_(p.sheet),p);return {...plan,confirmation:batchFingerprint_(plan.changes)};}
function batchPlan_(g,p){if(!Array.isArray(p.items)||!p.items.length||p.items.length>31||p.items.some(i=>!i||typeof i.date!=='string'||!CODES_.includes(i.code))||new Set(p.items.map(i=>i.date)).size!==p.items.length)throw Error('Selecione de 1 a 31 dias distintos do mês.');const staged={...g,values:g.values.map(row=>row.slice())};const changes=[];for(const item of [...p.items].sort((a,b)=>a.date.localeCompare(b.date))){const one=planInsertion_(staged,{...p,date:item.date,code:item.code});const originalMeta=g.values[one.row-1].slice(0,5),day=Number(item.date.slice(-2));changes.push({...one,expectedMeta:originalMeta});if(one.newMeta)staged.values[one.row-1].splice(0,5,...one.newMeta);staged.values[one.row-1][day+4]=item.code;}return {sheet:p.sheet,category:p.category,meta:p.meta,items:p.items,changes};}
// O identificador é calculado e conferido no servidor; só a string atravessa o transporte.
function batchFingerprint_(changes){
 const data=changes.map(c=>[c.sheet,c.row,c.date,c.expected,c.expectedMeta,c.code,c.newMeta,c.category]);
 const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(data),Utilities.Charset.UTF_8);
 return INTEGRATION_VERSION_+':'+Utilities.base64EncodeWebSafe(bytes);
}
function batchConflictMessage_(fresh,p){
 const prefix='Conferência do lote ['+INTEGRATION_VERSION_+']: ';
 if(typeof p.confirmation!=='string'||!p.confirmation.startsWith(INTEGRATION_VERSION_+':'))return prefix+'a confirmação usa outra versão ou está incompleta. Reabra o aplicativo e confira o lote novamente. Nenhum plantão foi gravado neste envio.';
 const fields=['sheet','row','date','expected','code','category'],labels={sheet:'aba',row:'linha',date:'data',expected:'conteúdo anterior',code:'turno',category:'função'},metaLabels=['matrícula','profissional','cooperativa','justificativa','POR QUEM'];
 if(Array.isArray(p.changes)&&p.changes.length===fresh.changes.length)for(let i=0;i<fresh.changes.length;i++){
  const a=fresh.changes[i],b=p.changes[i];let field='';
  if(!b)field='dados da conferência';
  else {const key=fields.find(k=>a[k]!==b[k]);if(key)field=labels[key];
   else for(const key of ['expectedMeta','newMeta']){
    if(a[key]===null){if(b[key]!==null)field='dados da linha';}
    else if(!Array.isArray(b[key])||a[key].length!==b[key].length)field='dados cadastrais';
    else {const index=a[key].findIndex((v,j)=>v!==b[key][j]);if(index>=0)field=metaLabels[index];}
    if(field)break;
   }
  }
  if(field)return prefix+'divergência em '+field+', aba '+a.sheet+', data '+a.date+', linha '+a.row+'. Atualize o calendário e confira o lote novamente. Nenhum plantão foi gravado neste envio.';
 }
 return prefix+'o identificador da confirmação não corresponde aos dados atuais. Atualize o calendário e confira o lote novamente. Nenhum plantão foi gravado neste envio.';
}
function writeInsertions_(g,changes){
 for(const c of changes)if(c.newMeta)for(let i=0;i<5;i++)if(formulaAt_(g,c.row,i+1))throw Error('Uma linha do lote contém fórmula nos dados cadastrais.');
 try{
  for(const c of changes)if(c.newMeta)g.s.getRange(c.row,1,1,5).setNumberFormat('@').setValues([c.newMeta]);
  const groups={};for(const c of changes){if(!groups[c.code])groups[c.code]=[];groups[c.code].push(columnLetter_(Number(c.date.slice(-2))+5)+c.row);}
  for(const code of Object.keys(groups))g.s.getRangeList(groups[code]).setValue(code);
  SpreadsheetApp.flush();
 }catch(e){throw Error('O envio do lote não foi concluído. Atualize o calendário e confira possíveis alterações parciais antes de tentar novamente. '+e.message);}
}
function changeMonthlyShifts(p){const lock=LockService.getScriptLock();lock.waitLock(15000);try{const g=grade_(p.sheet),fresh=batchPlan_(g,p);if(batchFingerprint_(fresh.changes)!==p.confirmation)throw Error(batchConflictMessage_(fresh,p));writeInsertions_(g,fresh.changes);return {ok:true,count:fresh.changes.length,snapshot:readMonthlySheet(p.sheet)};}finally{lock.releaseLock();}}
// A confirmação acontece antes da chamada; todo o lote é validado antes da escrita.
function capacityPlan_(g,p){
 const virtual={...g,values:g.values.map(r=>r.slice()),formulas:g.formulas.map(r=>r.slice()),blocks:g.blocks.map(b=>({...b}))};let count=0;
 while(true){try{return {plan:batchPlan_(virtual,p),count,virtual};}catch(e){if(e.code!=='NO_SPACE'||count>=31)throw e;const block=virtual.blocks.find(b=>b.category===p.category);if(!block)throw e;const before=block.end+1,width=virtual.values[0].length;virtual.values.splice(before-1,0,Array(width).fill(''));virtual.formulas.splice(before-1,0,Array(width).fill(''));block.end++;for(const other of virtual.blocks)if(other!==block&&other.start>=before){other.start++;other.end++;other.header++;other.heading++;}count++;}}
}
function growSection_(g,category,count){
 const b=g.blocks.find(b=>b.category===category),s=g.s,width=g.values[0].length,before=b.end>=b.start?b.end:b.start,template=b.end>=b.start?b.end:null;
 // Guarda apenas fórmulas de totais, sem copiar nomes ou plantões para a nova linha.
 const rowFormulas=template?s.getRange(template,1,1,width).getFormulasR1C1()[0].map(f=>f||''):Array(width).fill('');
 const footer=[];for(let row=b.end+1;row<=g.values.length;row++)for(let col=0;col<width;col++){const formula=g.formulas[row-1][col];if(formula)footer.push({row,col:col+1,formula});}
 if(before>s.getMaxRows())s.insertRowsAfter(s.getMaxRows(),count);else s.insertRowsBefore(before,count);
 const source=template?s.getRange(template>=before?template+count:template,1,1,width):null;
 const gridWidth=[31,31,31,30,31,30,31,31,30,31,30,31][Number(g.month.slice(5,7))-1];
 if(!template){const headers=g.values[b.header-1].map(norm_),dayRange='RC6:RC'+(5+gridWidth),diurnal=headers.indexOf('CHD'),nocturnal=headers.indexOf('CHN'),total=headers.indexOf('CH');if(diurnal>=0)rowFormulas[diurnal]='=SUMPRODUCT(COUNTIF('+dayRange+',{"M","T","MT","9C","MN","TN","MTN"}),{6,6,12,9,6,6,12})';if(nocturnal>=0)rowFormulas[nocturnal]='=SUM(COUNTIF('+dayRange+',{"N","MN","TN","MTN"}))*12';if(total>=0&&diurnal>=0&&nocturnal>=0)rowFormulas[total]='=RC'+(diurnal+1)+'+RC'+(nocturnal+1);}

 for(let row=before;row<before+count;row++){
  const target=s.getRange(row,1,1,width);
  if(source){source.copyTo(target,SpreadsheetApp.CopyPasteType.PASTE_FORMAT,false);source.copyTo(target,SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,false);s.setRowHeight(row,s.getRowHeight(template>=before?template+count:template));}
  target.setFormulasR1C1([rowFormulas.map((formula,col)=>col>=5+gridWidth?formula:'')]);
 }
 // Um total que cobria o bloco inteiro também deve abranger as linhas inseridas.
 const ranges=/(?:('(?:[^']|'')+'|[A-Za-z_][A-Za-z0-9_]*)!)?(\$?[A-Z]{1,3})(\$?)(\d+):(\$?[A-Z]{1,3})(\$?)(\d+)/g;
 for(const item of footer){const matches=[...item.formula.matchAll(ranges)];if(!matches.some(m=>(!m[1]||m[1].replace(/^'|'$/g,'')===g.name)&&Number(m[4])===b.start&&Number(m[7])===b.end))continue;const cell=s.getRange(item.row>=before?item.row+count:item.row,item.col),current=cell.getFormula();let index=0;const updated=current.replace(ranges,(full,prefix,c1,a1,r1,c2,a2,r2)=>{const old=matches[index++];if(!old||old[1]&&old[1].replace(/^'|'$/g,'')!==g.name||Number(old[4])!==b.start||Number(old[7])!==b.end)return full;return (prefix?prefix+'!':'')+c1+a1+b.start+':'+c2+a2+(b.end+count);});if(updated!==current)cell.setFormula(updated);}
 SpreadsheetApp.flush();
}
function insertMonthlyShifts(p){
 const lock=LockService.getScriptLock();lock.waitLock(15000);let expanded=false;
 try{
  let g=grade_(p.sheet,true);const capacity=capacityPlan_(g,p);let plan=capacity.plan;
  // Todas as validações do lote, inclusive fórmulas cadastrais, precedem a mudança estrutural.
  for(const c of plan.changes)if(c.newMeta)for(let i=0;i<5;i++)if(formulaAt_(capacity.virtual,c.row,i+1))throw Error('Uma linha do lote contém fórmula nos dados cadastrais.');
  if(capacity.count){expanded=true;growSection_(g,p.category,capacity.count);g=grade_(p.sheet,true);plan=batchPlan_(g,p);}
  writeInsertions_(g,plan.changes);const result=mutationResult_(g,plan.changes);if(expanded)result.snapshot.structureChanged=true;return result;
 }catch(e){if(expanded)throw Error('A ampliação do bloco ou o envio não foi concluído. Atualize e confira possíveis alterações parciais antes de reenviar. '+e.message);throw e;}finally{lock.releaseLock();}
}

function columnLetter_(col){let out='';while(col){const rem=(col-1)%26;out=String.fromCharCode(65+rem)+out;col=Math.floor((col-1)/26);}return out;}

function removalGrade_(cache,name){if(!cache[name]){cache[name]=grade_(name,true);}return cache[name];}
function findMonthlyShiftsForRemoval(p){
 if(!p||!Array.isArray(p.items)||!p.items.length||p.items.length>500)throw Error('Confira de 1 a 500 linhas por vez.');
 const cache={},failures={},entries=[];
 for(const item of p.items){
  if(!item||typeof item.name!=='string'||!item.name.trim()||item.name.length>240||typeof item.date!=='string'||!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(item.date)||!CODES_.includes(item.code))throw Error('Confira nome, data e turno da lista.');
  const d=new Date(item.date+'T12:00:00Z');if(isNaN(d)||d.toISOString().slice(0,10)!==item.date)throw Error('A lista contém uma data que não existe.');
  const sheet=Object.keys(MONTHS_).find(name=>MONTHS_[name]===Number(item.date.slice(5,7))),entry={line:item.line,name:item.name,date:item.date,code:item.code,sheet,matches:[]};
  try{
   if(failures[sheet])throw Error(failures[sheet]);
   let g;try{g=removalGrade_(cache,sheet);}catch(e){failures[sheet]=e.message;throw e;}
   if(!item.date.startsWith(g.month+'-'))throw Error('A aba '+sheet+' corresponde a '+g.month+', diferente do ano da data informada.');
   const day=Number(item.date.slice(-2));
   for(const block of g.blocks)for(let row=block.start;row<=block.end;row++){
    const values=g.values[row-1],meta=values.slice(0,5);
    if(norm_(meta[1])===norm_(item.name)&&values[day+4]===item.code)entry.matches.push({sheet,row,date:item.date,expected:item.code,expectedMeta:meta,category:block.category,protected:!!g.formulas[row-1][day+4]});
   }
  }catch(e){entry.error=e.message;}
  entries.push(entry);
 }
 return {entries,snapshot:p.currentSheet&&cache[p.currentSheet]?snapshot_(cache[p.currentSheet]):null};
}
function deletionPlan_(p){
 if(!p||!Array.isArray(p.targets)||!p.targets.length||p.targets.length>500)throw Error('Selecione de 1 a 500 plantões para remover.');
 const cache={},seen=new Set(),changes=[];
 for(const target of p.targets){
  if(!target||!MONTHS_[target.sheet]||!Number.isInteger(target.row)||typeof target.date!=='string'||!CODES_.includes(target.expected)||!Array.isArray(target.expectedMeta)||target.expectedMeta.length!==5||target.expectedMeta.some(v=>typeof v!=='string')||!target.expectedMeta[1]||!['ENFERMEIRO','TÉCNICO DE ENFERMAGEM'].includes(target.category))throw Error('Conferência de remoção incompleta. Confira a lista novamente.');
  const key=JSON.stringify([target.sheet,target.row,target.date]);if(seen.has(key))throw Error('Há um plantão repetido na seleção. Confira a lista novamente.');seen.add(key);
  const g=removalGrade_(cache,target.sheet);cell_(g,target.row,target.date);
  const values=g.values[target.row-1],meta=values.slice(0,5),day=Number(target.date.slice(-2)),category=g.blocks.find(b=>target.row>=b.start&&target.row<=b.end).category;
  if(category!==target.category||meta.some((v,i)=>v!==target.expectedMeta[i])||values[day+4]!==target.expected)throw Error('Remoção ['+REMOVAL_VERSION_+']: o plantão mudou desde a conferência, aba '+target.sheet+', data '+target.date+', linha '+target.row+'. Confira a lista novamente. Nenhum plantão foi removido neste envio.');
  if(g.formulas[target.row-1][day+4])throw Error('A célula da aba '+target.sheet+', data '+target.date+', linha '+target.row+' contém fórmula e não pode ser removida.');
  changes.push({sheet:target.sheet,row:target.row,date:target.date,expected:target.expected,expectedMeta:meta,code:'',newMeta:null,category});
 }
 changes.sort((a,b)=>a.date.localeCompare(b.date)||a.row-b.row);
 return {cache,changes};
}
function deletionFingerprint_(changes){return REMOVAL_VERSION_+':'+batchFingerprint_(changes);}
function planMonthlyDeletions(p){const plan=deletionPlan_(p);return {targets:plan.changes.map(c=>({sheet:c.sheet,row:c.row,date:c.date,expected:c.expected,expectedMeta:c.expectedMeta,category:c.category})),confirmation:deletionFingerprint_(plan.changes)};}
function writeDeletions_(plan){
 const groups={};for(const c of plan.changes){if(!groups[c.sheet])groups[c.sheet]=[];groups[c.sheet].push(columnLetter_(Number(c.date.slice(-2))+5)+c.row);}
 try{for(const sheet of Object.keys(groups))plan.cache[sheet].s.getRangeList(groups[sheet]).clearContent();SpreadsheetApp.flush();}
 catch(e){throw Error('A remoção do lote não foi concluída. Atualize o calendário e confira a lista novamente para verificar possíveis remoções parciais. '+e.message);}
 return Object.keys(groups);
}
function changeMonthlyDeletions(p){
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{const plan=deletionPlan_(p);if(p.confirmation!==deletionFingerprint_(plan.changes))throw Error('Remoção ['+REMOVAL_VERSION_+']: confirmação inválida ou de outra versão. Confira a lista novamente. Nenhum plantão foi removido neste envio.');return {ok:true,count:plan.changes.length,sheets:writeDeletions_(plan)};}finally{lock.releaseLock();}
}
function removeMonthlyShifts(p){
 if(p&&p.currentSheet!==undefined&&!Object.keys(MONTHS_).includes(p.currentSheet))throw Error('Selecione uma aba mensal válida.');
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const plan=deletionPlan_(p),sheets=writeDeletions_(plan);
  for(const c of plan.changes)plan.cache[c.sheet].values[c.row-1][Number(c.date.slice(-2))+4]='';
  return {ok:true,count:plan.changes.length,sheets,snapshot:plan.cache[p.currentSheet]?resultSnapshot_(plan.cache[p.currentSheet]):null,unchangedSheet:plan.cache[p.currentSheet]?null:p.currentSheet};
 }finally{lock.releaseLock();}
}


const CATALOG_SHEET_='GESTAO_COOPERADOS';
function catalogProfile_(p){
 if(!p||typeof p.name!=='string')return null;
 const category=norm_(p.category),cooperative=norm_(p.cooperative)==='COPEN'?'COOPEN':norm_(p.cooperative);
 const out={name:p.name.trim().replace(/\s+/g,' '),registration:String(p.registration||'').trim(),cooperative,category:['ENFERMEIRO','ENFERMEIRA'].includes(category)?'ENFERMEIRO':['TECNICO','TECNICA','TECNICO DE ENFERMAGEM','TECNICA DE ENFERMAGEM'].includes(category)?'TÉCNICO DE ENFERMAGEM':''};
 if(!out.name||out.name.length>120||out.registration.length>30||!out.category||!['COOPEN','COOPISAUDE'].includes(cooperative)||Object.values(out).some(v=>/[\t\r\n]/.test(v)||/^\s*[=+@]/.test(v)))return null;return out;
}
function syncCooperatorCatalog(p){
 p=p||{};if(!Array.isArray(p.profiles)||p.profiles.length>5000)throw Error('Confira os cadastros enviados.');const incoming=p.profiles.map(catalogProfile_);if(incoming.some(v=>!v))throw Error('Há cadastro incompleto ou inválido. Confira nome, matrícula, função e cooperativa.');
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const book=livro_();let sheet=book.getSheetByName(CATALOG_SHEET_),existing=[],all=[];
  if(sheet){const rows=sheet.getDataRange().getDisplayValues();if(rows[0].map(norm_).slice(0,4).join('|')!=='MAT|NOME|CATEGORIA|COOPERATIVA')throw Error('Confira o cabeçalho da aba '+CATALOG_SHEET_+'.');existing=rows.slice(1).map(r=>r.slice(0,4)).filter(r=>r.some(Boolean));for(const row of existing){const profile=catalogProfile_({registration:row[0],name:row[1],category:row[2],cooperative:row[3]});if(!profile)throw Error('Há um cadastro inválido na aba '+CATALOG_SHEET_+'.');all.push(profile);}}
  if(!sheet||p.refresh){
   for(const tab of book.getSheets()){
    const name=tab.getName();if(!Object.prototype.hasOwnProperty.call(MONTHS_,name)&&name!=='DADOS')continue;
    const rows=name==='DADOS'?tab.getDataRange().getDisplayValues():tab.getRange(1,1,tab.getLastRow(),5).getDisplayValues();
    if(name==='DADOS'){
     for(let index=0;index<Math.min(15,rows.length);index++){const header=rows[index].map(norm_),columns=[header.findIndex(v=>['MAT','MATRICULA'].includes(v)),header.findIndex(v=>['NOME','PROFISSIONAL DE ENFERMAGEM'].includes(v)),header.findIndex(v=>['CATEGORIA','FUNCAO'].includes(v)),header.indexOf('COOPERATIVA')];if(columns.some(v=>v<0))continue;for(const row of rows.slice(index+1)){const profile=catalogProfile_({registration:row[columns[0]],name:row[columns[1]],category:row[columns[2]],cooperative:row[columns[3]]});if(profile)all.push(profile);}break;}
    }else{let category='';for(const row of rows){const label=norm_(row[0]);if(label.includes('ENFERMEIROS'))category='ENFERMEIRO';if(label.includes('TECNICOS'))category='TÉCNICO DE ENFERMAGEM';const profile=catalogProfile_({registration:row[0],name:row[1],category,cooperative:row[2]});if(profile)all.push(profile);}}
   }
  }
  all.push(...incoming);const unique=new Map();for(const profile of all){const key=JSON.stringify([norm_(profile.name),norm_(profile.registration),profile.cooperative,profile.category]);if(!unique.has(key))unique.set(key,profile);}
  const profiles=[...unique.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')||a.registration.localeCompare(b.registration)),rows=profiles.map(v=>[v.registration,v.name,v.category,v.cooperative]);
  if(rows.length&&(!sheet||JSON.stringify(existing)!==JSON.stringify(rows))){if(!sheet){sheet=book.insertSheet(CATALOG_SHEET_);sheet.getRange(1,1,1,4).setValues([['MAT','NOME','CATEGORIA','COOPERATIVA']]);sheet.hideSheet();}if(sheet.getMaxRows()<rows.length+1)sheet.insertRowsAfter(sheet.getMaxRows(),rows.length+1-sheet.getMaxRows());sheet.getRange(2,1,rows.length,4).setNumberFormat('@').setValues(rows);if(existing.length>rows.length)sheet.getRange(rows.length+2,1,existing.length-rows.length,4).clearContent();SpreadsheetApp.flush();}
  return {profiles};
 }finally{lock.releaseLock();}
}


/** Consulta somente leitura, em uma chamada, sem misturar resultados parciais. */
function readReportSheets(p){
 if(!p||!Array.isArray(p.sheets)||!p.sheets.length||p.sheets.length>12||new Set(p.sheets).size!==p.sheets.length||p.sheets.some(name=>typeof name!=='string'||!Object.prototype.hasOwnProperty.call(MONTHS_,name)))throw Error('Selecione de 1 a 12 abas mensais válidas, sem repetições.');
 if(p.expectedMonths!==undefined&&(!p.expectedMonths||typeof p.expectedMonths!=='object'||Array.isArray(p.expectedMonths)||Object.values(p.expectedMonths).some(m=>typeof m!=='string'||!/^\d{4}-(0[1-9]|1[0-2])$/.test(m))))throw Error('Confira os meses do período.');
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{const book=livro_(),snapshots=[];for(const name of p.sheets){const g=grade_(name,false,book);if(p.expectedMonths?.[name]&&p.expectedMonths[name]!==g.month)throw Error('A aba '+name+' corresponde a '+g.month+', diferente do período solicitado ('+p.expectedMonths[name]+').');snapshots.push(snapshot_(g));}return {snapshots,generatedAt:new Date().toISOString(),version:'relatorios-1'};}finally{lock.releaseLock();}
}
