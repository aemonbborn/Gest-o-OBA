(function(root){
 const codes=['M','T','MT','N','9C','MN','TN','MTN'];
 const decode=code=>({M:['M'],T:['T'],MT:['MT'],N:['N'],'9C':['9C'],MN:['M','N'],TN:['T','N'],MTN:['MT','N']}[code]||[]);
 function monthInfo(month){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw Error('Selecione um mês válido.');const [y,m]=month.split('-').map(Number);return {days:new Date(Date.UTC(y,m,0)).getUTCDate(),offset:(new Date(Date.UTC(y,m-1,1)).getUTCDay()+6)%7};}
 function dates(slots){return Object.entries(slots).filter(([,code])=>codes.includes(code)).sort(([a],[b])=>a.localeCompare(b)).map(([date,code])=>({date,shifts:decode(code)}));}
 root.Calendar={codes,decode,monthInfo,dates};if(typeof module!=='undefined')module.exports=root.Calendar;
})(typeof window==='undefined'?globalThis:window);
