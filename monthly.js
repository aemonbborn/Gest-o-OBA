/* Grade compatível com os blocos da planilha enviada. Sem acesso à planilha online. */
(function(root){
 const HOURS={M:[6,0],T:[6,0],MT:[12,0],N:[0,12],'9C':[9,0],MN:[6,12],TN:[6,12],MTN:[12,12]};
 const norm=v=>String(v||'').trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 const known=v=>v&&v!=='-';
 const WIDTHS=[31,31,31,30,31,30,31,31,30,31,30,31];
 function combine(shifts){const set=new Set(shifts);if(set.has('9C')&&set.size>1)throw Error('9C combinado com outro turno: revise o plantão.');if(set.has('MT')&&(set.has('M')||set.has('T')))throw Error('MT sobreposto a M ou T: revise o plantão.');if(set.has('9C'))return '9C';const m=set.has('M')||set.has('MT'),t=set.has('T')||set.has('MT'),n=set.has('N');return (m?'M':'')+(t?'T':'')+(n?'N':'');}
 function build(records,month,category){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Selecione um mês válido.');const [year,number]=month.split('-').map(Number);const days=new Date(Date.UTC(year,number,0)).getUTCDate(),width=WIDTHS[number-1];const groups=new Map(),occupied=new Map(),warnings=[];let repeated=0;
 for(const r of records){const dates=r.dates.filter(d=>d.date.startsWith(month+'-'));if(!dates.length)continue;if(!r.category||!r.cooperative)throw Error('Há registros deste mês sem função ou cooperativa. Edite-os no histórico antes de gerar a planilha.');if(r.category!==category)continue;
 const name=r.professionalName||r.professional;const baseKey=JSON.stringify([norm(name),norm(r.cooperative),norm(r.reason),norm(r.replacement)]);if(!groups.has(baseKey))groups.set(baseKey,[]);const links=groups.get(baseKey);let g=links.find(item=>norm(item.registration)===norm(r.registration)||!known(norm(item.registration))||!known(norm(r.registration)));if(!g){g={professional:name,registration:r.registration||'',cooperative:r.cooperative,reason:r.reason,replacement:r.replacement||'',slots:Array.from({length:width},()=>new Set()),key:baseKey+'#'+links.length};links.push(g);}else if(!known(norm(g.registration))&&known(norm(r.registration)))g.registration=r.registration;const key=g.key;
 for(const d of dates){const day=Number(d.date.slice(-2));if(day<1||day>days)throw Error('Data fora do mês.');for(const shift of d.shifts){const atoms=shift==='MT'?['M','T']:[shift];for(const atom of atoms){const slotKey=JSON.stringify([name,r.registration||'',r.cooperative,d.date,atom]);if(occupied.has(slotKey)&&occupied.get(slotKey)!==key)throw Error('O mesmo profissional tem turnos sobrepostos com motivos ou substituições diferentes. Revise o histórico.');occupied.set(slotKey,key);}if(g.slots[day-1].has(shift))repeated++;g.slots[day-1].add(shift);}}
 }
 const rows=[...groups.values()].flat().sort((a,b)=>a.professional.localeCompare(b.professional,'pt-BR')||a.reason.localeCompare(b.reason,'pt-BR')).map(g=>{let diurnal=0,nocturnal=0;const slots=g.slots.map(set=>{const code=set.size?combine([...set]):'';if(code){diurnal+=HOURS[code][0];nocturnal+=HOURS[code][1];}return code;});return {cells:[g.registration,g.professional,g.cooperative,g.reason,g.replacement,...slots],diurnal,nocturnal};});
 if(repeated)warnings.push('Turnos idênticos repetidos foram contados uma única vez na grade.');
 return {rows,days,width,headers:['MAT','NOME','COOPERATIVA','MOTIVO','POR QUEM',...Array.from({length:width},(_,i)=>i<days?String(i+1):'')],warnings};
 }
 function safeCell(v){let s=String(v??'').replace(/[\t\r\n]/g,' ');if(/^\s*[=+@-]/.test(s))s="'"+s;return s;}
 function tsv(result){return result.rows.map(r=>r.cells.map(safeCell).join('\t')).join('\n');}
 root.Monthly={build,combine,tsv};if(typeof module!=='undefined')module.exports=root.Monthly;
})(typeof window==='undefined'?globalThis:window);
