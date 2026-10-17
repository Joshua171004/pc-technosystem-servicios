export function tomorrowInCancun(now=new Date()){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Cancun',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10)}
export function jobVisible(j:any,now=new Date()){return j.kind!=='Mantenimiento'||j.date<=tomorrowInCancun(now)}
