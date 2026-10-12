(function(root){
 const codes=['M','T','MT','N','9C','MN','TN','MTN'],limit=500;
 const clean=v=>String(v).trim().replace(/\s+/g,' '),norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 function dateOf(value,month){
  let date=clean(value),match;
  if((match=date.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/)))date=(match[3]||month.slice(0,4))+'-'+match[2].padStart(2,'0')+'-'+match[1].padStart(2,'0');
  else if(/^\d{1,2}$/.test(date))date=month+'-'+date.padStart(2,'0');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Data inválida. Use DD/MM/AAAA ou AAAA-MM-DD.');
  const d=new Date(date+'T12:00:00Z');if(isNaN(d)||d.toISOString().slice(0,10)!==date)throw Error('Esta data não existe.');
  return date;
 }
 function columns(line){
  const frame=line.trim();if(frame.startsWith('|')&&frame.endsWith('|'))line=frame.slice(1,-1);
  let quoted=false,delimiter='';
  for(let i=0;i<line.length;i++){if(line[i]==='"'){if(quoted&&line[i+1]==='"')i++;else quoted=!quoted;}else if(!quoted&&['\t',';','|',','].includes(line[i])){delimiter=line[i];break;}}
  if(!delimiter){const match=line.match(/^(.+?)\s+(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{4})?|\d{1,2})\s+(MTN|MN|TN|MT|M|T|N|9C)\s*$/i);if(!match)throw Error('Use NOME; DATA; TURNO, uma linha por plantão.');return match.slice(1);}
  const result=[];let cell='';quoted=false;
  for(let i=0;i<line.length;i++){const char=line[i];if(char==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(char===delimiter&&!quoted){result.push(clean(cell));cell='';}else cell+=char;}
  if(quoted)throw Error('Aspas não fechadas.');result.push(clean(cell));return result;
 }
 function parse(text,month){
  if(typeof text!=='string'||text.length>1024*1024)throw Error('A lista deve ter no máximo 1 MB.');
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Selecione um mês no calendário antes de conferir.');
  const entries=[],items=[],seen=new Set();
  for(const [index,raw] of text.replace(/^\ufeff/,'').split(/\r?\n/).entries()){
   if(!raw.trim()||/^[\s|:-]+$/.test(raw))continue;const entry={line:index+1,raw:raw.trim()};
   try{const fields=columns(raw);let name,date,code;
    if(fields.length===6){[date,name,,code]=fields;}
    else if(fields.length===3){[name,date,code]=fields;}
    else throw Error('Formato não reconhecido ('+fields.length+' colunas). Use DATA; NOME; SETOR; TURNO; FUNÇÃO; COOPERATIVA ou NOME; DATA; TURNO.');
    if(['NOME','PROFISSIONAL','PROFISSIONAL DE ENFERMAGEM'].includes(norm(name))&&norm(date)==='DATA'&&['TURNO','TURNOS'].includes(norm(code)))continue;
    entry.name=clean(name);entry.date=dateOf(date,month);entry.code=norm(code);
    if(!entry.name||entry.name.length>240)throw Error('Informe o nome completo, com até 240 caracteres.');
    if(!codes.includes(entry.code))throw Error('Turno inválido. Use M, T, MT, N, 9C, MN, TN ou MTN.');
    const key=JSON.stringify([norm(entry.name),entry.date,entry.code]);
    if(seen.has(key))entry.duplicate=true;else {seen.add(key);items.push({line:entry.line,name:entry.name,date:entry.date,code:entry.code});}
   }catch(error){entry.error=error.message;}
   entries.push(entry);if(entries.length>limit)throw Error('Confira até '+limit+' linhas por vez.');
  }
  if(!entries.length)throw Error('Cole a tabela DATA; NOME; SETOR; TURNO; FUNÇÃO; COOPERATIVA ou a lista NOME; DATA; TURNO.');
  return {entries,items};
 }
 const targetKey=r=>JSON.stringify([r.sheet,r.row,r.date]);
 root.RemovalList={parse,dateOf,targetKey,limit};if(typeof module!=='undefined')module.exports=root.RemovalList;
})(typeof window==='undefined'?globalThis:window);
