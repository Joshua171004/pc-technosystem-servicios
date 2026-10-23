import fs from 'node:fs';import {createHash} from 'node:crypto';
const html=fs.readFileSync('dist/index.html','utf8'),assets=fs.readdirSync('dist/assets').map(x=>'/assets/'+x);const urls=['/','/index.html','/logo-pctechnosystem.jpg',...assets];const version=createHash('sha256').update(html+assets.map(p=>fs.readFileSync('dist'+p)).join('')).digest('hex').slice(0,16);
const script=`const CACHE='pc-shell-${version}',FILES=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('pc-shell-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')||u.pathname==='/logout')return;
if(e.request.mode==='navigate'&&u.pathname==='/'){e.respondWith((async()=>{try{const r=await fetch(e.request,{signal:AbortSignal.timeout(5000)});if(r.ok)return r}catch{}return (await caches.open(CACHE)).match('/index.html')})());return}
if(FILES.includes(u.pathname))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(u.pathname))||fetch(e.request)));
});`;
fs.writeFileSync('dist/offline-sw.js',script);console.log('Offline shell prepared with '+urls.length+' static resources.');
