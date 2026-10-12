/** Execute configurarGestao uma vez no editor da planilha. Publique executando como o usuário que acessa. */
function configurarGestao(){const sheet=SpreadsheetApp.getActiveSpreadsheet();if(!sheet)throw Error('Abra o Apps Script por Extensões na planilha.');PropertiesService.getScriptProperties().setProperty('GESTAO_SPREADSHEET_ID',sheet.getId());}
function doGet(){return HtmlService.createHtmlOutputFromFile('App').setTitle('Gestão Emergência Adulto');}
function livro_(){const id=PropertiesService.getScriptProperties().getProperty('GESTAO_SPREADSHEET_ID');if(!id)throw Error('Execute configurarGestao no editor da planilha antes de usar.');return SpreadsheetApp.openById(id);}
function norm_(v){return String(v||'').trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();}
const MONTHS_={JAN:1,FEV:2,MAR:3,ABRIL:4,MAIO:5,JUN:6,JUL:7,AGT:8,SET:9,OUT:10,NOV:11,DEZ:12};
const CODES_=['M','T','MT','N','9C','MN','TN','MTN'];
const INTEGRATION_VERSION_='lote-4';
const REMOVAL_VERSION_='lista-1';
function getIntegrationInfo(){return {version:INTEGRATION_VERSION_,removalVersion:REMOVAL_VERSION_};}
function listMonthlySheets(){return livro_().getSheets().map(s=>s.getName()).filter(n=>MONTHS_[n]);}
function grade_(name){if(!MONTHS_[name])throw Error('Selecione uma aba mensal válida.');const s=livro_().getSheetByName(name);if(!s)throw Error('Aba não encontrada.');const values=s.getDataRange().getDisplayValues();let year=null;for(const row of values.slice(0,12)){for(const cell of row){const match=String(cell).match(/\b(20\d{2})\b/);if(match)year=Number(match[1]);}}if(!year)throw Error('O título desta aba precisa conter o ano, por exemplo OUTUBRO DE 2026.');
const blocks=[];for(let i=0;i<values.length;i++){const row=values[i];if(norm_(row[0])==='MAT'&&norm_(row[1])==='NOME'&&norm_(row[2])==='COOPERATIVA'&&norm_(row[3])==='MOTIVO'&&norm_(row[4])==='POR QUEM'){let category=null;for(let k=i-1;k>=Math.max(0,i-5);k--){const heading=norm_(values[k][0]);if(heading.includes('ENFERMEIROS')){category='ENFERMEIRO';break;}if(heading.includes('TECNICOS')){category='TÉCNICO DE ENFERMAGEM';break;}}if(!category)throw Error('Não foi possível identificar a função do bloco na linha '+(i+1));blocks.push({header:i+1,start:i+2,end:values.length,category});}}
if(!blocks.length)throw Error('Cabeçalhos da grade não reconhecidos.');for(let i=0;i<blocks.length-1;i++)blocks[i].end=blocks[i+1].header-2;
const month=year+'-'+String(MONTHS_[name]).padStart(2,'0'),days=new Date(Date.UTC(year,MONTHS_[name],0)).getUTCDate();let validatedHeader=null;for(const b of blocks){const headers=values[b.header-2]||[];const dayHeaders=headers.slice(5,5+days);const complete=Array.from({length:days},(_,i)=>Number(dayHeaders[i])===i+1).every(Boolean);const empty=Array.from({length:days},(_,i)=>!String(dayHeaders[i]||'').trim()).every(Boolean);if(complete){validatedHeader=b.header-1;}else if(empty&&validatedHeader){b.inheritedDayHeader=validatedHeader;}else{throw Error('Dias fora do layout esperado no bloco '+b.category+' (linha '+(b.header-1)+'). Os dias devem ser numerados de 1 a '+days+', ou ficar vazios para usar o cabeçalho validado do bloco acima.');}}
return {s,values,blocks,month,days};}
function readMonthlySheet(name){const g=grade_(name),records=[];for(const b of g.blocks)for(let row=b.start;row<=b.end;row++){const values=g.values[row-1]||[],meta=values.slice(0,5);if(!meta[1])continue;for(let day=1;day<=g.days;day++){const code=values[day+4];if(code)records.push({row,date:g.month+'-'+String(day).padStart(2,'0'),code,meta,category:b.category});}}return {sheet:name,month:g.month,records};}
function cell_(g,row,date){if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!date.startsWith(g.month+'-'))throw Error('A data não corresponde ao mês/ano da aba.');const day=Number(date.slice(-2));if(day<1||day>g.days||!Number.isInteger(row)||!g.blocks.some(b=>row>=b.start&&row<=b.end))throw Error('Linha ou dia fora da grade.');return g.s.getRange(row,day+5);}

