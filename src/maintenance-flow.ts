export const stageNames=['Inicio','Revisión general','Actividades de la visita','Datos del reporte','Revisión y cierre'];
export const taskComplete=(t:any)=>t.state!=='Pendiente'&&(!(t.state==='Realizada'&&t.photo)||t.photos.length>0)&&(!['Con falla','No realizada'].includes(t.state)||!!t.notes?.trim());
export const stageTasks=(v:any,stage:number)=>v.tasks.filter((t:any)=>t.stage===stage);
export function normalizeVisit(v:any,routineCount=5){return {...v,stage:v.closed?4:Number.isInteger(v.stage)?v.stage:v.started?1:0,tasks:v.tasks.map((t:any,i:number)=>({...t,stage:t.stage??(i<routineCount?1:2)}))}}