function assertShiftAvailable_(g,row,date,code,meta){const b=g.blocks.find(b=>row>=b.start&&row<=b.end);const day=Number(date.slice(-2));const atoms={M:['M'],T:['T'],MT:['M','T'],N:['N'],'9C':['M','T'],MN:['M','N'],TN:['T','N'],MTN:['M','T','N']};for(let r=b.start;r<=b.end;r++){const v=g.values[r-1],other=v[day+4];if(r===row||!other||!sameProfessional_(meta,v))continue;if(!atoms[other])throw Error('Existe um turno especial neste dia em outra linha. Confira a planilha antes de inserir.');if(atoms[code].some(a=>atoms[other].includes(a)))throw Error('O profissional já tem um turno sobreposto neste dia em outra linha. Recarregue e confira o calendário.');}}
function sameProfessional_(a,b){const ar=norm_(a[0]),br=norm_(b[0]);return norm_(a[1])===norm_(b[1])&&norm_(a[2])===norm_(b[2])&&(ar===br||!ar||ar==='-'||!br||br==='-');}
function planMonthlyInsertion(p){return planInsertion_(grade_(p.sheet),p);}
function planInsertion_(g,p){
 if(!CODES_.includes(p.code)||!Array.isArray(p.meta)||p.meta.length!==5||p.meta.some((v,i)=>typeof v!=='string'||v.length>240||/[\t\r\n]/.test(v)||(/^\s*[=+@-]/.test(v)&&!(i===0&&v==='-')))||!p.meta[1]||!p.meta[2]||!p.meta[3])throw Error('Confira os dados do plantão.');
 const b=g.blocks.find(b=>b.category===p.category);if(!b)throw Error('Bloco da função não encontrado.');
 let empty=null;const targets=[];for(let row=b.start;row<=b.end;row++){const meta=g.values[row-1].slice(0,5);if(sameProfessional_(meta,p.meta)&&norm_(meta[3])===norm_(p.meta[3])&&norm_(meta[4])===norm_(p.meta[4]))targets.push(row);else if(!empty&&meta.slice(1).every(v=>!v)&&(!meta[0]||meta[0]==='-')&&g.values[row-1].slice(5,5+g.days).every(v=>!v))empty=row;}
 const day=Number(String(p.date).slice(-2));let row=targets[0]||empty;if(!row)throw Error('Não há linha vazia neste bloco. Adicione uma linha de modelo na planilha e recarregue.');cell_(g,row,p.date);
 if(targets.length)row=targets.find(r=>!g.values[r-1][day+4]&&!g.s.getRange(r,day+5).getFormula())||targets[0];
 const range=cell_(g,row,p.date),meta=g.values[row-1].slice(0,5);assertShiftAvailable_(g,row,p.date,p.code,targets.length?meta:p.meta);if(g.values[row-1][day+4]||range.getFormula())throw Error('Este dia já está preenchido ou contém fórmula na linha existente. Confira antes de inserir.');
 return {sheet:p.sheet,row,date:p.date,expected:'',expectedMeta:meta,code:p.code,newMeta:targets.length?null:p.meta,category:p.category};
}
function changeMonthlyShift(p){const lock=LockService.getScriptLock();lock.waitLock(15000);try{const g=grade_(p.sheet);if(p.code!==''&&!CODES_.includes(p.code))throw Error('Turno não reconhecido.');const cell=cell_(g,p.row,p.date);const meta=g.s.getRange(p.row,1,1,5).getDisplayValues()[0];if(!Array.isArray(p.expectedMeta)||p.expectedMeta.length!==5||meta.some((v,i)=>v!==p.expectedMeta[i])||cell.getDisplayValue()!==p.expected)throw Error('A planilha mudou desde a conferência. Recarregue antes de alterar.');if(cell.getFormula())throw Error('Esta célula contém fórmula e não será alterada.');if(p.code&&p.expected)throw Error('Não é permitido sobrescrever um plantão existente.');if(!p.code&&!p.expected)throw Error('A célula já está vazia.');if(p.code)assertShiftAvailable_(g,p.row,p.date,p.code,p.newMeta||meta);if(p.newMeta){const plan=planInsertion_(g,{sheet:p.sheet,date:p.date,code:p.code,meta:p.newMeta,category:p.category});if(plan.row!==p.row)throw Error('A linha disponível mudou; confira novamente.');for(let i=0;i<5;i++){const range=g.s.getRange(p.row,i+1);if(range.getFormula())throw Error('A linha contém fórmula nos dados cadastrais.');}g.s.getRange(p.row,1,1,5).setNumberFormat('@').setValues([p.newMeta]);}if(p.code)cell.setValue(p.code);else cell.clearContent();SpreadsheetApp.flush();return {ok:true,snapshot:readMonthlySheet(p.sheet)};}finally{lock.releaseLock();}}

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
function changeMonthlyShifts(p){const lock=LockService.getScriptLock();lock.waitLock(15000);try{const g=grade_(p.sheet),fresh=batchPlan_(g,p);if(batchFingerprint_(fresh.changes)!==p.confirmation)throw Error(batchConflictMessage_(fresh,p));for(const c of fresh.changes){if(c.newMeta)for(let i=0;i<5;i++)if(g.s.getRange(c.row,i+1).getFormula())throw Error('Uma linha do lote contém fórmula nos dados cadastrais.');}try{for(const c of fresh.changes)if(c.newMeta)g.s.getRange(c.row,1,1,5).setNumberFormat('@').setValues([c.newMeta]);const groups={};for(const c of fresh.changes){if(!groups[c.code])groups[c.code]=[];const col=Number(c.date.slice(-2))+5;groups[c.code].push(columnLetter_(col)+c.row);}for(const code of Object.keys(groups))g.s.getRangeList(groups[code]).setValue(code);SpreadsheetApp.flush();}catch(e){throw Error('O envio do lote não foi concluído. Atualize o calendário e confira possíveis alterações parciais antes de tentar novamente. '+e.message);}return {ok:true,count:fresh.changes.length,snapshot:readMonthlySheet(p.sheet)};}finally{lock.releaseLock();}}
function columnLetter_(col){let out='';while(col){const rem=(col-1)%26;out=String.fromCharCode(65+rem)+out;col=Math.floor((col-1)/26);}return out;}

function removalGrade_(cache,name){if(!cache[name]){const g=grade_(name);g.formulas=g.s.getDataRange().getFormulas();cache[name]=g;}return cache[name];}
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
 return {entries};
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
function changeMonthlyDeletions(p){
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const plan=deletionPlan_(p);
  if(p.confirmation!==deletionFingerprint_(plan.changes))throw Error('Remoção ['+REMOVAL_VERSION_+']: confirmação inválida ou de outra versão. Confira a lista novamente. Nenhum plantão foi removido neste envio.');
  const groups={};for(const c of plan.changes){if(!groups[c.sheet])groups[c.sheet]=[];groups[c.sheet].push(columnLetter_(Number(c.date.slice(-2))+5)+c.row);}
  try{for(const sheet of Object.keys(groups))plan.cache[sheet].s.getRangeList(groups[sheet]).clearContent();SpreadsheetApp.flush();}
  catch(e){throw Error('A remoção do lote não foi concluída. Atualize o calendário e confira a lista novamente para verificar possíveis remoções parciais. '+e.message);}
  return {ok:true,count:plan.changes.length,sheets:Object.keys(groups)};
 }finally{lock.releaseLock();}
}
